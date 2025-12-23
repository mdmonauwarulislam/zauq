// src/config/apiUrls.js

const apiUrls = {
  base_url: import.meta.env.VITE_API_URL,

  // Auth
  auth: {
    login: "auth/login",
    signup: "auth/signup",
    me: "auth/me",
    updateProfile: "auth/me",
    changePassword: "auth/change-password",
    users: "auth/users", // admin: get all
    userById: (id) => `auth/users/${id}`, // admin: get/update/delete
  },

  // Products
  products: {
    list: "products",
    latest: "products/latest",
    byIds: "products/by-ids",
    byId: (id) => `products/${id}`,
    deals: "products/deals",
  },

  // Categories
  categories: {
    list: "categories",
    featured: "categories/featured",
    byId: (id) => `categories/${id}`,
  },

  // Orders
  orders: {
    create: "orders",
    myOrders: "orders/my",
    all: "orders", // admin (with query params)
    byId: (id) => `orders/${id}`,
    updateStatus: (id) => `orders/${id}/status`,
  },

  // Reviews
  reviews: {
    create: "reviews",
    productReviews: (productId) => `reviews/product/${productId}`,
    featured: "reviews/featured",
    list: "reviews", // admin
    approve: (id) => `reviews/${id}/approve`,
    delete: (id) => `reviews/${id}`,
    feature: (id) => `reviews/${id}/feature`,
  },

  // Coupons
  coupons: {
    validate: "coupons/validate",
    list: "coupons",          // admin
    create: "coupons",        // admin
    update: (id) => `coupons/${id}`,
    delete: (id) => `coupons/${id}`,
  },

  // Payments (Razorpay only)
  payments: {
    createRazorpayOrder: "payments/razorpay/order",
    verifyRazorpayPayment: "payments/razorpay/verify",
    paymentStatus: (paymentId) => `payments/razorpay/${paymentId}`, // admin
  },

  // Homepage config
  homepage: {
    getConfig: "homepage",
    updateConfig: "homepage",       
    updateNavbar: "homepage/navbar",
    updateSaleBanner: "homepage/sale-banner",
  },

  // Admin analytics
  admin: {
    stats: "admin/stats",
  },

  // Cloudinary
  cloudinary: {
    upload: "cloudinary/upload",
    deleteImage: "cloudinary/delete",
    signature: "cloudinary/signature",
  },

  // Cart
  cart: {
    list: "cart",
    add: "cart",
    update: (productId) => `cart/${productId}`,
    remove: (productId) => `cart/${productId}`,
    clear: "cart",
  },

  // Wishlist
  wishlist: {
    list: "wishlist",
    add: "wishlist",
    remove: (productId) => `wishlist/${productId}`,
    clear: "wishlist",
  },
};

export default apiUrls;
