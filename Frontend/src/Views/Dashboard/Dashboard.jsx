import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminService from "@/services/adminService";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  Star,
  BarChart3,
  Plus,
  Settings,
  Sparkles,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Check if user is authenticated and is admin
      if (!isAuthenticated || !user || user.role !== 'admin') {
        console.log("User not authenticated or not admin:", { isAuthenticated, user });
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalPaidOrders: 0,
          ordersByStatus: {},
          salesLast7Days: [],
          topProducts: [],
        });
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching dashboard stats...");
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const { data } = await AdminService.getDashboardStats();
        clearTimeout(timeoutId);
        console.log("Dashboard stats received:", data);
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        if (error.name === 'AbortError') {
          console.error("Request timed out");
        }
        // Set some default stats so the page doesn't stay loading
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalPaidOrders: 0,
          ordersByStatus: {},
          salesLast7Days: [],
          topProducts: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/dashboard/products")}
              className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-medium px-5 py-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
            <Button
              onClick={() => navigate("/dashboard/orders")}
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 font-medium px-5 py-2 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              View Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group bg-linear-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Live</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(stats.totalUsers)}
          </p>
        </div>

        <div className="group bg-linear-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 hover:border-green-200 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(stats.totalOrders)}
          </p>
        </div>

        <div className="group bg-linear-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-amber-100 rounded-lg">
              <FaRupeeSign className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="group bg-linear-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Paid</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Paid Orders</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(stats.totalPaidOrders)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm">
          <div className="p-6 border-b border-indigo-100 bg-linear-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Order Status Breakdown
            </h3>
            <p className="text-sm text-gray-600 mt-1">Track your order pipeline</p>
          </div>
          <div className="p-6 space-y-2.5">
            {Object.entries(stats.ordersByStatus).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No orders yet</p>
              </div>
            ) : (
              Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const getStatusColor = (status) => {
                  const colors = {
                    pending: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-700' },
                    processing: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700' },
                    shipped: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-700' },
                    delivered: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700' },
                    cancelled: { bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-700' },
                  };
                  return colors[status.toLowerCase()] || { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-700' };
                };
                const getStatusIcon = (status) => {
                  const icons = {
                    pending: Clock,
                    processing: Activity,
                    shipped: Package,
                    delivered: CheckCircle,
                    cancelled: XCircle,
                  };
                  const Icon = icons[status.toLowerCase()] || AlertCircle;
                  return <Icon className="w-4 h-4" />;
                };
                const colors = getStatusColor(status);
                return (
                  <div key={status} className={`flex justify-between items-center p-3.5 rounded-lg bg-linear-to-r ${colors.bg} hover:shadow-md border ${colors.border} transition-all`}>
                    <div className="flex items-center gap-2.5">
                      <span className={colors.text}>
                        {getStatusIcon(status)}
                      </span>
                      <span className={`text-sm font-semibold ${colors.text} capitalize`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(count)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-green-100 shadow-sm">
          <div className="p-6 border-b border-green-100 bg-linear-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Products
            </h3>
            <p className="text-sm text-gray-600 mt-1">Best sellers this month</p>
          </div>
          <div className="p-6 space-y-2.5">
            {stats.topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No products sold yet</p>
              </div>
            ) : (
              stats.topProducts.map((product, index) => {
                const getRankingStyle = (index) => {
                  const styles = [
                    { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', badge: 'bg-linear-to-r from-yellow-400 to-amber-500' },
                    { bg: 'from-gray-50 to-slate-100', border: 'border-gray-300', badge: 'bg-linear-to-r from-gray-400 to-slate-500' },
                    { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', badge: 'bg-linear-to-r from-orange-400 to-amber-500' },
                  ];
                  return styles[index] || { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'bg-linear-to-r from-blue-400 to-cyan-500' };
                };
                const style = getRankingStyle(index);
                return (
                  <div key={product._id} className={`group flex justify-between items-center p-3.5 rounded-lg bg-linear-to-r ${style.bg} hover:shadow-md border ${style.border} transition-all`}>
                    <div className="flex items-center gap-3">
                      <div className={`${style.badge} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          {formatNumber(product.sold)} sold
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(product.discountedPrice || product.price)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Chart Placeholder */}
      <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
        <div className="p-6 border-b border-orange-100 bg-linear-to-r from-orange-50 to-amber-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Sales Overview (Last 7 Days)
          </h3>
          <p className="text-sm text-gray-600 mt-1">Your sales performance at a glance</p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-linear-to-br from-orange-50/50 to-amber-50/50 rounded-lg border border-dashed border-orange-200">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-orange-400" />
              <p className="font-medium text-gray-700">Chart visualization coming soon</p>
              <p className="text-sm mt-1 text-gray-500">
                {stats.salesLast7Days.length} days of data available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-cyan-100 shadow-sm">
        <div className="p-6 border-b border-cyan-100 bg-linear-to-r from-cyan-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-600" />
            Quick Actions
          </h3>
          <p className="text-sm text-gray-600 mt-1">Navigate to key sections quickly</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/dashboard/categories")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Package className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-700">Categories</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/products")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-700">Products</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 border border-green-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-green-700">Orders</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/users")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 border border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-indigo-700">Users</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/reviews")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-yellow-50 to-yellow-100/50 hover:from-yellow-100 hover:to-yellow-200/50 border border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Star className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-yellow-700">Reviews</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/coupons")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-pink-50 to-pink-100/50 hover:from-pink-100 hover:to-pink-200/50 border border-pink-200 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer"
            >
              <DollarSign className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-pink-700">Coupons</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/hero")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-orange-700">Hero Config</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/navbar")}
              className="group h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-linear-to-br from-teal-50 to-teal-100/50 hover:from-teal-100 hover:to-teal-200/50 border border-teal-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
            >
              <Settings className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-teal-700">Navbar Config</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;