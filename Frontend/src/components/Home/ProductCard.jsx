import { EyeIcon, Heart, HeartPlus, Plus } from 'lucide-react';
import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { pushRecentView as pushRecentViewUtil } from '@/lib/recentViews';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice';

/**
 * ProductCard Component
 * Production-ready product card with wishlist and quick view
 * Accepts product object as prop
 */
const ProductCard = memo(({ product }) => {
  const [cartQuantity, setCartQuantity] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

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

  // Check if product is in wishlist
  const isWishlisted = wishlistItems.some(item => 
    item._id === _id || item.productId === _id || item.product?._id === _id
  );

  // Check cart quantity for this product
  useEffect(() => {
    const cartItem = cartItems.find(item => item.productId === _id || item._id === _id);
    setCartQuantity(cartItem?.quantity || 0);
  }, [cartItems, _id]);

  const imageUrl = images?.[0] || 'https://placehold.co/400x550';
  
  // Show discounted price as main price if available, otherwise show regular price
  const displayPrice = discountedPrice || price;
  const hasDiscount = discountedPrice && price && discountedPrice < price;
  const discountPercentage = hasDiscount 
    ? Math.round(((price - discountedPrice) / price) * 100) 
    : null;

  const handleProductClick = () => {
    pushRecentViewUtil({
      _id,
      name,
      images,
      discountedPrice: displayPrice,
      slug: product.slug,
    });
    navigate(`/products/${_id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Add to cart clicked for:', name);
    
    const cartItem = {
      _id,
      productId: _id,
      name,
      price: displayPrice,
      image: imageUrl,
      images: [imageUrl],
      quantity: 1
    };
    
    console.log('Cart item:', cartItem);
    
    try {
      dispatch(addToCart(cartItem));
      console.log('Dispatched addToCart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(_id)).unwrap();
        console.log('Removed from wishlist:', name);
      } else {
        await dispatch(addToWishlist(_id)).unwrap();
        console.log('Added to wishlist:', name);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className="w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[400px] bg-white border-b-2 border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x550';
            }}
          />
          
          {/* Discount Badge */}
          {discountPercentage && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded z-10">
              {discountPercentage}% OFF
            </div>
          )}
          
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col space-y-2">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 sm:p-3 bg-white rounded-full shadow-md transition-colors group relative ${
                isWishlisted ? 'hover:bg-gray-100' : 'hover:bg-red-500'
              }`}
              aria-label="Add to wishlist"
            >
              {isWishlisted ? (
                <Heart className="w-3 h-3 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
              ) : (
                <div className="relative">
                  <HeartPlus className="w-3 h-3 sm:w-5 sm:h-5 text-gray-800 group-hover:text-white transition-colors" />                </div>
              )}
            </button>
            
          </div>
        </div>

        <div className="p-2 sm:p-3 md:p-4 flex justify-between items-end">
          <div className="flex flex-col space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-800 truncate">{name}</h3>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">₹{displayPrice}</span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-through">
                  ₹{price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="relative flex items-center justify-center p-1.5 sm:p-2 md:p-2.5 border-2 border-gray-900 text-gray-900 bg-white rounded-lg hover:bg-gray-100  transition-all duration-300shrink-0 min-w-8 sm:min-w-[38px] md:min-w-11 min-h-8 sm:min-h-[38px] md:min-h-11"
            aria-label="Add to Cart"
          >
            {cartQuantity > 0 ? (
              <span className="text-xs sm:text-sm md:text-base font-bold">{cartQuantity}</span>
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
