import React from "react";
import { Route, Routes } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Dashboard from "../Views/Dashboard/Dashboard";
import Categories from "../Views/Dashboard/Categories";
import Products from "../Views/Dashboard/Products";
import HeroConfig from "../Views/Dashboard/HeroConfig";
import NavbarConfig from "../Views/Dashboard/NavbarConfig";
import Coupons from "../Views/Dashboard/Coupons";
import Orders from "../Views/Dashboard/Orders";
import Users from "../Views/Dashboard/Users";
import Reviews from "../Views/Dashboard/Reviews";

const DashboardLayout = () => {
  return (
    <div className="bg-white flex flex-row gap-4 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/hero" element={<HeroConfig />} />
          <Route path="/navbar" element={<NavbarConfig />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
