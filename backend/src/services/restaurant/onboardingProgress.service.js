const { executeQuery } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

// Step mapping for restaurant onboarding (after first 3 steps)
// Correct order: Business Details → Media → Capacity → Tax & Legal → Menu Setup → Review → Complete
const STEP_MAPPING = {
  'business-details': { stepNumber: 4, stepName: 'Business Details', route: '/restaurant/setup/business-details' },
  'media': { stepNumber: 5, stepName: 'Media', route: '/restaurant/setup/media' },
  'capacity': { stepNumber: 6, stepName: 'Capacity', route: '/restaurant/setup/capacity' },
  'tax-legal': { stepNumber: 7, stepName: 'Tax & Legal', route: '/restaurant/setup/tax-legal' },
  'menu': { stepNumber: 8, stepName: 'Menu Setup', route: '/restaurant/setup/menu' },
  'review': { stepNumber: 9, stepName: 'Review Restaurant', route: '/restaurant/setup/review' },
  'complete': { stepNumber: 10, stepName: 'Setup Complete', route: '/restaurant/setup/complete' }
};

class RestaurantOnboardingProgressService {
  /**
   * Get or create progress tracking for a user
   */
  async getProgress(userId) {
    try {
      const rows = await executeQuery(
        'SELECT * FROM restaurant_onboarding_progress_track WHERE user_id = ?',
        [userId]
      );

      // executeQuery returns results directly, but check if it's an array
      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }

      const progress = rows[0];
      // Parse completed_steps JSON if it exists
      if (progress.completed_steps) {
        try {
          progress.completed_steps = typeof progress.completed_steps === 'string' 
            ? JSON.parse(progress.completed_steps) 
            : progress.completed_steps;
        } catch (e) {
          progress.completed_steps = [];
        }
      } else {
        progress.completed_steps = [];
      }

      return progress;
    } catch (error) {
      console.error('Error getting restaurant progress:', error);
      throw error;
    }
  }

  /**
   * Save or update progress for a user
   */
  async saveProgress(userId, stepKey, restaurantId = null, isComplete = false) {
    try {
      if (!STEP_MAPPING[stepKey]) {
        throw new Error(`Invalid step key: ${stepKey}`);
      }

      const stepInfo = STEP_MAPPING[stepKey];
      
      // Get existing progress
      const existingProgress = await this.getProgress(userId);
      
      let completedSteps = [];
      if (existingProgress && existingProgress.completed_steps) {
        completedSteps = Array.isArray(existingProgress.completed_steps) 
          ? existingProgress.completed_steps 
          : [];
      }

      // Add current step to completed steps if it's being marked as complete
      if (isComplete && !completedSteps.includes(stepKey)) {
        completedSteps.push(stepKey);
      }

      if (existingProgress) {
        // Update existing progress
        await executeQuery(
          `UPDATE restaurant_onboarding_progress_track 
           SET current_step = ?, step_name = ?, step_number = ?, 
               is_complete = ?, completed_steps = ?, restaurant_id = ?
           WHERE user_id = ?`,
          [
            stepKey,
            stepInfo.stepName,
            stepInfo.stepNumber,
            isComplete ? 1 : 0,
            JSON.stringify(completedSteps),
            restaurantId || existingProgress.restaurant_id,
            userId
          ]
        );
      } else {
        // Create new progress record
        const id = uuidv4();
        await executeQuery(
          `INSERT INTO restaurant_onboarding_progress_track 
           (id, user_id, restaurant_id, current_step, step_name, step_number, is_complete, completed_steps)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            restaurantId,
            stepKey,
            stepInfo.stepName,
            stepInfo.stepNumber,
            isComplete ? 1 : 0,
            JSON.stringify(completedSteps)
          ]
        );
      }

      return await this.getProgress(userId);
    } catch (error) {
      console.error('Error saving restaurant progress:', error);
      throw error;
    }
  }

  /**
   * Mark a step as complete and move to next step
   */
  async completeStep(userId, stepKey, restaurantId = null) {
    try {
      // Mark current step as complete
      await this.saveProgress(userId, stepKey, restaurantId, true);

      // Determine next step
      const stepOrder = Object.keys(STEP_MAPPING);
      const currentIndex = stepOrder.indexOf(stepKey);
      
      if (currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1];
        await this.saveProgress(userId, nextStep, restaurantId, false);
        return STEP_MAPPING[nextStep];
      }

      // All steps complete
      return null;
    } catch (error) {
      console.error('Error completing restaurant step:', error);
      throw error;
    }
  }

  /**
   * Get the next step the user should be on
   */
  async getNextStep(userId) {
    try {
      const progress = await this.getProgress(userId);
      
      if (!progress) {
        // No progress found, start at business-details step (first setup step)
        return STEP_MAPPING['business-details'];
      }

      // If current step is complete, find next incomplete step
      if (progress.is_complete) {
        const stepOrder = Object.keys(STEP_MAPPING);
        const currentIndex = stepOrder.indexOf(progress.current_step);
        
        if (currentIndex < stepOrder.length - 1) {
          return STEP_MAPPING[stepOrder[currentIndex + 1]];
        }
      }

      // Return current step
      return STEP_MAPPING[progress.current_step] || STEP_MAPPING['business-details'];
    } catch (error) {
      console.error('Error getting next restaurant step:', error);
      throw error;
    }
  }

  /**
   * Reset progress (for testing or restarting onboarding)
   */
  async resetProgress(userId) {
    try {
      await executeQuery(
        'DELETE FROM restaurant_onboarding_progress_track WHERE user_id = ?',
        [userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error resetting restaurant progress:', error);
      throw error;
    }
  }

  /**
   * Get step mapping (for frontend reference)
   */
  getStepMapping() {
    return STEP_MAPPING;
  }
}

module.exports = new RestaurantOnboardingProgressService();

