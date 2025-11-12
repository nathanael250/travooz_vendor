const toursAdminService = require('../../services/tours/toursAdmin.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

/**
 * Get all tour submissions for admin review
 * GET /api/v1/admin/tours/submissions
 */
const getAllSubmissions = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;
        
        const result = await toursAdminService.getAllSubmissions({
            status,
            search,
            page: page || 1,
            limit: limit || 10
        });

        return sendSuccess(res, result, 'Submissions retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getAllSubmissions controller:', error);
        return sendError(res, error.message || 'Failed to get submissions', 500);
    }
};

/**
 * Get submission details by ID
 * GET /api/v1/admin/tours/submissions/:id
 */
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await toursAdminService.getSubmissionById(parseInt(id));

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        return sendSuccess(res, submission, 'Submission retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getSubmissionById controller:', error);
        return sendError(res, error.message || 'Failed to get submission', 500);
    }
};

/**
 * Approve or reject submission
 * PATCH /api/v1/admin/tours/submissions/:id/status
 */
const updateSubmissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, rejectionReason } = req.body;
        const adminId = req.user?.userId || req.user?.id;

        if (!status) {
            return sendError(res, 'Status is required', 400);
        }

        if (!adminId) {
            return sendError(res, 'Admin ID is required', 401);
        }

        const result = await toursAdminService.updateSubmissionStatus(
            parseInt(id),
            status,
            adminId,
            notes,
            rejectionReason
        );

        const message = status === 'approved' 
            ? 'Submission approved successfully' 
            : status === 'rejected'
            ? 'Submission rejected successfully'
            : 'Submission status updated successfully';

        return sendSuccess(res, result, message, 200);
    } catch (error) {
        console.error('Error in updateSubmissionStatus controller:', error);
        return sendError(res, error.message || 'Failed to update submission status', 500);
    }
};

/**
 * Get submission statistics
 * GET /api/v1/admin/tours/submissions/stats
 */
const getSubmissionStats = async (req, res) => {
    try {
        const stats = await toursAdminService.getSubmissionStats();
        return sendSuccess(res, stats, 'Statistics retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getSubmissionStats controller:', error);
        return sendError(res, error.message || 'Failed to get statistics', 500);
    }
};

module.exports = {
    getAllSubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    getSubmissionStats
};

