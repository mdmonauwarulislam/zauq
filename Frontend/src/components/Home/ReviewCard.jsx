import { memo } from 'react';
import { Star } from 'lucide-react';

/**
 * ReviewCard Component
 * Production-ready review card with star rating
 * Accepts review object as prop
 */
const ReviewCard = memo(({ review }) => {
  // Safe prop validation
  if (!review || !review._id) {
    return null;
  }

  const {
    user,
    rating = 0,
    createdAt,
    title,
    comment,
    review: reviewText
  } = review;

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Customer';

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const ratingValue = Math.round(rating || 0);
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Avatar & Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {userName}
          </div>
          <div className="text-xs text-gray-500">{dateStr}</div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="text-xs text-gray-600 ml-2">{ratingValue}/5</span>
      </div>

      {/* Title & Comment */}
      <div className="flex-1">
        {title && (
          <div className="font-semibold text-sm text-gray-900 mb-2">
            {title}
          </div>
        )}
        <div className="text-sm text-gray-700 line-clamp-4">
          {comment || reviewText || 'No comment provided'}
        </div>
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;
