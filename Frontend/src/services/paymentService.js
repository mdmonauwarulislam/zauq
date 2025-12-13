// src/services/paymentService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const createRazorpayOrder = async (payload) =>
  Request({
    url: apiUrls.payments.createRazorpayOrder,
    method: "POST",
    data: payload,
    secure: true,
  });

const verifyRazorpayPayment = async (payload) =>
  Request({
    url: apiUrls.payments.verifyRazorpayPayment,
    method: "POST",
    data: payload,
    secure: true,
  });

// Admin
const getPaymentStatus = async (paymentId) =>
  Request({
    url: apiUrls.payments.paymentStatus(paymentId),
    method: "GET",
    secure: true,
  });

const PaymentService = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
};

export default PaymentService;
