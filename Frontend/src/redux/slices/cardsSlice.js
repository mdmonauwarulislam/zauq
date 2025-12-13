import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Featured Collections Data
  featuredCollections: [],
  
  // Collections/Categories Data
  collections: [],
  
  // Products Data
  products: [],
  
  // Reviews Data
  reviews: [],
  
  // Loading states
  loading: false,
  error: null,
};

const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    // Featured Collections
    setFeaturedCollections(state, action) {
      state.featuredCollections = action.payload || [];
    },
    
    // Collections/Categories
    setCollections(state, action) {
      state.collections = action.payload || [];
    },
    
    // Products
    setProducts(state, action) {
      state.products = action.payload || [];
    },
    
    // Reviews
    setReviews(state, action) {
      state.reviews = action.payload || [];
    },
    
    // Bulk update (useful when fetching from homepage config)
    updateCardsData(state, action) {
      const { featuredCollections, collections, products, reviews } = action.payload;
      if (featuredCollections) state.featuredCollections = featuredCollections;
      if (collections) state.collections = collections;
      if (products) state.products = products;
      if (reviews) state.reviews = reviews;
    },
    
    // Loading states
    setLoading(state, action) {
      state.loading = action.payload;
    },
    
    setError(state, action) {
      state.error = action.payload;
    },
    
    // Clear all data
    clearCardsData(state) {
      state.featuredCollections = [];
      state.collections = [];
      state.products = [];
      state.reviews = [];
      state.error = null;
    },
  },
});

export const {
  setFeaturedCollections,
  setCollections,
  setProducts,
  setReviews,
  updateCardsData,
  setLoading,
  setError,
  clearCardsData,
} = cardsSlice.actions;

// Selectors
export const selectFeaturedCollections = (state) =>
  state.cards?.featuredCollections || [];
export const selectCollections = (state) =>
  state.cards?.collections || [];
export const selectProducts = (state) =>
  state.cards?.products || [];
export const selectReviews = (state) =>
  state.cards?.reviews || [];
export const selectCardsLoading = (state) =>
  state.cards?.loading || false;
export const selectCardsError = (state) =>
  state.cards?.error || null;

export default cardsSlice.reducer;
