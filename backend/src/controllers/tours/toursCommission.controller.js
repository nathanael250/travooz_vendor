const toursCommissionService = require('../../services/tours/toursCommission.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

class ToursCommissionController {
    /**
     * Get active commission
     * GET /tours/commission/active
     */
    static async getActiveCommission(req, res) {
        try {
            const commission = await toursCommissionService.getActiveCommission();
            if (!commission) {
                return sendError(res, 'No active commission found', 404);
            }
            return sendSuccess(res, commission, 'Active commission retrieved successfully');
        } catch (error) {
            console.error('Error getting active commission:', error);
            return sendError(res, error.message || 'Failed to get active commission', 500);
        }
    }
}

module.exports = ToursCommissionController;

