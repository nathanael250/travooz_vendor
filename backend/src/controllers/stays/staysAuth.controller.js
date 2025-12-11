const AuthService = require('../../services/stays/staysAuth.service');
const EmailService = require('../../utils/email.service');
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

// Validation schema for password reset request
const passwordResetRequestSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    })
});

// Validation schema for password reset
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
        const result = await AuthService.requestPasswordReset(email);

        // If user exists, send email
        if (result.resetToken && result.user) {
            try {
                console.log('📧 [Stays] Attempting to send password reset email to:', result.user.email);
                    const resetUrl = `${process.env.FRONTEND_URL || 'https://vendor.travooz.rw'}/stays/reset-password?token=${result.resetToken}`;
                
                // Try to send email directly (sendEmail handles connection internally)
                const emailResult = await EmailService.sendPasswordResetEmail({
                        email: result.user.email,
                        name: result.user.name || 'there',
                        resetToken: result.resetToken,
                        resetUrl: resetUrl
                    });
                
                if (emailResult && emailResult.success) {
                    console.log('✅ [Stays] Password reset email sent successfully to:', result.user.email);
                } else {
                    console.warn('⚠️ [Stays] Password reset email may not have been sent to:', result.user.email);
                }
            } catch (emailError) {
                console.error('❌ [Stays] Error sending password reset email:', emailError);
                console.error('❌ [Stays] Error details:', {
                    message: emailError.message,
                    code: emailError.code,
                    command: emailError.command,
                    stack: emailError.stack
                });
                // Don't fail the request if email fails (security best practice)
            }
        } else {
            console.log('ℹ️ [Stays] No user found or no reset token generated for email:', email);
        }

        // Always return success message (security best practice - don't reveal if email exists)
        return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
    } catch (err) {
        console.error('Password reset request error:', err);
        // Always return success message (security best practice)
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
        const result = await AuthService.resetPassword(token, password);

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

