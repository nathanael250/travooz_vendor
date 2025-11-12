const { executeQuery } = require('../../../config/database');

class ToursSetupSubmissionService {
    /**
     * Create or update submission record
     * @param {number} tourBusinessId 
     * @param {number} userId 
     * @param {string} status 
     */
    async submitForVerification(tourBusinessId, userId, status = 'pending_review') {
        try {
            // Check if submission already exists
            const existing = await executeQuery(
                `SELECT submission_id FROM tours_setup_submissions 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );

            if (existing.length > 0) {
                // Update existing submission
                await executeQuery(
                    `UPDATE tours_setup_submissions 
                     SET status = ?,
                         submitted_at = NOW(),
                         updated_at = NOW()
                     WHERE tour_business_id = ? AND user_id = ?`,
                    [status, tourBusinessId, userId]
                );
                return {
                    submissionId: existing[0].submission_id,
                    tourBusinessId,
                    userId,
                    status,
                    updated: true
                };
            } else {
                // Create new submission
                const result = await executeQuery(
                    `INSERT INTO tours_setup_submissions (
                        tour_business_id, user_id, status, submitted_at
                    ) VALUES (?, ?, ?, NOW())`,
                    [tourBusinessId, userId, status]
                );
                return {
                    submissionId: result.insertId,
                    tourBusinessId,
                    userId,
                    status,
                    updated: false
                };
            }
        } catch (error) {
            console.error('Error submitting for verification:', error);
            throw error;
        }
    }

    /**
     * Get submission status
     * @param {number} tourBusinessId 
     * @param {number} userId 
     */
    async getSubmissionStatus(tourBusinessId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM tours_setup_submissions 
                 WHERE tour_business_id = ? AND user_id = ?
                 ORDER BY submitted_at DESC
                 LIMIT 1`,
                [tourBusinessId, userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting submission status:', error);
            throw error;
        }
    }

    /**
     * Get submission by user ID (for checking if user has any pending submissions)
     * @param {number} userId 
     */
    async getSubmissionByUserId(userId) {
        try {
            const result = await executeQuery(
                `SELECT s.*, tb.tour_business_name 
                 FROM tours_setup_submissions s
                 JOIN tours_businesses tb ON s.tour_business_id = tb.tour_business_id
                 WHERE s.user_id = ?
                 ORDER BY s.submitted_at DESC
                 LIMIT 1`,
                [userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting submission by user ID:', error);
            throw error;
        }
    }
}

module.exports = new ToursSetupSubmissionService();

