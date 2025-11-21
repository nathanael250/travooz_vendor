const ToursEmailVerificationService = require('../../services/tours/toursEmailVerification.service');
const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Send verification code
const sendVerificationCode = async (req, res) => {
    try {
        const { userId, email, userName } = req.body;

        if (!userId || !email) {
            return sendError(res, 'User ID and email are required', 400);
        }

        // Check rate limit
        const isRateLimited = await ToursEmailVerificationService.checkRateLimit(email);
        if (isRateLimited) {
            return sendError(
                res,
                'Too many verification requests. Please try again later.',
                429
            );
        }

        // Generate and send code
        const result = await ToursEmailVerificationService.generateAndSendCode(
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
        const { userId, email, code, tourBusinessId } = req.body;

        if (!userId || !email || !code) {
            return sendError(res, 'User ID, email, and code are required', 400);
        }

        // Verify code
        const isValid = await ToursEmailVerificationService.verifyCode(userId, email, code);

        if (!isValid) {
            return sendError(res, 'Invalid or expired verification code', 400);
        }

        // Update step 1 progress (Email Verification) if tourBusinessId is provided
        if (tourBusinessId) {
            try {
                await toursSetupProgressService.updateStepProgress(
                    parseInt(tourBusinessId),
                    userId,
                    1,
                    true
                );
            } catch (progressError) {
                console.warn('Failed to update step 1 progress:', progressError);
                // Don't fail the verification if progress update fails
            }
        }

        // Send confirmation email with dashboard link (non-blocking)
        ToursEmailVerificationService.sendVerificationSuccessEmail({
            userId,
            email,
            tourBusinessId
        }).catch(err => {
            console.warn('Failed to send post-verification email:', err.message);
        });

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

