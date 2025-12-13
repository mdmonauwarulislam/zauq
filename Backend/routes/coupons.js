import express from "express";
import {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// User: validate coupon (during checkout)
router.post("/validate", protect, validateCoupon);

// Admin: full coupon management
router.post("/", protect, authorize("admin"), createCoupon);
router.get("/", protect, authorize("admin"), getAllCoupons);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

export default router;
