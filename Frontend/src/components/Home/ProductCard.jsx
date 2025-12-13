import { EyeIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pushRecentView as pushRecentViewUtil } from '@/lib/recentViews';

/**
 * ProductCard Component
 * Production-ready product card with wishlist and quick view
 * Accepts product object as prop
 */
const ProductCard = memo(({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  // Safe prop validation
  if (!product || !product._id) {
    return null;
  }

  const {
    _id,
    name = 'Product',
    price,
    discountedPrice,
    images = [],
  } = product;

  const imageUrl = images?.[0] || 'https://placehold.co/400x550';
  const currentPrice = discountedPrice ?? price;
  const originalPrice = price && discountedPrice && price !== discountedPrice ? price : null;

  const handleProductClick = () => {
    pushRecentViewUtil({
      _id,
      name,
      images,
      discountedPrice: currentPrice,
      slug: product.slug,
    });
    navigate(`/products/${_id}`);
  };

  return (
    <div className="w-full max-w-xs bg-white border-b-2 border-gray-200 rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 group hover:shadow-xl">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x550';
          }}
        />
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-3 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <HeartIcon
              className={isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-800'}
            />
          </button>
          <button
            onClick={handleProductClick}
            className="p-3 bg-white rounded-full shadow-md hover:bg-gray-800 hover:text-white transition-colors"
            aria-label="Quick view"
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      <div className="p-4 flex justify-between items-end">
        <div className="flex flex-col space-y-1">
          <h3 className="text-base font-medium text-gray-800 truncate">{name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">₹{currentPrice}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleProductClick}
          className="p-3 bg-gray-900 text-white rounded-lg shadow-xl hover:bg-gray-700 transition-colors"
          aria-label="Add to Cart"
        >
          <ShoppingBagIcon />
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
