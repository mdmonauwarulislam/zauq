import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryService from '@/services/categoryService';
import CollectionsCategory from '@/components/Home/CollectionsCategory';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await CategoryService.getCategories();
      setCategories(res?.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-text-primary py-8 md:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary mb-3">
            Shop by Category
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Explore our curated collections
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CollectionsCategory key={category._id} collection={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
