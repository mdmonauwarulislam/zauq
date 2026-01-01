import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistedProducts,
  getProductWishlistUsers,
  getAllUsersWishlists,
} from "../controllers/wishlistController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin routes (must be before /:productId to avoid conflicts)
router.get("/admin/products", protect, authorize("admin"), getWishlistedProducts);
router.get("/admin/products/:productId/users", protect, authorize("admin"), getProductWishlistUsers);
router.get("/admin/users", protect, authorize("admin"), getAllUsersWishlists);

// User routes
router.use(protect); // All wishlist routes require authentication

router.route("/").get(getWishlist).post(addToWishlist).delete(clearWishlist);

router.route("/:productId").delete(removeFromWishlist);

export default router;