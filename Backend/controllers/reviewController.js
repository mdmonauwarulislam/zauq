import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * Helper: Recalculate product rating & reviews count
 */
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const product = await Product.findById(productId);
  if (!product) return;

  if (stats.length > 0) {
    product.rating = Number(stats[0].avgRating.toFixed(1));
  } else {
    product.rating = 0;
  }

  await product.save();
};

/**
 * @desc    Create review for a product
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { product, title, comment, rating } = req.body;

  if (!product || !comment || !rating) {
    throw new ErrorHandler("Please provide all required fields", 400);
  }

  const existingReview = await Review.findOne({
    product,
    user: req.user.id,
  });

  if (existingReview) {
    throw new ErrorHandler("You have already reviewed this product", 400);
  }

  const review = await Review.create({
    product,
    user: req.user.id,
    title,
    comment,
    rating,
  });

  // Not updating rating here until approved (depends on business logic)
  // If you want to recalc on creation, call recalcProductRating(product)

  return res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    review,
  });
});

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true,
  })
    .populate("user", "firstName lastName")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    reviews,
  });
});

/**
 * @desc    Approve review (admin)
 * @route   PUT /api/reviews/:id/approve
 * @access  Private/Admin
 */
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!review) {
    throw new ErrorHandler("Review not found", 404);
  }

  await recalcProductRating(review.product);

  return res.status(200).json({
    success: true,
    message: "Review approved successfully",
    review,
  });
});

/**
 * @desc    Delete review (admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    throw new ErrorHandler("Review not found", 404);
  }

  await recalcProductRating(review.product);

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

/**
 * @desc    Mark/unmark review as featured (admin)
 * @route   PUT /api/reviews/:id/feature
 * @access  Private/Admin
 */
export const setReviewFeatured = asyncHandler(async (req, res) => {
  const { isFeatured } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isFeatured: Boolean(isFeatured) },
    { new: true }
  );

  if (!review) {
    throw new ErrorHandler("Review not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `Review ${isFeatured ? 'marked as' : 'removed from'} featured successfully`,
    review,
  });
});

/**
 * @desc    Get featured reviews for homepage slider
 * @route   GET /api/reviews/featured
 * @access  Public
 */
export const getFeaturedReviews = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const reviews = await Review.find({
    isApproved: true,
    isFeatured: true,
  })
    .populate("user", "firstName lastName")
    .populate("product", "name")
    .limit(limit)
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    reviews,
  });
});

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/reviews
 * @access  Private/Admin
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, rating, search, sort } = req.query;

  const filter = {};
  
  // Status filter
  if (status === 'pending') {
    filter.isApproved = false;
  } else if (status === 'approved') {
    filter.isApproved = true;
  } else if (status === 'featured') {
    filter.isFeatured = true;
  }

  // Rating filter
  if (rating) {
    filter.rating = Number(rating);
  }

  // Build aggregation pipeline for search
  let reviews;
  let total;

  if (search) {
    const searchPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...filter,
          $or: [
            { 'user.firstName': { $regex: search, $options: 'i' } },
            { 'user.lastName': { $regex: search, $options: 'i' } },
            { 'product.name': { $regex: search, $options: 'i' } },
            { comment: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
          ]
        }
      }
    ];

    // Get total count for search
    const countResult = await Review.aggregate([...searchPipeline, { $count: 'total' }]);
    total = countResult[0]?.total || 0;

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'rating_high') sortObj = { rating: -1 };
    else if (sort === 'rating_low') sortObj = { rating: 1 };

    reviews = await Review.aggregate([
      ...searchPipeline,
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          comment: 1,
          rating: 1,
          isApproved: 1,
          isFeatured: 1,
          createdAt: 1,
          'user._id': 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'product._id': 1,
          'product.name': 1
        }
      }
    ]);
  } else {
    total = await Review.countDocuments(filter);

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'rating_high') sortObj = { rating: -1 };
    else if (sort === 'rating_low') sortObj = { rating: 1 };

    reviews = await Review.find(filter)
      .populate("user", "firstName lastName")
      .populate("product", "name")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
  }

  // Get stats
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
        pending: { $sum: { $cond: ['$isApproved', 0, 1] } },
        featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
        avgRating: { $avg: '$rating' },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    }
  ]);

  const reviewStats = stats[0] || {
    total: 0,
    approved: 0,
    pending: 0,
    featured: 0,
    avgRating: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0
  };

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    reviews,
    stats: {
      ...reviewStats,
      avgRating: reviewStats.avgRating ? Number(reviewStats.avgRating.toFixed(1)) : 0,
      ratingDistribution: {
        1: reviewStats.rating1,
        2: reviewStats.rating2,
        3: reviewStats.rating3,
        4: reviewStats.rating4,
        5: reviewStats.rating5
      }
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
