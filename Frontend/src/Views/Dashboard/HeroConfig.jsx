import React, { useEffect, useState, useRef } from "react";
import HomepageService from "@/services/homepageService";
import CategoryService from "@/services/categoryService";
import ProductService from "@/services/productService";
import ReviewService from "@/services/reviewService";
import CloudinaryService from "@/services/cloudinaryService";
import { Button } from "@/components/ui/button";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Star,
  Layout,
  Package,
  MessageSquare,
  X,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";

const HeroConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [heroes, setHeroes] = useState([{ title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]); 
  const [selectedReviews, setSelectedReviews] = useState([]);

  const [allCategories, setAllCategories] = useState([]);
  const [latestCandidates, setLatestCandidates] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState({
    featuredCollections: false,
    mainCategories: false,
    latestProducts: false,
    featuredReviews: false,
  });

  // Refs for click-outside detection
  const featuredCollectionsRef = useRef(null);
  const mainCategoriesRef = useRef(null);
  const latestProductsRef = useRef(null);
  const featuredReviewsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featuredCollectionsRef.current && !featuredCollectionsRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, featuredCollections: false }));
      }
      if (mainCategoriesRef.current && !mainCategoriesRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, mainCategories: false }));
      }
      if (latestProductsRef.current && !latestProductsRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, latestProducts: false }));
      }
      if (featuredReviewsRef.current && !featuredReviewsRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, featuredReviews: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const resp = await HomepageService.getHomepageConfig();
      const cfg = resp?.data?.config || resp || {};

      // map homepage fields
      const h = cfg.heroSection || [];
      setHeroes(h.length > 0 ? h : [{ title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);

      setFeaturedCollections((cfg.featuredCategories || []).map((c) => c._id || c));
      setMainCategories((cfg.mainCategories || []).map((c) => c._id || c).slice(0, 7));
      setLatestProducts((cfg.latestProducts || []).map((p) => p._id || p));
      setSelectedReviews((cfg.featuredReviews || []).map((r) => r._id || r));

      // load helpers
      const catResp = await CategoryService.getCategories();
      setAllCategories(catResp?.data?.categories || catResp || []);

      const latestResp = await ProductService.getLatestProducts(50);
      setLatestCandidates(latestResp?.data?.products || latestResp || []);

      const revResp = await ReviewService.getFeaturedReviews();
      setFeaturedReviews(revResp?.data?.reviews || revResp || []);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load homepage config', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setToast({ show: true, message: text, type });
  };

  const handleImage = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await CloudinaryService.uploadImage(file);
      setHeroes((prev) => prev.map((h, i) => i === index ? { ...h, image: res.secure_url || res.url } : h));
      showMessage("success", "Image uploaded successfully!");
    } catch (err) {
      showMessage("error", "Image upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const addHero = () => {
    setHeroes((prev) => [...prev, { title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);
  };

  const removeHero = (index) => {
    if (heroes.length > 1) {
      setHeroes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateHero = (index, field, value) => {
    setHeroes((prev) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        heroSection: heroes,
        featuredCategories: featuredCollections,
        mainCategories,
        latestProducts,
        featuredReviews: selectedReviews,
      };

      await HomepageService.updateHomepageConfig(payload);
      showMessage("success", "Homepage updated successfully!");
    } catch (err) {
      console.error(err);
      showMessage("error", "Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-orange-50/30">
        <div className="bg-white rounded-xl border border-orange-100 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading homepage configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-orange-50/30">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-orange-900 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-orange-600" />
              Hero & Home Configuration
            </h1>
            <p className="text-gray-600">
              Manage hero banners, featured categories, products, and reviews
            </p>
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold px-6 shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hero Banner Section */}
        <section className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200 bg-linear-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  Hero Banner Slides
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create engaging hero slides with images, titles, and call-to-action buttons
                </p>
              </div>
              <Button
                onClick={addHero}
                variant="outline"
                className="flex items-center gap-2 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {heroes.map((hero, index) => (
              <div
                key={index}
                className="p-6 border-2 border-gray-200 rounded-xl bg-linear-to-br from-purple-50/30 to-blue-50/30 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-linear-to-br from-purple-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
                      {index + 1}
                    </span>
                    Slide {index + 1}
                  </h3>
                  {heroes.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeHero(index)}
                      className="flex items-center gap-2 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        value={hero.title}
                        onChange={(e) => updateHero(index, "title", e.target.value)}
                        placeholder="Enter slide title"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <input
                        value={hero.subtitle}
                        onChange={(e) => updateHero(index, "subtitle", e.target.value)}
                        placeholder="Enter slide subtitle"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          value={hero.ctaText}
                          onChange={(e) => updateHero(index, "ctaText", e.target.value)}
                          placeholder="Shop Now"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Button Link
                        </label>
                        <input
                          value={hero.ctaLink}
                          onChange={(e) => updateHero(index, "ctaLink", e.target.value)}
                          placeholder="/products"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Hero Image
                    </label>
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 hover:border-purple-500 bg-white/50 transition-all">
                      {hero.image ? (
                        <div className="relative">
                          <img
                            src={hero.image}
                            alt={`Hero ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <label className="absolute bottom-2 right-2 cursor-pointer">
                            <div className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                              <Upload className="w-4 h-4 text-gray-700" />
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImage(e, index)}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            Click to upload image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImage(e, index)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Featured Collections */}
          <section className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b bg-linear-to-r from-blue-50 to-cyan-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                Featured Collections
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select up to 4 categories to feature on homepage (limit: {featuredCollections.length}/4)
              </p>
            </div>

            <div className="p-6">
              {/* Selected Items Display */}
              {featuredCollections.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Selected Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featuredCollections.map((id) => {
                      const category = allCategories.find((c) => (c._id || c) === id);
                      if (!category) return null;
                      return (
                        <div
                          key={id}
                          className="relative group bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 hover:shadow-lg transition-all"
                        >
                          <button
                            onClick={() =>
                              setFeaturedCollections((prev) =>
                                prev.filter((x) => x !== id)
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={category.images?.[0] || "/placeholder.png"}
                            alt={category.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <p className="text-sm font-semibold text-gray-900 text-center">
                            {category.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown Selection */}
              {featuredCollections.length < 4 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Add Category
                  </label>
                  <div className="relative" ref={featuredCollectionsRef}>
                    <button
                      onClick={() =>
                        setDropdownOpen((prev) => ({
                          ...prev,
                          featuredCollections: !prev.featuredCollections,
                        }))
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium bg-white hover:border-blue-400 transition-colors flex items-center justify-between"
                    >
                      <span className="text-gray-600">Select a category to add</span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {dropdownOpen.featuredCollections && (
                      <div className="absolute z-9999 w-full mt-2 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                        {allCategories
                          .filter((c) => !featuredCollections.includes(c._id || c))
                          .map((c) => {
                            const id = c._id || c;
                            return (
                              <div
                                key={id}
                                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                onClick={() => {
                                  setFeaturedCollections((prev) => [...prev, id]);
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    featuredCollections: false,
                                  }));
                                }}
                              >
                                <img
                                  src={c.images?.[0] || "/placeholder.png"}
                                  alt={c.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{c.name}</p>
                                  <p className="text-xs text-gray-500">Category</p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Main Categories */}
          <section className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b bg-linear-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Layout className="w-5 h-5 text-green-600" />
                Main Categories
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select up to 7 categories for main section (limit: {mainCategories.length}/7)
              </p>
            </div>

            <div className="p-6">
              {/* Selected Items Display */}
              {mainCategories.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Selected Categories
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                    {mainCategories.map((id) => {
                      const category = allCategories.find((c) => (c._id || c) === id);
                      if (!category) return null;
                      return (
                        <div
                          key={id}
                          className="relative group bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-3 hover:shadow-lg transition-all"
                        >
                          <button
                            onClick={() =>
                              setMainCategories((prev) =>
                                prev.filter((x) => x !== id)
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <img
                            src={category.images?.[0] || "/placeholder.png"}
                            alt={category.name}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs font-semibold text-gray-900 text-center truncate">
                            {category.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown Selection */}
              {mainCategories.length < 7 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Add Category
                  </label>
                  <div className="relative" ref={mainCategoriesRef}>
                    <button
                      onClick={() =>
                        setDropdownOpen((prev) => ({
                          ...prev,
                          mainCategories: !prev.mainCategories,
                        }))
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base font-medium bg-white hover:border-green-400 transition-colors flex items-center justify-between"
                    >
                      <span className="text-gray-600">Select a category to add</span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {dropdownOpen.mainCategories && (
                      <div className="absolute z-9999 w-full mt-2 bg-white border-2 border-green-400 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                        {allCategories
                          .filter((c) => !mainCategories.includes(c._id || c))
                          .map((c) => {
                            const id = c._id || c;
                            return (
                              <div
                                key={id}
                                className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                onClick={() => {
                                  setMainCategories((prev) => [...prev, id]);
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    mainCategories: false,
                                  }));
                                }}
                              >
                                <img
                                  src={c.images?.[0] || "/placeholder.png"}
                                  alt={c.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{c.name}</p>
                                  <p className="text-xs text-gray-500">Category</p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Products and Reviews Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Latest Products */}
          <section className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b bg-linear-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Latest Products
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select products to showcase in latest section ({latestProducts.length} selected)
                  </p>
                </div>
                {latestProducts.length > 0 && (
                  <button
                    onClick={() => setLatestProducts([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Selected Items Display */}
              {latestProducts.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Selected Products
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {latestProducts.map((id) => {
                      const product = latestCandidates.find((p) => (p._id || p) === id);
                      if (!product) return null;
                      return (
                        <div
                          key={id}
                          className="relative group bg-linear-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-3 hover:shadow-lg transition-all"
                        >
                          <button
                            onClick={() =>
                              setLatestProducts((prev) =>
                                prev.filter((x) => x !== id)
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-28 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-orange-600 font-bold">
                            ₹{product.discountedPrice || product.price}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Add Product
                </label>
                <div className="relative" ref={latestProductsRef}>
                  <button
                    onClick={() =>
                      setDropdownOpen((prev) => ({
                        ...prev,
                        latestProducts: !prev.latestProducts,
                      }))
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base font-medium bg-white hover:border-orange-400 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-600">Select a product to add</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {dropdownOpen.latestProducts && (
                    <div className="absolute z-9999 w-full mt-2 bg-white border-2 border-orange-400 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                      {latestCandidates
                        .filter((p) => !latestProducts.includes(p._id || p))
                        .map((p) => {
                          const id = p._id || p;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                setLatestProducts((prev) => [...prev, id]);
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  latestProducts: false,
                                }));
                              }}
                            >
                              <img
                                src={p.images?.[0] || "/placeholder.png"}
                                alt={p.name}
                                className="w-14 h-14 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{p.name}</p>
                                <p className="text-xs text-orange-600 font-semibold">
                                  ₹{p.discountedPrice || p.price}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Featured Reviews */}
          <section className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b bg-linear-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                    Featured Reviews
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select reviews to display in carousel ({selectedReviews.length} selected)
                  </p>
                </div>
                {selectedReviews.length > 0 && (
                  <button
                    onClick={() => setSelectedReviews([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Selected Items Display */}
              {selectedReviews.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Selected Reviews
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedReviews.map((id) => {
                      const review = featuredReviews.find((r) => (r._id || r) === id);
                      if (!review) return null;
                      return (
                        <div
                          key={id}
                          className="relative group bg-linear-to-br from-pink-50 to-rose-50 border-2 border-pink-300 rounded-xl p-4 hover:shadow-lg transition-all"
                        >
                          <button
                            onClick={() =>
                              setSelectedReviews((prev) =>
                                prev.filter((x) => x !== id)
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {review.userName || review.user?.name || "Anonymous"}
                            </p>
                            <div className="flex items-center text-yellow-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs ml-1">
                                {review.rating || 5}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {review.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Add Review
                </label>
                <div className="relative" ref={featuredReviewsRef}>
                  <button
                    onClick={() =>
                      setDropdownOpen((prev) => ({
                        ...prev,
                        featuredReviews: !prev.featuredReviews,
                      }))
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base font-medium bg-white hover:border-pink-400 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-600">Select a review to add</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {dropdownOpen.featuredReviews && (
                    <div className="absolute z-9999 w-full mt-2 bg-white border-2 border-pink-400 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                      {featuredReviews
                        .filter((r) => !selectedReviews.includes(r._id || r))
                        .map((r) => {
                          const id = r._id || r;
                          return (
                            <div
                              key={id}
                              className="flex items-start gap-3 p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                setSelectedReviews((prev) => [...prev, id]);
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  featuredReviews: false,
                                }));
                              }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900">
                                    {r.userName || r.user?.name || "Anonymous"}
                                  </p>
                                  <div className="flex items-center text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs ml-1">{r.rating || 5}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {r.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Info Section */}
        <section className="bg-linear-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5" />
            Configuration Tips
          </h3>
          <ul className="space-y-2.5 text-sm text-orange-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0"></div>
              <span><strong>Hero Slides:</strong> Use high-quality images (1920x800px recommended) for best results</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0"></div>
              <span><strong>Featured Collections:</strong> Choose your most popular or seasonal categories</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0"></div>
              <span><strong>Latest Products:</strong> Keep this updated with new arrivals</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0"></div>
              <span><strong>Reviews:</strong> Showcase authentic 5-star reviews to build trust</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0"></div>
              <span><strong>Save Changes:</strong> Don't forget to save after making updates</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-linear-to-r from-green-500 to-emerald-600' 
              : 'bg-linear-to-r from-red-500 to-rose-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border-2 border-white/20`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 shrink-0" />
            )}
            <p className="font-semibold">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'error' })}
              className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroConfig;
