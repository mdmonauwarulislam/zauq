import Request from "../config/apiConfig";
import apiUrls from "../config/apiUrls";

const getWishlist = async () => {
  const response = await Request({
    url: apiUrls.wishlist.list,
    method: "GET",
    secure: true,
  });
  return response.data;
};

const addToWishlist = async (productId) => {
  const response = await Request({
    url: apiUrls.wishlist.add,
    method: "POST",
    data: { productId },
    secure: true,
  });
  return response.data;
};

const removeFromWishlist = async (productId) => {
  const response = await Request({
    url: apiUrls.wishlist.remove(productId),
    method: "DELETE",
    secure: true,
  });
  return response.data;
};

const clearWishlist = async () => {
  const response = await Request({
    url: apiUrls.wishlist.clear,
    method: "DELETE",
    secure: true,
  });
  return response.data;
};

// Admin endpoints
const getWishlistedProducts = async (params = {}) => {
  const response = await Request({
    url: "wishlist/admin/products",
    method: "GET",
    params,
    secure: true,
  });
  return response;
};

const getProductWishlistUsers = async (productId, params = {}) => {
  const response = await Request({
    url: `wishlist/admin/products/${productId}/users`,
    method: "GET",
    params,
    secure: true,
  });
  return response;
};

const getAllUsersWishlists = async (params = {}) => {
  const response = await Request({
    url: "wishlist/admin/users",
    method: "GET",
    params,
    secure: true,
  });
  return response;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  // Admin
  getWishlistedProducts,
  getProductWishlistUsers,
  getAllUsersWishlists,
};

export default wishlistService;