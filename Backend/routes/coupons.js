import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// User: validate coupon (during checkout)
router.post("/validate", protect, validateCoupon);

// Admin: full coupon management
router.post("/", protect, authorize("admin"), createCoupon);
router.get("/", protect, authorize("admin"), getAllCoupons);
router.get("/:id", protect, authorize("admin"), getCouponById);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.put("/:id/toggle", protect, authorize("admin"), toggleCouponStatus);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

export default router;
