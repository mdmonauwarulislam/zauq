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

  const filter = {};
  if (req.query.status === 'pending') {
    filter.isApproved = false;
  } else if (req.query.status === 'approved') {
    filter.isApproved = true;
  }

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate("user", "firstName lastName")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
