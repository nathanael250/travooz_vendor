const toursBusinessService = require('../../services/tours/toursBusiness.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const jwt = require('jsonwebtoken');

// Create tour business listing (all 3 steps combined)
const createTourBusiness = async (req, res) => {
    try {
        console.log('📥 Received request to create tour business:', {
            hasEmail: !!req.body.email,
            hasPassword: !!req.body.password,
            hasFirstName: !!req.body.firstName,
            hasTourBusinessName: !!req.body.tourBusinessName,
            userId: req.body.user_id
        });
        
        const tourBusiness = await toursBusinessService.createTourBusiness(req.body);
        
        // Generate JWT token for the newly created user
        let token = null;
        if (tourBusiness.user_id) {
            token = jwt.sign(
                { 
                    userId: tourBusiness.user_id,
                    id: tourBusiness.user_id,
                    email: req.body.email,
                    role: 'vendor'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );
        }
        
        return sendSuccess(res, {
            tourBusinessId: tourBusiness.tour_business_id,
            userId: tourBusiness.user_id,
            status: tourBusiness.status,
            token: token, // Include JWT token (user will be fully authenticated after email verification)
            userCreated: !!(req.body.email && req.body.password),
            message: 'Tour business listing created successfully. Please verify your email to continue.'
        }, 'Tour business listing created successfully', 201);
    } catch (err) {
        console.error('Error creating tour business:', err);
        
        // Handle duplicate email error
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
            return sendError(res, 'Email already exists. Please use a different email or sign in.', 400);
        }
        
        return sendError(res, err.message || 'Failed to create tour business listing', 500);
    }
};

// Get tour business by ID
const getTourBusinessById = async (req, res) => {
    try {
        const tourBusinessId = parseInt(req.params.id);
        if (!tourBusinessId) {
            return sendError(res, 'Invalid tour business ID', 400);
        }

        const tourBusiness = await toursBusinessService.getTourBusinessById(tourBusinessId);
        
        if (!tourBusiness) {
            return sendError(res, 'Tour business not found', 404);
        }

        return sendSuccess(res, tourBusiness);
    } catch (err) {
        console.error('Error getting tour business:', err);
        return sendError(res, err.message || 'Failed to get tour business', 500);
    }
};

// Get user's tour businesses (requires authentication)
const getMyTourBusinesses = async (req, res) => {
    try {
        // Get user_id from authenticated token
        const userId = req.user?.userId || req.user?.user_id || req.query.user_id;
        
        if (!userId) {
            return sendError(res, 'User ID required. Please ensure you are authenticated.', 400);
        }

        const tourBusinesses = await toursBusinessService.getTourBusinessesByUserId(userId);
        return sendSuccess(res, tourBusinesses);
    } catch (err) {
        console.error('Error getting user tour businesses:', err);
        return sendError(res, err.message || 'Failed to get tour businesses', 500);
    }
};

// Get tour businesses by userId (no auth required - for setup flow)
const getTourBusinessesByUserId = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (!userId || isNaN(userId)) {
            return sendError(res, 'Valid user ID is required', 400);
        }

        const tourBusinesses = await toursBusinessService.getTourBusinessesByUserId(userId);
        return sendSuccess(res, tourBusinesses);
    } catch (err) {
        console.error('Error getting tour businesses by user ID:', err);
        return sendError(res, err.message || 'Failed to get tour businesses', 500);
    }
};

// Update tour business
const updateTourBusiness = async (req, res) => {
    try {
        const tourBusinessId = parseInt(req.params.id);
        if (!tourBusinessId) {
            return sendError(res, 'Invalid tour business ID', 400);
        }

        const tourBusiness = await toursBusinessService.updateTourBusiness(tourBusinessId, req.body);
        return sendSuccess(res, tourBusiness, 'Tour business updated successfully');
    } catch (err) {
        console.error('Error updating tour business:', err);
        if (err.message === 'Tour business not found') {
            return sendError(res, err.message, 404);
        }
        return sendError(res, err.message || 'Failed to update tour business', 500);
    }
};

// Delete tour business
const deleteTourBusiness = async (req, res) => {
    try {
        const tourBusinessId = parseInt(req.params.id);
        if (!tourBusinessId) {
            return sendError(res, 'Invalid tour business ID', 400);
        }

        await toursBusinessService.deleteTourBusiness(tourBusinessId);
        return sendSuccess(res, null, 'Tour business deleted successfully');
    } catch (err) {
        console.error('Error deleting tour business:', err);
        if (err.message === 'Tour business not found') {
            return sendError(res, err.message, 404);
        }
        return sendError(res, err.message || 'Failed to delete tour business', 500);
    }
};

module.exports = {
    createTourBusiness,
    getTourBusinessById,
    getMyTourBusinesses,
    getTourBusinessesByUserId,
    updateTourBusiness,
    deleteTourBusiness
};

