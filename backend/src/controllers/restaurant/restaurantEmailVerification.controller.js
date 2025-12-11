const RestaurantEmailVerificationService = require('../../services/restaurant/restaurantEmailVerification.service');
const restaurantSetupProgressService = require('../../services/restaurant/restaurantSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Send verification code
const sendVerificationCode = async (req, res) => {
    try {
        const { userId, email, userName } = req.body;

        if (!userId || !email) {
            return sendError(res, 'User ID and email are required', 400);
        }

        // Check rate limit
        const isRateLimited = await RestaurantEmailVerificationService.checkRateLimit(email);
        if (isRateLimited) {
            return sendError(
                res,
                'Too many verification requests. Please try again later.',
                429
            );
        }

        // Generate and send code
        const result = await RestaurantEmailVerificationService.generateAndSendCode(
            userId,
            email,
            userName
        );

        return sendSuccess(res, result, 'Verification code sent successfully');
    } catch (error) {
        console.error('Send verification code error:', error);
        return sendError(res, error.message || 'Failed to send verification code', 500);
    }
};

// Verify code
const verifyCode = async (req, res) => {
    try {
        const { userId, email, code, restaurantId } = req.body;

        if (!userId || !email || !code) {
            return sendError(res, 'User ID, email, and code are required', 400);
        }

        // Verify code
        const isValid = await RestaurantEmailVerificationService.verifyCode(userId, email, code);

        if (!isValid) {
            return sendError(res, 'Invalid or expired verification code', 400);
        }

        // Update step 1-3 progress (Email Verification) if restaurantId is provided
        if (restaurantId) {
            try {
                // Email verification is part of step 1-3, which should already be marked complete
                // But we can ensure it's marked as complete here
                await restaurantSetupProgressService.updateStepProgress(
                    restaurantId,
                    userId,
                    3, // Step 1-3 includes email verification
                    true
                );
            } catch (progressError) {
                console.warn('Failed to update step 1-3 progress:', progressError);
                // Don't fail the verification if progress update fails
            }
        }

        return sendSuccess(res, { verified: true }, 'Email verified successfully');
    } catch (error) {
        console.error('Verify code error:', error);
        return sendError(res, error.message || 'Failed to verify code', 500);
    }
};

module.exports = {
    sendVerificationCode,
    verifyCode
};

