import React, { memo } from "react";
import { useNavigate } from "react-router-dom";

/**
 * FeaturedCard Component (Production Ready)
 * Receives featured collection data as prop
 * Memoized to prevent unnecessary re-renders
 */
const FeaturedCard = memo(({ collection }) => {
  const navigate = useNavigate();

  // Safe default values
  if (!collection || !collection._id) {
    return null;
  }

  const { images = [], link, slug, _id, name } = collection;
  const image = images?.[0] || "https://placehold.co/800x500/f0f0f0/999999?text=Featured+Collection";
  const navigationLink = link || `/categories/${slug || _id}`;

  const handleNavigate = () => {
    navigate(navigationLink);
  };

  return (
    <div className="block w-full h-full cursor-pointer" onClick={handleNavigate}>
      <div className="group relative w-full h-full overflow-hidden rounded-2xl shadow-md bg-white mx-auto hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <img
          src={image}
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

