const adminPackagesService = require('../../services/admin/adminPackages.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

class AdminPackagesController {
    /**
     * Get all packages with filters
     * GET /api/v1/admin/packages
     */
    async getPackages(req, res) {
        try {
            const filters = {
                status: req.query.status || 'all',
                search: req.query.search || '',
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 100,
                service_type: req.query.service_type || 'all',
                businessId: req.query.businessId ? parseInt(req.query.businessId, 10) : null
            };

            const result = await adminPackagesService.getPackages(filters);
            return sendSuccess(res, result, 'Packages retrieved successfully', 200);
        } catch (error) {
            console.error('Get packages error:', error);
            return sendError(res, error.message || 'Failed to get packages', 500);
        }
    }

    /**
     * Get package statistics
     * GET /api/v1/admin/packages/stats
     */
    async getPackageStats(req, res) {
        try {
            const businessId = req.query.businessId ? parseInt(req.query.businessId, 10) : null;
            const stats = await adminPackagesService.getPackageStats(businessId);
            return sendSuccess(res, stats, 'Package statistics retrieved successfully', 200);
        } catch (error) {
            console.error('Get package stats error:', error);
            return sendError(res, error.message || 'Failed to get package statistics', 500);
        }
    }

    /**
     * Get package details by ID
     * GET /api/v1/admin/packages/:packageId
     */
    async getPackageDetails(req, res) {
        try {
            const { packageId } = req.params;
            const details = await adminPackagesService.getPackageDetails(parseInt(packageId));

            if (!details) {
                return sendError(res, 'Package not found', 404);
            }

            return sendSuccess(res, details, 'Package details retrieved successfully', 200);
        } catch (error) {
            console.error('Get package details error:', error);
            return sendError(res, error.message || 'Failed to get package details', 500);
        }
    }

    /**
     * Approve a package
     * POST /api/v1/admin/packages/:packageId/approve
     */
    async approvePackage(req, res) {
        try {
            const { packageId } = req.params;
            const { notes } = req.body;
            const adminId = req.user.id || req.user.userId;

            if (!adminId) {
                return sendError(res, 'Admin ID not found in token', 401);
            }

            const result = await adminPackagesService.approvePackage(
                parseInt(packageId),
                adminId,
                notes
            );

            return sendSuccess(res, result, 'Package approved successfully', 200);
        } catch (error) {
            console.error('Approve package error:', error);
            return sendError(res, error.message || 'Failed to approve package', 500);
        }
    }

    /**
     * Reject a package
     * POST /api/v1/admin/packages/:packageId/reject
     */
    async rejectPackage(req, res) {
        try {
            const { packageId } = req.params;
            const { rejectionReason, notes } = req.body;
            const adminId = req.user.id || req.user.userId;

            if (!adminId) {
                return sendError(res, 'Admin ID not found in token', 401);
            }

            const result = await adminPackagesService.rejectPackage(
                parseInt(packageId),
                adminId,
                rejectionReason,
                notes
            );

            return sendSuccess(res, result, 'Package rejected successfully', 200);
        } catch (error) {
            console.error('Reject package error:', error);
            return sendError(res, error.message || 'Failed to reject package', 500);
        }
    }
}

module.exports = new AdminPackagesController();

