import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// User: initiate Razorpay order
router.post("/razorpay/order", protect, createRazorpayOrder);

// User: verify Razorpay payment
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// Admin: check payment status in Razorpay
router.get("/razorpay/:paymentId", protect, authorize("admin"), getPaymentStatus);

export default router;
