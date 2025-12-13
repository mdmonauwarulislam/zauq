// src/services/categoryService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getCategories = async () =>
  Request({
    url: apiUrls.categories.list,
    method: "GET",
  });

const getFeaturedCategories = async () =>
  Request({
    url: apiUrls.categories.featured,
    method: "GET",
  });

const getCategoryById = async (id) =>
  Request({
    url: apiUrls.categories.byId(id),
    method: "GET",
  });

// Admin
const createCategory = async (payload) => {
  console.log("Creating category with payload:", payload);
  console.log("Token in localStorage:", localStorage.getItem("access_token"));
  return Request({
    url: apiUrls.categories.list,
    method: "POST",
    data: payload,
    secure: true,
  });
};

const updateCategory = async (id, payload) =>
  Request({
    url: apiUrls.categories.byId(id),
    method: "PUT",
    data: payload,
    secure: true,
  });

const deleteCategory = async (id) =>
  Request({
    url: apiUrls.categories.byId(id),
    method: "DELETE",
    secure: true,
  });

const CategoryService = {
  getCategories,
  getFeaturedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default CategoryService;
