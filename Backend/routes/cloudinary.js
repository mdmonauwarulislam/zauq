import express from "express";
import {
  deleteImageFromCloudinary,
  getCloudinarySignature,
} from "../controllers/cloudinaryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin: delete image
router.post("/delete", protect, authorize("admin"), deleteImageFromCloudinary);

// Admin: get upload signature
router.get("/signature", protect, authorize("admin"), getCloudinarySignature);

export default router;
