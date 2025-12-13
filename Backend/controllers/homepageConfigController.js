import HomepageConfig from "../models/HomepageConfig.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Get homepage configuration (public)
 * @route   GET /api/homepage
 * @access  Public
 */
export const getHomepageConfig = asyncHandler(async (req, res) => {
  let config = await HomepageConfig.findOne()
    .populate("featuredCategories", "name slug images isFeatured")
    .populate("mainCategories", "name slug images isFeatured")
    .populate("latestProducts", "name slug images discountedPrice price isLatest")
    .populate({
      path: "featuredReviews",
      populate: [
        { path: "user", select: "firstName lastName" },
        { path: "product", select: "name slug" },
      ],
    })
    .sort({ updatedAt: -1 });

  // If no config exists yet, create a default empty one
  if (!config) {
    config = await HomepageConfig.create({});
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    config,
  });
});

/**
 * Helper to safely limit arrays coming from body
 */
const limitArray = (value, max) => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max);
};

/**
 * @desc    Update homepage configuration
 * @route   PUT /api/homepage
 * @access  Private/Admin
 *
 * Body can contain any of:
 *  - heroSection: { image, title, subtitle, ctaText, ctaLink }
 *  - featuredCategories: [categoryId] (max 4)
 *  - mainCategories: [categoryId] (max 7)
 *  - latestProducts: [productId]
 *  - featuredReviews: [reviewId]
 *  - navbarCouponText: string
 *  - marqueeMessages: [string]
 *  - saleBanner: { message, endDate, isActive }
 *  - navbarItems: [{ name, href, dropdown, isActive }]
 */
export const updateHomepageConfig = asyncHandler(async (req, res) => {
  const {
    heroSection,
    featuredCategories,
    mainCategories,
    latestProducts,
    featuredReviews,
    navbarCouponText,
    marqueeMessages,
    saleBanner,
    navbarItems,
  } = req.body;

  let config = await HomepageConfig.findOne();

  if (!config) {
    config = new HomepageConfig({});
  }

  // Hero section
  if (heroSection) {
    if (Array.isArray(heroSection)) {
      config.heroSection = heroSection;
    } else {
      // For backward compatibility, if single object, wrap in array
      config.heroSection = [heroSection];
    }
  }

  // Featured categories (4 cards under hero)
  if (featuredCategories) {
    config.featuredCategories = limitArray(featuredCategories, 4);
  }

  // Main categories (7 categories section)
  if (mainCategories) {
    config.mainCategories = limitArray(mainCategories, 7);
  }

  // Latest products section
  if (latestProducts) {
    config.latestProducts = Array.isArray(latestProducts)
      ? latestProducts
      : [];
  }

  // Featured reviews for homepage slider
  if (featuredReviews) {
    config.featuredReviews = Array.isArray(featuredReviews)
      ? featuredReviews
      : [];
  }

  // Navbar coupon bar text
  if (typeof navbarCouponText === "string") {
    config.navbarCouponText = navbarCouponText.trim();
  }

  // Marquee messages
  if (Array.isArray(marqueeMessages)) {
    config.marqueeMessages = marqueeMessages;
  }

  if (saleBanner && typeof saleBanner === "object") {
    config.saleBanner = {
      ... (config.saleBanner?.toObject?.() || {}),
      ...saleBanner,
    };
  }

  // Navbar items
  if (Array.isArray(navbarItems)) {
    config.navbarItems = navbarItems;
  }

  await config.save();

  const populatedConfig = await HomepageConfig.findById(config._id)
    .populate("featuredCategories", "name slug images isFeatured")
    .populate("mainCategories", "name slug images isFeatured")
    .populate("latestProducts", "name slug images discountedPrice price isLatest")
    .populate({
      path: "featuredReviews",
      populate: [
        { path: "user", select: "firstName lastName" },
        { path: "product", select: "name slug" },
      ],
    });

  return res.status(200).json({
    success: true,
    message: "Homepage configuration updated successfully",
    config: populatedConfig,
  });
});


/**
 * @desc    Update only navbar coupon text and marquee messages
 * @route   PUT /api/homepage/navbar
 * @access  Private/Admin
 */
export const updateNavbarAndMarquee = asyncHandler(async (req, res) => {
  const { navbarCouponText, marqueeMessages } = req.body;

  let config = await HomepageConfig.findOne();
  if (!config) {
    config = new HomepageConfig({});
  }

  if (typeof navbarCouponText === "string") {
    config.navbarCouponText = navbarCouponText.trim();
  }

  if (Array.isArray(marqueeMessages)) {
    config.marqueeMessages = marqueeMessages;
  }

  await config.save();

  return res.status(200).json({
    success: true,
    message: "Navbar and marquee updated successfully",
    config,
  });
});


/**
 * Admin: update sale banner only
 * PUT /api/homepage/sale-banner
 * body: { message, endDate, isActive }
 */
export const updateSaleBanner = asyncHandler(async (req, res) => {
  const { message, endDate, isActive } = req.body;

  let config = await HomepageConfig.findOne();
  if (!config) config = new HomepageConfig({});

  if (typeof message === "string") config.saleBanner.message = message.trim();
  if (typeof isActive === "boolean") config.saleBanner.isActive = isActive;
  if (endDate) {
    const dt = new Date(endDate);
    if (Number.isNaN(dt.getTime())) {
      throw new ErrorHandler("Invalid endDate", 400);
    }
    config.saleBanner.endDate = dt;
  }

  await config.save();

  return res.status(200).json({
    success: true,
    message: "Sale banner updated successfully",
    saleBanner: config.saleBanner,
  });
});