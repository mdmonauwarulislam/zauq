// src/config/apiConfig.js
import axios from "axios";
import toast from "react-hot-toast";
import store from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Request = async (httpOptions) => {
  const token = localStorage.getItem("access_token");

  // Prefix base URL unless `exact` is true
  if (!httpOptions.exact) {
    const base = API_BASE_URL?.replace(/\/+$/, ""); // remove trailing slash
    const path = String(httpOptions.url || "").replace(/^\/+/, ""); // remove leading slash
    httpOptions.url = `${base}/${path}`;
  }

  httpOptions.headers = {
    "Content-Type": httpOptions.files
      ? "multipart/form-data"
      : "application/json",
    Accept: "application/json",
    ...httpOptions.headers,
  };

  // Attach JWT if secure
  if (httpOptions.secure && token) {
    httpOptions.headers.Authorization = `Bearer ${token}`;
  }

  const handleRequestErrors = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.log("API error response:", data);

      if (status === 401) {
        // Any 401 → logout and redirect
        store.dispatch(logout());
        toast.error(data?.message || "Session expired. Please login again.");
        window.location.replace("/login");
      } else if (status === 403) {
        toast.error(data?.message || "You are not allowed to perform this action.");
      } else if (status === 413) {
        toast.error("File size exceeds the allowed limit.");
      } else if (data?.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      console.log("API error request:", error.request);
      toast.error("No response from server. Please check your connection.");
    } else {
      console.log("API error message:", error.message);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return axios(httpOptions)
    .then((response) => response)
    .catch((error) => {
      handleRequestErrors(error);
      // rethrow so calling code can handle if needed
      throw error?.response || error;
    });
};

export default Request;
