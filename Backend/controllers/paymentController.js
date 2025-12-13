// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import Order from "../models/Order.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/constant.js";

dotenv.config();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️ Razorpay keys are not set. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env"
  );
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/razorpay/order
 * @access  Private
 *
 * Body:
 *  - amount (required, in rupees)
 *  - currency (optional, default "INR")
 *  - receipt (optional, string)
 *  - notes (optional, object)
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;

  if (!amount || Number(amount) <= 0) {
    throw new ErrorHandler("Amount is required and must be greater than 0", 400);
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new ErrorHandler("Razorpay is not configured on server", 500);
  }

  const options = {
    amount: Math.round(Number(amount) * 100), // rupees -> paise
    currency: currency || "INR",
    receipt: receipt || `rcpt_${Date.now()}`,
    notes: {
      ...(notes || {}),
      userId: req.user?.id,
      source: "ZAUQ_ECOMMERCE",
    },
  };

  const order = await razorpay.orders.create(options);

  return res.status(201).json({
    success: true,
    message: "Razorpay order created successfully",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
});

/**
 * @desc    Verify Razorpay payment signature and update Order
 * @route   POST /api/payments/razorpay/verify
 * @access  Private
 *
 * Body:
 *  - razorpay_order_id
 *  - razorpay_payment_id
 *  - razorpay_signature
 *  - orderId (optional but recommended: your internal Order _id)
 */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ErrorHandler("Invalid Razorpay payment data", 400);
  }

  if (!RAZORPAY_KEY_SECRET) {
    throw new ErrorHandler("Razorpay is not configured on server", 500);
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    // If we have an internal order, mark payment as failed
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: PAYMENT_STATUS.FAILED,
      });
    }

    throw new ErrorHandler("Payment verification failed", 400);
  }

  // If we have an internal order, mark payment as completed + move status
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      status: ORDER_STATUS.PROCESSING,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    razorpay_order_id,
    razorpay_payment_id,
    orderId: orderId || null,
  });
});

/**
 * @desc    Get Razorpay payment status/details
 * @route   GET /api/payments/razorpay/:paymentId
 * @access  Private/Admin
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new ErrorHandler("Payment ID is required", 400);
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new ErrorHandler("Razorpay is not configured on server", 500);
  }

  const payment = await razorpay.payments.fetch(paymentId);

  return res.status(200).json({
    success: true,
    message: "Payment fetched successfully",
    payment,
  });
});
