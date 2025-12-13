import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import UserProfile from "@/Views/account/UserProfile";
import Deals from "@/Views/deals/Deals";
import Home from "@/views/home/home";
import Product from "@/views/product/product";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchHomepageConfig } from "@/redux/slices/homepageSlice";

const MainLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHomepageConfig());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Product />} />
        <Route path="/profile" element={<UserProfile/>} />
        <Route path="/deals" element={<Deals/>} />

      </Routes>
      <Footer />
    </>
  );
};

export default MainLayout;
