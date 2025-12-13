// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ErrorHandler, asyncHandler } from "../utils/error.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

/**
 * Generate JWT token for a user
 */
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * @desc    User signup
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new ErrorHandler("Please provide all required fields", 400);
  }

  if (!validateEmail(email)) {
    throw new ErrorHandler("Please provide a valid email", 400);
  }

  if (!validatePassword(password)) {
    throw new ErrorHandler("Password must be at least 6 characters", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorHandler(RESPONSE_MESSAGES.EMAIL_EXISTS, 400);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  const token = generateToken(user._id, user.role);

  return res.status(201).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    token,
    user: user.toJSON(),
  });
});

/**
 * @desc    User login
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler("Please provide email and password", 400);
  }

  if (!validateEmail(email)) {
    throw new ErrorHandler("Please provide a valid email", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ErrorHandler(RESPONSE_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  if (user.isBlocked) {
    throw new ErrorHandler("User account is blocked", 403);
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ErrorHandler(RESPONSE_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const token = generateToken(user._id, user.role);

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    token,
    user: user.toJSON(),
  });
});

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    throw new ErrorHandler(RESPONSE_MESSAGES.UNAUTHORIZED, 401);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    user: user.toJSON(),
  });
});

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    throw new ErrorHandler(RESPONSE_MESSAGES.UNAUTHORIZED, 401);
  }

  const { firstName, lastName, email, profileImage } = req.body;

  const updateData = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (profileImage) updateData.profileImage = profileImage;

  if (email) {
    if (!validateEmail(email)) {
      throw new ErrorHandler("Please provide a valid email", 400);
    }

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ErrorHandler(RESPONSE_MESSAGES.EMAIL_EXISTS, 400);
    }

    updateData.email = email;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ErrorHandler("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser.toJSON(),
  });
});

/**
 * @desc    Change password for logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    throw new ErrorHandler(RESPONSE_MESSAGES.UNAUTHORIZED, 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ErrorHandler("Please provide current and new password", 400);
  }

  if (!validatePassword(newPassword)) {
    throw new ErrorHandler("New password must be at least 6 characters", 400);
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    throw new ErrorHandler("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

/**
 * @desc    Get all users (admin)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search?.trim() || "";

  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get single user by ID (admin)
 * @route   GET /api/auth/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    user,
  });
});

/**
 * @desc    Update user (role, block/unblock) - admin
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, isBlocked } = req.body;

  const updateData = {};

  if (role) updateData.role = role;
  if (typeof isBlocked === "boolean") updateData.isBlocked = isBlocked;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

/**
 * @desc    Delete user (admin)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
