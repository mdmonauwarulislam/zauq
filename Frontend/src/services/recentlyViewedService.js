import api from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

/**
 * Get recently viewed products for authenticated user
 */
const getRecentlyViewed = async () => {
  return api.get(apiUrls.recentlyViewed.list);
};

/**
 * Add product to recently viewed
 * @param {string} productId - Product ID to add
 */
const addRecentlyViewed = async (productId) => {
  return api.post(apiUrls.recentlyViewed.add(productId));
};

/**
 * Clear all recently viewed products
 */
const clearRecentlyViewed = async () => {
  return api.delete(apiUrls.recentlyViewed.clear);
};

const RecentlyViewedService = {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
};

export default RecentlyViewedService;
