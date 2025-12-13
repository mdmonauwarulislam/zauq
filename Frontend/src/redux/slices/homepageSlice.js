import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HomepageService from "@/services/homepageService";

/**
 * Async Thunk to fetch homepage configuration from backend
 * This is the single source of truth for all homepage data
 */
export const fetchHomepageConfig = createAsyncThunk(
  "homepage/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HomepageService.getHomepageConfig();
      const config = response?.data?.config;
      
      if (!config) {
        throw new Error("No configuration data received");
      }
      
      return {
        hero: config.heroSection || [],
        featuredCollections: config.featuredCategories || [],
        collections: config.mainCategories || [],
        products: config.latestProducts || [],
        reviews: config.featuredReviews || [],
        navbarItems: config.navbarItems || [],
        marqueeMessages: config.marqueeMessages || [],
        saleBanner: config.saleBanner || { message: "", endDate: null, isActive: false },
      };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to load homepage";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  // Hero Section
  hero: [],
  
  // All card data normalized in one place
  featuredCollections: [],
  collections: [],
  products: [],
  reviews: [],
  
  // Navbar and marquee
  navbarItems: [],
  marqueeMessages: [],
  saleBanner: { message: "", endDate: null, isActive: false },
  
  // Loading and error states
  loading: false,
  error: null,
  lastFetchedAt: null,
};

const homepageSlice = createSlice({
  name: "homepage",
  initialState,
  reducers: {
    // Manual data update if needed (e.g., after user action)
    updateHeroSection(state, action) {
      state.hero = action.payload;
    },
    clearHomepageData(state) {
      state.hero = [];
      state.featuredCollections = [];
      state.collections = [];
      state.products = [];
      state.reviews = [];
      state.navbarItems = [];
      state.marqueeMessages = [];
      state.saleBanner = { message: "", endDate: null, isActive: false };
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomepageConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.hero = action.payload.hero;
        state.featuredCollections = action.payload.featuredCollections;
        state.collections = action.payload.collections;
        state.products = action.payload.products;
        state.reviews = action.payload.reviews;
        state.navbarItems = action.payload.navbarItems;
        state.marqueeMessages = action.payload.marqueeMessages;
        state.saleBanner = action.payload.saleBanner;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchHomepageConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error occurred";
      });
  },
});

export const { updateHeroSection, clearHomepageData } = homepageSlice.actions;

// ============ OPTIMIZED SELECTORS ============

/**
 * Get hero section data
 */
export const selectHero = (state) => state.homepage.hero || [];

/**
 * Get all featured collections with memoization
 */
export const selectFeaturedCollections = (state) =>
  state.homepage.featuredCollections || [];

/**
 * Get all collections/categories
 */
export const selectCollections = (state) =>
  state.homepage.collections || [];

/**
 * Get all products
 */
export const selectProducts = (state) =>
  state.homepage.products || [];

/**
 * Get navbar items
 */
export const selectNavbarItems = (state) =>
  state.homepage.navbarItems || [];

/**
 * Get marquee messages
 */
export const selectMarqueeMessages = (state) =>
  state.homepage.marqueeMessages || [];

/**
 * Get sale banner
 */
export const selectSaleBanner = (state) =>
  state.homepage.saleBanner || { message: "", endDate: null, isActive: false };

/**
 * Get all reviews
 */
export const selectReviews = (state) =>
  state.homepage.reviews || [];

/**
 * Get loading state
 */
export const selectHomepageLoading = (state) =>
  state.homepage.loading || false;

/**
 * Get error state
 */
export const selectHomepageError = (state) =>
  state.homepage.error || null;

/**
 * Get last fetch timestamp
 */
export const selectLastFetchedAt = (state) =>
  state.homepage.lastFetchedAt || null;

/**
 * Check if data is available
 */
export const selectHasHomepageData = (state) => {
  const homepage = state.homepage;
  return (
    homepage.collections?.length > 0 ||
    homepage.products?.length > 0 ||
    homepage.reviews?.length > 0 ||
    homepage.hero?.length > 0
  );
};

export default homepageSlice.reducer;

