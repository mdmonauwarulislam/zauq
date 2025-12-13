import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    comment: {
      type: String,
      required: [true, "Please provide review comment"],
      trim: true,
      minlength: [5, "Review comment must be at least 5 characters"],
    },

    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Prevent same user from reviewing the same product twice.
 */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Additional helpful indexes.
 */
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

const Review = model("Review", reviewSchema);

export default Review;
