import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Sub-schema for hero section
const heroSchema = new Schema(
  {
    image: { type: String, default: null },
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    ctaText: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
  },
  { _id: false }
);

const homepageConfigSchema = new Schema(
  {
    heroSection: {
      type: [heroSchema],
      default: [],
    },

    featuredCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    mainCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    latestProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    featuredReviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    navbarCouponText: {
      type: String,
      trim: true,
      default: "",
    },

    marqueeMessages: {
      type: [String],
      default: [],
    },
    saleBanner: {
      message: { type: String, default: "" },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false },
    },

    navbarItems: {
      type: [
        {
          name: { type: String, required: true },
          href: { type: String, required: true },
          dropdown: { type: Boolean, default: false },
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [
        { name: "HOME", href: "/", dropdown: false, isActive: true },
        { name: "COLLECTIONS", href: "/collections", dropdown: true, isActive: true },
        { name: "PRODUCTS", href: "/products", dropdown: true, isActive: true },
        { name: "CONTACT US", href: "/contact", dropdown: false, isActive: true },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast single-document query
homepageConfigSchema.index({ updatedAt: -1 });

// Ensure only ONE homepage config exists
homepageConfigSchema.statics.ensureSingleConfig = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    return this.create({});
  }
};

const HomepageConfig = model("HomepageConfig", homepageConfigSchema);

export default HomepageConfig;
