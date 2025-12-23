import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Signup from "./views/auth/Signup";
import Login from "./Views/Auth/Login";

import DashboardLayout from "./layout/dashboardLayout";
import MainLayout from "./layout/mainLayout";
import NotFoundPage from "./views/404";

import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AuthService from "./services/AuthService";
import { setUser, logout } from "./redux/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  // Initialize user data on app start if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          const { data } = await AuthService.getCurrentUser();
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Token might be invalid, logout
          dispatch(logout());
        }
      }
    };

    initializeAuth();
  }, [token, user, dispatch]);

  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected user routes (profile, later orders, etc.) */}
        <Route element={<ProtectedRoute />}>
          {/* we still want Navbar/Footer, so reuse MainLayout */}
          <Route path="/account/*" element={<MainLayout />} />
        </Route>

        {/* Admin-only dashboard */}
        <Route element={<AdminRoute />}>
          <Route path="/dashboard/*" element={<DashboardLayout />} />
        </Route>

        {/* Public site (home, products, etc.) */}
        <Route path="/*" element={<MainLayout />} />

        {/* Fallback 404 (if something slips through) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
