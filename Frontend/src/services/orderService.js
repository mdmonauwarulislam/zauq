// src/services/orderService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

// User
const createOrder = async (payload) =>
  Request({
    url: apiUrls.orders.create,
    method: "POST",
    data: payload,
    secure: true,
  });

const getMyOrders = async () =>
  Request({
    url: apiUrls.orders.myOrders,
    method: "GET",
    secure: true,
  });

const getOrderById = async (id) =>
  Request({
    url: apiUrls.orders.byId(id),
    method: "GET",
    secure: true,
  });

// Admin
const getAllOrders = async (params = {}) =>
  Request({
    url: apiUrls.orders.all,
    method: "GET",
    secure: true,
    params,
  });

const updateOrderStatus = async (id, status) =>
  Request({
    url: apiUrls.orders.updateStatus(id),
    method: "PUT",
    data: { status },
    secure: true,
  });

const OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};

export default OrderService;
