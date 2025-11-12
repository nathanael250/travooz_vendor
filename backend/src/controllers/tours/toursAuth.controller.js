const toursAuthService = require('../../services/tours/toursAuth.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const { authenticate } = require('../../middlewares/auth.middleware');

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Email and password are required', 400);
        }

        const result = await toursAuthService.login(email, password);

        return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
        console.error('Error in login controller:', error);
        return sendError(res, error.message || 'Login failed', 401);
    }
};

// Get profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }

        const profile = await toursAuthService.getProfile(userId);

        return sendSuccess(res, profile, 'Profile retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getProfile controller:', error);
        return sendError(res, error.message || 'Failed to get profile', 500);
    }
};

module.exports = {
    login,
    getProfile
};

