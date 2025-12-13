import express from "express";
import {
  getHomepageConfig,
  updateHomepageConfig,
  updateNavbarAndMarquee,
  updateSaleBanner,
} from "../controllers/homepageConfigController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getHomepageConfig);

router.put("/", protect, authorize("admin"), updateHomepageConfig);

router.put("/navbar", protect, authorize("admin"), updateNavbarAndMarquee);

router.put("/sale-banner", protect, authorize("admin"), updateSaleBanner);

export default router;
