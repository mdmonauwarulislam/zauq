// src/services/reviewService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const createReview = async (payload) =>
  Request({
    url: apiUrls.reviews.create,
    method: "POST",
    data: payload,
    secure: true,
  });

const getProductReviews = async (productId) =>
  Request({
    url: apiUrls.reviews.productReviews(productId),
    method: "GET",
  });

const getFeaturedReviews = async () =>
  Request({
    url: apiUrls.reviews.featured,
    method: "GET",
  });

// Admin
const getAllReviews = async (params = {}) =>
  Request({
    url: apiUrls.reviews.list,
    method: "GET",
    params,
    secure: true,
  });

const approveReview = async (id) =>
  Request({
    url: apiUrls.reviews.approve(id),
    method: "PUT",
    secure: true,
  });

const deleteReview = async (id) =>
  Request({
    url: apiUrls.reviews.delete(id),
    method: "DELETE",
    secure: true,
  });

const toggleReviewFeatured = async (id, isFeatured) =>
  Request({
    url: apiUrls.reviews.feature(id),
    method: "PUT",
    data: { isFeatured },
    secure: true,
  });

const ReviewService = {
  createReview,
  getProductReviews,
  getFeaturedReviews,
  getAllReviews,
  approveReview,
  deleteReview,
  toggleReviewFeatured,
};

export default ReviewService;
