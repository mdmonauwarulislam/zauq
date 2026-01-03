import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    desktopBannerImage: {
      type: String,
      default: "",
    },

    mobileBannerImage: {
      type: String,
      default: "",
    },

    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre("save", function() {
  if (!this.isModified("name")) {
    return;
  }

  try {
    // Simple slug generation without external library
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_-]+/g, '-') 
      .replace(/^-+|-+$/g, '');

  } catch (error) {
    console.error("Slug generation error:", error);
  }
});


const Category = model("Category", categorySchema);

export default Category;
