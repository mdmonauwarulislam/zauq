// src/services/adminService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getDashboardStats = async () =>
  Request({
    url: apiUrls.admin.stats,
    method: "GET",
    secure: true,
  });

const AdminService = {
  getDashboardStats,
};

export default AdminService;
