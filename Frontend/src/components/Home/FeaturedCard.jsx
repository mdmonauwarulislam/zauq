import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * FeaturedCard Component (Production Ready)
 * Receives featured collection data as prop
 * Supports banner mode for full-width display
 * Shows appropriate banner image based on device (desktop/mobile)
 * Memoized to prevent unnecessary re-renders
 */
const FeaturedCard = memo(({ collection, isBanner = false }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Detect device type on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Safe default values
  if (!collection || !collection._id) {
    return null;
  }

  const { images = [], link, slug, _id, name, desktopBannerImage, mobileBannerImage } = collection;
  
  // Choose appropriate banner based on device, fallback to regular image
  const displayImage = isMobile 
    ? (mobileBannerImage || desktopBannerImage || images?.[0] || "https://placehold.co/800x500/f0f0f0/999999?text=Featured+Collection")
    : (desktopBannerImage || mobileBannerImage || images?.[0] || "https://placehold.co/800x500/f0f0f0/999999?text=Featured+Collection");
  
  const navigationLink = link || `/category/${_id}`;

  const handleNavigate = () => {
    navigate(navigationLink);
  };

  // Banner mode - full width with 45-50vh height
  if (isBanner) {
    return (
      <div 
        className="block w-full cursor-pointer" 
        onClick={handleNavigate}
      >
        <div className="group relative w-full h-[25vh] sm:h-[35vh] md:h-[45vh] lg:h-[50vh] overflow-hidden rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-300">
          {/* Banner Image */}
          <img
            src={displayImage}
            alt={name || "Featured collection"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/1920x800/f0f0f0/999999?text=Featured+Collection";
            }}
          />

          {/* Hover Overlay with name */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold">{name}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card mode
  return (
    <div className="block w-full h-full cursor-pointer" onClick={handleNavigate}>
      <div className="group relative w-full h-full overflow-hidden rounded-2xl shadow-md bg-white mx-auto hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <img
          src={displayImage}
          alt={name || "Featured collection"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/800x500/f0f0f0/999999?text=Featured+Collection";
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
          {/* Optional overlay content */}
        </div>
      </div>
    </div>
  );
});

FeaturedCard.displayName = "FeaturedCard";

export default FeaturedCard;

