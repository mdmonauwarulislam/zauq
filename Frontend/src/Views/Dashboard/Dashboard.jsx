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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard/products")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/orders")}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalUsers)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalOrders)}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <FaRupeeSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalPaidOrders)}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Order Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Products
          </h3>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={product._id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(product.sold)} sold
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.discountedPrice || product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Sales Overview (Last 7 Days)
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart visualization would go here</p>
            <p className="text-sm mt-1">
              {stats.salesLast7Days.length} days of data available
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/categories")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <Package className="w-6 h-6" />
            <span className="text-sm">Categories</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/products")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Products</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/orders")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-sm">Orders</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/users")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <Users className="w-6 h-6" />
            <span className="text-sm">Users</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/reviews")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <Star className="w-6 h-6" />
            <span className="text-sm">Reviews</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/coupons")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-sm">Coupons</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/hero")}
            className="h-20 flex flex-col items-center gap-2"
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm">Hero Config</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;