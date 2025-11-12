const toursSetupSubmissionService = require('../../services/tours/toursSetupSubmission.service');
const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Submit for verification
const submitForVerification = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.body;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }

        // Submit for verification
        const submission = await toursSetupSubmissionService.submitForVerification(
            parseInt(tourBusinessId),
            userId,
            'pending_review'
        );

        // Update step 6 as complete
        await toursSetupProgressService.updateStepProgress(
            parseInt(tourBusinessId),
            userId,
            6,
            true
        );

        return sendSuccess(res, submission, 'Submission completed successfully. Your application is now under review.', 200);
    } catch (error) {
        console.error('Error in submitForVerification controller:', error);
        return sendError(res, error.message || 'Failed to submit for verification', 500);
    }
};

// Get submission status
const getSubmissionStatus = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.query || req.params;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }

        let result;
        if (tourBusinessId) {
            result = await toursSetupSubmissionService.getSubmissionStatus(
                parseInt(tourBusinessId),
                userId
            );
        } else {
            // Get by user ID if no tourBusinessId provided
            result = await toursSetupSubmissionService.getSubmissionByUserId(userId);
        }

        if (!result) {
            return sendSuccess(res, { status: null, message: 'No submission found' }, 'No submission found', 200);
        }

        return sendSuccess(res, result, 'Submission status retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getSubmissionStatus controller:', error);
        return sendError(res, error.message || 'Failed to get submission status', 500);
    }
};

module.exports = {
    submitForVerification,
    getSubmissionStatus
};

