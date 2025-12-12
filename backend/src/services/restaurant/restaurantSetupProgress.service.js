const { executeQuery } = require('../../../config/database');

class RestaurantSetupProgressService {
    /**
     * Initialize progress record (called when restaurant is created after Step 3)
     * @param {string} restaurantId 
     * @param {string} userId 
     * @param {object} stepData - Data from steps 1-3
     */
    async initializeProgress(restaurantId, userId, stepData = {}) {
        try {
            // Check if progress already exists
            const existing = await executeQuery(
                `SELECT progress_id FROM restaurant_setup_progress 
                 WHERE restaurant_id = ?`,
                [restaurantId]
            );

            if (existing.length > 0) {
                console.log(`Progress already exists for restaurant ${restaurantId}`);
                return existing[0];
            }

            // Create new progress record with Step 1-3 marked as complete
            const result = await executeQuery(
                `INSERT INTO restaurant_setup_progress (
                    restaurant_id, user_id, step_1_3_complete, current_step, step_data
                ) VALUES (?, ?, ?, ?, ?)`,
                [restaurantId, userId, 1, 4, JSON.stringify(stepData)]
            );

            console.log(`✅ Initialized progress for restaurant ${restaurantId}`);
            return { progressId: result.insertId, restaurantId, userId };
        } catch (error) {
            console.error('Error initializing progress:', error);
            throw error;
        }
    }

    /**
     * Update progress for a specific step
     * @param {string} restaurantId 
     * @param {string} userId 
     * @param {number} stepNumber (4-11)
     * @param {boolean} isComplete 
     * @param {object} stepData - Optional data to save for this step
     */
    async updateStepProgress(restaurantId, userId, stepNumber, isComplete = true, stepData = null) {
        try {
            if (stepNumber < 4 || stepNumber > 11) {
                throw new Error('Step number must be between 4 and 11');
            }

            const stepColumn = `step_${stepNumber}_complete`;
            
            // Get existing step_data
            const existing = await this.getProgress(restaurantId, userId);
            let mergedStepData = {};
            if (existing && existing.step_data) {
                try {
                    mergedStepData = typeof existing.step_data === 'string' 
                        ? JSON.parse(existing.step_data) 
                        : existing.step_data;
                } catch (e) {
                    mergedStepData = {};
                }
            }

            // Merge new step data
            if (stepData) {
                mergedStepData[`step_${stepNumber}`] = stepData;
            }

            // Update the specific step and current_step
            await executeQuery(
                `UPDATE restaurant_setup_progress 
                 SET ${stepColumn} = ?, 
                     current_step = ?,
                     last_updated_step = ?,
                     step_data = ?,
                     updated_at = NOW()
                 WHERE restaurant_id = ? AND user_id = ?`,
                [
                    isComplete ? 1 : 0, 
                    stepNumber, 
                    stepNumber, 
                    JSON.stringify(mergedStepData),
                    restaurantId, 
                    userId
                ]
            );

            console.log(`✅ Updated step ${stepNumber} progress for restaurant ${restaurantId}`);
            return { success: true, step: stepNumber, completed: isComplete };
        } catch (error) {
            console.error('Error updating step progress:', error);
            throw error;
        }
    }

    /**
     * Get current progress for a restaurant
     * @param {string} restaurantId 
     * @param {string} userId 
     */
    async getProgress(restaurantId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM restaurant_setup_progress 
                 WHERE restaurant_id = ? AND user_id = ?`,
                [restaurantId, userId]
            );
            
            if (result.length > 0) {
                const progress = result[0];
                // Parse step_data if it's a string
                if (progress.step_data && typeof progress.step_data === 'string') {
                    try {
                        progress.step_data = JSON.parse(progress.step_data);
                    } catch (e) {
                        progress.step_data = {};
                    }
                }
                return progress;
            }
            return null;
        } catch (error) {
            console.error('Error getting progress:', error);
            throw error;
        }
    }

    /**
     * Get progress by user ID (for login check)
     * @param {string} userId 
     */
    async getProgressByUserId(userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM restaurant_setup_progress 
                 WHERE user_id = ? 
                 ORDER BY updated_at DESC 
                 LIMIT 1`,
                [userId]
            );
            
