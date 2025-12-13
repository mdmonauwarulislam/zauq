// src/services/homepageService.js
import Request from "@/config/apiConfig";
import apiUrls from "@/config/apiUrls";

const getHomepageConfig = async () =>
  Request({
    url: apiUrls.homepage.getConfig,
    method: "GET",
  });

// Admin
const updateHomepageConfig = async (payload) =>
  Request({
    url: apiUrls.homepage.updateConfig,
    method: "PUT",
    data: payload,
    secure: true,
  });

const updateNavbarAndMarquee = async (payload) =>
  Request({
    url: apiUrls.homepage.updateNavbar,
    method: "PUT",
    data: payload,
    secure: true,
  });

  const updateSaleBanner = (payload) =>
  Request({
    url: apiUrls.homepage.updateSaleBanner,
    method: "PUT",
    data: payload,
    secure: true,
  });

const HomepageService = {
  getHomepageConfig,
  updateHomepageConfig,
  updateNavbarAndMarquee,
  updateSaleBanner,
};

export default HomepageService;
