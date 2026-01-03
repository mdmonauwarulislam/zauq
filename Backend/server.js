import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { mongoSanitizeMiddleware } from "./middleware/mongoSanitize.js";
import { errorMiddleware } from "./utils/error.js";
import { connectDB } from "./config/db.js";

// routes
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
import recentlyViewedRoutes from "./routes/recentlyViewed.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || "*",
  credentials: true,
}));

app.use(mongoSanitizeMiddleware);

app.use(helmet({ crossOriginResourcePolicy: false }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API healthy" });
});

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
app.use("/api/recently-viewed", recentlyViewedRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel (local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }).catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
}

export default app;
