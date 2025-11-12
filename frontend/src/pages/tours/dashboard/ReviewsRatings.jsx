import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter, Search, Send, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const ReviewsRatings = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRating !== 'all') {
        params.append('rating', filterRating);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      
      const response = await apiClient.get(`/tours/reviews${query}`);
      const reviewsData = response.data?.data || response.data || [];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/tours/reviews/stats');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setResponding(true);
    try {
      const reviewId = selectedReview.review_id || selectedReview.id;
      await apiClient.patch(`/tours/reviews/${reviewId}/response`, {
        response: responseText.trim()
      });
      
      toast.success('Response posted successfully');
      setShowResponseModal(false);
      setResponseText('');
      setSelectedReview(null);
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error posting response:', error);
      toast.error(error.response?.data?.message || 'Failed to post response');
    } finally {
      setResponding(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tour_package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-sm text-gray-600 mt-1">View and respond to customer reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageRating || '0.0'}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-400 fill-current" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalReviews || reviews.length || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">5 Star</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.ratingDistribution?.[5] || reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-400 fill-current" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.responseRate || 
                  (reviews.length > 0 
                    ? ((reviews.filter(r => r.vendor_response).length / reviews.length) * 100).toFixed(0)
                    : 0)}%
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews by comment, customer name, or package name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              {searchTerm || filterRating !== 'all' 
                ? 'Try adjusting your filters'
                : 'Reviews from customers will appear here'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const reviewId = review.review_id || review.id;
            const hasResponse = review.vendor_response && review.vendor_response.trim();

            return (
              <div key={reviewId} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#3CAF54] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {review.customer_name?.[0]?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {review.customer_name || 'Anonymous'}
                        </h3>
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">({review.rating})</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {review.package_name || review.tour_package_name || 'Tour Package'} • {new Date(review.created_at).toLocaleDateString()}
                      </p>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}
                    </div>
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>
                )}

                {/* Detailed Ratings */}
                {(review.guide_rating || review.value_rating || review.experience_rating) && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    {review.guide_rating && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Guide</p>
                        {renderStars(review.guide_rating)}
                      </div>
                    )}
                    {review.value_rating && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Value</p>
                        {renderStars(review.value_rating)}
                      </div>
                    )}
                    {review.experience_rating && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Experience</p>
                        {renderStars(review.experience_rating)}
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.image_url}
                        alt={`Review image ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                        onClick={() => window.open(img.image_url, '_blank')}
                      />
                    ))}
                  </div>
                )}
                
                {/* Vendor Response */}
                {hasResponse ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">Your Response:</span>
                      <span className="text-xs text-gray-500">
                        {review.vendor_responded_at 
                          ? new Date(review.vendor_responded_at).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.vendor_response}</p>
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setResponseText(review.vendor_response);
                        setShowResponseModal(true);
                      }}
                      className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium mt-2"
                    >
                      Edit Response
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setResponseText('');
                      setShowResponseModal(true);
                    }}
                    className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium"
                  >
                    Respond to Review
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedReview.vendor_response ? 'Edit Response' : 'Respond to Review'}
              </h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">
                  {selectedReview.customer_name || 'Anonymous'}
                </span>
                {renderStars(selectedReview.rating)}
              </div>
              {selectedReview.comment && (
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a professional and helpful response to this review..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRespond}
                disabled={responding || !responseText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {responding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Post Response</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsRatings;
