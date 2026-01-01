
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

// ✅ Login (POST /api/auth/login)
const login = async (payload) =>
  Request({
    url: apiUrls.auth.login,
    method: "POST",
    data: payload,
  });

// ✅ Signup/Register (POST /api/auth/signup)
const signup = async (payload) =>
  Request({
    url: apiUrls.auth.signup,
    method: "POST",
    data: payload,
  });

// ✅ Get current user profile (GET /api/auth/me)
const getCurrentUser = async () =>
  Request({
    url: apiUrls.auth.me,
    method: "GET",
    secure: true,
  });

// ✅ Update own profile (PUT /api/auth/me)
const updateProfile = async (payload) =>
  Request({
    url: apiUrls.auth.updateProfile,
    method: "PUT",
    data: payload,
    secure: true,
  });

// ✅ Change password (PUT /api/auth/change-password)
const changePassword = async (payload) =>
  Request({
    url: apiUrls.auth.changePassword,
    method: "PUT",
    data: payload,
    secure: true,
  });

/**
 * ===========================
 *      ADMIN ONLY
 * ===========================
 */

// Get all users (GET /api/auth/users)
const getAllUsers = async (params = {}) =>
  Request({
    url: apiUrls.auth.users,
    method: "GET",
    secure: true,
    params,
  });

// Get single user by id (GET /api/auth/users/:id)
const getUserById = async (userId) =>
  Request({
    url: apiUrls.auth.userById(userId),
    method: "GET",
    secure: true,
  });

// Update user (e.g. role, block, profile) (PUT /api/auth/users/:id)
const updateUserByAdmin = async ({ userId, ...payload }) =>
  Request({
    url: apiUrls.auth.userById(userId),
    method: "PUT",
    data: payload,
    secure: true,
  });

// Delete user (DELETE /api/auth/users/:id)
const deleteUser = async (userId) =>
  Request({
    url: apiUrls.auth.userById(userId),
    method: "DELETE",
    secure: true,
  });

const AuthService = {
  login,
  signup,
  getCurrentUser,
  updateProfile,
  changePassword,
  // admin
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
};

export default AuthService;
