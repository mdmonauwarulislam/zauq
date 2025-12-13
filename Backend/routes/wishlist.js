import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All wishlist routes require authentication

router.route("/").get(getWishlist).post(addToWishlist).delete(clearWishlist);

router.route("/:productId").delete(removeFromWishlist);

export default router;