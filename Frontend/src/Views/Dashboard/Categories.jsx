import React, { useEffect, useState, useRef } from "react";
import CategoryService from "@/services/categoryService";
import CloudinaryService from "@/services/cloudinaryService";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Folder,
  Star,
  Search,
  Image as ImageIcon,
  Sparkles,
  Grid3x3,
  List,
  ArrowUpDown,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

const CategoryForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [images, setImages] = useState(initial.images || []);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured || false);
  const [displayOrder, setDisplayOrder] = useState(initial.displayOrder || 0);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Check if adding these files would exceed the limit
    const remainingSlots = 2 - images.length;
    if (remainingSlots <= 0) {
      alert('Maximum 2 images allowed');
      return;
    }
    
    // Only take files up to the remaining slots
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added. Maximum is 2 images.`);
    }
    
    setUploading(true);
    try {
      for (const file of filesToUpload) {
        const res = await CloudinaryService.uploadImage(file);
        setImages((prev) => [...prev, res.secure_url || res.url]);
      }
    } catch (err) {
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = (ev) => {
    ev.preventDefault();
    onSubmit({ name, description, images, isFeatured, displayOrder });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Basic Info Section */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-600" />
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Category Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter category name"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows="3"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-600" />
          Category Images (Max 2)
        </h3>
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed rounded-lg transition-all ${
              images.length >= 2
                ? "border-gray-300 opacity-50 cursor-not-allowed"
                : "border-orange-300 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
            }`}>
            <Upload className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">
              {images.length >= 2 ? "Maximum Reached" : images.length === 1 ? "Upload 1 More" : "Upload Images (Max 2)"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              multiple
              disabled={images.length >= 2}
              className="hidden"
            />
          </label>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
              Uploading...
            </div>
          )}
        </div>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Category ${i + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Category Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <Star className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              Mark as Featured
            </span>
          </label>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              placeholder="0"
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
          Save Category
        </Button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); 
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const [openMenu, setOpenMenu] = useState(null); 
  const menuRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CategoryService.getCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
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

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (payload) => {
    try {
      await CategoryService.createCategory(payload);
      setShowNew(false);
      load();
    } catch (err) {
      alert("Create failed: " + (err.message || err));
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await CategoryService.updateCategory(id, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert("Update failed: " + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await CategoryService.deleteCategory(id);
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
              Category Management
            </h1>
            <p className="text-gray-600 text-sm">
              Organize your products with categories
            </p>
          </div>
          <Button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Category
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
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1 ? "Category" : "Categories"}
            </span>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <X className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading categories...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchTerm ? "No categories found" : "No categories yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first category"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowNew(true)}
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Category
            </Button>
          )}
        </div>
      )}

      {/* Categories Grid View */}
      {!loading && filteredCategories.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map((c) => (
            <div
              key={c._id}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden relative"
            >
              {/* Three Dot Menu - Top Right Corner */}
              <div
                className="absolute top-3 right-3 z-20"
                ref={openMenu === c._id ? menuRef : null}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === c._id ? null : c._id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:bg-white text-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenu === c._id && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setEditing(c);
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

              {/* Category Image */}
              <div className="relative h-48 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
                {c.images?.[0] ? (
                  <img
                    src={c.images[0]}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Folder className="w-20 h-20 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-medium">
                        No Image
                      </p>
                    </div>
                  </div>
                )}
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Featured Badge */}
                {c.isFeatured && (
                  <div className="absolute top-3 right-3 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in slide-in-from-top">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Featured
                  </div>
                )}

                {/* Display Order Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  {c.displayOrder}
                </div>
              </div>

              {/* Category Info */}
              <div className="p-5 pb-1">
                {/* Category Name */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>

                {/* Category Description */}
                <p className="text-sm text-gray-600 mb-0 line-clamp-2 min-h-10">
                  {c.description || "No description available"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories List View */}
      {!loading && filteredCategories.length > 0 && viewMode === "list" && (
        <div className="space-y-4">
          {filteredCategories.map((c) => (
            <div
              key={c._id}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-4 relative"
            >
              {/* Three Dot Menu - Top Right Corner */}
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
                        setEditing(c);
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

              <div className="flex items-center gap-5">
                {/* Category Image */}
                <div className="relative w-32 h-32 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl overflow-hidden shrink-0 shadow-md">
                  {c.images?.[0] ? (
                    <img
                      src={c.images[0]}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Folder className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {/* Display Order Badge */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />
                    {c.displayOrder}
                  </div>
                </div>

                {/* Category Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Category Name with Featured Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                          {c.name}
                        </h3>
                        {c.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                            <Star className="w-3 h-3 fill-white" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Category Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {c.description || "No description available"}
                      </p>

                      {/* Image Count */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {c.images?.length || 0}{" "}
                          {c.images?.length === 1 ? "Image" : "Images"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Category Modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-linear-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Category
                </h3>
              </div>
              <button
                onClick={() => setShowNew(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <CategoryForm
                onSubmit={handleCreate}
                onCancel={() => setShowNew(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-linear-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Edit className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Category
                </h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <CategoryForm
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
                Delete Category?
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

              {/* Category Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden shrink-0">
                  {deleteConfirm.images?.[0] ? (
                    <img
                      src={deleteConfirm.images[0]}
                      alt={deleteConfirm.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Folder className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {deleteConfirm.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {deleteConfirm.description || "No description"}
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
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold cursor-pointer shadow-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
