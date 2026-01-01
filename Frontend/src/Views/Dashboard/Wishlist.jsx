import React, { useEffect, useState } from "react";
import wishlistService from "@/services/wishlistService";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Users,
  Package,
  Calendar,
  Mail,
  TrendingUp,
  ShoppingBag,
  User,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const PAGE_LIMIT = 15;

const Wishlist = () => {
  const [activeTab, setActiveTab] = useState("products"); // products | users
  const [products, setProducts] = useState([]);
  const [usersWishlists, setUsersWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalWishlists: 0, uniqueProducts: 0, totalUsers: 0 });
  
  // Filter states
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("-wishlistCount");
  
  // Detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productUsers, setProductUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Load products with wishlist counts
  const loadProducts = async (p = 1) => {
    setLoading(true);
    try {
      const params = { 
        page: p, 
        limit: PAGE_LIMIT,
        sort: sortOrder,
      };
      if (search) params.search = search;
      
      const res = await wishlistService.getWishlistedProducts(params);
      const data = res?.data || res || {};
      setProducts(data.products || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load users with their wishlists
  const loadUsersWishlists = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_LIMIT };
      if (search) params.search = search;
      
      const res = await wishlistService.getAllUsersWishlists(params);
      const data = res?.data || res || {};
      setUsersWishlists(data.wishlists || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load users who wishlisted a product
  const loadProductUsers = async (productId, p = 1) => {
    setLoadingUsers(true);
    try {
      const res = await wishlistService.getProductWishlistUsers(productId, { page: p, limit: 20 });
      const data = res?.data || res || {};
      setProductUsers(data.users || []);
      setUserPage(data.pagination?.page || p);
      setUserTotalPages(data.pagination?.totalPages || 1);
      if (data.product && !selectedProduct) {
        setSelectedProduct(data.product);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      loadProducts(1);
    } else {
      loadUsersWishlists(1);
    }
  }, [activeTab, sortOrder]);

  const handleSearch = (ev) => {
    ev?.preventDefault();
    if (activeTab === "products") {
      loadProducts(1);
    } else {
      loadUsersWishlists(1);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSortOrder("-wishlistCount");
    if (activeTab === "products") {
      loadProducts(1);
    } else {
      loadUsersWishlists(1);
    }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setProductUsers([]);
    setUserPage(1);
    loadProductUsers(product._id, 1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50 min-h-screen">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2 flex items-center gap-2">
              <Heart className="w-8 h-8" />
              Wishlist Management
            </h1>
            <p className="text-gray-600">View products and users wishlist analytics</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-pink-50 rounded-lg px-4 py-2 border border-pink-100">
              <p className="text-xs text-pink-600 font-medium">Total Wishlists</p>
              <p className="text-xl font-bold text-pink-700">{stats.totalWishlists}</p>
            </div>
            <div className="bg-purple-50 rounded-lg px-4 py-2 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">Unique Products</p>
              <p className="text-xl font-bold text-purple-700">{stats.uniqueProducts}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Users with Wishlist</p>
              <p className="text-xl font-bold text-blue-700">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "products"
                ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Package className="w-4 h-4" />
            Wishlisted Products
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "users"
                ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            Users Wishlists
          </button>
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
              placeholder={activeTab === "products" ? "Search products..." : "Search users..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </form>

          {/* Sort Order - Only for products */}
          {activeTab === "products" && (
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
            >
              <option value="-wishlistCount">Most Wishlisted</option>
              <option value="wishlistCount">Least Wishlisted</option>
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
            </select>
          )}

          {/* Clear Filters */}
          {(search || sortOrder !== '-wishlistCount') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Count */}
          <div className="ml-auto text-sm text-gray-600">
            <span className="font-bold text-brand-primary">{total}</span> {activeTab === "products" ? "products" : "users"}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      ) : activeTab === "products" ? (
        /* Products Tab */
        products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">No wishlisted products</p>
            <p className="text-sm text-gray-500 mt-1">Products will appear here when users add them to wishlist</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          Wishlist Count
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || '/placeholder.png'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product._id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-center">
                          <div>
                            <p className="font-bold text-brand-primary">{formatCurrency(product.discountedPrice || product.price)}</p>
                            {product.discountedPrice && product.discountedPrice < product.price && (
                              <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-700'
                              : product.stock > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? product.stock : 'Out of Stock'}
                          </span>
                        </td>

                        {/* Wishlist Count */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full">
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            <span className="font-bold text-pink-700">{product.wishlistCount}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => openProductDetails(product)}
                              className="px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View Users
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => loadProducts(page - 1)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => loadProducts(page + 1)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )
      ) : (
        /* Users Tab */
        usersWishlists.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">No user wishlists found</p>
            <p className="text-sm text-gray-500 mt-1">User wishlists will appear here</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Items in Wishlist</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Products Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersWishlists.map(wishlist => (
                      <tr key={wishlist._id} className="hover:bg-gray-50 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                              {wishlist.user?.profileImage ? (
                                <img src={wishlist.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <span className="text-brand-primary font-bold text-sm">
                                  {wishlist.user?.firstName?.[0]}{wishlist.user?.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{wishlist.user?.firstName} {wishlist.user?.lastName}</p>
                              <p className="text-xs text-gray-500">ID: {wishlist.user?._id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {wishlist.user?.email}
                          </div>
                        </td>

                        {/* Item Count */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full">
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            <span className="font-bold text-pink-700">{wishlist.itemCount}</span>
                          </div>
                        </td>

                        {/* Last Updated */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(wishlist.updatedAt)}
                          </div>
                        </td>

                        {/* Products Preview */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {wishlist.items?.slice(0, 4).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.product?.images?.[0] || '/placeholder.png'}
                                alt=""
                                className="w-8 h-8 object-cover rounded border border-gray-200"
                                title={item.product?.name}
                              />
                            ))}
                            {wishlist.items?.length > 4 && (
                              <span className="text-xs text-gray-500 ml-1">+{wishlist.items.length - 4}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => loadUsersWishlists(page - 1)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => loadUsersWishlists(page + 1)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )
      )}

      {/* Product Detail Modal - Users who wishlisted */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProduct.images?.[0] || '/placeholder.png'}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-brand-primary font-bold">{formatCurrency(selectedProduct.discountedPrice || selectedProduct.price)}</span>
                    <span className="inline-flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-full">
                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                      <span className="text-sm font-semibold text-pink-700">{selectedProduct.wishlistCount} wishlists</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setProductUsers([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                Users who wishlisted this product
              </h4>

              {loadingUsers ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : productUsers.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-xl">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">User</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Added to Wishlist</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">User Since</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productUsers.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            {/* User */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                                  {user.profileImage ? (
                                    <img src={user.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                                  ) : (
                                    <span className="text-brand-primary font-bold text-xs">
                                      {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-gray-500">ID: {user._id?.slice(-8)}</p>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">{user.email}</span>
                            </td>

                            {/* Added At */}
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">{formatDateTime(user.addedAt)}</span>
                            </td>

                            {/* User Since */}
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">{formatDate(user.userJoined)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for users */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Page <span className="font-bold">{userPage}</span> of <span className="font-bold">{userTotalPages}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={userPage <= 1}
                          onClick={() => {
                            setUserPage(userPage - 1);
                            loadProductUsers(selectedProduct._id, userPage - 1);
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={userPage >= userTotalPages}
                          onClick={() => {
                            setUserPage(userPage + 1);
                            loadProductUsers(selectedProduct._id, userPage + 1);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
