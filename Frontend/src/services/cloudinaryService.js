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

// Upload file to Cloudinary using signature returned from backend
const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  // get signature and upload preset/cloud name from backend
  const sigResp = await getSignature();
  const { timestamp, signature, uploadPreset, cloudName, apiKey } = sigResp?.data || {};

  if (!cloudName || !signature) {
    throw new Error("Cloudinary is not configured on the server");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  // Try with upload preset first, fallback to unsigned upload if preset fails
  let url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    // First try with upload preset
    if (uploadPreset) {
      form.append("upload_preset", uploadPreset);
    }

    const resp = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      // If preset doesn't exist, try without preset (requires unsigned upload)
      if (errorText.includes("Upload preset") && errorText.includes("not found")) {
        // Remove preset and try again with basic upload
        form.delete("upload_preset");
        const retryResp = await fetch(url, {
          method: "POST",
          body: form,
        });

        if (!retryResp.ok) {
          const retryText = await retryResp.text();
          throw new Error(`Cloudinary upload failed: ${retryText}`);
        }

        const retryData = await retryResp.json();
        return retryData;
      } else {
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }
    }

    const data = await resp.json();
    return data; // contains secure_url, public_id, etc.
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

const CloudinaryService = {
  getSignature,
  deleteImage,
  uploadImage,
};

export default CloudinaryService;
