import React, { useEffect, useState, useRef } from "react";
import CouponService from "@/services/couponService";
import HomepageService from "@/services/homepageService";
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
} from "lucide-react";

const emptyCoupon = { code: "", type: "percentage", value: 0, expiry: "", usageLimit: 0 };

const CouponForm = ({ initial = emptyCoupon, onCancel, onSave }) => {
  const [coupon, setCoupon] = useState(initial);

  const submit = (e) => {
    e.preventDefault();
    onSave(coupon);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Coupon Code Section */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          Coupon Code
        </h3>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Code *</label>
          <input
            value={coupon.code}
            onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
            required
            placeholder="e.g. SAVE20"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
          />
        </div>
      </div>

      {/* Discount Details Section */}
      <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Discount Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Discount Type *</label>
            <select
              value={coupon.type}
              onChange={(e) => setCoupon({ ...coupon, type: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Value * {coupon.type === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              type="number"
              value={coupon.value}
              onChange={(e) => setCoupon({ ...coupon, value: Number(e.target.value) })}
              min="0"
              max={coupon.type === "percentage" ? "100" : undefined}
              required
              placeholder="0"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Usage & Validity Section */}
      <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          Usage & Validity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Expiry Date
            </label>
            <input
              type="date"
              value={coupon.expiry ? coupon.expiry.split("T")[0] : ""}
              onChange={(e) => setCoupon({ ...coupon, expiry: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Usage Limit
            </label>
            <input
              type="number"
              value={coupon.usageLimit}
              onChange={(e) => setCoupon({ ...coupon, usageLimit: Number(e.target.value) })}
              min="0"
              placeholder="0 = Unlimited"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
          className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-50 font-medium cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-6 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold cursor-pointer"
        >
          Save Coupon
        </Button>
      </div>
    </form>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CouponService.getAllCoupons();
      const data = res?.data?.coupons || [];
      setCoupons(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load coupons: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await CouponService.updateCoupon(editing._id, payload);
      } else {
        await CouponService.createCoupon(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert("Save failed: " + (err.message || err));
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await CouponService.deleteCoupon(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  return (
    <div className="p-6 w-full bg-linear-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-2">
              Coupon Management
            </h1>
            <p className="text-gray-600 text-sm">
              Create and manage discount coupons for your store
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading coupons...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No coupons yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first discount coupon
          </p>
          <Button
            onClick={handleCreate}
            className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Coupon
          </Button>
        </div>
      )}

      {/* Coupons Grid */}
      {!loading && coupons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-5 relative"
            >
              {/* Three Dot Menu */}
              <div
                className="absolute top-4 right-4 z-20"
                ref={openMenu === c._id ? menuRef : null}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === c._id ? null : c._id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenu === c._id && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        handleEdit(c);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors text-left border-b border-gray-100"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="font-medium text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(c);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="font-medium text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Code Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-90">Coupon Code</span>
                  </div>
                  <p className="text-2xl font-bold tracking-wider">{c.code}</p>
                </div>
              </div>

              {/* Discount Info */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.type === "percentage" ? (
                      <Percent className="w-5 h-5 text-green-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    )}
                    <span className="text-sm text-gray-600 font-medium">Discount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {c.type === "percentage" ? "Percentage Off" : "Flat Discount"}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-semibold text-gray-900">
                    {c.expiry ? new Date(c.expiry).toLocaleDateString() : "No expiry"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Usage Limit:</span>
                  <span className="font-semibold text-gray-900">
                    {c.usageLimit || "Unlimited"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New/Edit Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="sticky top-0 bg-linear-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {editing ? <Edit className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editing ? "Edit Coupon" : "Add New Coupon"}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <CouponForm
                initial={editing || emptyCoupon}
                onCancel={() => setShowForm(false)}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Coupon?
              </h3>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete coupon{" "}
                <span className="font-bold text-gray-900">"{deleteConfirm.code}"</span>?
              </p>
              <p className="text-sm text-red-600 text-center mb-6">
                This action cannot be undone.
              </p>

              {/* Coupon Preview */}
              <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Code:</span>
                  <span className="font-bold text-lg text-gray-900">{deleteConfirm.code}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="font-semibold text-gray-900">
                    {deleteConfirm.type === "percentage"
                      ? `${deleteConfirm.value}%`
                      : `₹${deleteConfirm.value}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm text-gray-900">
                    {deleteConfirm.expiry
                      ? new Date(deleteConfirm.expiry).toLocaleDateString()
                      : "No expiry"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold cursor-pointer py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold cursor-pointer shadow-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Coupon
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
