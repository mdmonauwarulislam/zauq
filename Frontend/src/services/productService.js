// src/services/productService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getProducts = async (params = {}) =>
  Request({
    url: apiUrls.products.list,
    method: "GET",
    params,
  });

const getLatestProducts = async (limit) =>
  Request({
    url: apiUrls.products.latest,
    method: "GET",
    params: limit ? { limit } : undefined,
  });

const getProductById = async (id) =>
  Request({
    url: apiUrls.products.byId(id),
    method: "GET",
  });

const getProductsByIds = async (ids = []) =>
  Request({
    url: apiUrls.products.byIds,
    method: "GET",
    params: { ids: ids.join(",") },
  });

// Admin
const createProduct = async (payload) =>
  Request({
    url: apiUrls.products.list,
    method: "POST",
    data: payload,
    secure: true,
  });

const updateProduct = async (id, payload) =>
  Request({
    url: apiUrls.products.byId(id),
    method: "PUT",
    data: payload,
    secure: true,
  });

const deleteProduct = async (id) =>
  Request({
    url: apiUrls.products.byId(id),
    method: "DELETE",
    secure: true,
  });

  const getDeals = ({ page = 1, limit = 20, sort = "discount" } = {}) =>
  Request({
    url: apiUrls.products.deals,
    method: "GET",
    params: { page, limit, sort },
  });

const ProductService = {
  getProducts,
  getLatestProducts,
  getProductById,
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  getDeals,
};

export default ProductService;
