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
const getAllCoupons = async () =>
  Request({
    url: apiUrls.coupons.list,
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

const deleteCoupon = async (id) =>
  Request({
    url: apiUrls.coupons.delete(id),
    method: "DELETE",
    secure: true,
  });

const CouponService = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

export default CouponService;
