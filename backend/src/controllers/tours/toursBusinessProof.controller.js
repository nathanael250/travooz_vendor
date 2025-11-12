const toursBusinessProofService = require('../../services/tours/toursBusinessProof.service');
const toursSetupProgressService = require('../../services/tours/toursSetupProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const { authenticate } = require('../../middlewares/auth.middleware');

// Save business proof
const saveBusinessProof = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }

        const { tourBusinessId, businessLegalName } = req.body;
        const file = req.file;

        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }
        if (!businessLegalName) {
            return sendError(res, 'Business legal name is required', 400);
        }
        if (!file) {
            return sendError(res, 'Professional certificate file is required', 400);
        }

        // Construct file URL
        const professionalCertificateUrl = `/uploads/tours/${file.filename}`;

        const result = await toursBusinessProofService.saveBusinessProof({
            tourBusinessId: parseInt(tourBusinessId),
            userId,
            businessLegalName,
            professionalCertificateUrl,
            professionalCertificateName: file.originalname,
            professionalCertificateSize: file.size,
            professionalCertificateType: file.mimetype
        });

        // Update step 4 progress (Prove Your Business)
        await toursSetupProgressService.updateStepProgress(
            parseInt(tourBusinessId),
            userId,
            4,
            true
        );

        return sendSuccess(res, result, 'Business proof saved successfully', 200);
    } catch (error) {
        console.error('Error in saveBusinessProof controller:', error);
        return sendError(res, error.message || 'Failed to save business proof', 500);
    }
};

// Get business proof
const getBusinessProof = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { tourBusinessId } = req.query || req.params;

        if (!userId) {
            return sendError(res, 'User authentication required', 401);
        }
        if (!tourBusinessId) {
            return sendError(res, 'Tour business ID is required', 400);
        }

        const result = await toursBusinessProofService.getBusinessProof(tourBusinessId, userId);

        if (!result) {
            return sendError(res, 'Business proof not found', 404);
        }

        return sendSuccess(res, result, 'Business proof retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getBusinessProof controller:', error);
        return sendError(res, error.message || 'Failed to get business proof', 500);
    }
};

module.exports = {
    saveBusinessProof,
    getBusinessProof
};

