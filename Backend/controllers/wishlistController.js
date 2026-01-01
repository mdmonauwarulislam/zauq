import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS,
      wishlist: { items: [] },
    });
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    wishlist,
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ErrorHandler("Product ID is required", 400);
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, items: [] });
  }

  // Check if product already in wishlist
  const existingItem = wishlist.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    throw new ErrorHandler("Product already in wishlist", 400);
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  return res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    wishlist: populatedWishlist,
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    throw new ErrorHandler("Wishlist not found", 404);
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  return res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    wishlist: populatedWishlist,
  });
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndDelete({ user: req.user.id });

  return res.status(200).json({
    success: true,
    message: "Wishlist cleared",
    wishlist: { items: [] },
  });
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all wishlisted products with user counts (Admin)
 * @route   GET /api/wishlist/admin/products
 * @access  Private/Admin
 * 
 * Query:
 *  - page?: number
 *  - limit?: number
 *  - search?: string
 *  - sort?: string (wishlistCount, -wishlistCount, name, -name)
 */
export const getWishlistedProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const search = req.query.search?.trim() || "";
  const sort = req.query.sort || "-wishlistCount";
  const skip = (page - 1) * limit;

  // Aggregate to get products with wishlist count
  const pipeline = [
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        wishlistCount: { $sum: 1 },
        users: { $push: "$user" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  // Search filter
  if (search) {
    pipeline.push({
      $match: {
        "product.name": { $regex: search, $options: "i" },
      },
    });
  }

  // Get total count
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Wishlist.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Sorting
  let sortStage = { wishlistCount: -1 };
  if (sort === "wishlistCount") sortStage = { wishlistCount: 1 };
  else if (sort === "-wishlistCount") sortStage = { wishlistCount: -1 };
  else if (sort === "name") sortStage = { "product.name": 1 };
  else if (sort === "-name") sortStage = { "product.name": -1 };

  pipeline.push({ $sort: sortStage });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  pipeline.push({
    $project: {
      _id: "$product._id",
      name: "$product.name",
      slug: "$product.slug",
      images: "$product.images",
      price: "$product.price",
      discountedPrice: "$product.discountedPrice",
      stock: "$product.stock",
      wishlistCount: 1,
    },
  });

  const products = await Wishlist.aggregate(pipeline);

  // Get overall stats
  const statsResult = await Wishlist.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: null,
        totalWishlists: { $sum: 1 },
        uniqueProducts: { $addToSet: "$items.product" },
      },
    },
  ]);

  const stats = {
    totalWishlists: statsResult[0]?.totalWishlists || 0,
    uniqueProducts: statsResult[0]?.uniqueProducts?.length || 0,
    totalUsers: await Wishlist.countDocuments(),
  };

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    stats,
  });
});

/**
 * @desc    Get users who wishlisted a specific product (Admin)
 * @route   GET /api/wishlist/admin/products/:productId/users
 * @access  Private/Admin
 * 
 * Query:
 *  - page?: number
 *  - limit?: number
 */
export const getProductWishlistUsers = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Get product details
  const product = await Product.findById(productId).select("name slug images price discountedPrice stock");
  
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  // Find all wishlists containing this product
  const wishlists = await Wishlist.find({
    "items.product": productId,
  })
    .populate("user", "firstName lastName email profileImage createdAt")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Wishlist.countDocuments({
    "items.product": productId,
  });

  // Format the response
  const users = wishlists.map((w) => {
    const item = w.items.find((i) => i.product.toString() === productId);
    return {
      _id: w.user._id,
      firstName: w.user.firstName,
      lastName: w.user.lastName,
      email: w.user.email,
      profileImage: w.user.profileImage,
      userJoined: w.user.createdAt,
      addedAt: item?.addedAt,
    };
  });

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    product,
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get all users with their wishlist summary (Admin)
 * @route   GET /api/wishlist/admin/users
 * @access  Private/Admin
 * 
 * Query:
 *  - page?: number
 *  - limit?: number
 *  - search?: string
 */
export const getAllUsersWishlists = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const search = req.query.search?.trim() || "";
  const skip = (page - 1) * limit;

  let matchStage = {};

  const wishlists = await Wishlist.find(matchStage)
    .populate("user", "firstName lastName email profileImage createdAt")
    .populate("items.product", "name slug images price")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Filter by search after population if needed
  let filteredWishlists = wishlists;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredWishlists = wishlists.filter(
      (w) =>
        w.user?.firstName?.toLowerCase().includes(searchLower) ||
        w.user?.lastName?.toLowerCase().includes(searchLower) ||
        w.user?.email?.toLowerCase().includes(searchLower)
    );
  }

  const total = await Wishlist.countDocuments(matchStage);

  const formattedData = filteredWishlists.map((w) => ({
    _id: w._id,
    user: w.user,
    itemCount: w.items?.length || 0,
    items: w.items,
    updatedAt: w.updatedAt,
  }));

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    wishlists: formattedData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});