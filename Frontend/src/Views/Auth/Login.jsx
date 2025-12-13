import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

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

  // If already logged in, redirect (optional)
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
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please enter both email and password.");
      return false;
    }

    // Basic email format check
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
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      dispatch(authFailure());

      // error handling is already done in Request, this is fallback
      if (!error?.data?.message) {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-8 backdrop-blur">
        {/* Brand / Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-[0.2em] text-white">
            ZAUQ
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Login to continue your fashion journey ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200 mb-1.5"
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
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
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
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember / Forgot (optional future) */}
          {/* <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-rose-400 hover:text-rose-300"
            >
              Forgot password?
            </button>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 mt-2 shadow-lg shadow-rose-900/40 transition-transform active:scale-[0.98]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            OR
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Signup link */}
        <p className="mt-4 text-center text-xs text-slate-400">
          New to ZAUQ?{" "}
          <Link
            to="/signup"
            className="text-rose-400 hover:text-rose-300 font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
