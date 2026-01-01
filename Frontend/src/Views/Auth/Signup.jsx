import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Package,
  Gift,
  Zap,
  Users,
  TrendingUp,
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

      if (!error?.data?.message) {
        toast.error("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
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
              className="hidden lg:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-primary transition-colors mb-4 group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
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
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pr-12"
                    placeholder="Create a strong password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  placeholder="Re-enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
                style={{ boxShadow: '0 8px 30px -8px rgba(61, 26, 120, 0.5)' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Sign In Button */}
            <Link
              to="/login"
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              <TrendingUp className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
              Sign In to Existing Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
          © 2026 ZAUQ. All rights reserved.
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden" style={{ background: 'linear-gradient(225deg, #3d1a78 0%, #6b21a8 50%, #3d1a78 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-24 right-16" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <Gift className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute top-40 left-24" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}>
            <Star className="w-14 h-14 text-white/15" />
          </div>
          <div className="absolute bottom-40 right-24" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
            <Heart className="w-10 h-10 text-white/20" />
          </div>
          <div className="absolute bottom-24 left-16" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '3s' }}>
            <ShoppingBag className="w-12 h-12 text-white/15" />
          </div>
          <div className="absolute top-1/3 right-1/3" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '4s' }}>
            <Zap className="w-8 h-8 text-white/10" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-12 w-full">
          <Link to="/" className="mb-6">
            <h1 className="text-5xl xl:text-6xl font-bold text-white tracking-tight drop-shadow-lg">ZAUQ</h1>
          </Link>
          
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-3 leading-tight">
            Join the<br />Family!
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-sm leading-relaxed">
            Create your account and unlock exclusive benefits, personalized recommendations, and much more.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Exclusive Access</p>
                <p className="text-xs text-white/50">Early access to new arrivals</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Faster Checkout</p>
                <p className="text-xs text-white/50">Save your preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Rewards Program</p>
                <p className="text-xs text-white/50">Earn points on every purchase</p>
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
      `}</style>
    </div>
  );
};

export default Signup;
