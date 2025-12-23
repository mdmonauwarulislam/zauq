import { ArrowRight } from 'lucide-react';
import { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CollectionsCategory Component
 * Production-ready category card with hover effects and mobile slider
 * Desktop: Shows second image on hover with centered button
 * Mobile: Myntra-style image slider with swipe support
 */
const CollectionsCategory = memo(({ collection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  // Safe prop validation
  if (!collection || !collection._id) {
    return null;
  }

  const { 
    name = 'Category', 
    images = [],
    slug,
    itemCount = 0,
    productCount = 0
  } = collection;

  const primaryImage = images?.[0];
  const secondaryImage = images?.[1] || primaryImage;
  const mobileImages = images.length > 0 ? images : [primaryImage];
  const hasMultipleImages = images.length > 1;

  const displayCount = itemCount || productCount;

  const handleNavigate = () => {
    navigate(`/category/${collection._id}`);
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < mobileImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className="group relative w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[400px] bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNavigate}
      >
        {/* Desktop View - Hover image swap */}
        <div className="hidden md:block">
          {/* Primary Image */}
          <div className="absolute inset-0 transition-opacity duration-500">
            <img
              src={primaryImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/400x500/f0f0f0/333333?text=Category+Image';
              }}
            />
          </div>

          {/* Secondary Image - Shows on hover */}
          {hasMultipleImages && (
            <div 
              className={`absolute inset-0 transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={secondaryImage}
                alt={`${name} alternate view`}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = primaryImage;
                }}
              />
            </div>
          )}

          {/* Centered Button - Shows on hover */}
          <button
            className={`flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 bg-white text-black rounded-full shadow-xl transition-all duration-300 z-10 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            aria-label={`View ${name} category`}
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile View - Slider */}
        <div 
          className="md:hidden relative w-full h-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={sliderRef}
        >
          {/* Image Container */}
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {mobileImages.map((image, index) => (
                <div key={index} className="min-w-full h-full shrink-0">
                  <img
                    src={image}
                    alt={`${name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'https://placehold.co/400x500/f0f0f0/333333?text=Category+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots - Only show if multiple images */}
          {hasMultipleImages && (
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              {mobileImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Category Info - Always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-4 z-10">
          <div className="bg-white/60 rounded px-2 py-1.5 sm:px-3 sm:py-2 text-center">
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide uppercase mb-0.5 text-black">
              {name}
            </h2>
            {displayCount > 0 && (
              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-700 font-medium">
                {displayCount} Items
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CollectionsCategory.displayName = 'CollectionsCategory';

export default CollectionsCategory;