
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  RESPONSE_MESSAGES,
} from "../utils/constant.js";

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Parallel queries for efficiency
  const [
    totalUsers,
    totalOrders,
    completedOrdersAgg,
    ordersByStatusAgg,
    salesLast7DaysAgg,
    topProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    // Total revenue from completed payments
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.COMPLETED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" },
          totalPaidOrders: { $sum: 1 },
        },
      },
    ]),
    // Orders count by status
    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    // Sales last 7 days
    Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.COMPLETED,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$finalPrice" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Top 5 products by sold count
    Product.find({})
      .sort({ sold: -1 })
      .limit(5)
      .select("name slug sold price discountedPrice"),
  ]);

  const totalRevenue = completedOrdersAgg[0]?.totalRevenue || 0;
  const totalPaidOrders = completedOrdersAgg[0]?.totalPaidOrders || 0;

  // Normalize ordersByStatus to an object keyed by ORDER_STATUS
  const ordersByStatus = Object.values(ORDER_STATUS).reduce((acc, status) => {
    acc[status] =
      ordersByStatusAgg.find((item) => item._id === status)?.count || 0;
    return acc;
  }, {});

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    stats: {
      totalUsers,
      totalOrders,
      totalRevenue,
      totalPaidOrders,
      ordersByStatus,
      salesLast7Days: salesLast7DaysAgg,
      topProducts,
    },
  });
});
