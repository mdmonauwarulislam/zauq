import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShoppingBag, Sparkles, ArrowRight, Heart, Star, Package, Truck, Shield, Gift, Percent } from "lucide-react";

import AuthService from "@/services/AuthService";
import { authStart, authFailure, loginSuccess } from "@/redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // If already logged in, redirect (admin to dashboard, others to home)
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
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
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please enter both email and password.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(authStart());

      const { data } = await AuthService.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid response from server");
      }

      dispatch(
        loginSuccess({
          token: data.token,
          user: data.user,
        }),
      );

      toast.success("Logged in successfully ✨");
      
      if (data.user?.role === 'admin') {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(authFailure());

      if (!error?.data?.message) {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3d1a78 0%, #6b21a8 50%, #3d1a78 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-16" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <ShoppingBag className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute top-40 right-24" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}>
            <Heart className="w-14 h-14 text-white/15" />
          </div>
          <div className="absolute bottom-40 left-24" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
            <Star className="w-10 h-10 text-white/20" />
          </div>
          <div className="absolute bottom-24 right-16" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '3s' }}>
            <Package className="w-12 h-12 text-white/15" />
          </div>
          <div className="absolute top-1/3 left-1/3" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '4s' }}>
            <Gift className="w-8 h-8 text-white/10" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-12 w-full">
          <Link to="/" className="mb-6">
            <h1 className="text-5xl xl:text-6xl font-bold text-white tracking-tight drop-shadow-lg">ZAUQ</h1>
          </Link>
          
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-3 leading-tight">
            Welcome<br />Back!
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-sm leading-relaxed">
            Sign in to access your account, track orders, and continue your fashion journey.
          </p>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Premium Quality</p>
                <p className="text-xs text-white/50">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Secure Payments</p>
                <p className="text-xs text-white/50">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Exclusive Offers</p>
                <p className="text-xs text-white/50">Members-only deals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #3d1a78 0%, #6b21a8 100%)' }}>
          <Link to="/" className="text-2xl font-bold text-white">ZAUQ</Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-md">
            {/* Back to Home - Desktop */}
            <Link 
              to="/"
              className="hidden lg:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-primary transition-colors mb-6 group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-brand-primary font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ boxShadow: '0 8px 30px -8px rgba(61, 26, 120, 0.5)' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Sign Up Button */}
            <Link
              to="/signup"
              className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
              Create New Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
          © 2026 ZAUQ. All rights reserved.
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
