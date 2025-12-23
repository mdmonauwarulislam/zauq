import Wishlist from "../models/Wishlist.js";
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