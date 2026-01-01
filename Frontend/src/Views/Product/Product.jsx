/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductService from '@/services/productService';
import CategoryService from '@/services/categoryService';
import ProductCard from '@/components/Home/ProductCard';
import {
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Product = () => {
  const [searchParams, _setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedDiscount, setSelectedDiscount] = useState('');
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || 'newest'
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || ''
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchClear, setShowSearchClear] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Accordion states
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    brands: true,
    discount: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    loadRecentSearches();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (term) => {
    if (!term || term.trim().length < 2) return;
    
    try {
      let recent = [...recentSearches];
      recent = recent.filter(s => s.toLowerCase() !== term.toLowerCase());
      recent.unshift(term);
      recent = recent.slice(0, 5); // Keep only last 5
      
      setRecentSearches(recent);
      localStorage.setItem('recentSearches', JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // Generate search suggestions
  const updateSuggestions = (input) => {
    if (!input || input.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const query = input.toLowerCase().trim();
    const suggestions = [];

    // Add matching categories (limit to 3)
    const matchingCategories = categories
      .filter(cat => cat && cat.name && cat.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map(cat => ({
        type: 'category',
        text: cat.name,
        id: cat._id
      }));

    // Add matching brands (limit to 3)
    const matchingBrands = brands
      .filter(brand => brand && brand.toLowerCase().includes(query))
      .slice(0, 3)
      .map(brand => ({
        type: 'brand',
        text: brand
      }));

    suggestions.push(...matchingCategories, ...matchingBrands);
    setSearchSuggestions(suggestions.slice(0, 6));
  };

  // Debounced search effect - separate concerns
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when searchTerm changes (after debounce)
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    const newUrl = newParams.toString() ? `?${newParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm]);

  useEffect(() => {
    setShowSearchClear(searchInput.length > 0);
  }, [searchInput]);

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    selectedBrands,
    priceRange,
    selectedDiscount,
    sortBy,
    searchTerm,
  ]);

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getCategories();
      setCategories(res?.data?.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await ProductService.getProducts({ limit: 1000 });
      const allProducts = res?.data?.products || [];
      const uniqueBrands = [
        ...new Set(allProducts.map((p) => p.brand).filter(Boolean)),
      ];
      setBrands(uniqueBrands.sort());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (searchTerm) setSearchLoading(true);
      
      const params = { sort: sortBy, limit: 100 };

      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const res = await ProductService.getProducts(params);
      let filteredProducts = res?.data?.products || [];

      if (selectedBrands.length) {
        filteredProducts = filteredProducts.filter((p) =>
          selectedBrands.includes(p.brand)
        );
      }

      if (priceRange.min || priceRange.max < 100000) {
        filteredProducts = filteredProducts.filter((p) => {
          const price = p.discountedPrice || p.price;
          return (
            price >= priceRange.min && price <= priceRange.max
          );
        });
      }

      if (selectedDiscount) {
        const d = Number(selectedDiscount);
        filteredProducts = filteredProducts.filter(
          (p) => p.discount >= d
        );
      }

      setProducts(filteredProducts);
      setTotalProducts(filteredProducts.length);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setSearchTerm(trimmedInput);
      saveRecentSearch(trimmedInput);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim().length >= 2) {
      updateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(value.length === 0 && recentSearches.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    
    if (suggestion.type === 'category') {
      setSelectedCategory(suggestion.id);
      setSearchInput('');
      setSearchTerm('');
    } else if (suggestion.type === 'brand') {
      setSelectedBrands([suggestion.text]);
      setSearchInput('');
      setSearchTerm('');
    } else {
      // It's a recent search term
      setSearchInput(suggestion);
      setSearchTerm(suggestion);
      saveRecentSearch(suggestion);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 100000 });
    setSelectedDiscount('');
    setSortBy('newest');
    setSearchTerm('');
    setSearchInput('');
    
    // Clear URL params properly
    window.history.replaceState({}, '', window.location.pathname);
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedBrands.length > 0 ||
    priceRange.min > 0 ||
    priceRange.max < 100000 ||
    selectedDiscount ||
    sortBy !== 'newest';

  const discountOptions = [
    { value: '10', label: '10% and above' },
    { value: '20', label: '20% and above' },
    { value: '30', label: '30% and above' },
    { value: '40', label: '40% and above' },
    { value: '50', label: '50% and above' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Latest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-text-primary">
      {/* Hero */}
      <div className="text-brand-primary py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-6">
            All Products
          </h1>

          <form
            onSubmit={handleSearchSubmit}
            className="relative"
            onClick={(e) => {
              // Allow submit button clicks to work
              if (e.target.type !== 'submit' && !e.target.closest('button[type="submit"]')) {
                e.stopPropagation();
              }
            }}
          >
            <div className="relative border-2 border-primary rounded-2xl">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for products, brands and more..."
                className="w-full px-6 py-4 pr-24 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:to-brand-primary transition"
                autoComplete="off"
              />
              
              {/* Loading Spinner */}
              {searchLoading && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                </div>
              )}
              
              {/* Clear Button */}
              {showSearchClear && !searchLoading && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
              
              {/* Search Button */}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-white p-3 rounded-xl hover:bg-brand-primary-dark cursor-pointer transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchInput.length > 0 || recentSearches.length > 0) && (
              <div
                className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* Recent Searches */}
                {searchInput.length === 0 && recentSearches.length > 0 && (
                  <div className="p-4 border-b">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Recent Searches
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(term)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 text-sm transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Suggestions */}
                {searchInput.length > 0 && searchSuggestions.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Suggestions
                    </h4>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {suggestion.text}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 capitalize">
                            {suggestion.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchInput.length > 0 && searchSuggestions.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No suggestions found
                  </div>
                )}
              </div>
            )}
            
            {/* Search hint */}
            {searchInput && !showSuggestions && (
              <p className="text-sm text-purple-100 mt-2 text-center">
                Press Enter to search or wait for auto-search
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 flex gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brand-primary"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-4 pb-4 border-b">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="font-semibold text-sm uppercase">Categories</h4>
                {openSections.categories ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-brand-primary transition" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-brand-primary transition" />
                )}
              </button>
              {openSections.categories && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !selectedCategory
                        ? 'bg-brand-secondary-light text-brand-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryChange(category._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedCategory === category._id
                          ? 'bg-brand-secondary-light text-brand-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                      {category.productCount > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.productCount})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4 pb-4 border-b">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="font-semibold text-sm uppercase">Price Range</h4>
                {openSections.price ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                )}
              </button>
              {openSections.price && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[1000, 5000, 10000, 20000, 50000].map((price) => (
                      <button
                        key={price}
                        onClick={() => setPriceRange({ min: 0, max: price })}
                        className="px-3 py-1 text-xs border rounded-full hover:border-purple-600 hover:text-purple-600 transition"
                      >
                        Under ₹{price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="mb-4 pb-4 border-b">
                <button
                  onClick={() => toggleSection('brands')}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <h4 className="font-semibold text-sm uppercase">Brands</h4>
                  {openSections.brands ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                  )}
                </button>
                {openSections.brands && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discount */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection('discount')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="font-semibold text-sm uppercase">Discount</h4>
                {openSections.discount ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                )}
              </button>
              {openSections.discount && (
                <div className="space-y-2">
                  {discountOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                    >
                      <input
                        type="radio"
                        name="discount"
                        checked={selectedDiscount === option.value}
                        onChange={() => setSelectedDiscount(option.value)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                  {selectedDiscount && (
                    <button
                      onClick={() => setSelectedDiscount('')}
                      className="text-sm text-purple-600 hover:text-purple-700 ml-6"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Mobile Filter & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)
                      ?.name || 'Products'
                  : 'All Products'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'}{' '}
                found
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex-1 sm:flex-none lg:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-purple-600 transition"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm font-medium hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">No products found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h3 className="text-lg font-bold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Categories */}
                <div className="mb-4 pb-4 border-b">
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <h4 className="font-semibold text-sm uppercase">
                      Categories
                    </h4>
                    {openSections.categories ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    )}
                  </button>
                  {openSections.categories && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategoryChange('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          !selectedCategory
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryChange(category._id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                            selectedCategory === category._id
                              ? 'bg-purple-100 text-purple-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {category.name}
                          {category.productCount > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({category.productCount})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-4 pb-4 border-b">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <h4 className="font-semibold text-sm uppercase">
                      Price Range
                    </h4>
                    {openSections.price ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    )}
                  </button>
                  {openSections.price && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[1000, 5000, 10000, 20000, 50000].map((price) => (
                          <button
                            key={price}
                            onClick={() =>
                              setPriceRange({ min: 0, max: price })
                            }
                            className="px-3 py-1 text-xs border rounded-full hover:border-purple-600 hover:text-purple-600 transition"
                          >
                            Under ₹{price.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="mb-4 pb-4 border-b">
                    <button
                      onClick={() => toggleSection('brands')}
                      className="w-full flex items-center justify-between mb-3 group"
                    >
                      <h4 className="font-semibold text-sm uppercase">
                        Brands
                      </h4>
                      {openSections.brands ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                      )}
                    </button>
                    {openSections.brands && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {brands.map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => handleBrandToggle(brand)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Discount */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleSection('discount')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <h4 className="font-semibold text-sm uppercase">
                      Discount
                    </h4>
                    {openSections.discount ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition" />
                    )}
                  </button>
                  {openSections.discount && (
                    <div className="space-y-2">
                      {discountOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                          <input
                            type="radio"
                            name="discount-mobile"
                            checked={selectedDiscount === option.value}
                            onChange={() => setSelectedDiscount(option.value)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                      {selectedDiscount && (
                        <button
                          onClick={() => setSelectedDiscount('')}
                          className="text-sm text-purple-600 hover:text-purple-700 ml-6"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
