import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Please provide description"],
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Please provide price"],
      min: [0, "Price cannot be negative"],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },

    discountedPrice: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: [true, "Please provide stock"],
      min: [0, "Stock cannot be negative"],
    },

    images: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    isLatest: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/**
 * Auto-create slug based on product name.
 */
productSchema.pre("save", function () {
  if (!this.isModified("name")) return;

  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
    replacement: "-",
  });


});

/**
 * Calculate discounted price automatically before saving.
 */
productSchema.pre("save", function (next) {
  const price = this.price || 0;
  const discount = this.discount || 0;

  this.discountedPrice = discount > 0
    ? price - (price * discount) / 100
    : price;

});

/**
 * Create performance indexes for searching and filtering.
 */
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ isLatest: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

const Product = model("Product", productSchema);

export default Product;
