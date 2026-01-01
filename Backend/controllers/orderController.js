// controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  COUPON_TYPES,
  RESPONSE_MESSAGES,
  PAGINATION_LIMIT,
  DEFAULT_PAGE,
} from "../utils/constant.js";

/**
 * @desc    Create order (with optional coupon)
 * @route   POST /api/orders
 * @access  Private
 *
 * Body:
 *  - items: [{ product, quantity, size?, color? }]
 *  - shippingAddress: { name, phone, address, city, state, postalCode, country }
 *  - paymentMethod: "razorpay" (only online payment via Razorpay)
 *  - couponCode?: string
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode } = req.body;
  // Payment method is always razorpay since only online payment is available
  const paymentMethod = "razorpay";

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ErrorHandler("No items in order", 400);
  }

  if (!shippingAddress || !shippingAddress.address) {
    throw new ErrorHandler("Shipping address is required", 400);
  }

  if (!paymentMethod) {
    throw new ErrorHandler("Payment method is required", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalPrice = 0;
    let discountAmount = 0;
    let finalPrice = 0;
    let appliedCoupon = null;

    const orderItems = [];

    // 1️⃣ Process items, calculate total & update stock/sold
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new ErrorHandler(`Product ${item.product} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new ErrorHandler(`Insufficient stock for ${product.name}`, 400);
      }

      const price = product.discountedPrice ?? product.price;

      totalPrice += price * item.quantity;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price,
        size: item.size,
        color: item.color,
      });

      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save({ session });
    }

    // 2️⃣ Handle coupon (if couponCode provided)
    if (couponCode) {
      const now = new Date();
      const code = String(couponCode).trim().toUpperCase();

      const coupon = await Coupon.findOne({ code }).session(session);

      if (!coupon) {
        throw new ErrorHandler("Coupon not found", 404);
      }

      if (!coupon.isActive) {
        throw new ErrorHandler("Coupon is not active", 400);
      }

      if (now < coupon.startDate) {
        throw new ErrorHandler("Coupon is not yet valid", 400);
      }

      if (now > coupon.expiryDate) {
        throw new ErrorHandler("Coupon has expired", 400);
      }

      if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
        throw new ErrorHandler("Coupon usage limit reached", 400);
      }

      if (totalPrice < coupon.minOrderValue) {
        throw new ErrorHandler(
          `Minimum order value for this coupon is ${coupon.minOrderValue}`,
          400
        );
      }

      // Per-user usage check
      if (coupon.maxUsagePerUser) {
        const userUsageCount = await Order.countDocuments({
          user: req.user.id,
          couponApplied: coupon._id,
        }).session(session);

        if (userUsageCount >= coupon.maxUsagePerUser) {
          throw new ErrorHandler(
            "You have already used this coupon the maximum allowed times",
            400
          );
        }
      }

      // Calculate discount
      if (coupon.type === COUPON_TYPES.FLAT) {
        discountAmount = coupon.discount;
      } else if (coupon.type === COUPON_TYPES.PERCENTAGE) {
        discountAmount = (totalPrice * coupon.discount) / 100;
      }

      // Ensure discount isn't more than total
      if (discountAmount > totalPrice) {
        discountAmount = totalPrice;
      }

      finalPrice = totalPrice - discountAmount;
      appliedCoupon = coupon;

      // Increment coupon usage
      coupon.usedCount += 1;
      await coupon.save({ session });
    } else {
      // No coupon → finalPrice == totalPrice
      finalPrice = totalPrice;
    }

    // 3️⃣ Create order with discount + couponApplied
    const [order] = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          totalPrice,
          discount: discountAmount,
          finalPrice,
          shippingAddress,
          paymentMethod,
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
          couponApplied: appliedCoupon ? appliedCoupon._id : null,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    orders,
  });
});

/**
 * @desc    Get single order (user or admin)
 * @route   GET /api/orders/:id
 * @access  Private (owner) / Admin
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ErrorHandler("Invalid order id", 400);
  }

  const order = await Order.findById(orderId)
    .populate("items.product")
    .populate("user", "firstName lastName email");

  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  // If not admin, ensure this is user's own order
  if (req.user.role !== "admin" && order.user._id.toString() !== req.user.id) {
    throw new ErrorHandler("Not authorized to view this order", 403);
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    order,
  });
});

/**
 * @desc    Get all orders (admin with filters & pagination)
 * @route   GET /api/orders
 * @access  Private/Admin
 *
 * Query:
 *  - status?: string
 *  - paymentStatus?: string
 *  - startDate?: string (ISO date)
 *  - endDate?: string (ISO date)
 *  - sort?: string (field name, prefix with - for descending)
 *  - page?: number
 *  - limit?: number
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { 
    status, 
    paymentStatus,
    startDate,
    endDate,
    sort = "-createdAt",
    page = DEFAULT_PAGE, 
    limit = PAGINATION_LIMIT 
  } = req.query;

  const query = {};
  
  // Status filter
  if (status && Object.values(ORDER_STATUS).includes(status)) {
    query.status = status;
  }
  
  // Payment status filter (convert frontend value to backend constant)
  if (paymentStatus) {
    const paymentStatusMap = {
      'Paid': PAYMENT_STATUS.COMPLETED,
      'Pending': PAYMENT_STATUS.PENDING,
      'Failed': PAYMENT_STATUS.FAILED,
      'completed': PAYMENT_STATUS.COMPLETED,
      'pending': PAYMENT_STATUS.PENDING,
      'failed': PAYMENT_STATUS.FAILED,
    };
    const mappedStatus = paymentStatusMap[paymentStatus];
    if (mappedStatus && Object.values(PAYMENT_STATUS).includes(mappedStatus)) {
      query.paymentStatus = mappedStatus;
    }
  }
  
  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  const pageNum = Number(page) || DEFAULT_PAGE;
  const limitNum = Number(limit) || PAGINATION_LIMIT;
  const skip = (pageNum - 1) * limitNum;
  
  // Build sort object
  let sortObj = { createdAt: -1 }; // default
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    sortObj = { [sortField]: sortOrder };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "firstName lastName email")
      .populate("items.product")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    orders,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalOrders: total,
    },
  });
});

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 *
 * Body:
 *  - status: one of ORDER_STATUS
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new ErrorHandler("Invalid order status", 400);
  }

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ErrorHandler("Invalid order id", 400);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  )
    .populate("user", "firstName lastName email")
    .populate("items.product");

  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});
