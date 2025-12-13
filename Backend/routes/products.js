import express from "express";
import {
  getAllProducts,
  getLatestProducts,
  getProductById,
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  getDeals 
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/latest", getLatestProducts);
router.get("/by-ids", getProductsByIds);
router.get("/:id", getProductById);
router.get("/deals", getDeals);

// Admin
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
