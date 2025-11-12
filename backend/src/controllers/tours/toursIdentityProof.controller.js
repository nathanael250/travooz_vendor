const toursIdentityProofService = require('../../services/tours/toursIdentityProof.service');
const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const { authenticate } = require('../../middlewares/auth.middleware');

// Save identity proof
const saveIdentityProof = async (req, res) => {
    try {
        // Try multiple ways to extract userId from JWT payload
        const userId = req.user?.userId || req.user?.id || req.user?.user_id;
        
        if (!userId) {
            console.error('❌ User ID extraction failed. req.user:', JSON.stringify(req.user, null, 2));
            return sendError(res, 'User authentication required. Please log in again.', 401);
        }

        const { tourBusinessId, idCountry } = req.body;
        const file = req.file;

        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }
        if (!idCountry) {
            return sendError(res, 'ID country is required', 400);
        }
        if (!file) {
            return sendError(res, 'ID card photo file is required', 400);
        }

        // Construct file URL
        const idCardPhotoUrl = `/uploads/tours/${file.filename}`;

        const result = await toursIdentityProofService.saveIdentityProof({
            tourBusinessId: parseInt(tourBusinessId),
            userId,
            idCountry,
            idCardPhotoUrl,
            idCardPhotoName: file.originalname,
            idCardPhotoSize: file.size,
            idCardPhotoType: file.mimetype
        });

        // Update step 3 progress (Prove Your Identity)
        await toursSetupProgressService.updateStepProgress(
            parseInt(tourBusinessId),
            userId,
            3,
            true
        );

        return sendSuccess(res, result, 'Identity proof saved successfully', 200);
    } catch (error) {
        console.error('Error in saveIdentityProof controller:', error);
        return sendError(res, error.message || 'Failed to save identity proof', 500);
    }
};

// Get identity proof
const getIdentityProof = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.query || req.params;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }

        const result = await toursIdentityProofService.getIdentityProof(tourBusinessId, userId);

        if (!result) {
            return sendError(res, 'Identity proof not found', 404);
        }

        return sendSuccess(res, result, 'Identity proof retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getIdentityProof controller:', error);
        return sendError(res, error.message || 'Failed to get identity proof', 500);
    }
};

module.exports = {
    saveIdentityProof,
    getIdentityProof
};

