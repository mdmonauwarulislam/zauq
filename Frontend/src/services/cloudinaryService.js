// src/services/cloudinaryService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getSignature = async () =>
  Request({
    url: apiUrls.cloudinary.signature,
    method: "GET",
    secure: true,
  });

const deleteImage = async (publicId) =>
  Request({
    url: apiUrls.cloudinary.deleteImage,
    method: "POST",
    data: { publicId },
    secure: true,
  });

// Upload image through backend
const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        
        const response = await Request({
          url: apiUrls.cloudinary.upload,
          method: "POST",
          data: { 
            image: base64Image,
            folder: "profile_images"
          },
          secure: true,
        });

        if (response?.data?.url) {
          resolve({
            secure_url: response.data.url,
            public_id: response.data.publicId,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

const CloudinaryService = {
  getSignature,
  deleteImage,
  uploadImage,
};

export default CloudinaryService;
