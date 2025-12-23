import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Heart,
  Star,
  Package,
  Gift,
  Zap,
  X,
  Home,
} from "lucide-react";

import AuthService from "@/services/AuthService";
import { authStart, authFailure, loginSuccess } from "@/redux/slices/authSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect away from Signup
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = form;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return false;
    }

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!password) {
      toast.error("Please enter a password.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(authStart());

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const { data } = await AuthService.signup(payload);

      if (!data?.token || !data?.user) {
        throw new Error("Invalid response from server");
      }

      dispatch(
        loginSuccess({
          token: data.token,
          user: data.user,
        })
      );

      toast.success("Account created successfully ✨");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Signup error:", error);
      dispatch(authFailure());

      // Detailed errors already handled by Request (toasts)
      if (!error?.data?.message) {
        toast.error("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-brand-primary-light via-brand-secondary-light to-brand-primary-light">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Icons */}
        <div className="absolute top-10 right-16 animate-float">
          <Gift className="w-14 h-14 text-purple-300 opacity-20" />
        </div>
        <div className="absolute top-1/4 left-16 animate-float-delayed">
          <Star className="w-12 h-12 text-yellow-300 opacity-20" />
        </div>
        <div className="absolute bottom-40 right-20 animate-float">
          <Heart className="w-16 h-16 text-pink-300 opacity-20" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float-delayed">
          <Zap className="w-10 h-10 text-blue-300 opacity-20" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float">
          <Package className="w-12 h-12 text-purple-300 opacity-20" />
        </div>
        <div className="absolute top-20 left-1/3 animate-float-delayed">
          <ShoppingBag className="w-14 h-14 text-pink-300 opacity-20" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 right-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-12 md:py-12">
        {/* Return to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute cursor-pointer top-6 left-4 md:left-8 z-10 px-4 py-2.5 bg-white/70 backdrop-blur-md hover:bg-white/90 rounded-full shadow-xl border border-white/30 transition-all transform hover:scale-105 group flex items-center gap-2"
          aria-label="Return to home"
        >
          <Home className="w-4 h-4 text-brand-primary " />
          <span className="text-sm font-semibold text-brand-primary ">
            Back to Home
          </span>
        </button>

        {/* Glassmorphic Modal */}
        <div className="w-full max-w-lg">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-linear-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Brand */}
              <div className="text-center mb-8">
                
                <h1 className="text-4xl font-bold text-brand-primary bg-clip-text mb-2">
                  ZAUQ
                </h1>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Join us and start your fashion journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Saiful"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Islam"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-md border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="saiful@gmail.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-md border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Re-enter password"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary disabled:opacity-60 disabled:cursor-not-allowed text-brand-text-primary rounded-md text-sm font-semibold py-3.5 shadow-lg shadow-brand-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>Create ZAUQ Account</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-xs text-gray-500 font-medium px-2">
                  Already a member?
                </span>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Login link */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  Sign in to your account
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Signup;
