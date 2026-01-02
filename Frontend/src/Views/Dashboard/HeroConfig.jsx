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
  Grid3X3,
  Eye,
  Settings,
  Layers,
  RefreshCw,
  Copy,
  GripVertical,
} from "lucide-react";

const HeroConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [activeTab, setActiveTab] = useState('hero');

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

  // Tab configuration
  const tabs = [
    { id: 'hero', label: 'Hero Banners', icon: ImageIcon, count: heroes.length },
    { id: 'collections', label: 'Featured Collections', icon: Layers, count: featuredCollections.length },
    { id: 'categories', label: 'Main Categories', icon: Grid3X3, count: mainCategories.length },
    { id: 'products', label: 'Latest Products', icon: Package, count: latestProducts.length },
    { id: 'reviews', label: 'Featured Reviews', icon: MessageSquare, count: selectedReviews.length },
  ];

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

  const duplicateHero = (index) => {
    const heroCopy = { ...heroes[index] };
    setHeroes((prev) => [...prev.slice(0, index + 1), heroCopy, ...prev.slice(index + 1)]);
    showMessage("success", "Slide duplicated!");
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

  // Stats calculations
  const stats = {
    totalSlides: heroes.length,
    slidesWithImages: heroes.filter(h => h.image).length,
    totalCollections: featuredCollections.length,
    totalCategories: mainCategories.length,
    totalProducts: latestProducts.length,
    totalReviews: selectedReviews.length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 w-full bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading homepage configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary mb-1 flex items-center gap-2">
              <Settings className="w-7 h-7" />
              Homepage Configuration
            </h1>
            <p className="text-gray-600">
              Manage hero banners, featured sections, products, and reviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadConfig}
              variant="outline"
              disabled={loading}
              className="border-gray-300 hover:border-brand-primary hover:text-brand-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hero Slides</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalSlides}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.slidesWithImages} with images</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collections</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalCollections}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Max 4 allowed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categories</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalCategories}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Grid3X3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Max 7 allowed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Latest section</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviews</p>
              <p className="text-2xl font-bold text-pink-600 mt-1">{stats.totalReviews}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Featured carousel</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Items</p>
              <p className="text-2xl font-bold text-brand-primary mt-1">
                {stats.totalSlides + stats.totalCollections + stats.totalCategories + stats.totalProducts + stats.totalReviews}
              </p>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-brand-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Configured items</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Hero Banners Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hero Banner Slides</h3>
                  <p className="text-sm text-gray-500 mt-1">Create engaging hero slides with images and call-to-action buttons</p>
                </div>
                <Button
                  onClick={addHero}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide
                </Button>
              </div>

              <div className="space-y-4">
                {heroes.map((hero, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all bg-linear-to-br from-purple-50/30 to-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-400 cursor-move">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">Slide {index + 1}</h4>
                        {hero.image && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                            Has Image
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateHero(index)}
                          className="border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {heroes.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeHero(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Title
                            </label>
                            <input
                              value={hero.title}
                              onChange={(e) => updateHero(index, "title", e.target.value)}
                              placeholder="Enter slide title"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Subtitle
                            </label>
                            <input
                              value={hero.subtitle}
                              onChange={(e) => updateHero(index, "subtitle", e.target.value)}
                              placeholder="Enter slide subtitle"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Button Text
                            </label>
                            <input
                              value={hero.ctaText}
                              onChange={(e) => updateHero(index, "ctaText", e.target.value)}
                              placeholder="Shop Now"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Button Link
                            </label>
                            <input
                              value={hero.ctaLink}
                              onChange={(e) => updateHero(index, "ctaLink", e.target.value)}
                              placeholder="/products"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Hero Image
                        </label>
                        <div className="border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 bg-white transition-all h-[140px]">
                          {hero.image ? (
                            <div className="relative h-full">
                              <img
                                src={hero.image}
                                alt={`Hero ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
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
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">Upload image</span>
                              <span className="text-xs text-gray-400 mt-1">1920x800px recommended</span>
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
            </div>
          )}

          {/* Featured Collections Tab */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Featured Collections</h3>
                  <p className="text-sm text-gray-500 mt-1">Select up to 4 categories to feature on homepage ({featuredCollections.length}/4)</p>
                </div>
                {featuredCollections.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFeaturedCollections([])}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Selected Collections */}
              {featuredCollections.length > 0 && (
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
                          onClick={() => setFeaturedCollections((prev) => prev.filter((x) => x !== id))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img
                          src={category.images?.[0] || "/placeholder.png"}
                          alt={category.name}
                          className="w-full h-28 object-cover rounded-lg mb-3"
                        />
                        <p className="text-sm font-semibold text-gray-900 text-center truncate">
                          {category.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Collection Dropdown */}
              {featuredCollections.length < 4 && (
                <div className="relative" ref={featuredCollectionsRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => ({ ...prev, featuredCollections: !prev.featuredCollections }))}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-400 bg-white transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-600 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add a collection
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen.featuredCollections ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen.featuredCollections && (
                    <div className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
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
                                setDropdownOpen((prev) => ({ ...prev, featuredCollections: false }));
                              }}
                            >
                              <img
                                src={c.images?.[0] || "/placeholder.png"}
                                alt={c.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{c.name}</p>
                                <p className="text-xs text-gray-500">Category</p>
                              </div>
                              <Plus className="w-5 h-5 text-blue-500" />
                            </div>
                          );
                        })}
                      {allCategories.filter((c) => !featuredCollections.includes(c._id || c)).length === 0 && (
                        <p className="p-4 text-center text-gray-500">No more categories available</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Main Categories</h3>
                  <p className="text-sm text-gray-500 mt-1">Select up to 7 categories for main section ({mainCategories.length}/7)</p>
                </div>
                {mainCategories.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMainCategories([])}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Selected Categories */}
              {mainCategories.length > 0 && (
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
                          onClick={() => setMainCategories((prev) => prev.filter((x) => x !== id))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <img
                          src={category.images?.[0] || "/placeholder.png"}
                          alt={category.name}
                          className="w-full h-20 object-cover rounded-lg mb-2"
                        />
                        <p className="text-xs font-semibold text-gray-900 text-center truncate">
                          {category.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Category Dropdown */}
              {mainCategories.length < 7 && (
                <div className="relative" ref={mainCategoriesRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => ({ ...prev, mainCategories: !prev.mainCategories }))}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-green-400 bg-white transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-600 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add a category
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen.mainCategories ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen.mainCategories && (
                    <div className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-green-400 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
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
                                setDropdownOpen((prev) => ({ ...prev, mainCategories: false }));
                              }}
                            >
                              <img
                                src={c.images?.[0] || "/placeholder.png"}
                                alt={c.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{c.name}</p>
                                <p className="text-xs text-gray-500">Category</p>
                              </div>
                              <Plus className="w-5 h-5 text-green-500" />
                            </div>
                          );
                        })}
                      {allCategories.filter((c) => !mainCategories.includes(c._id || c)).length === 0 && (
                        <p className="p-4 text-center text-gray-500">No more categories available</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Latest Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Latest Products</h3>
                  <p className="text-sm text-gray-500 mt-1">Select products to showcase in latest section ({latestProducts.length} selected)</p>
                </div>
                {latestProducts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLatestProducts([])}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Selected Products */}
              {latestProducts.length > 0 && (
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
                          onClick={() => setLatestProducts((prev) => prev.filter((x) => x !== id))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-24 object-cover rounded-lg mb-2"
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
              )}

              {/* Add Product Dropdown */}
              <div className="relative" ref={latestProductsRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => ({ ...prev, latestProducts: !prev.latestProducts }))}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-orange-400 bg-white transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-600 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add a product
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen.latestProducts ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen.latestProducts && (
                  <div className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-orange-400 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
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
                              setDropdownOpen((prev) => ({ ...prev, latestProducts: false }));
                            }}
                          >
                            <img
                              src={p.images?.[0] || "/placeholder.png"}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{p.name}</p>
                              <p className="text-xs text-orange-600 font-semibold">
                                ₹{p.discountedPrice || p.price}
                              </p>
                            </div>
                            <Plus className="w-5 h-5 text-orange-500" />
                          </div>
                        );
                      })}
                    {latestCandidates.filter((p) => !latestProducts.includes(p._id || p)).length === 0 && (
                      <p className="p-4 text-center text-gray-500">No more products available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Featured Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Featured Reviews</h3>
                  <p className="text-sm text-gray-500 mt-1">Select reviews to display in carousel ({selectedReviews.length} selected)</p>
                </div>
                {selectedReviews.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReviews([])}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Selected Reviews */}
              {selectedReviews.length > 0 && (
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
                          onClick={() => setSelectedReviews((prev) => prev.filter((x) => x !== id))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center">
                            <span className="text-pink-700 font-semibold text-sm">
                              {(review.userName || review.user?.name || "A").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {review.userName || review.user?.name || "Anonymous"}
                            </p>
                            <div className="flex items-center text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < (review.rating || 5) ? 'fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {review.comment || review.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Review Dropdown */}
              <div className="relative" ref={featuredReviewsRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => ({ ...prev, featuredReviews: !prev.featuredReviews }))}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-pink-400 bg-white transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-600 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add a review
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen.featuredReviews ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen.featuredReviews && (
                  <div className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-pink-400 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
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
                              setDropdownOpen((prev) => ({ ...prev, featuredReviews: false }));
                            }}
                          >
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-pink-600 font-semibold">
                                {(r.userName || r.user?.name || "A").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900 truncate">
                                  {r.userName || r.user?.name || "Anonymous"}
                                </p>
                                <div className="flex items-center text-yellow-500">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs ml-1">{r.rating || 5}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {r.comment || r.text}
                              </p>
                            </div>
                            <Plus className="w-5 h-5 text-pink-500 shrink-0" />
                          </div>
                        );
                      })}
                    {featuredReviews.filter((r) => !selectedReviews.includes(r._id || r)).length === 0 && (
                      <p className="p-4 text-center text-gray-500">No more reviews available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-primary" />
          Configuration Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <ImageIcon className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Hero Images</p>
              <p className="text-xs text-gray-600">Use high-quality images (1920x800px) for best results</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Collections</p>
              <p className="text-xs text-gray-600">Choose popular or seasonal categories to feature</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Categories</p>
              <p className="text-xs text-gray-600">Select your main product categories for easy navigation</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <Package className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Products</p>
              <p className="text-xs text-gray-600">Keep updated with new arrivals and bestsellers</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Reviews</p>
              <p className="text-xs text-gray-600">Showcase 5-star reviews to build customer trust</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brand-primary/10 rounded-lg">
            <Save className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Save Changes</p>
              <p className="text-xs text-gray-600">Don't forget to save after making updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-green-600' 
              : 'bg-red-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium">{toast.message}</p>
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
