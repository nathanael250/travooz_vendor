const { executeQuery } = require('../../../config/database');
const ToursApprovalNotificationService = require('./toursApprovalNotification.service');

class ToursAdminService {
    /**
     * Get all tour submissions for admin review
     * @param {object} filters - { status, search, page, limit }
     */
    async getAllSubmissions(filters = {}) {
        try {
            const { status, search, page = 1, limit = 10 } = filters;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = `
                SELECT 
                    s.*,
                    tb.tour_business_name,
                    tb.tour_type,
                    tb.tour_type_name,
                    tb.location,
                    tb.currency,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone,
                    boi.first_name,
                    boi.last_name,
                    boi.country_of_residence,
                    boi.email as owner_email_alt,
                    ip.id_country as id_registration_country,
                    ip.id_card_photo_url,
                    bp.business_legal_name,
                    bp.professional_certificate_url
                FROM tours_setup_submissions s
                JOIN tours_businesses tb ON s.tour_business_id = tb.tour_business_id
                JOIN tours_users u ON s.user_id = u.user_id
                LEFT JOIN tours_business_owner_info boi ON s.tour_business_id = boi.tour_business_id AND s.user_id = boi.user_id
                LEFT JOIN tours_identity_proof ip ON s.tour_business_id = ip.tour_business_id AND s.user_id = ip.user_id
                LEFT JOIN tours_business_proof bp ON s.tour_business_id = bp.tour_business_id AND s.user_id = bp.user_id
                WHERE 1=1
            `;
            const params = [];

            if (status && status !== 'all') {
                query += ' AND s.status = ?';
                params.push(status);
            }

            if (search) {
                query += ' AND (tb.tour_business_name LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR boi.first_name LIKE ? OR boi.last_name LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);

            const submissions = await executeQuery(query, params);

            // Get total count
            let countQuery = `
                SELECT COUNT(*) as total
                FROM tours_setup_submissions s
                JOIN tours_businesses tb ON s.tour_business_id = tb.tour_business_id
                JOIN tours_users u ON s.user_id = u.user_id
                WHERE 1=1
            `;
            const countParams = [];

            if (status && status !== 'all') {
                countQuery += ' AND s.status = ?';
                countParams.push(status);
            }

            if (search) {
                countQuery += ' AND (tb.tour_business_name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }

            const [countResult] = await executeQuery(countQuery, countParams);
            const total = countResult.total || 0;

            return {
                submissions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error getting all submissions:', error);
            throw error;
        }
    }

    /**
     * Get submission details by ID
     * @param {number} submissionId 
     */
    async getSubmissionById(submissionId) {
        try {
            const result = await executeQuery(
                `SELECT 
                    s.*,
                    tb.*,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone,
                    boi.*,
                    ip.*,
                    bp.*,
                    sp.step_1_complete,
                    sp.step_2_complete,
                    sp.step_3_complete,
                    sp.step_4_complete,
                    sp.step_5_complete,
                    sp.step_6_complete,
                    sp.current_step
                FROM tours_setup_submissions s
                JOIN tours_businesses tb ON s.tour_business_id = tb.tour_business_id
                JOIN tours_users u ON s.user_id = u.user_id
                LEFT JOIN tours_business_owner_info boi ON s.tour_business_id = boi.tour_business_id AND s.user_id = boi.user_id
                LEFT JOIN tours_identity_proof ip ON s.tour_business_id = ip.tour_business_id AND s.user_id = ip.user_id
                LEFT JOIN tours_business_proof bp ON s.tour_business_id = bp.tour_business_id AND s.user_id = bp.user_id
                LEFT JOIN tours_setup_progress sp ON s.tour_business_id = sp.tour_business_id AND s.user_id = sp.user_id
                WHERE s.submission_id = ?`,
                [submissionId]
            );

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting submission by ID:', error);
            throw error;
        }
    }

    /**
     * Approve or reject submission
     * @param {number} submissionId 
     * @param {string} status - 'approved' or 'rejected'
     * @param {number} adminId 
     * @param {string} notes 
     * @param {string} rejectionReason 
     */
    async updateSubmissionStatus(submissionId, status, adminId, notes = null, rejectionReason = null) {
        try {
            const validStatuses = ['pending_review', 'approved', 'rejected', 'in_progress'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }

            // Check if submission exists
            const existing = await executeQuery(
                'SELECT * FROM tours_setup_submissions WHERE submission_id = ?',
                [submissionId]
            );

            if (existing.length === 0) {
                throw new Error('Submission not found');
            }

            const updateFields = ['status = ?', 'updated_at = NOW()'];
            const updateParams = [status];

            if (status === 'approved') {
                updateFields.push('approved_at = NOW()', 'approved_by = ?');
                updateParams.push(adminId);
                if (notes) {
                    updateFields.push('notes = ?');
                    updateParams.push(notes);
                }
            } else if (status === 'rejected') {
                updateFields.push('rejected_at = NOW()', 'rejected_by = ?');
                updateParams.push(adminId);
                if (rejectionReason) {
                    updateFields.push('rejection_reason = ?');
                    updateParams.push(rejectionReason);
                }
                if (notes) {
                    updateFields.push('notes = ?');
                    updateParams.push(notes);
                }
            }

            await executeQuery(
                `UPDATE tours_setup_submissions SET ${updateFields.join(', ')} WHERE submission_id = ?`,
                [...updateParams, submissionId]
            );

            // If approved, also update the tour business status
            if (status === 'approved') {
                await executeQuery(
                    `UPDATE tours_businesses 
                     SET status = 'approved', is_live = 1, updated_at = NOW()
                     WHERE tour_business_id = ?`,
                    [existing[0].tour_business_id]
                );

                // Fetch vendor details for notification (supports tours_users and stays_users)
                const [ownerInfo] = await executeQuery(
                    `SELECT 
                        COALESCE(tu.email, su.email) AS email,
                        COALESCE(tu.name, su.name) AS name,
                        tb.tour_business_name
                    FROM tours_businesses tb
                    LEFT JOIN tours_users tu ON tb.user_id = tu.user_id
                    LEFT JOIN stays_users su ON tb.user_id = su.user_id
                    WHERE tb.tour_business_id = ?
                    LIMIT 1`,
                    [existing[0].tour_business_id]
                );

                // (Email notifications handled in adminAccounts service now)
            } else if (status === 'rejected') {
                await executeQuery(
                    `UPDATE tours_businesses 
                     SET status = 'rejected', is_live = 0, updated_at = NOW()
                     WHERE tour_business_id = ?`,
                    [existing[0].tour_business_id]
                );
            }

            return {
                submissionId,
                status,
                tourBusinessId: existing[0].tour_business_id
            };
        } catch (error) {
            console.error('Error updating submission status:', error);
            throw error;
        } finally {
            // Approval/rejection emails are triggered from the admin accounts service.
        }
    }

    /**
     * Get submission statistics
     */
    async getSubmissionStats() {
        try {
            const stats = await executeQuery(
                `SELECT 
                    status,
                    COUNT(*) as count
                FROM tours_setup_submissions
                GROUP BY status
                `
            );

            const total = await executeQuery(
                'SELECT COUNT(*) as total FROM tours_setup_submissions'
            );

            return {
                byStatus: stats.reduce((acc, stat) => {
                    acc[stat.status] = stat.count;
                    return acc;
                }, {}),
                total: total[0]?.total || 0
            };
        } catch (error) {
            console.error('Error getting submission stats:', error);
            throw error;
        }
    }
}

module.exports = new ToursAdminService();

