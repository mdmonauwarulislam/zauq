import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductService from '@/services/productService';
import CategoryService from '@/services/categoryService';
import ProductCard from '@/components/Home/ProductCard';
import toast from 'react-hot-toast';

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategoryData();
  }, [categoryId, sortBy]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      const [categoryRes, productsRes] = await Promise.all([
        CategoryService.getCategoryById(categoryId),
        ProductService.getProducts({ category: categoryId, sort: sortBy })
      ]);

      setCategory(categoryRes?.data?.category || null);
      setProducts(productsRes?.data?.products || []);
    } catch (error) {
      console.error('Failed to fetch category data:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Latest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
  ];

  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Category not found</p>
        <button
          onClick={() => navigate('/collections')}
          className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  // Banner selection logic (only after category is loaded)
  const bannerImage = isMobile
    ? (category.mobileBannerImage || category.desktopBannerImage)
    : (category.desktopBannerImage || category.mobileBannerImage);
  const fallbackImage = category.images?.[0] || null;

  return (
    <div className="min-h-screen bg-brand-text-primary">
      {/* Hero Section */}
      <div className="relative h-[30vh] md:h-[50vh] overflow-hidden">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : fallbackImage ? (
          <img
            src={fallbackImage}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-brand-primary" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/collections')}
          className="absolute top-4 left-4 md:top-8 md:left-8 p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Category Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="w-full px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/90 text-sm md:text-lg max-w-2xl">
                {category.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
              All Products
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              {products.length} {products.length === 1 ? 'item' : 'items'} available
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-all"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <SlidersHorizontal className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              There are no products in this category yet.
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Browse Other Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Categories Section (Optional) */}
      {products.length > 0 && (
        <div className="bg-linear-to-r from-purple-100 to-pink-100 py-8 md:py-12 mt-12">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Explore More Categories
            </h3>
            <button
              onClick={() => navigate('/collections')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              View All Categories
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
