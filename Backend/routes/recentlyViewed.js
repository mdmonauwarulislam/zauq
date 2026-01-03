import express from "express";
import { protect } from "../middleware/auth.js";
import {
  addRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed
} from "../controllers/recentlyViewedController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route("/")
  .get(getRecentlyViewed)
  .delete(clearRecentlyViewed);

router.route("/:productId")
  .post(addRecentlyViewed);

export default router;
