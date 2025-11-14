const adminAuthService = require('../../services/admin/adminAuth.service');
const { sendSuccess, sendError, sendUnauthorized } = require('../../utils/response.utils');

class AdminAuthController {
    /**
     * Login admin user
     * POST /api/v1/admin/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, 'Email and password are required', 400);
            }

            const result = await adminAuthService.login(email, password);

            return sendSuccess(res, result, 'Login successful', 200);
        } catch (error) {
            console.error('Admin login error:', error);
            return sendUnauthorized(res, error.message || 'Login failed');
        }
    }

    /**
     * Get admin profile
     * GET /api/v1/admin/auth/profile
     */
    async getProfile(req, res) {
        try {
            const userId = req.user.id || req.user.userId;

            if (!userId) {
                return sendUnauthorized(res, 'User ID not found in token');
            }

            const profile = await adminAuthService.getProfile(userId);

            return sendSuccess(res, profile, 'Profile retrieved successfully', 200);
        } catch (error) {
            console.error('Get admin profile error:', error);
            return sendError(res, error.message || 'Failed to get profile', 500);
        }
    }
}

module.exports = new AdminAuthController();

