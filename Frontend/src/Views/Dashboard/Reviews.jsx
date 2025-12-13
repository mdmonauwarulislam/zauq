import React, { useEffect, useState } from "react";
import ReviewService from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import { Star, Eye, Trash2, Check, X } from "lucide-react";

const PAGE_LIMIT = 10;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

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
      alert("Failed to load reviews: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, statusFilter);
  }, [statusFilter]);

  const handleApprove = async (review) => {
    if (!confirm("Approve this review?")) return;
    try {
      await ReviewService.approveReview(review._id);
      load(page, statusFilter);
    } catch (err) {
      alert("Failed to approve review: " + (err.message || err));
    }
  };

  const handleDelete = async (review) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await ReviewService.deleteReview(review._id);
      load(page, statusFilter);
    } catch (err) {
      alert("Failed to delete review: " + (err.message || err));
    }
  };

  const handleToggleFeatured = async (review) => {
    const action = review.isFeatured ? "Remove from featured?" : "Mark as featured?";
    if (!confirm(action)) return;
    try {
      await ReviewService.toggleReviewFeatured(review._id, !review.isFeatured);
      load(page, statusFilter);
    } catch (err) {
      alert("Failed to update featured status: " + (err.message || err));
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Approve, reject, delete and mark reviews as featured.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          All Reviews
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "approved" ? "default" : "outline"}
          onClick={() => setStatusFilter("approved")}
        >
          Approved
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.user?.firstName} {review.user?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {review.product?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-500">
                        ({review.rating})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.comment}
                    </div>
                    {review.title && (
                      <div className="text-sm text-gray-500">{review.title}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          review.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                      {review.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!review.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(review)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleFeatured(review)}
                        className={
                          review.isFeatured
                            ? "text-blue-600 hover:text-blue-900"
                            : "text-gray-600 hover:text-gray-900"
                        }
                      >
                        {review.isFeatured ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => load(page - 1, statusFilter)}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => load(page + 1, statusFilter)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
