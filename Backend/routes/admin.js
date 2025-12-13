import express from "express";
import { getAdminDashboardStats } from "../controllers/adminAnalyticsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin dashboard stats
router.get("/stats", protect, authorize("admin"), getAdminDashboardStats);

export default router;
