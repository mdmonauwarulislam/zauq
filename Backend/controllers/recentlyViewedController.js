import User from "../models/User.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";

const MAX_RECENT_VIEWS = 8;

/**
 * @desc    Add product to recently viewed
 * @route   POST /api/recently-viewed/:productId
 * @access  Private
 */
export const addRecentlyViewed = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Remove if already exists (to move to front)
  user.recentlyViewed = user.recentlyViewed.filter(
    (item) => item.product.toString() !== productId
  );

  // Add to front of array
  user.recentlyViewed.unshift({
    product: productId,
    viewedAt: new Date()
  });

  // Keep only MAX_RECENT_VIEWS items
  user.recentlyViewed = user.recentlyViewed.slice(0, MAX_RECENT_VIEWS);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to recently viewed"
  });
});

/**
 * @desc    Get recently viewed products
 * @route   GET /api/recently-viewed
 * @access  Private
 */
export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: "recentlyViewed.product",
    select: "name images price discountedPrice slug"
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Filter out null products (deleted products) and map to clean format
  const validProducts = [];
  const invalidProductIds = [];

  for (const item of user.recentlyViewed) {
    if (item.product) {
      validProducts.push({
        _id: item.product._id,
        name: item.product.name,
        images: item.product.images,
        price: item.product.price,
        discountedPrice: item.product.discountedPrice,
        slug: item.product.slug,
        viewedAt: item.viewedAt
      });
    } else {
      invalidProductIds.push(item._id);
    }
  }

  // Clean up deleted products from user's recently viewed
  if (invalidProductIds.length > 0) {
    user.recentlyViewed = user.recentlyViewed.filter(
      (item) => item.product !== null
    );
    await user.save();
  }

  res.status(200).json({
    success: true,
    products: validProducts
  });
});

/**
 * @desc    Clear recently viewed products
 * @route   DELETE /api/recently-viewed
 * @access  Private
 */
export const clearRecentlyViewed = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    recentlyViewed: []
  });

  res.status(200).json({
    success: true,
    message: "Recently viewed cleared"
  });
});
