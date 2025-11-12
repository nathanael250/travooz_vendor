const toursReviewService = require('../../services/tours/toursReview.service');
const { executeQuery } = require('../../../config/database');

const getReviews = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get tour business ID for this user
        const businesses = await executeQuery(
            'SELECT tour_business_id FROM tours_businesses WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: 'Tour business not found' });
        }

        const tourBusinessId = businesses[0].tour_business_id;

        // Get filters from query params
        const filters = {
            status: req.query.status || 'all',
            rating: req.query.rating || null,
            packageId: req.query.package_id || null,
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const reviews = await toursReviewService.getReviewsByBusinessId(tourBusinessId, filters);

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await toursReviewService.getReviewById(id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error getting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateVendorResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!response || !response.trim()) {
            return res.status(400).json({ success: false, message: 'Response is required' });
        }

        const review = await toursReviewService.updateVendorResponse(id, response.trim());

        res.json({
            success: true,
            message: 'Response updated successfully',
            data: review
        });
    } catch (error) {
        console.error('Error updating vendor response:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update response',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getReviewStats = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get tour business ID for this user
        const businesses = await executeQuery(
            'SELECT tour_business_id FROM tours_businesses WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: 'Tour business not found' });
        }

        const tourBusinessId = businesses[0].tour_business_id;

        const stats = await toursReviewService.getReviewStats(tourBusinessId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting review stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getReviews,
    getReviewById,
    updateVendorResponse,
    getReviewStats
};

