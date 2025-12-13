import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  if (!cart) {
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS,
      cart: { items: [], totalAmount: 0 },
    });
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    cart,
  });
});

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw new ErrorHandler("Product ID is required", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  if (product.stock < quantity) {
    throw new ErrorHandler("Insufficient stock", 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if product already in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    if (product.stock < existingItem.quantity) {
      throw new ErrorHandler("Insufficient stock", 400);
    }
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountedPrice || product.price,
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  return res.status(200).json({
    success: true,
    message: "Product added to cart",
    cart: populatedCart,
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new ErrorHandler("Valid quantity is required", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ErrorHandler("Cart not found", 404);
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ErrorHandler("Product not in cart", 404);
  }

  const product = await Product.findById(productId);
  if (product.stock < quantity) {
    throw new ErrorHandler("Insufficient stock", 400);
  }

  item.quantity = quantity;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  return res.status(200).json({
    success: true,
    message: "Cart updated",
    cart: populatedCart,
  });
});

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ErrorHandler("Cart not found", 404);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name slug images price discountedPrice stock",
  });

  return res.status(200).json({
    success: true,
    message: "Product removed from cart",
    cart: populatedCart,
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndDelete({ user: req.user._id });

  return res.status(200).json({
    success: true,
    message: "Cart cleared",
    cart: { items: [], totalAmount: 0 },
  });
});