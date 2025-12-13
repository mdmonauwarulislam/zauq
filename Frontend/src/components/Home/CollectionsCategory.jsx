import { ArrowRight } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CollectionsCategory Component
 * Production-ready category card with hover effects
 * Accepts collection object as prop
 */
const CollectionsCategory = memo(({ collection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

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

  const image = images?.[0] || 'https://placehold.co/400x550/f0f0f0/333333?text=Category+Image';

  const displayCount = itemCount || productCount;

  const handleNavigate = () => {
    navigate(`/categories/${slug || collection._id}`);
  };

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <div
        className="relative w-full max-w-sm h-[400px] md:h-[500px] bg-white rounded-xl shadow-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNavigate}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = 'https://placehold.co/400x550/f0f0f0/333333?text=Category+Image';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-10" />
        </div>

        {/* Floating Arrow Button */}
        <button
          className="absolute top-1/2 right-2/7 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white text-gray-900 rounded-full shadow-lg cursor-pointer z-10 transition-all duration-500 ease-out"
          style={{ 
            opacity: isHovered ? 1 : 0, 
            transform: isHovered 
              ? 'translate(-50%, -50%) scale(1)' 
              : 'translate(-50%, -50%) scale(0.9)',
          }}
          aria-label={`View ${name} category`}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
        >
          <ArrowRight />
        </button>

        {/* Text Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <div className="bg-white p-2 md:p-3 rounded-xl shadow-2xl text-center opacity-75 max-w-[95%] mx-auto">
            <h2 className="text-sm font-extrabold tracking-widest uppercase text-gray-900">
              {name}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {displayCount} Items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

CollectionsCategory.displayName = 'CollectionsCategory';

export default CollectionsCategory;