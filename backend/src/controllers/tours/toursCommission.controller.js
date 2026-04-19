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
                // Return default commission instead of 404
                // This allows the frontend to work even if no commission is set
                return sendSuccess(res, {
                    commission_percentage: 15.00,
                    fixed_commission: null,
                    commission_structure: 'percentage',
                    min_commission_per_booking: null,
                    max_commission_per_booking: null,
                    currency: 'RWF',
                    calculation_method: 'customer_pays',
                    is_active: 1,
                    description: 'Default commission rate'
                }, 'Active commission retrieved successfully (using default)');
            }
            return sendSuccess(res, commission, 'Active commission retrieved successfully');
        } catch (error) {
            console.error('Error getting active commission:', error);
            // If table doesn't exist or other DB error, return default
            if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
                return sendSuccess(res, {
                    commission_percentage: 15.00,
                    fixed_commission: null,
                    commission_structure: 'percentage',
                    currency: 'RWF',
                    calculation_method: 'customer_pays',
                    is_active: 1,
                    description: 'Default commission rate (table not configured)'
                }, 'Active commission retrieved successfully (using default)');
            }
            return sendError(res, error.message || 'Failed to get active commission', 500);
        }
    }
}

module.exports = ToursCommissionController;

