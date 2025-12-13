import React from "react";
import ReviewCard from "./ReviewCard";

const FeaturedReviewsCarousel = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) return <div className="text-sm text-gray-500">No reviews yet</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {reviews.map((r) => (
        <ReviewCard key={r._id} review={r} />
      ))}
    </div>
  );
};

export default FeaturedReviewsCarousel;
