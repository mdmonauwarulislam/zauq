import Request from "../config/apiConfig";
import apiUrls from "../config/apiUrls";

const getCart = async () => {
  const response = await Request({
    url: apiUrls.cart.list,
    method: "GET",
    secure: true,
  });
  return response.data;
};

const addToCart = async (productId, quantity = 1) => {
  const response = await Request({
    url: apiUrls.cart.add,
    method: "POST",
    data: { productId, quantity },
    secure: true,
  });
  return response.data;
};

const updateCartItem = async (productId, quantity) => {
  const response = await Request({
    url: apiUrls.cart.update(productId),
    method: "PUT",
    data: { quantity },
    secure: true,
  });
  return response.data;
};

const removeFromCart = async (productId) => {
  const response = await Request({
    url: apiUrls.cart.remove(productId),
    method: "DELETE",
    secure: true,
  });
  return response.data;
};

const clearCart = async () => {
  const response = await Request({
    url: apiUrls.cart.clear,
    method: "DELETE",
    secure: true,
  });
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default cartService;