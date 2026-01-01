// src/services/couponService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const validateCoupon = async (payload) =>
  Request({
    url: apiUrls.coupons.validate,
    method: "POST",
    data: payload,
    secure: true,
  });

// Admin
const getAllCoupons = async (params = {}) =>
  Request({
    url: apiUrls.coupons.list,
    method: "GET",
    params,
    secure: true,
  });

const getCouponById = async (id) =>
  Request({
    url: `${apiUrls.coupons.list}/${id}`,
    method: "GET",
    secure: true,
  });

const createCoupon = async (payload) =>
  Request({
    url: apiUrls.coupons.create,
    method: "POST",
    data: payload,
    secure: true,
  });

const updateCoupon = async (id, payload) =>
  Request({
    url: apiUrls.coupons.update(id),
    method: "PUT",
    data: payload,
    secure: true,
  });

const toggleCouponStatus = async (id) =>
  Request({
    url: `${apiUrls.coupons.list}/${id}/toggle`,
    method: "PUT",
    secure: true,
  });

const deleteCoupon = async (id) =>
  Request({
    url: apiUrls.coupons.delete(id),
    method: "DELETE",
    secure: true,
  });

const CouponService = {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
};

export default CouponService;
