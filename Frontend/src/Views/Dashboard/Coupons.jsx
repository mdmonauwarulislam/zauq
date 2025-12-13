import React, { useEffect, useState } from "react";
import CouponService from "@/services/couponService";
import HomepageService from "@/services/homepageService";
import { Button } from "@/components/ui/button";

const emptyCoupon = { code: "", type: "percentage", value: 0, expiry: "", usageLimit: 0 };

const CouponForm = ({ initial = emptyCoupon, onCancel, onSave }) => {
  const [coupon, setCoupon] = useState(initial);

  useEffect(() => setCoupon(initial), [initial]);

  const submit = (e) => {
    e.preventDefault();
    onSave(coupon);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-sm font-medium">Code</label>
        <input value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value })} required className="w-full mt-1 p-2 border rounded-md" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-sm font-medium">Type</label>
          <select value={coupon.type} onChange={(e) => setCoupon({ ...coupon, type: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Value</label>
          <input type="number" value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: Number(e.target.value) })} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Usage Limit</label>
          <input type="number" value={coupon.usageLimit} onChange={(e) => setCoupon({ ...coupon, usageLimit: Number(e.target.value) })} className="w-full mt-1 p-2 border rounded-md" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Expiry</label>
        <input type="date" value={coupon.expiry ? coupon.expiry.split("T")[0] : ""} onChange={(e) => setCoupon({ ...coupon, expiry: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [navbarText, setNavbarText] = useState("");
  const [savingNavbar, setSavingNavbar] = useState(false);

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
    // load navbar text
    (async () => {
      try {
        const cfg = await HomepageService.getHomepageConfig();
        const data = cfg?.data?.config || cfg?.config || cfg;
        setNavbarText(data?.navbarCouponText || "");
      } catch (err) {
        console.warn("Failed to load navbar text", err);
      }
    })();
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

  const handleDelete = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await CouponService.deleteCoupon(c._id);
      load();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  const saveNavbar = async () => {
    setSavingNavbar(true);
    try {
      await HomepageService.updateNavbarAndMarquee({ navbarCouponText: navbarText });
      alert("Navbar message updated");
    } catch (err) {
      alert("Failed to update navbar: " + (err.message || err));
    } finally {
      setSavingNavbar(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coupons & Navbar Discount</h1>
          <p className="mt-1 text-sm text-gray-600">Create and manage coupons. Also configure the navbar discount bar text.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate}>New Coupon</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div>Loading coupons...</div>
          ) : (
            <div className="bg-white border rounded-md">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left">
                    <th className="p-3 border-b">Code</th>
                    <th className="p-3 border-b">Type</th>
                    <th className="p-3 border-b">Value</th>
                    <th className="p-3 border-b">Expiry</th>
                    <th className="p-3 border-b">Usage Limit</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{c.code}</td>
                      <td className="p-3 border-b">{c.type}</td>
                      <td className="p-3 border-b">{c.value}</td>
                      <td className="p-3 border-b">{c.expiry ? new Date(c.expiry).toLocaleDateString() : '-'}</td>
                      <td className="p-3 border-b">{c.usageLimit ?? '-'}</td>
                      <td className="p-3 border-b">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                          <Button size="sm" className="bg-red-600 text-white" onClick={() => handleDelete(c)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Navbar Coupon Message</h3>
          <textarea value={navbarText} onChange={(e) => setNavbarText(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Use code ZAUQ10 for 10% off" />
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setNavbarText("")}>Clear</Button>
            <Button onClick={saveNavbar} disabled={savingNavbar}>{savingNavbar ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </div>

      {/* Modal/Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Coupon' : 'New Coupon'}</h3>
            <CouponForm initial={editing || emptyCoupon} onCancel={() => setShowForm(false)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
