import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler, ErrorHandler } from "../utils/error.js";
import { RESPONSE_MESSAGES } from "../utils/constant.js";

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const { visible } = req.query;

  const filter = {};
  if (visible === "true") filter.isVisible = true;
  if (visible === "false") filter.isVisible = false;

  const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });

  // Add product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        productCount,
        itemCount: productCount, // For backward compatibility
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    categories: categoriesWithCount,
  });
});

/**
 * @desc    Get featured categories (for home page)
 * @route   GET /api/categories/featured
 * @access  Public
 */
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;

  const categories = await Category.find({
    isFeatured: true,
    isVisible: true,
  })
    .sort({ displayOrder: 1, name: 1 })
    .limit(limit);

  // Add product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        productCount,
        itemCount: productCount, // For backward compatibility
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    categories: categoriesWithCount,
  });
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ErrorHandler("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    category,
  });
});

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ErrorHandler("Please provide category name", 400);
  }

  const exists = await Category.findOne({ name: name.trim() });
  if (exists) {
    throw new ErrorHandler("Category name already exists", 400);
  }

  const category = await Category.create({
    ...req.body,
    name: name.trim(),
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ErrorHandler("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new ErrorHandler("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
