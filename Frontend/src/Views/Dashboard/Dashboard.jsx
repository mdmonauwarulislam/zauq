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
  Zap,
  ShoppingBag,
  Box,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Individual filters for each section
  const [salesFilter, setSalesFilter] = useState("weekly");
  const [orderFilter, setOrderFilter] = useState("weekly");
  const [customerFilter, setCustomerFilter] = useState("weekly");
  
  // Individual data states for each section
  const [salesData, setSalesData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [sectionLoading, setSectionLoading] = useState({
    sales: false,
    order: false,
    customer: false,
  });

  const fetchStats = async () => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      console.log("User not authenticated or not admin:", {
        isAuthenticated,
        user,
      });
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalItemsSold: 0,
        totalProfit: 0,
        ordersByStatus: {},
        orderDistribution: [],
        salesPerformance: [],
        customerMetrics: [],
        orderMetrics: [],
        topProducts: [],
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const { data } = await AdminService.getDashboardStats("weekly");
      clearTimeout(timeoutId);
      setStats(data.stats);
      setSalesData(data.stats.salesPerformance || []);
      setOrderData(data.stats.orderMetrics || []);
      setCustomerData(data.stats.customerMetrics || []);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalItemsSold: 0,
        totalProfit: 0,
        ordersByStatus: {},
        orderDistribution: [],
        salesPerformance: [],
        customerMetrics: [],
        orderMetrics: [],
        topProducts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionData = async (section, filter) => {
    try {
      setSectionLoading(prev => ({ ...prev, [section]: true }));
      const { data } = await AdminService.getDashboardStats(filter);
      
      if (section === 'sales') {
        setSalesData(data.stats.salesPerformance || []);
      } else if (section === 'order') {
        setOrderData(data.stats.orderMetrics || []);
      } else if (section === 'customer') {
        setCustomerData(data.stats.customerMetrics || []);
      }
    } catch (error) {
      console.error(`Failed to fetch ${section} data:`, error);
    } finally {
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user]);

  const handleSalesFilterChange = (newFilter) => {
    setSalesFilter(newFilter);
    fetchSectionData('sales', newFilter);
  };

  const handleOrderFilterChange = (newFilter) => {
    setOrderFilter(newFilter);
    fetchSectionData('order', newFilter);
  };

  const handleCustomerFilterChange = (newFilter) => {
    setCustomerFilter(newFilter);
    fetchSectionData('customer', newFilter);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("Sales") || entry.name.includes("Profit") || entry.name.includes("Cost")
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

  // Calculate percentages for order distribution
  const totalOrdersForDist = stats.orderDistribution?.reduce((sum, item) => sum + item.value, 0) || 0;

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-screen">
      {/* Header */}
      <div className="bg-brand-primary rounded-2xl p-8 shadow-xl text-brand-text-primary">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">
              Welcome back! Here's your store overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/dashboard/products")}
              className="flex items-center gap-2 bg-brand-text-primary hover:bg-brand-text-primary text-brand-primary font-medium px-5 py-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
            <Button
              onClick={() => navigate("/dashboard/orders")}
              className="flex items-center gap-2 bg-brand-secondary text-brand-text-primary hover:bg-brand-secondary/80 border font-medium px-5 py-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales */}
        <div
          onClick={() => navigate("/dashboard/orders")}
          className="group bg-white p-5 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <FaRupeeSign className="w-5 h-5 text-emerald-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => navigate("/dashboard/users")}
          className="group bg-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => navigate("/dashboard/orders")}
          className="group bg-white p-5 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => navigate("/dashboard/products")}
          className="group bg-white p-5 rounded-xl border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Box className="w-5 h-5 text-amber-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProducts)}</p>
          </div>
        </div>

        {/* Items Sold */}
        <div
          onClick={() => navigate("/dashboard/products")}
          className="group bg-white p-5 rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-rose-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-rose-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Products Sold</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalItemsSold)}</p>
          </div>
        </div>
      </div>

      {/* Order Distribution & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Order Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">Visual breakdown of order statuses</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pie Chart */}
              <div className="w-full md:w-1/2 h-64">
                {stats.orderDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.orderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stats.orderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No order data</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Legend & Stats */}
              <div className="w-full md:w-1/2 space-y-3">
                <div className="text-center md:text-left mb-4">
                  <p className="text-sm text-gray-500">Total Products Sold</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalItemsSold)}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Orders: {formatNumber(stats.totalOrders)}</p>
                </div>
                {stats.orderDistribution?.map((item, index) => {
                  const percentage = totalOrdersForDist > 0 ? ((item.value / totalOrdersForDist) * 100).toFixed(1) : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{formatNumber(item.value)}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products - Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Most Ordered Products
            </h3>
            <p className="text-sm text-gray-600 mt-1">Top 5 best-selling products</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Full Pie Chart */}
              <div className="w-full md:w-1/2 h-64">
                {stats.topProducts?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.topProducts.map((p, i) => ({
                          name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
                          value: p.sold,
                          color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][i],
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stats.topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [formatNumber(value) + ' orders', name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No products sold yet</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Product List with Rank */}
              <div className="w-full md:w-1/2 space-y-2">
                {stats.topProducts?.length > 0 ? (
                  <>
                    <div className="text-center md:text-left mb-3 pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total from Top 5</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.topProducts.reduce((sum, p) => sum + p.sold, 0))} orders
                      </p>
                    </div>
                    {stats.topProducts.map((product, index) => {
                      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
                      const bgColors = ['bg-emerald-50 hover:bg-emerald-100', 'bg-blue-50 hover:bg-blue-100', 'bg-purple-50 hover:bg-purple-100', 'bg-amber-50 hover:bg-amber-100', 'bg-red-50 hover:bg-red-100'];
                      const textColors = ['text-emerald-700', 'text-blue-700', 'text-purple-700', 'text-amber-700', 'text-red-700'];
                      const totalSold = stats.topProducts.reduce((sum, p) => sum + p.sold, 0);
                      const percentage = totalSold > 0 ? ((product.sold / totalSold) * 100).toFixed(1) : 0;
                      return (
                        <div
                          key={product._id}
                          onClick={() => navigate(`/dashboard/products/${product._id}`)}
                          className={`flex items-center gap-3 p-3 rounded-xl ${bgColors[index]} transition-all cursor-pointer`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${colors[index]}`}>
                            #{index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product.name} <span className="text-gray-500 font-normal">({percentage}%)</span>
                            </p>
                            <p className="text-xs text-gray-500">{formatCurrency(product.discountedPrice || product.price)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${textColors[index]}`}>{formatNumber(product.sold)}</p>
                            <p className="text-xs text-gray-500">orders</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No products sold yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales & Profit Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sales & Profit Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">Track your revenue, cost, and profit trends</p>
            </div>
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleSalesFilterChange(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    salesFilter === f
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          {sectionLoading.sales ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="h-80">
                {salesData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotoneX" dataKey="sales" name="Sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6' }} activeDot={{ r: 7 }} />
                      <Line type="monotoneX" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} activeDot={{ r: 7 }} />
                      <Line type="monotoneX" dataKey="cost" name="Cost" stroke="#EF4444" strokeWidth={3} dot={{ r: 5, fill: '#EF4444' }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No sales data for this period</p>
                      <p className="text-sm mt-1">Try selecting a different time range</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Summary Cards */}
              {salesData?.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(salesData.reduce((sum, item) => sum + item.sales, 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(salesData.reduce((sum, item) => sum + item.profit, 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(salesData.reduce((sum, item) => sum + item.cost, 0))}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-linear-to-r from-purple-50 to-pink-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Order Performance Metrics
                </h3>
                <p className="text-sm text-gray-600 mt-1">Order trends over time</p>
              </div>
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleOrderFilterChange(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      orderFilter === f
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            {sectionLoading.order ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="h-64">
                {orderData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={orderData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotoneX" dataKey="total" name="Total Orders" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} activeDot={{ r: 6 }} />
                      <Line type="monotoneX" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                      <Line type="monotoneX" dataKey="cancelled" name="Cancelled" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No order metrics available</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-linear-to-r from-cyan-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  Customer Growth Metrics
                </h3>
                <p className="text-sm text-gray-600 mt-1">New customer registrations</p>
              </div>
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleCustomerFilterChange(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      customerFilter === f
                        ? 'bg-white text-cyan-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            {sectionLoading.customer ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <div className="h-64">
                {customerData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotoneX" dataKey="newCustomers" name="New Customers" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No customer data available</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-slate-50 to-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h3>
          <p className="text-sm text-gray-600 mt-1">Navigate to key sections quickly</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { path: "/dashboard/categories", icon: Package, label: "Categories", color: "purple" },
              { path: "/dashboard/products", icon: Plus, label: "Products", color: "blue" },
              { path: "/dashboard/orders", icon: ShoppingCart, label: "Orders", color: "green" },
              { path: "/dashboard/users", icon: Users, label: "Users", color: "indigo" },
              { path: "/dashboard/reviews", icon: Star, label: "Reviews", color: "yellow" },
              { path: "/dashboard/coupons", icon: DollarSign, label: "Coupons", color: "pink" },
              { path: "/dashboard/hero", icon: Eye, label: "Hero", color: "orange" },
              { path: "/dashboard/navbar", icon: Settings, label: "Navbar", color: "teal" },
            ].map((item) => {
              const Icon = item.icon;
              const colorClasses = {
                purple: "from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-300 text-purple-600",
                blue: "from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300 text-blue-600",
                green: "from-green-50 to-green-100/50 border-green-200 hover:border-green-300 text-green-600",
                indigo: "from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-300 text-indigo-600",
                yellow: "from-yellow-50 to-yellow-100/50 border-yellow-200 hover:border-yellow-300 text-yellow-600",
                pink: "from-pink-50 to-pink-100/50 border-pink-200 hover:border-pink-300 text-pink-600",
                orange: "from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-300 text-orange-600",
                teal: "from-teal-50 to-teal-100/50 border-teal-200 hover:border-teal-300 text-teal-600",
              };
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group h-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-linear-to-br ${colorClasses[item.color]} border hover:shadow-md transition-all cursor-pointer`}
                >
                  <Icon className={`w-5 h-5 ${colorClasses[item.color].split(' ').pop()} group-hover:scale-110 transition-transform`} />
                  <span className={`text-xs font-medium ${colorClasses[item.color].split(' ').pop()}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;