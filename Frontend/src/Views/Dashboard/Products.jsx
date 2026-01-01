import React, { useEffect, useState, useRef } from 'react';
import ProductService from '@/services/productService';
import CloudinaryService from '@/services/cloudinaryService';
import CategoryService from '@/services/categoryService';
import ProductDetailsView from '@/components/Product/ProductDetailsView';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Package,
  Tag,
  DollarSign,
  Percent,
  Search,
  Image as ImageIcon,
  Sparkles,
  Grid3x3,
  List,
  MoreVertical,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const ProductForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [brand, setBrand] = useState(initial.brand || '');
  const [category, setCategory] = useState(initial.category || '');
  const [price, setPrice] = useState(initial.price || 0);
  const [discount, setDiscount] = useState(initial.discount || 0);
  const [stock, setStock] = useState(initial.stock || 0);
  const [images, setImages] = useState(initial.images || []);
  const [tags, setTags] = useState(initial.tags?.join(',') || '');
  const [isLatest, setIsLatest] = useState(initial.isLatest || false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await CategoryService.getCategories();
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Set category value when initial data changes (for editing)
  useEffect(() => {
    if (initial.category) {
      // Handle both object and string category formats
      const categoryId = typeof initial.category === 'object' ? initial.category._id : initial.category;
      setCategory(categoryId);
    }
  }, [initial.category]);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setUploading(true);
    try {
      for (const file of files) {
        const res = await CloudinaryService.uploadImage(file);
        setImages((prev) => [...prev, res.secure_url || res.url]);
      }
    } catch (err) {
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const submit = (ev) => {
    ev.preventDefault();
    onSubmit({ name, description, brand, category, price, discount, stock, images, tags: tags.split(',').map(t => t.trim()).filter(Boolean), isLatest });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Basic Info Section */}
      <div className="bg-brand-text-primary rounded-xl p-5 border border-brand-primary">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-primary" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Product Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter product name"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand name"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            rows="3"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Category & Pricing Section */}
      <div className="bg-green-50 rounded-xl p-5 border border-green-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Category & Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer"
              disabled={loadingCategories}
              required
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Price (₹) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0"
              min="0"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Stock Quantity *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              placeholder="0"
              min="0"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-600" />
          Additional Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              Discount (%)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              min="0"
              max="100"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. summer, casual, trending"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={isLatest}
                onChange={(e) => setIsLatest(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Mark as Latest</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-600" />
          Product Images (Multiple)
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">Upload Images</span>
            <input type="file" accept="image/*" onChange={handleFile} multiple className="hidden" />
          </label>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
              Uploading...
            </div>
          )}
        </div>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Product ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
          className="px-6 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold cursor-pointer"
        >
          Save Product
        </Button>
      </div>
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts({ limit: 100 });
      const productsData = res.data?.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      alert('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (payload) => {
    try {
      await ProductService.createProduct(payload);
      setShowNew(false);
      load();
    } catch (err) {
      alert('Create failed: ' + (err.message || err));
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await ProductService.updateProduct(id, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  };

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded-xl border border-brand-primary bg-white p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2">
              Product Management
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your product inventory, pricing, and details
            </p>
          </div>
          <Button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary/90 font-semibold px-5 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 outline-none border border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first product'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowNew(true)}
              className="bg-brand-primary text-white px-6 py-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          )}
        </div>
      )}

      {/* Products Grid View */}
      {!loading && filteredProducts.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all overflow-hidden relative"
            >
              {/* Three Dot Menu */}
              <div
                className="absolute top-3 right-3 z-20"
                ref={openMenu === p._id ? menuRef : null}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:bg-white text-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenu === p._id && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setViewing(p);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary transition-colors text-left border-b border-gray-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-medium text-sm">View</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary transition-colors text-left border-b border-gray-100"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="font-medium text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(p);
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

              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Latest Badge */}
                {p.isLatest && (
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    New
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {p.category?.name || 'No category'}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-brand-primary">₹{(p.discountedPrice || p.price)?.toLocaleString()}</span>
                  {p.discountedPrice && p.discountedPrice < p.price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{p.price?.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        -{Math.round(((p.price - p.discountedPrice) / p.price) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      p.stock > 10
                        ? 'bg-green-100 text-green-700'
                        : p.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <Package className="w-3 h-3" />
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products List View - Table Format */}
      {!loading && filteredProducts.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    {/* Product Name & Image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px]">{p.name}</p>
                          {p.isLatest && (
                            <span className="inline-flex items-center gap-1 text-purple-600 text-xs font-medium">
                              <Sparkles className="w-3 h-3" />
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {p.category?.name || 'No category'}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{p.brand || '-'}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-brand-primary">₹{(p.discountedPrice || p.price)?.toLocaleString()}</span>
                      {p.discountedPrice && p.discountedPrice < p.price && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{p.price?.toLocaleString()}
                        </p>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-3 text-right">
                      {p.discountedPrice && p.discountedPrice < p.price ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                          -{Math.round(((p.price - p.discountedPrice) / p.price) * 100)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-900">{p.stock || 0}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          p.stock > 10
                            ? 'bg-green-100 text-green-700'
                            : p.stock > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <Package className="w-3 h-3" />
                        {p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewing(p)}
                          className="p-2 rounded-lg hover:bg-brand-primary/10 text-gray-600 hover:text-brand-primary transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditing(p)}
                          className="p-2 rounded-lg hover:bg-brand-primary/10 text-gray-600 hover:text-brand-primary transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-blue-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              </div>
              <button
                onClick={() => setShowNew(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-green-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Edit className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                initial={editing}
                onSubmit={(payload) => handleUpdate(editing._id, payload)}
                onCancel={() => setEditing(null)}
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
                Delete Product?
              </h3>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  "{deleteConfirm.name}"
                </span>
                ?
              </p>
              <p className="text-sm text-red-600 text-center mb-6">
                This action cannot be undone.
              </p>

              {/* Product Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                  {deleteConfirm.images?.[0] ? (
                    <img
                      src={deleteConfirm.images[0]}
                      alt={deleteConfirm.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {deleteConfirm.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {deleteConfirm.brand || "No brand"} • ₹{deleteConfirm.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock: {deleteConfirm.stock || 0}
                  </p>
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-brand-text-primary px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary/10 p-2 rounded-lg">
                  <Eye className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div>
              <ProductDetailsView
                product={viewing}
                reviews={viewing.reviews || []}
                loading={false}
                isAdmin={true}
                showBackButton={false}
                onEdit={(product) => {
                  setViewing(null);
                  setEditing(product);
                }}
                onDelete={(product) => {
                  setViewing(null);
                  setDeleteConfirm(product);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
