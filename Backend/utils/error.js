/**
 * Custom application error with HTTP status code support.
 */
export class ErrorHandler extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);

    this.name = "ErrorHandler";
    this.statusCode = statusCode;

    if (details) {
      this.details = details;
    }

    // Capture stack trace excluding constructor call
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Wrap async route handlers and forward errors to Express.
 * Usage: router.get('/route', asyncHandler(controllerFn))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized Express error handling middleware.
 * Must be the last middleware in the chain.
 */
/* eslint-disable no-unused-vars */
export const errorMiddleware = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    message = `${field} already exists`;
    statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    message = `Invalid ${err.path || "identifier"}`;
    statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.join(", ") || "Validation error";
    statusCode = 400;
    err = new ErrorHandler(message, statusCode, errors);
  }

  // Invalid JWT
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
    err = new ErrorHandler(message, statusCode);
  }

  // Expired JWT
  if (err.name === "TokenExpiredError") {
    message = "Token has expired";
    statusCode = 401;
    err = new ErrorHandler(message, statusCode);
  }

  // Fallback if not already wrapped in ErrorHandler
  if (!err.statusCode) err.statusCode = statusCode;
  if (!err.message) err.message = message;

  if (!isProd) {
    console.error("🔥 ErrorMiddleware:", err);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(err.details && { details: err.details }),
    ...(!isProd && { stack: err.stack }),
  });
};
/* eslint-enable no-unused-vars */
