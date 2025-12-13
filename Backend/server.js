// server.js / app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { mongoSanitizeMiddleware } from "./middleware/mongoSanitize.js";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./utils/error.js";

// Import models
import HomepageConfig from "./models/HomepageConfig.js";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import reviewRoutes from "./routes/reviews.js";
import couponRoutes from "./routes/coupons.js";
import paymentRoutes from "./routes/payments.js";
import cloudinaryRoutes from "./routes/cloudinary.js";
import homepageRoutes from "./routes/homepage.js";
import adminRoutes from "./routes/admin.js";
import wishlistRoutes from "./routes/wishlist.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ----------- Core Middlewares ----------- //

// Parse JSON & URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS Configuration (adjust origins as needed)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(mongoSanitizeMiddleware);

// Secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Rate limiting for API abuse protection (skip for admin routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  // Skip rate limiting for admin routes
  skip: (req) => req.path.startsWith('/api/admin') || req.path.startsWith('/api/categories') || req.path.startsWith('/api/products') || req.path.startsWith('/api/coupons') || req.path.startsWith('/api/orders') || req.path.startsWith('/api/reviews') || req.path.startsWith('/api/auth/users') || req.path.startsWith('/api/homepage') || req.path.startsWith('/api/cloudinary') || req.path.startsWith('/api/wishlist') || req.path.startsWith('/api/cart'),
});
app.use("/api", limiter);

// ----------- Health Check ----------- //

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    env: NODE_ENV,
  });
});

// ----------- Routes ----------- //

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);

// ----------- 404 Handler ----------- //

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ----------- Central Error Handler ----------- //
// Uses your shared errorMiddleware (ErrorHandler, JWT, duplicate key, etc.)
app.use(errorMiddleware);

// ----------- Start Server After DB Connection ----------- //

const startServer = async () => {
  try {
    await connectDB();
    try {
      await HomepageConfig.ensureSingleConfig();
    } catch (err) {
      console.warn("HomepageConfig.ensureSingleConfig failed:", err.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;
