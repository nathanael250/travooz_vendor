const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Update step progress
const updateStepProgress = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId, stepNumber } = req.body;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }
        if (!stepNumber || stepNumber < 1 || stepNumber > 6) {
            return sendError(res, 'Valid step number (1-6) is required', 400);
        }

        const result = await toursSetupProgressService.updateStepProgress(
            parseInt(tourBusinessId),
            userId,
            parseInt(stepNumber),
            true
        );

        return sendSuccess(res, result, 'Step progress updated successfully', 200);
    } catch (error) {
        console.error('Error in updateStepProgress controller:', error);
        return sendError(res, error.message || 'Failed to update step progress', 500);
    }
};

// Get progress
const getProgress = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.query || req.params;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }

        const result = await toursSetupProgressService.getProgress(
            parseInt(tourBusinessId),
            userId
        );

        if (!result) {
            return sendError(res, 'Progress not found', 404);
        }

        return sendSuccess(res, result, 'Progress retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getProgress controller:', error);
        return sendError(res, error.message || 'Failed to get progress', 500);
    }
};

module.exports = {
    updateStepProgress,
    getProgress
};

