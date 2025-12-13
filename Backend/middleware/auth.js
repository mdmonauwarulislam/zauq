import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ErrorHandler, asyncHandler } from "../utils/error.js";

/**
 * Protect routes - only for authenticated users
 * Usage: router.get("/me", protect, controller)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ErrorHandler("Not authorized. Token missing.", 401);
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new ErrorHandler(
      "JWT_SECRET is not defined in environment variables",
      500
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ErrorHandler("Not authorized. Token has expired.", 401);
    }
    if (err.name === "JsonWebTokenError") {
      throw new ErrorHandler("Not authorized. Invalid token.", 401);
    }
    throw err;
  }

  if (!decoded?.id) {
    throw new ErrorHandler("Not authorized. Invalid token payload.", 401);
  }

  // Optional but safer: ensure the user still exists + not blocked
  const dbUser = await User.findById(decoded.id);

  if (!dbUser) {
    throw new ErrorHandler(
      "User associated with this token no longer exists.",
      401
    );
  }

  if (dbUser.isBlocked) {
    throw new ErrorHandler("User account is blocked.", 403);
  }

  // Attach minimal user info to req
  req.user = {
    id: dbUser._id.toString(),
    role: dbUser.role,
  };

  next();
});

/**
 * Restrict route access based on user roles.
 * Usage: authorize("admin"), authorize("admin", "manager")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorHandler("User not authenticated.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          "User role not authorized to access this route.",
          403
        )
      );
    }

    next();
  };
};
