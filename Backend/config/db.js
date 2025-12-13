import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose.
 * Includes improved error handling & environment validation.
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("Missing MONGODB_URI in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }

    // Gracefully exit the server if DB connection fails
    process.exit(1);
  }
};
