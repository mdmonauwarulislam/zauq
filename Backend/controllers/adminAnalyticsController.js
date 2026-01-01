
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
 * Helper function to get date range based on filter
 */
const getDateRange = (filter) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (filter) {
    case 'daily':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return { startDate, endDate: now };
};

/**
 * Helper function to get date format for aggregation
 */
const getDateFormat = (filter) => {
  switch (filter) {
    case 'daily':
      return "%Y-%m-%d %H:00"; // Hourly for daily with date
    case 'weekly':
      return "%Y-%m-%d"; // Daily for weekly
    case 'monthly':
      return "%Y-%m-%d"; // Daily for monthly
    case 'yearly':
      return "%Y-%m"; // Monthly for yearly
    default:
      return "%Y-%m-%d";
  }
};

/**
 * Helper function to format date labels based on filter
 */
const formatDateLabel = (dateStr, filter) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (filter) {
    case 'daily': {
      // Format: "10:00" or "2 PM"
      const parts = dateStr.split(' ');
      if (parts.length > 1) {
        const hour = parseInt(parts[1].split(':')[0]);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12} ${ampm}`;
      }
      return dateStr;
    }
    case 'weekly': {
      // Format: "Jan 1"
      const date = new Date(dateStr);
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
    case 'monthly': {
      // Format: "Jan 1" or "Week 1"
      const date = new Date(dateStr);
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
    case 'yearly': {
      // Format: "Jan 2025"
      const [year, month] = dateStr.split('-');
      return `${months[parseInt(month) - 1]} ${year}`;
    }
    default:
      return dateStr;
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const { filter = 'weekly' } = req.query;
  const { startDate, endDate } = getDateRange(filter);
  const dateFormat = getDateFormat(filter);

  // Parallel queries for efficiency
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    completedOrdersAgg,
    ordersByStatusAgg,
    salesDataAgg,
    topProducts,
    totalItemsSold,
    customerGrowthAgg,
    orderGrowthAgg,
  ] = await Promise.all([
    // Total users (customers)
    User.countDocuments(),
    // Total orders
    Order.countDocuments(),
    // Total products
    Product.countDocuments(),
    // Total revenue from completed payments
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.COMPLETED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" },
          totalPaidOrders: { $sum: 1 },
          totalCost: { $sum: { $ifNull: ["$totalCost", 0] } },
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
    // Sales data based on filter
    Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.COMPLETED,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" },
          },
          totalSales: { $sum: "$finalPrice" },
          totalCost: { $sum: { $ifNull: ["$totalCost", 0] } },
          ordersCount: { $sum: 1 },
          itemsCount: { $sum: { $size: { $ifNull: ["$items", []] } } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Top 5 products by sold count
    Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(5)
      .select("name slug sold price discountedPrice images"),
    // Total items sold
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.COMPLETED } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalItems: { $sum: "$items.quantity" },
        },
      },
    ]),
    // Customer growth over time
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" },
          },
          newCustomers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Order growth over time
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", ORDER_STATUS.DELIVERED] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", ORDER_STATUS.CANCELLED] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = completedOrdersAgg[0]?.totalRevenue || 0;
  const totalPaidOrders = completedOrdersAgg[0]?.totalPaidOrders || 0;
  const totalCost = completedOrdersAgg[0]?.totalCost || 0;
  const totalItemsSoldCount = totalItemsSold[0]?.totalItems || 0;

  // Normalize ordersByStatus to an object keyed by ORDER_STATUS
  const ordersByStatus = Object.values(ORDER_STATUS).reduce((acc, status) => {
    acc[status] =
      ordersByStatusAgg.find((item) => item._id === status)?.count || 0;
    return acc;
  }, {});

  // Calculate order distribution for pie chart
  const orderDistribution = [
    { name: 'Processing', value: ordersByStatus.processing || 0, color: '#3B82F6' },
    { name: 'Shipped', value: ordersByStatus.shipped || 0, color: '#8B5CF6' },
    { name: 'Delivered', value: ordersByStatus.delivered || 0, color: '#10B981' },
    { name: 'Cancelled', value: ordersByStatus.cancelled || 0, color: '#EF4444' },
    { name: 'Pending', value: ordersByStatus.pending || 0, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  // Process sales data for charts with formatted date labels
  const salesPerformance = salesDataAgg.map(item => ({
    date: formatDateLabel(item._id, filter),
    rawDate: item._id,
    sales: item.totalSales,
    cost: item.totalCost,
    profit: item.totalSales - item.totalCost,
    orders: item.ordersCount,
    items: item.itemsCount,
  }));

  // Process customer growth data with formatted date labels
  const customerMetrics = customerGrowthAgg.map(item => ({
    date: formatDateLabel(item._id, filter),
    rawDate: item._id,
    newCustomers: item.newCustomers,
  }));

  // Process order growth data with formatted date labels
  const orderMetrics = orderGrowthAgg.map(item => ({
    date: formatDateLabel(item._id, filter),
    rawDate: item._id,
    total: item.totalOrders,
    completed: item.completedOrders,
    cancelled: item.cancelledOrders,
  }));

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    stats: {
      // Summary stats
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      totalPaidOrders,
      totalItemsSold: totalItemsSoldCount,
      totalProfit: totalRevenue - totalCost,
      
      // Order distribution for pie chart
      ordersByStatus,
      orderDistribution,
      
      // Time-series data for charts
      salesPerformance,
      customerMetrics,
      orderMetrics,
      
      // Top products
      topProducts,
      
      // Filter info
      currentFilter: filter,
    },
  });
});
