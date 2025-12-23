import React, { useEffect, useState, useRef } from "react";
import ReviewService from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Eye, 
  Trash2, 
  Check, 
  X,
  MessageSquare,
  Search,
  Filter,
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
} from "lucide-react";

const PAGE_LIMIT = 10;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, review: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const menuRef = useRef(null);

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

  const load = async (p = 1, status = "all") => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_LIMIT };
      if (status !== "all") params.status = status;
      const res = await ReviewService.getAllReviews(params);
      const data = res || res.data || {};
      setReviews(data.reviews || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load reviews', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, statusFilter);
  }, [statusFilter]);

  const handleApprove = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.approveReview(review._id);
      setToast({ show: true, message: 'Review approved successfully', type: 'success' });
      load(page, statusFilter);
    } catch (err) {
      setToast({ show: true, message: 'Failed to approve review', type: 'error' });
    }
  };

  const handleDelete = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.deleteReview(review._id);
      setToast({ show: true, message: 'Review deleted successfully', type: 'success' });
      load(page, statusFilter);
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete review', type: 'error' });
    }
  };

  const handleToggleFeatured = async (review) => {
    setConfirmModal({ show: false, action: null, review: null });
    try {
      await ReviewService.toggleReviewFeatured(review._id, !review.isFeatured);
      setToast({ show: true, message: `Review ${review.isFeatured ? 'removed from' : 'marked as'} featured`, type: 'success' });
      load(page, statusFilter);
    } catch (err) {
      setToast({ show: true, message: 'Failed to update featured status', type: 'error' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.user?.firstName?.toLowerCase().includes(query) ||
      review.user?.lastName?.toLowerCase().includes(query) ||
      review.product?.name?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.title?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-amber-50/30">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-amber-900 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-amber-600" />
              Reviews Management
            </h1>
            <p className="text-gray-600">Approve, moderate, and showcase customer reviews</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-amber-700 font-bold">{reviews.length}</span> reviews
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, product, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-linear-to-r from-amber-600 to-orange-600 text-white" : ""}
            >
              <Filter className="w-4 h-4 mr-1" />
              All Reviews
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-linear-to-r from-yellow-600 to-amber-600 text-white" : ""}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => setStatusFilter("approved")}
              className={statusFilter === "approved" ? "bg-linear-to-r from-green-600 to-emerald-600 text-white" : ""}
            >
              Approved
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-amber-100 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-amber-100 p-12 text-center shadow-sm">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No reviews found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search criteria' : 'Reviews will appear here once customers submit them'}
          </p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div key={review._id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        {/* User Avatar */}
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-100 to-yellow-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-amber-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {review.user?.firstName} {review.user?.lastName}
                            </h3>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="ml-1 text-sm font-semibold text-gray-600">({review.rating})</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4" />
                            {review.product?.name}
                          </p>
                          
                          {review.title && (
                            <p className="font-semibold text-gray-900 mb-1">{review.title}</p>
                          )}
                          
                          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                          
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex gap-2 flex-wrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 ${
                          review.isApproved
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}>
                          {review.isApproved ? (
                            <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Approved</>
                          ) : (
                            <><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pending</>
                          )}
                        </span>
                        {review.isFeatured && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border-2 border-blue-200">
                            <Sparkles className="w-3.5 h-3.5 mr-1" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Three-dot menu */}
                    <div className="relative" ref={openMenu === review._id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenu(openMenu === review._id ? null : review._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {openMenu === review._id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border-2 border-gray-200 py-2 z-10">
                          {!review.isApproved && (
                            <button
                              onClick={() => {
                                setConfirmModal({ show: true, action: 'approve', review });
                                setOpenMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-gray-700"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                              Approve Review
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'featured', review });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-gray-700"
                          >
                            {review.isFeatured ? (
                              <>
                                <X className="w-4 h-4 text-blue-600" />
                                Remove Featured
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                Mark as Featured
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'delete', review });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Review
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
            <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => load(page - 1, statusFilter)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => load(page + 1, statusFilter)}
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
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-amber-200">
            <div className={`${
              confirmModal.action === 'delete' 
                ? 'bg-linear-to-r from-red-50 to-rose-50 border-red-100' 
                : confirmModal.action === 'approve'
                ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-100'
                : 'bg-linear-to-r from-blue-50 to-cyan-50 border-blue-100'
            } p-6 border-b`}>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {confirmModal.action === 'delete' ? (
                  <>
                    <Trash2 className="w-6 h-6 text-red-600" />
                    Delete Review
                  </>
                ) : confirmModal.action === 'approve' ? (
                  <>
                    <Check className="w-6 h-6 text-green-600" />
                    Approve Review
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    {confirmModal.review?.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                  </>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {confirmModal.action === 'delete' 
                  ? 'Are you sure you want to permanently delete this review? This action cannot be undone.' 
                  : confirmModal.action === 'approve'
                  ? 'Approve this review and make it visible to all customers?'
                  : confirmModal.review?.isFeatured
                  ? 'Remove this review from featured reviews?'
                  : 'Mark this review as featured to highlight it on your store?'}
              </p>
              
              <div className={`${
                confirmModal.action === 'delete' ? 'bg-red-50 border-red-100' 
                : confirmModal.action === 'approve' ? 'bg-green-50 border-green-100'
                : 'bg-blue-50 border-blue-100'
              } rounded-lg p-4 mb-6 border`}>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-gray-900">{confirmModal.review?.user?.firstName} {confirmModal.review?.user?.lastName}</span>
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(confirmModal.review?.rating)}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{confirmModal.review?.comment}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, review: null })}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
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
                      ? 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                      : confirmModal.action === 'approve'
                      ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white rounded-lg font-semibold transition-all shadow-sm`}
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
              ? 'bg-linear-to-r from-green-500 to-emerald-600' 
              : 'bg-linear-to-r from-red-500 to-rose-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border-2 border-white/20`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            )}
            <p className="font-semibold">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'error' })}
              className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
