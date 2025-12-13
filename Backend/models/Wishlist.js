import mongoose from "mongoose";

const { Schema, model } = mongoose;

const wishlistItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
wishlistSchema.index({ user: 1 });

const Wishlist = model("Wishlist", wishlistSchema);

export default Wishlist;