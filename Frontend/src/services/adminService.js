// src/services/adminService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getDashboardStats = async (filter = 'weekly') =>
  Request({
    url: `${apiUrls.admin.stats}?filter=${filter}`,
    method: "GET",
    secure: true,
  });

const AdminService = {
  getDashboardStats,
};

export default AdminService;
