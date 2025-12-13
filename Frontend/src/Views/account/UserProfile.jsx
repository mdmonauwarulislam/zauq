import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AuthService from "@/services/AuthService";
import OrderService from "@/services/orderService";
import { setUser } from "@/redux/slices/authSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch profile + orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProfile(true);
        setLoadingOrders(true);

        const [profileRes, ordersRes] = await Promise.all([
          AuthService.getCurrentUser(),
          OrderService.getMyOrders(),
        ]);

        const userData = profileRes?.data?.user;
        if (userData) {
          setProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
          });
          dispatch(setUser(userData));
        }

        setOrders(ordersRes?.data?.orders || []);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoadingProfile(false);
        setLoadingOrders(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error("Please provide your first and last name.");
      return;
    }

    try {
      setSavingProfile(true);
      const { data } = await AuthService.updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      });

      if (data?.user) {
        dispatch(setUser(data.user));
      }

      toast.success("Profile updated successfully ✨");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1.1fr,1.4fr]">
        {/* Left: Profile card */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/40">
          <h2 className="text-lg font-semibold mb-1">My Profile</h2>
          <p className="text-xs text-slate-400 mb-5">
            Manage your personal information and account details.
          </p>

          {loadingProfile ? (
            <p className="text-sm text-slate-400">Loading profile...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                    placeholder="Ayesha"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                    placeholder="Khan"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Email cannot be changed for now.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 mt-1 shadow-md shadow-rose-900/40 transition-transform active:scale-[0.98]"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          )}
        </section>

        {/* Right: Orders summary */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/40">
          <h2 className="text-lg font-semibold mb-1">My Orders</h2>
          <p className="text-xs text-slate-400 mb-4">
            Track your recent orders and their status.
          </p>

          {loadingOrders ? (
            <p className="text-sm text-slate-400">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-400">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-slate-800 bg-slate-950/50 rounded-xl p-3.5 text-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-slate-800 text-slate-200">
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {order.items?.length || 0} item
                      {order.items?.length > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-rose-300">
                      ₹{order.finalPrice?.toFixed(2) || order.finalPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                    <span>
                      Payment:{" "}
                      <span className="uppercase">
                        {order.paymentStatus || "pending"}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
