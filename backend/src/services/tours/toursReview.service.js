const ToursReview = require('../../models/tours/toursReview.model');
const { executeQuery } = require('../../../config/database');

class ToursReviewService {
    async getReviewsByBusinessId(tourBusinessId, filters = {}) {
        try {
            const reviews = await ToursReview.findByBusinessId(tourBusinessId, filters);
            
            // Enrich reviews with package and image data
            const enrichedReviews = await Promise.all(
                reviews.map(async (review) => {
                    const reviewData = { ...review };
                    
                    // Get package info
                    const packageInfo = await executeQuery(
                        'SELECT package_id, name, category FROM tours_packages WHERE package_id = ?',
                        [review.package_id]
                    );
                    if (packageInfo.length > 0) {
                        reviewData.package_name = packageInfo[0].name;
                        reviewData.tour_package_name = packageInfo[0].name;
                        reviewData.package_category = packageInfo[0].category;
                    }
                    
                    // Get review images
                    const images = await executeQuery(
                        'SELECT * FROM tours_review_images WHERE review_id = ? ORDER BY display_order',
                        [review.review_id]
                    );
                    reviewData.images = images;
                    
                    return reviewData;
                })
            );
            
            return enrichedReviews;
        } catch (error) {
            console.error('Error getting reviews by business ID:', error);
            throw error;
        }
    }

    async getReviewById(reviewId) {
        try {
            const review = await ToursReview.findById(reviewId);
            if (!review) {
                return null;
            }

            const reviewData = { ...review };
            
            // Get package info
            const packageInfo = await executeQuery(
                'SELECT * FROM tours_packages WHERE package_id = ?',
                [review.package_id]
            );
            if (packageInfo.length > 0) {
                reviewData.package = packageInfo[0];
                reviewData.package_name = packageInfo[0].name;
                reviewData.tour_package_name = packageInfo[0].name;
            }
            
            // Get review images
            const images = await executeQuery(
                'SELECT * FROM tours_review_images WHERE review_id = ? ORDER BY display_order',
                [reviewId]
            );
            reviewData.images = images;
            
            return reviewData;
        } catch (error) {
            console.error('Error getting review by ID:', error);
            throw error;
        }
    }

    async updateVendorResponse(reviewId, response) {
        try {
            const review = await ToursReview.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            review.vendor_response = response;
            review.vendor_responded_at = new Date();
            
            await review.update();
            return review;
        } catch (error) {
            console.error('Error updating vendor response:', error);
            throw error;
        }
    }

    async getReviewStats(tourBusinessId) {
        try {
            const reviews = await ToursReview.findByBusinessId(tourBusinessId, { status: 'approved' });
            
            if (reviews.length === 0) {
                return {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                    responseRate: 0
                };
            }

            const totalReviews = reviews.length;
            const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
            
            const ratingDistribution = {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length
            };

            const reviewsWithResponse = reviews.filter(r => r.vendor_response).length;
            const responseRate = (reviewsWithResponse / totalReviews) * 100;

            return {
                totalReviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingDistribution,
                responseRate: parseFloat(responseRate.toFixed(0))
            };
        } catch (error) {
            console.error('Error getting review stats:', error);
            throw error;
        }
    }
}

module.exports = new ToursReviewService();

