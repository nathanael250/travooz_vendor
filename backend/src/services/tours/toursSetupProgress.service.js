const { executeQuery } = require('../../../config/database');

class ToursSetupProgressService {
    /**
     * Update progress for a specific step
     * @param {number} tourBusinessId 
     * @param {number} userId 
     * @param {number} stepNumber (1-6)
     * @param {boolean} isComplete 
     */
    async updateStepProgress(tourBusinessId, userId, stepNumber, isComplete = true) {
        try {
            if (stepNumber < 1 || stepNumber > 6) {
                throw new Error('Step number must be between 1 and 6');
            }

            const stepColumn = `step_${stepNumber}_complete`;
            
            // Update the specific step and current_step
            await executeQuery(
                `UPDATE tours_setup_progress 
                 SET ${stepColumn} = ?, 
                     current_step = ?,
                     last_updated_step = ?,
                     updated_at = NOW()
                 WHERE tour_business_id = ? AND user_id = ?`,
                [isComplete ? 1 : 0, stepNumber, stepNumber, tourBusinessId, userId]
            );

            console.log(`✅ Updated step ${stepNumber} progress for tour business ${tourBusinessId}`);
            return { success: true, step: stepNumber, completed: isComplete };
        } catch (error) {
            console.error('Error updating step progress:', error);
            throw error;
        }
    }

    /**
     * Get current progress for a tour business
     * @param {number} tourBusinessId 
     * @param {number} userId 
     */
    async getProgress(tourBusinessId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM tours_setup_progress 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting progress:', error);
            throw error;
        }
    }

    /**
     * Initialize progress record (called when tour business is created)
     * @param {number} tourBusinessId 
     * @param {number} userId 
     */
    async initializeProgress(tourBusinessId, userId) {
        try {
            // Check if progress already exists
            const existing = await executeQuery(
                `SELECT progress_id FROM tours_setup_progress 
                 WHERE tour_business_id = ?`,
                [tourBusinessId]
            );

            if (existing.length > 0) {
                console.log(`Progress already exists for tour business ${tourBusinessId}`);
                return existing[0];
            }

            // Create new progress record
            const result = await executeQuery(
                `INSERT INTO tours_setup_progress (
                    tour_business_id, user_id, current_step
                ) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE current_step = ?`,
                [tourBusinessId, userId, 1, 1]
            );

            console.log(`✅ Initialized progress for tour business ${tourBusinessId}`);
            return { progressId: result.insertId, tourBusinessId, userId };
        } catch (error) {
            console.error('Error initializing progress:', error);
            throw error;
        }
    }
}

module.exports = new ToursSetupProgressService();

