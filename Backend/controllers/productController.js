import mongoose from "mongoose";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Get all products with filters, sort & pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, sort, page = 1, limit = 12, search } = req.query;

  const query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  let sortQuery = {};
  switch (sort) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "price-low":
      sortQuery = { discountedPrice: 1 };
      break;
    case "price-high":
      sortQuery = { discountedPrice: -1 };
      break;
    case "popular":
      sortQuery = { sold: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .populate("category"),
    Product.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    products,
    total,
    pages: Math.ceil(total / limitNum),
  });
});

/**
 * @desc    Get latest products
 * @route   GET /api/products/latest
 * @access  Public
 */
export const getLatestProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ isLatest: true })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("category");

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    products,
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
      throw new ErrorHandler("Invalid product id", 400);
    }
  
    const product = await Product.findById(productId)
      .populate("category")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "firstName lastName" },
      });
  
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }
  
    // 🔹 Recommended products logic
    const RECOMMENDED_LIMIT = 8;
  
    const recommended = await Product.find({
      _id: { $ne: product._id },
      category: product.category?._id || product.category,
    })
      .sort({ isLatest: -1, sold: -1, createdAt: -1 })
      .limit(RECOMMENDED_LIMIT)
      .select("name slug images discountedPrice price isLatest category");
  
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS,
      product,
      recommended,
    });
});

/**
 * @desc    Get products by IDs
 * @route   GET /api/products/by-ids?ids=comma,separated,ids
 * @access  Public
 */


export const getProductsByIds = asyncHandler(async (req, res) => {
    const idsParam = req.query.ids;
  
    if (!idsParam) {
      return res.status(400).json({
        success: false,
        message: "Product IDs are required",
      });
    }
  
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.isValidObjectId(id));
  
    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "No valid product IDs provided",
      });
    }
  
    const products = await Product.find({ _id: { $in: ids } })
      .select("name slug images discountedPrice price isLatest category")
      .populate("category");
  
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS,
      products,
    });
  });
  

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});


/**
 * GET /api/products/deals
 * public endpoint returning products for "Deals" page
 */
export const getDeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = "discount" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    $or: [
      { discount: { $gt: 0 } },
      { isLatest: true },
    ],
  };

  let sortQuery = { discount: -1 };
  if (sort === "price-low") sortQuery = { discountedPrice: 1 };
  if (sort === "price-high") sortQuery = { discountedPrice: -1 };
  if (sort === "newest") sortQuery = { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortQuery).skip(skip).limit(Number(limit)).populate("category"),
    Product.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    products,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  });
});