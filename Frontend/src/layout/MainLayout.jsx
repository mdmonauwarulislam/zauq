import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UserProfile from "@/Views/account/UserProfile";
import Deals from "@/Views/deals/Deals";
import Home from "@/Views/Home/Home";
import Product from "@/Views/Product/Product";
import ProductDetails from "@/Views/Product/ProductDetails";
import Categories from "@/Views/Category/Categories";
import Category from "@/Views/Category/Category";
import Checkout from "@/Views/Checkout/Checkout";
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
        <Route path="/collections" element={<Categories />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/products" element={<Product />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<UserProfile/>} />
        <Route path="/deals" element={<Deals/>} />
        <Route path="/checkout" element={<Checkout/>} />
      </Routes>
      <Footer />
    </>
  );
};

export default MainLayout;
