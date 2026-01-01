/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import ReviewService from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Trash2, 
  Check, 
  X,
  MessageSquare,
  Search,
  MoreVertical,
  User,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowUpDown,
} from "lucide-react";

const PAGE_LIMIT = 10;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, review: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const menuRef = useRef(null);
  const searchTimeout = useRef(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchInput]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      if (ratingFilter !== "all") params.rating = ratingFilter;
      if (searchQuery) params.search = searchQuery;
      if (sortBy === "oldest") params.sort = "oldest";
      else if (sortBy === "rating_high") params.sort = "rating_high";
      else if (sortBy === "rating_low") params.sort = "rating_low";

      const res = await ReviewService.getAllReviews(params);
      const data = res || res.data || {};
      setReviews(data.reviews || []);
      setStats(data.stats || null);
      setPage(data.pagination?.page || page);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load reviews', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, ratingFilter, sortBy, searchQuery, page]);

  const handleApprove = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.approveReview(review._id);
      setToast({ show: true, message: 'Review approved successfully', type: 'success' });
      load();
    } catch (err) {
      setToast({ show: true, message: 'Failed to approve review', type: 'error' });
    }
  };

  const handleDelete = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.deleteReview(review._id);
      setToast({ show: true, message: 'Review deleted successfully', type: 'success' });
      load();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete review', type: 'error' });
    }
  };

  const handleToggleFeatured = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.toggleReviewFeatured(review._id, !review.isFeatured);
      setToast({ show: true, message: `Review ${review.isFeatured ? 'removed from' : 'marked as'} featured`, type: 'success' });
      load();
    } catch (err) {
      setToast({ show: true, message: 'Failed to update featured status', type: 'error' });
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setRatingFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const getRatingBarWidth = (count) => {
    if (!stats || stats.total === 0) return 0;
    return (count / stats.total) * 100;
  };

  const hasActiveFilters = statusFilter !== "all" || ratingFilter !== "all" || sortBy !== "newest" || searchInput;

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50 min-h-screen">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2 flex items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              Reviews Management
            </h1>
            <p className="text-gray-600">Moderate, approve, and showcase customer feedback</p>
          </div>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-100">
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
                <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-100">
                <p className="text-xs text-green-600 font-medium">Approved</p>
                <p className="text-xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="bg-purple-50 rounded-lg px-4 py-2 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">Featured</p>
                <p className="text-xl font-bold text-purple-700">{stats.featured}</p>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-2 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Avg Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-bold text-amber-700">{stats.avgRating}</p>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      {stats && stats.ratingDistribution && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${getRatingBarWidth(stats.ratingDistribution[rating])}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {stats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, product, comment..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="featured">Featured</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>

          {/* Sort Order */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => { setSortBy('newest'); setPage(1); }}
              className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-1 ${
                sortBy === 'newest'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Newest
            </button>
            <button
              onClick={() => { setSortBy('oldest'); setPage(1); }}
              className={`px-3 py-2 text-sm font-medium transition-all border-l border-gray-200 ${
                sortBy === 'oldest'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => { setSortBy('rating_high'); setPage(1); }}
              className={`px-3 py-2 text-sm font-medium transition-all border-l border-gray-200 ${
                sortBy === 'rating_high'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Top Rated
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Result Count */}
          <div className="ml-auto text-sm text-gray-600">
            <span className="font-bold text-brand-primary">{totalCount}</span> reviews found
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No reviews found</p>
          <p className="text-sm text-gray-500 mt-1">
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Reviews will appear here once customers submit them'}
          </p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-white rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-brand-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {review.user?.firstName} {review.user?.lastName}
                            </h3>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="ml-1 text-sm font-semibold text-gray-500">({review.rating})</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                            <Package className="w-4 h-4" />
                            <span className="truncate">{review.product?.name}</span>
                          </p>
                          
                          {review.title && (
                            <p className="font-semibold text-gray-800 mb-1">{review.title}</p>
                          )}
                          
                          <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(review.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric'
                              })}
                            </span>
                            
                            {/* Status Badges */}
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                              review.isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {review.isApproved ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Pending</>
                              )}
                            </span>
                            {review.isFeatured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                <Sparkles className="w-3 h-3 mr-1" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative" ref={openMenu === review._id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenu(openMenu === review._id ? null : review._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      {openMenu === review._id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                          {!review.isApproved && (
                            <button
                              onClick={() => {
                                setConfirmModal({ show: true, action: 'approve', review });
                                setOpenMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-sm text-gray-700"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'featured', review });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            {review.isFeatured ? (
                              <><X className="w-4 h-4 text-purple-600" /> Remove Featured</>
                            ) : (
                              <><Sparkles className="w-4 h-4 text-purple-600" /> Mark Featured</>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'delete', review });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`${
              confirmModal.action === 'delete' 
                ? 'bg-red-50' 
                : confirmModal.action === 'approve'
                ? 'bg-green-50'
                : 'bg-purple-50'
            } p-5 border-b`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {confirmModal.action === 'delete' ? (
                  <><Trash2 className="w-5 h-5 text-red-600" /> Delete Review</>
                ) : confirmModal.action === 'approve' ? (
                  <><Check className="w-5 h-5 text-green-600" /> Approve Review</>
                ) : (
                  <><Sparkles className="w-5 h-5 text-purple-600" /> {confirmModal.review?.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}</>
                )}
              </h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4">
                {confirmModal.action === 'delete' 
                  ? 'This review will be permanently deleted. This action cannot be undone.' 
                  : confirmModal.action === 'approve'
                  ? 'This review will become visible to all customers.'
                  : confirmModal.review?.isFeatured
                  ? 'Remove this review from featured reviews?'
                  : 'This review will be highlighted on your store.'}
              </p>
              
              <div className={`${
                confirmModal.action === 'delete' ? 'bg-red-50' 
                : confirmModal.action === 'approve' ? 'bg-green-50'
                : 'bg-purple-50'
              } rounded-lg p-4 mb-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {confirmModal.review?.user?.firstName} {confirmModal.review?.user?.lastName}
                  </span>
                  <div className="flex">{renderStars(confirmModal.review?.rating, "w-3 h-3")}</div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{confirmModal.review?.comment}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, review: null })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.action === 'delete') handleDelete(confirmModal.review);
                    else if (confirmModal.action === 'approve') handleApprove(confirmModal.review);
                    else handleToggleFeatured(confirmModal.review);
                  }}
                  className={`flex-1 px-4 py-2.5 ${
                    confirmModal.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white rounded-lg font-medium text-sm transition-all`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-green-600' 
              : 'bg-red-600'
          } text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[280px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'error' })}
              className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
