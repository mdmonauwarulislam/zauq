import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/login", login);

// Logged-in user
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin: user management
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.put("/users/:id", protect, authorize("admin"), updateUserByAdmin);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

export default router;
