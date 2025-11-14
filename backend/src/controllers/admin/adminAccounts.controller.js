const adminAccountsService = require('../../services/admin/adminAccounts.service');
const { sendSuccess, sendError, sendUnauthorized } = require('../../utils/response.utils');

class AdminAccountsController {
    /**
     * Get all pending accounts
     * GET /api/v1/admin/accounts
     */
    async getAllPendingAccounts(req, res) {
        try {
            const filters = {
                status: req.query.status || 'pending_review',
                search: req.query.search || '',
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                service_type: req.query.service_type || 'all'
            };

            const result = await adminAccountsService.getAllPendingAccounts(filters);

            return sendSuccess(res, result, 'Pending accounts retrieved successfully', 200);
        } catch (error) {
            console.error('Get pending accounts error:', error);
            return sendError(res, error.message || 'Failed to get pending accounts', 500);
        }
    }

    /**
     * Get account statistics
     * GET /api/v1/admin/accounts/stats
     */
    async getAccountStats(req, res) {
        try {
            const stats = await adminAccountsService.getAccountStats();

            return sendSuccess(res, stats, 'Account statistics retrieved successfully', 200);
        } catch (error) {
            console.error('Get account stats error:', error);
            return sendError(res, error.message || 'Failed to get account statistics', 500);
        }
    }

    /**
     * Approve an account
     * POST /api/v1/admin/accounts/:serviceType/:accountId/approve
     */
    async approveAccount(req, res) {
        try {
            const { serviceType, accountId } = req.params;
            const { notes } = req.body;
            const adminId = req.user.id || req.user.userId;

            if (!adminId) {
                return sendUnauthorized(res, 'Admin ID not found in token');
            }

            const result = await adminAccountsService.approveAccount(
                serviceType,
                parseInt(accountId),
                adminId,
                notes
            );

            return sendSuccess(res, result, 'Account approved successfully', 200);
        } catch (error) {
            console.error('Approve account error:', error);
            return sendError(res, error.message || 'Failed to approve account', 500);
        }
    }

    /**
     * Reject an account
     * POST /api/v1/admin/accounts/:serviceType/:accountId/reject
     */
    async rejectAccount(req, res) {
        try {
            const { serviceType, accountId } = req.params;
            const { rejectionReason, notes } = req.body;
            const adminId = req.user.id || req.user.userId;

            if (!adminId) {
                return sendUnauthorized(res, 'Admin ID not found in token');
            }

            const result = await adminAccountsService.rejectAccount(
                serviceType,
                parseInt(accountId),
                adminId,
                rejectionReason,
                notes
            );

            return sendSuccess(res, result, 'Account rejected successfully', 200);
        } catch (error) {
            console.error('Reject account error:', error);
            return sendError(res, error.message || 'Failed to reject account', 500);
        }
    }
}

module.exports = new AdminAccountsController();

