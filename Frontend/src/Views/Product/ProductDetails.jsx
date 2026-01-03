import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductService from '@/services/productService';
import RecentlyViewedService from '@/services/recentlyViewedService';
import ProductCard from '@/components/Home/ProductCard';
import ProductDetailsView from '@/components/Product/ProductDetailsView';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

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
          
          // Add to recently viewed only for authenticated users
          if (isAuthenticated) {
            try {
              await RecentlyViewedService.addRecentlyViewed(productData._id);
            } catch (err) {
              console.log('Failed to add to recently viewed:', err);
            }
          }
          
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

    const loadRecentlyViewed = async () => {
      if (!isAuthenticated) {
        setRecentProducts([]);
        return;
      }
      
      try {
        const res = await RecentlyViewedService.getRecentlyViewed();
        const products = res?.data?.products || [];
        // Filter out current product
        const filtered = products.filter(p => p._id !== id);
        setRecentProducts(filtered);
      } catch (err) {
        console.log('Failed to load recently viewed:', err);
        setRecentProducts([]);
      }
    };

    if (id) {
      fetchProductDetails();
      loadRecentlyViewed();
    }
  }, [id, isAuthenticated]);

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
      
      {/* Recently Viewed Section - Only for authenticated users */}
      {!loading && isAuthenticated && recentProducts.length > 0 && (
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
