/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import CouponService from "@/services/couponService";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Tag,
  Percent,
  Calendar,
  Users,
  DollarSign,
  MoreVertical,
  AlertTriangle,
  Ticket,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Power,
  Copy,
  TrendingUp,
  ShoppingCart,
  Ban,
} from "lucide-react";

const emptyCoupon = {
  code: "",
  type: "percentage",
  discount: 0,
  minOrderValue: 0,
  maxUsagePerUser: 1,
  totalUsageLimit: "",
  startDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  isActive: true,
};

const CouponForm = ({ initial = emptyCoupon, onCancel, onSave, loading }) => {
  const [coupon, setCoupon] = useState(() => ({
    ...initial,
    startDate: initial.startDate ? initial.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
    expiryDate: initial.expiryDate ? initial.expiryDate.split("T")[0] : "",
  }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...coupon,
      totalUsageLimit: coupon.totalUsageLimit ? Number(coupon.totalUsageLimit) : null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Coupon Code Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-primary" />
          Coupon Code
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Code *</label>
            <input
              value={coupon.code}
              onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
              required
              placeholder="e.g. SAVE20"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all uppercase"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={coupon.isActive}
                onChange={(e) => setCoupon({ ...coupon, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm font-semibold text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Discount Details Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Discount Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Type *</label>
            <select
              value={coupon.type}
              onChange={(e) => setCoupon({ ...coupon, type: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Discount * {coupon.type === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              type="number"
              value={coupon.discount}
              onChange={(e) => setCoupon({ ...coupon, discount: Number(e.target.value) })}
              min="0"
              max={coupon.type === "percentage" ? "100" : undefined}
              required
              placeholder="0"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Min Order Value (₹)</label>
            <input
              type="number"
              value={coupon.minOrderValue}
              onChange={(e) => setCoupon({ ...coupon, minOrderValue: Number(e.target.value) })}
              min="0"
              placeholder="0"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Usage & Validity Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          Usage & Validity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Start Date *</label>
            <input
              type="date"
              value={coupon.startDate}
              onChange={(e) => setCoupon({ ...coupon, startDate: e.target.value })}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Expiry Date *</label>
            <input
              type="date"
              value={coupon.expiryDate}
              onChange={(e) => setCoupon({ ...coupon, expiryDate: e.target.value })}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Max Usage Per User</label>
            <input
              type="number"
              value={coupon.maxUsagePerUser}
              onChange={(e) => setCoupon({ ...coupon, maxUsagePerUser: Number(e.target.value) })}
              min="1"
              placeholder="1"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Total Usage Limit</label>
            <input
              type="number"
              value={coupon.totalUsageLimit}
              onChange={(e) => setCoupon({ ...coupon, totalUsageLimit: e.target.value })}
              min="1"
              placeholder="Unlimited"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50 font-medium cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold cursor-pointer"
        >
          {loading ? "Saving..." : "Save Coupon"}
        </Button>
      </div>
    </form>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [_openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const menuRef = useRef(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (sortBy !== "newest") params.sort = sortBy;

      const res = await CouponService.getAllCoupons(params);
      const data = res?.data || res || {};
      setCoupons(data.coupons || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Failed to load coupons", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, sortBy]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    load();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSortBy("newest");
  };

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await CouponService.updateCoupon(editing._id, payload);
        setToast({ show: true, message: "Coupon updated successfully", type: 'success' });
      } else {
        await CouponService.createCoupon(payload);
        setToast({ show: true, message: "Coupon created successfully", type: 'success' });
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Save failed", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setShowForm(true);
  };

  const handleToggleStatus = async (c) => {
    try {
      await CouponService.toggleCouponStatus(c._id);
      setToast({ show: true, message: `Coupon ${c.isActive ? 'deactivated' : 'activated'}`, type: 'success' });
      load();
    } catch (err) {
      setToast({ show: true, message: "Failed to update status", type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await CouponService.deleteCoupon(id);
      setDeleteConfirm(null);
      setToast({ show: true, message: "Coupon deleted successfully", type: 'success' });
      load();
    } catch (err) {
      setToast({ show: true, message: "Delete failed", type: 'error' });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setToast({ show: true, message: `Code "${code}" copied!`, type: 'success' });
  };

  const getCouponStatus = (c) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const expiry = new Date(c.expiryDate);

    if (!c.isActive) return { label: "Inactive", color: "bg-gray-100 text-gray-700" };
    if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
    if (now > expiry) return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (c.totalUsageLimit && c.usedCount >= c.totalUsageLimit) return { label: "Limit Reached", color: "bg-orange-100 text-orange-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const hasActiveFilters = search || statusFilter || sortBy !== "newest";

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2 flex items-center gap-2">
              <Ticket className="w-8 h-8" />
              Coupon Management
            </h1>
            <p className="text-gray-600">Create and manage discount coupons for your store</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-100">
                <p className="text-xs text-green-600 font-medium">Active</p>
                <p className="text-xl font-bold text-green-700">{stats.active}</p>
              </div>
              <div className="bg-red-50 rounded-lg px-4 py-2 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Expired</p>
                <p className="text-xl font-bold text-red-700">{stats.expired}</p>
              </div>
              <div className="bg-purple-50 rounded-lg px-4 py-2 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">Total Uses</p>
                <p className="text-xl font-bold text-purple-700">{stats.totalUsage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-1 ${
                sortBy === 'newest'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Newest
            </button>
            <button
              onClick={() => setSortBy('expiry_asc')}
              className={`px-3 py-2 text-sm font-medium transition-all border-l border-gray-200 ${
                sortBy === 'expiry_asc'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Expiring Soon
            </button>
            <button
              onClick={() => setSortBy('usage_high')}
              className={`px-3 py-2 text-sm font-medium transition-all border-l border-gray-200 ${
                sortBy === 'usage_high'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Most Used
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Add Coupon Button */}
          <Button
            onClick={handleCreate}
            className="ml-auto flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-4 py-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading coupons...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No coupons found</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters ? "Try adjusting your filters" : "Get started by creating your first discount coupon"}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={handleCreate}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Coupon
            </Button>
          )}
        </div>
      )}

      {/* Coupons Table */}
      {!loading && coupons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Order</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Validity</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-brand-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-bold text-brand-primary tracking-wide">{c.code}</span>
                          </div>
                          <button
                            onClick={() => copyCode(c.code)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {c.type === "percentage" ? (
                            <Percent className="w-4 h-4 text-green-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-600" />
                          )}
                          <span className="font-bold text-green-700">
                            {c.type === "percentage" ? `${c.discount}%` : `₹${c.discount}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{c.type === "percentage" ? "Off" : "Flat"}</p>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-700">
                          {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "-"}
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs">
                          <p className="text-gray-500">{formatDate(c.startDate)}</p>
                          <p className="text-gray-400">to</p>
                          <p className="text-gray-700 font-medium">{formatDate(c.expiryDate)}</p>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-gray-900">{c.usedCount || 0}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-600">{c.totalUsageLimit || "∞"}</span>
                        </div>
                        <p className="text-xs text-gray-500">{c.maxUsagePerUser} per user</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label === "Active" && <CheckCircle className="w-3 h-3" />}
                          {status.label === "Expired" && <XCircle className="w-3 h-3" />}
                          {status.label === "Upcoming" && <Clock className="w-3 h-3" />}
                          {status.label === "Inactive" && <Ban className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`p-2 rounded-lg transition-colors group ${c.isActive ? 'hover:bg-orange-50' : 'hover:bg-green-50'}`}
                            title={c.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power className={`w-4 h-4 ${c.isActive ? 'text-gray-400 group-hover:text-orange-600' : 'text-gray-400 group-hover:text-green-600'}`} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New/Edit Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary/10 p-2 rounded-lg">
                  {editing ? <Edit className="w-6 h-6 text-brand-primary" /> : <Plus className="w-6 h-6 text-brand-primary" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editing ? "Edit Coupon" : "Add New Coupon"}
                </h3>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <CouponForm
                initial={editing || emptyCoupon}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                onSave={handleSave}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-50 p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Coupon
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to delete this coupon? This action cannot be undone.
              </p>

              {/* Coupon Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Code:</span>
                  <span className="font-bold text-gray-900">{deleteConfirm.code}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="font-semibold text-gray-900">
                    {deleteConfirm.type === "percentage" ? `${deleteConfirm.discount}%` : `₹${deleteConfirm.discount}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Used:</span>
                  <span className="text-sm text-gray-900">{deleteConfirm.usedCount || 0} times</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[280px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'error' })}
              className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
