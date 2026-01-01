import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '@/services/productService';
import ProductCard from '@/components/Home/ProductCard';
import ProductDetailsView from '@/components/Product/ProductDetailsView';
import { pushRecentView, getRecentViews } from '@/lib/recentViews';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await ProductService.getProductById(id);
        const productData = res?.data?.product;
        
        if (productData) {
          setProduct(productData);
          pushRecentView(productData);
          
          // Fetch reviews
          if (productData.reviews && productData.reviews.length > 0) {
            setReviews(productData.reviews);
          }

          // Fetch recommended products from same category
          if (productData.category?._id) {
            const recRes = await ProductService.getProducts({ 
              category: productData.category._id, 
              limit: 8 
            });
            const filtered = recRes?.data?.products?.filter(p => p._id !== id) || [];
            setRecommendedProducts(filtered);
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const loadRecentlyViewed = () => {
      const recent = getRecentViews().filter(p => p._id !== id).slice(0, 8);
      setRecentProducts(recent);
    };

    if (id) {
      fetchProductDetails();
      loadRecentlyViewed();
    }
  }, [id]);

  return (
    <div>
      <ProductDetailsView
        product={product}
        reviews={reviews}
        loading={loading}
        isAdmin={false}
        showBackButton={true}
        showRecommendations={true}
        recommendedProducts={recommendedProducts}
        ProductCardComponent={ProductCard}
      />
      
      {/* Recently Viewed Section - Kept separate as it's unique to user view */}
      {!loading && recentProducts.length > 0 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 bg-brand-text-primary">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {recentProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
