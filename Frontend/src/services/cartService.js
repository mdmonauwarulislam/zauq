import api from "../config/apiConfig";

class CartService {
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  }

  async addToCart(productId, quantity = 1) {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  }

  async updateCartItem(productId, quantity) {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  }

  async removeFromCart(productId) {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  }

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  }
}

const cartService = new CartService();
export default cartService;