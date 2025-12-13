import mongoose from "mongoose";
import { COUPON_TYPES } from "../utils/constant.js";

const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(COUPON_TYPES),
      required: true,
    },

    discount: {
      type: Number,
      required: [true, "Please provide discount value"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Percentage discount cannot exceed 100"],
    },

    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },

    maxUsagePerUser: {
      type: Number,
      default: 1,
      min: [1, "Usage per user must be at least 1"],
    },

    totalUsageLimit: {
      type: Number,
      default: null,
      min: [1, "Total usage limit must be at least 1"],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },

    startDate: {
      type: Date,
      required: [true, "Please provide start date"],
    },

    expiryDate: {
      type: Date,
      required: [true, "Please provide expiry date"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Validate that expiryDate > startDate
 */
couponSchema.pre("save", function (next) {
  if (this.expiryDate <= this.startDate) {
    return next(
      new Error("Expiry date must be later than start date")
    );
  }
  next();
});

/**
 * Automatically uppercase coupon codes even if updated.
 */
couponSchema.pre("save", function (next) {
  if (this.isModified("code")) {
    this.code = this.code.trim().toUpperCase();
  }
  next();
});

/**
 * Useful indexes for performance.
 */

couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

const Coupon = model("Coupon", couponSchema);

export default Coupon;
