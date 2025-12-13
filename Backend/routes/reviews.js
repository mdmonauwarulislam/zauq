
import express from "express";
import {
  createReview,
  getProductReviews,
  approveReview,
  deleteReview,
  getFeaturedReviews,
  setReviewFeatured,
  getAllReviews,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// User
router.post("/", protect, createReview);

// Public
router.get("/product/:productId", getProductReviews);
router.get("/featured", getFeaturedReviews);

// Admin
router.get("/", protect, authorize("admin"), getAllReviews);
router.put("/:id/approve", protect, authorize("admin"), approveReview);
router.delete("/:id", protect, authorize("admin"), deleteReview);
router.put("/:id/feature", protect, authorize("admin"), setReviewFeatured);

export default router;
