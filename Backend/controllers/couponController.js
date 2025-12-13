import Coupon from "../models/Coupon.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, discount, startDate, expiryDate } = req.body;

  if (!code || !type || discount === undefined || !startDate || !expiryDate) {
    throw new ErrorHandler("Please provide all required fields", 400);
  }

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new ErrorHandler("Coupon code already exists", 400);
  }

  const coupon = await Coupon.create(req.body);

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon,
  });
});

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    coupons,
  });
});

/**
 * @desc    Validate coupon for an order
 * @route   POST /api/coupons/validate
 * @access  Private
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code || orderValue === undefined) {
    throw new ErrorHandler("Coupon code and order value are required", 400);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw new ErrorHandler("Coupon not found", 404);
  }

  if (!coupon.isActive) {
    throw new ErrorHandler("Coupon is not active", 400);
  }

  const now = new Date();

  if (now < coupon.startDate) {
    throw new ErrorHandler("Coupon is not yet valid", 400);
  }

  if (now > coupon.expiryDate) {
    throw new ErrorHandler("Coupon has expired", 400);
  }

  if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
    throw new ErrorHandler("Coupon usage limit reached", 400);
  }

  if (orderValue < coupon.minOrderValue) {
    throw new ErrorHandler(
      `Minimum order value should be ${coupon.minOrderValue}`,
      400
    );
  }

  let discountAmount = 0;
  if (coupon.type === "flat") {
    discountAmount = coupon.discount;
  } else {
    discountAmount = (orderValue * coupon.discount) / 100;
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    coupon,
    discountAmount,
  });
});

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    throw new ErrorHandler("Coupon not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    throw new ErrorHandler("Coupon not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
