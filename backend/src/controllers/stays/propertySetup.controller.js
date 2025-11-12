const propertySetupService = require('../../services/stays/propertySetup.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Step 2: Save Contract Acceptance
const saveContract = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.saveContract(userId, propertyId);
        return sendSuccess(res, { success: true }, 'Contract accepted successfully');
    } catch (error) {
        console.error('Error saving contract:', error);
        return sendError(res, error.message || 'Failed to save contract', 500);
    }
};

// Step 3: Save Policies and Settings
const savePolicies = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...policiesData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.savePolicies(userId, propertyId, policiesData);
        return sendSuccess(res, { success: true }, 'Policies saved successfully');
    } catch (error) {
        console.error('Error saving policies:', error);
        return sendError(res, error.message || 'Failed to save policies', 500);
    }
};

// Step 4: Save Property Amenities
const saveAmenities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...amenitiesData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.saveAmenities(userId, propertyId, amenitiesData);
        return sendSuccess(res, { success: true }, 'Amenities saved successfully');
    } catch (error) {
        console.error('Error saving amenities:', error);
        return sendError(res, error.message || 'Failed to save amenities', 500);
    }
};

// Step 5-6: Save Room
const saveRoom = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...roomData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        const result = await propertySetupService.saveRoom(userId, propertyId, roomData);
        return sendSuccess(res, result, 'Room saved successfully');
    } catch (error) {
        console.error('Error saving room:', error);
        return sendError(res, error.message || 'Failed to save room', 500);
    }
};

// Step 7: Save Promotions
const savePromotions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, promotions } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.savePromotions(userId, propertyId, promotions);
        return sendSuccess(res, { success: true }, 'Promotions saved successfully');
    } catch (error) {
        console.error('Error saving promotions:', error);
        return sendError(res, error.message || 'Failed to save promotions', 500);
    }
};

// Step 8: Save Images
const saveImages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...imagesData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.saveImages(userId, propertyId, imagesData);
        return sendSuccess(res, { success: true }, 'Images saved successfully');
    } catch (error) {
        console.error('Error saving images:', error);
        return sendError(res, error.message || 'Failed to save images', 500);
    }
};

// Step 9: Save Tax Details
const saveTaxDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...taxData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.saveTaxDetails(userId, propertyId, taxData);
        return sendSuccess(res, { success: true }, 'Tax details saved successfully');
    } catch (error) {
        console.error('Error saving tax details:', error);
        return sendError(res, error.message || 'Failed to save tax details', 500);
    }
};

// Step 10: Save Connectivity Settings
const saveConnectivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId, ...connectivityData } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        await propertySetupService.saveConnectivity(userId, propertyId, connectivityData);
        return sendSuccess(res, { success: true }, 'Connectivity settings saved successfully');
    } catch (error) {
        console.error('Error saving connectivity:', error);
        return sendError(res, error.message || 'Failed to save connectivity settings', 500);
    }
};

// Get Setup Status
const getSetupStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.params;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        const status = await propertySetupService.getSetupStatus(userId, propertyId);
        return sendSuccess(res, status, 'Setup status retrieved successfully');
    } catch (error) {
        console.error('Error getting setup status:', error);
        return sendError(res, error.message || 'Failed to get setup status', 500);
    }
};

// Submit Final Listing
const submitListing = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.body;

        if (!propertyId) {
            return sendError(res, 'Property ID is required', 400);
        }

        const result = await propertySetupService.submitListing(userId, propertyId);
        
        if (!result.success) {
            // Include incompleteSteps in the error response
            return res.status(400).json({
                success: false,
                message: result.message || 'Failed to submit listing',
                incompleteSteps: result.incompleteSteps || []
            });
        }

        return sendSuccess(res, result, 'Listing submitted successfully');
    } catch (error) {
        console.error('Error submitting listing:', error);
        return sendError(res, error.message || 'Failed to submit listing', 500);
    }
};

module.exports = {
    saveContract,
    savePolicies,
    saveAmenities,
    saveRoom,
    savePromotions,
    saveImages,
    saveTaxDetails,
    saveConnectivity,
    getSetupStatus,
    submitListing
};

