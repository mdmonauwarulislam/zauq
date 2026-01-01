import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  Package,
  ChevronRight,
  Mail,
  Calendar,
  TrendingUp,
  Camera,
  Upload,
  Eye
} from "lucide-react";

import AuthService from "@/services/AuthService";
import OrderService from "@/services/orderService";
import CloudinaryService from "@/services/cloudinaryService";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import { setUser, logout } from "@/redux/slices/authSlice";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ initialTab = "profile" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Sidebar menu items
  const menuItems = [
    { id: "profile", label: "About", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "address", label: "Address", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch profile, orders, and wishlist
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProfile(true);
        setLoadingOrders(true);

        const [profileRes, ordersRes] = await Promise.all([
          AuthService.getCurrentUser(),
          OrderService.getMyOrders(),
        ]);

        const userData = profileRes?.data?.user;
        if (userData) {
          setProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
          });
          setAddresses(userData.addresses || []);
          if (userData.profileImage) {
            setImagePreview(userData.profileImage);
          }
          dispatch(setUser(userData));
        }

        // Only show paid orders
        const allOrders = ordersRes?.data?.orders || [];
        const paidOrders = allOrders.filter(order => order.paymentStatus === 'completed');
        setOrders(paidOrders);
        dispatch(fetchWishlist());
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoadingProfile(false);
        setLoadingOrders(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error("Please provide your first and last name.");
      return;
    }

    try {
      setSavingProfile(true);
      
      const updateData = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      };

      // If there's a new profile image, upload to Cloudinary via backend
      if (profileImage) {
        try {
          toast.loading("Uploading image...");
          const uploadResult = await CloudinaryService.uploadImage(profileImage);
          
          if (uploadResult?.secure_url) {
            updateData.profileImage = uploadResult.secure_url;
          }
          toast.dismiss();
        } catch (uploadError) {
          toast.dismiss();
          console.error("Image upload error:", uploadError);
          toast.error("Failed to upload image. Updating profile without image.");
        }
      }

      const { data } = await AuthService.updateProfile(updateData);

      if (data?.user) {
        dispatch(setUser(data.user));
        // Keep the image preview even after save
        if (data.user.profileImage && !imagePreview) {
          setImagePreview(data.user.profileImage);
        }
      }

      toast.success("Profile updated successfully ✨");
      setProfileImage(null); // Clear the file input
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSavingAddress(true);
      
      // Add new address to the addresses array
      const updatedAddresses = [...addresses, addressForm];
      
      const { data } = await AuthService.updateProfile({
        addresses: updatedAddresses,
      });

      if (data?.user) {
        setAddresses(data.user.addresses || []);
        dispatch(setUser(data.user));
      }

      toast.success("Address added successfully ✨");
      setShowAddressModal(false);
      setAddressForm({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
    } catch (error) {
      console.error("Add address error:", error);
      toast.error("Failed to add address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (addressToDelete === null) return;
    
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== addressToDelete);
      
      const { data } = await AuthService.updateProfile({
        addresses: updatedAddresses,
      });

      if (data?.user) {
        setAddresses(data.user.addresses || []);
        dispatch(setUser(data.user));
      }

      toast.success("Address deleted successfully");
      setShowDeleteModal(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("Failed to delete address.");
    }
  };

  // Render Profile Section
  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-brand-primary rounded-2xl p-6 md:p-8 text-brand-text-primary">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl font-bold border-2 border-white/30 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.firstName.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 p-2 bg-brand-primary text-brand-text-primary rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-110"
              type="button"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm sm:text-base">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        {loadingProfile ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  placeholder="Saiful"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  placeholder="Islam"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-brand-primary disabled:opacity-60 text-brand-text-primary text-sm font-semibold px-6 py-3 shadow-lg shadow-brand-primary transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // Render Orders Section
  const renderOrdersSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
          <span className="px-3 py-1 bg-purple-100 text-brand-primary rounded-full text-sm font-medium">
            {orders.length} Orders
          </span>
        </div>

        {loadingOrders ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items?.length || 0} item{order.items?.length > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand-primary">
                        ₹{Math.round(order.finalPrice || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.paymentStatus || "pending"}
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );

  // Render Address Section
  const renderAddressSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
          <button
            onClick={() => setShowAddressModal(true)}
            className="px-4 py-2 bg-brand-primary text-brand-text-primary rounded-md text-sm font-semibold hover:bg-brand-primary-dark transition-all transform hover:scale-105"
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No addresses saved yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first address to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, index) => (
              <div
                key={index}
                className="border-2 border-brand-primary-light rounded-xl p-4 hover:border-brand-primary transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{addr.name}</h4>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-brand-primary-light text-brand-primary rounded-full text-xs font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
                    <p className="text-sm text-gray-700">
                      {addr.address}, {addr.city}
                      {addr.state && `, ${addr.state}`}
                      {addr.postalCode && ` - ${addr.postalCode}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{addr.country}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAddressToDelete(index);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" style={{scrollbarWidth:'none'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-brand-primary">Add New Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:bg-red-600 hover:text-brand-text-primary p-2 rounded-md transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  name="name"
                  value={addressForm.name}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={addressForm.address}
                  onChange={handleAddressChange}
                  rows="2"
                  className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                  <input
                    name="postalCode"
                    value={addressForm.postalCode}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <input
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border-2 border-brand-primary px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressChange}
                  className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                />
                <label className="text-sm text-gray-700">Set as default address</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 px-4 py-2.5 bg-brand-primary text-brand-text-primary rounded-xl font-semibold hover:bg-brand-primary-dark disabled:opacity-60 transition-all"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Address?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAddressToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAddress}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Wishlist Section
  const renderWishlistSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">My Wishlist</h3>
          <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
            {wishlistItems.length} Items
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mt-1">Save items you love for later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.product._id}
                onClick={() => navigate(`/products/${item.product._id}`)}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-pink-300 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={item.product.images?.[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-lg font-bold text-brand-primary mt-1">
                    ₹{item.product.discountedPrice || item.product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render Settings Section
  const renderSettingsSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-primary transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-500 mt-1">Update your account password</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-primary transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-primary transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Privacy & Security</h4>
                <p className="text-sm text-gray-500 mt-1">Control your privacy settings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-text-primary">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden lg:sticky lg:top-4">
              {/* Profile Header */}
              <div className="bg-brand-primary p-6 text-brand-text-primary">
                <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30 mx-auto mb-3 overflow-hidden group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.firstName.charAt(0).toUpperCase()
                  )}
                  <button
                    onClick={triggerFileInput}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    type="button"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-center font-semibold text-base lg:text-lg wrap-break-word px-2">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-center text-xs lg:text-sm text-white/80 mt-1 break-all px-2">
                  {profile.email}
                </p>
              </div>

              {/* Menu Items */}
              <nav className="p-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-8 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                        activeTab === item.id
                          ? "bg-brand-primary text-brand-text-primary shadow-lg shadow-brand-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.id === "wishlist" && wishlistItems.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                          {wishlistItems.length}
                        </span>
                      )}
                      {item.id === "orders" && orders.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-brand-text-primary text-brand-primary backdrop-blur-sm rounded-full text-xs">
                          {orders.length}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "profile" && renderProfileSection()}
            {activeTab === "orders" && renderOrdersSection()}
            {activeTab === "address" && renderAddressSection()}
            {activeTab === "wishlist" && renderWishlistSection()}
            {activeTab === "settings" && renderSettingsSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
