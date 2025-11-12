const AuthService = require('../../services/stays/staysAuth.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response.utils');
const Joi = require('joi');

// Validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});

/**
 * Login controller
 */
const login = async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return sendValidationError(res, errors);
        }

        const { email, password } = value;

        // Attempt login
        const result = await AuthService.login(email, password);

        return sendSuccess(res, {
            user: result.user,
            token: result.token
        }, 'Login successful');
    } catch (err) {
        console.error('Login error:', err);
        
        if (err.message === 'Invalid email or password') {
            return sendError(res, err.message, 401);
        }
        
        return sendError(res, err.message || 'Login failed', 500);
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await AuthService.getUserById(userId);
        
        return sendSuccess(res, user);
    } catch (err) {
        console.error('Get profile error:', err);
        
        if (err.message === 'User not found') {
            return sendError(res, err.message, 404);
        }
        
        return sendError(res, err.message || 'Failed to get profile', 500);
    }
};

module.exports = {
    login,
    getProfile
};

