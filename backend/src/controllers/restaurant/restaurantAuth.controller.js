const restaurantAuthService = require('../../services/restaurant/restaurantAuth.service');
const EmailService = require('../../utils/email.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response.utils');
const Joi = require('joi');

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Email and password are required', 400);
        }

        const result = await restaurantAuthService.login(email, password);

        return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
        console.error('Error in restaurant login controller:', error);
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

        const profile = await restaurantAuthService.getProfile(userId);

        return sendSuccess(res, profile, 'Profile retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getProfile controller:', error);
        return sendError(res, error.message || 'Failed to get profile', 500);
    }
};

// Validation schemas
const passwordResetRequestSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    })
});

const passwordResetSchema = Joi.object({
    token: Joi.string().required().messages({
        'string.empty': 'Reset token is required',
        'any.required': 'Reset token is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
    try {
        // Validate input
        const { error, value } = passwordResetRequestSchema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return sendValidationError(res, errors);
        }

        const { email } = value;

        // Request password reset
        const result = await restaurantAuthService.requestPasswordReset(email);

        // If user exists, send email
        if (result.resetToken && result.user) {
            try {
                const isConnected = await EmailService.verifyConnection();
                if (isConnected) {
                    const resetUrl = `${process.env.FRONTEND_URL || 'https://vendor.travooz.rw'}/restaurant/reset-password?token=${result.resetToken}`;
                    await EmailService.sendPasswordResetEmail({
                        email: result.user.email,
                        name: result.user.name || 'there',
                        resetToken: result.resetToken,
                        resetUrl: resetUrl
                    });
                } else {
                    console.warn('SMTP not connected, password reset email not sent');
                }
            } catch (emailError) {
                console.error('Error sending password reset email:', emailError);
                // Don't fail the request if email fails
            }
        }

        // Always return success message (security best practice)
        return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
    } catch (err) {
        console.error('Password reset request error:', err);
        return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
    }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
    try {
        // Validate input
        const { error, value } = passwordResetSchema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return sendValidationError(res, errors);
        }

        const { token, password } = value;

        // Reset password
        const result = await restaurantAuthService.resetPassword(token, password);

        return sendSuccess(res, null, 'Password reset successfully. You can now login with your new password.');
    } catch (err) {
        console.error('Password reset error:', err);
        
        if (err.message === 'Invalid or expired reset token') {
            return sendError(res, err.message, 400);
        }
        
        return sendError(res, err.message || 'Failed to reset password', 500);
    }
};

module.exports = {
    login,
    getProfile,
    requestPasswordReset,
    resetPassword
};



