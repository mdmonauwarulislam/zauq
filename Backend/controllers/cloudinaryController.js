import cloudinary from "cloudinary";
import { asyncHandler, ErrorHandler } from "../utils/error.js";

const { v2: cloud } = cloudinary;

cloud.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc    Delete image from Cloudinary
 * @route   POST /api/cloudinary/delete
 * @access  Private/Admin
 */
export const deleteImageFromCloudinary = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    throw new ErrorHandler("Public ID is required", 400);
  }

  const result = await cloud.uploader.destroy(publicId);

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    result,
  });
});

/**
 * @desc    Get Cloudinary signature for client-side upload
 * @route   GET /api/cloudinary/signature
 * @access  Private/Admin
 */
export const getCloudinarySignature = asyncHandler(async (req, res) => {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new ErrorHandler("Cloudinary is not properly configured", 500);
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Create signature for direct upload without preset
  const signature = cloud.utils.api_sign_request(
    {
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default", // fallback preset
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return res.status(200).json({
    success: true,
    timestamp,
    signature,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});
