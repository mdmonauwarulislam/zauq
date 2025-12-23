import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ViewAllCard Component
 * Card that matches category card dimensions for consistent grid layout
 */
const ViewAllCard = memo(({ to = '/categories' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center">
      <div
        className="group relative w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[400px] bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 border-dashed border-gray-300"
        onClick={() => navigate(to)}
      >
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide uppercase mb-2 md:mb-4 text-brand-primary">
              View All
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 md:mb-6">
              Explore our complete collection
            </p>
            
            {/* Icon Button */}
            <button
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-brand-primary text-white rounded-full shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-primary/90 mx-auto"
              aria-label="View all categories"
              onClick={(e) => {
                e.stopPropagation();
                navigate(to);
              }}
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ViewAllCard.displayName = 'ViewAllCard';

export default ViewAllCard;
