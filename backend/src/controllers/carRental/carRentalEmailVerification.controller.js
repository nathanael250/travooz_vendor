const CarRentalEmailVerificationService = require('../../services/carRental/carRentalEmailVerification.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Send verification code
const sendVerificationCode = async (req, res) => {
    try {
        const { userId, email, userName } = req.body;

        if (!userId || !email) {
            return sendError(res, 'User ID and email are required', 400);
        }

        // Check rate limit (simple implementation matching restaurant)
        const isRateLimited = await CarRentalEmailVerificationService.checkRateLimit(email);
        if (isRateLimited) {
            return sendError(
                res,
                'Too many verification requests. Please try again later.',
                429
            );
        }

        // Generate and send code
        const result = await CarRentalEmailVerificationService.generateAndSendCode(
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
        const { userId, email, code, carRentalBusinessId } = req.body;

        if (!userId || !email || !code) {
            return sendError(res, 'User ID, email, and code are required', 400);
        }

        // Verify code
        const isValid = await CarRentalEmailVerificationService.verifyCode(userId, email, code);

        if (!isValid) {
            return sendError(res, 'Invalid or expired verification code', 400);
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

