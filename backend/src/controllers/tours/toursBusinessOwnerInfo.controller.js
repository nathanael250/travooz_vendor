const toursBusinessOwnerInfoService = require('../../services/tours/toursBusinessOwnerInfo.service');
const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const { authenticate } = require('../../middlewares/auth.middleware');

// Save business owner information
const saveBusinessOwnerInfo = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }

        const { tourBusinessId, firstName, lastName, countryOfResidence, email } = req.body;

        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }
        if (!firstName || !lastName || !countryOfResidence || !email) {
            return sendError(res, 'All fields are required: firstName, lastName, countryOfResidence, email', 400);
        }

        const result = await toursBusinessOwnerInfoService.saveBusinessOwnerInfo({
            tourBusinessId,
            userId,
            firstName,
            lastName,
            countryOfResidence,
            email
        });

        // Update step 2 progress (Business Owner Information)
        await toursSetupProgressService.updateStepProgress(
            parseInt(tourBusinessId),
            userId,
            2,
            true
        );

        return sendSuccess(res, result, 'Business owner information saved successfully', 200);
    } catch (error) {
        console.error('Error in saveBusinessOwnerInfo controller:', error);
        return sendError(res, error.message || 'Failed to save business owner information', 500);
    }
};

// Get business owner information
const getBusinessOwnerInfo = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.query || req.params;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }

        const result = await toursBusinessOwnerInfoService.getBusinessOwnerInfo(tourBusinessId, userId);

        if (!result) {
            return sendError(res, 'Business owner information not found', 404);
        }

        return sendSuccess(res, result, 'Business owner information retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getBusinessOwnerInfo controller:', error);
        return sendError(res, error.message || 'Failed to get business owner information', 500);
    }
};

module.exports = {
    saveBusinessOwnerInfo,
    getBusinessOwnerInfo
};

