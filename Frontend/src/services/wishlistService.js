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

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};

export default wishlistService;