            if (result.length > 0) {
                const progress = result[0];
                // Parse step_data if it's a string
                if (progress.step_data && typeof progress.step_data === 'string') {
                    try {
                        progress.step_data = JSON.parse(progress.step_data);
                    } catch (e) {
                        progress.step_data = {};
                    }
                }
                return progress;
            }
            return null;
        } catch (error) {
            console.error('Error getting progress by user ID:', error);
            throw error;
        }
    }

    /**
     * Check if user can access a specific step
     * @param {string} restaurantId 
     * @param {string} userId 
     * @param {number} targetStep 
     */
    async canAccessStep(restaurantId, userId, targetStep) {
        try {
            const progress = await this.getProgress(restaurantId, userId);
            
            if (!progress) {
                // No progress means setup hasn't started (shouldn't happen)
                return { allowed: false, reason: 'Setup not initialized' };
            }

            // Step 1-3 must be complete
            if (!progress.step_1_3_complete) {
                return { allowed: false, reason: 'Steps 1-3 must be completed first' };
            }

            // For steps 4-11, check email verification status
            if (targetStep >= 4) {
                // Convert userId to integer if it's a string (user_id is INT in restaurant_users)
                const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
                
                if (isNaN(userIdInt)) {
                    console.error('Invalid userId format:', userId);
                    return { allowed: false, reason: 'Invalid user ID format' };
                }
                
                console.log(`🔍 Checking email verification for user_id: ${userIdInt}, restaurant_id: ${restaurantId}, step: ${targetStep}`);
                
                const userResult = await executeQuery(
                    `SELECT email_verified, email FROM restaurant_users WHERE user_id = ?`,
                    [userIdInt]
                );

                if (!userResult || userResult.length === 0) {
                    console.error('❌ User not found in restaurant_users:', userIdInt);
                    return { allowed: false, reason: 'User not found' };
                }

                const isEmailVerified = userResult[0]?.email_verified === 1;
                const userEmail = userResult[0]?.email;
                
                console.log(`📧 Email verification status for user_id ${userIdInt} (${userEmail}): ${isEmailVerified ? 'VERIFIED' : 'NOT VERIFIED'} (value: ${userResult[0]?.email_verified})`);
                
                if (!isEmailVerified) {
                    return { 
                        allowed: false, 
                        reason: 'Email verification required. Please verify your email before continuing.' 
                    };
                }
            }

            // For step 4, always allow if email is verified (it's the first step after 1-3)
            if (targetStep === 4) {
                return { allowed: true };
            }

            // For other steps, check if previous step is complete
            const previousStep = targetStep - 1;
            const previousStepColumn = previousStep === 3 ? 'step_1_3_complete' : `step_${previousStep}_complete`;
            
            const result = await executeQuery(
                `SELECT ${previousStepColumn} as is_complete 
                 FROM restaurant_setup_progress 
                 WHERE restaurant_id = ? AND user_id = ?`,
                [restaurantId, userId]
            );

            if (!result || result.length === 0) {
                console.error(`❌ Progress not found for restaurant_id: ${restaurantId}, user_id: ${userId}`);
                return { allowed: false, reason: 'Progress not found' };
            }

            const isPreviousComplete = result[0]?.is_complete === 1;
            
            if (!isPreviousComplete) {
                return { 
                    allowed: false, 
                    reason: `Step ${previousStep} must be completed before accessing step ${targetStep}` 
                };
            }

            return { allowed: true };
        } catch (error) {
            console.error('Error checking step access:', error);
            return { allowed: false, reason: error.message };
        }
    }
}

module.exports = new RestaurantSetupProgressService();

