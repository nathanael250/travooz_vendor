const { executeQuery } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

// Step mapping for car rental onboarding (after first 3 steps)
// Business Details → Tax & Payment → Review → Agreement → Complete
const STEP_MAPPING = {
  'business-details': { stepNumber: 2, stepName: 'Business Details', route: '/car-rental/setup/business-details' },
  'tax-payment': { stepNumber: 3, stepName: 'Tax & Payment', route: '/car-rental/setup/tax-payment' },
  'review': { stepNumber: 4, stepName: 'Review', route: '/car-rental/setup/review' },
  'agreement': { stepNumber: 5, stepName: 'Agreement', route: '/car-rental/setup/agreement' },
  'complete': { stepNumber: 6, stepName: 'Setup Complete', route: '/car-rental/setup/complete' }
};

class CarRentalOnboardingProgressService {
  /**
   * Get or create progress tracking for a user
   */
  async getProgress(userId) {
    try {
      const rows = await executeQuery(
        'SELECT * FROM car_rental_onboarding_progress_track WHERE user_id = ?',
        [userId]
      );

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
      console.error('Error getting car rental progress:', error);
      throw error;
    }
  }

  /**
   * Save or update progress for a user
   */
  async saveProgress(userId, stepKey, businessId = null, isComplete = false) {
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
          `UPDATE car_rental_onboarding_progress_track 
           SET current_step = ?, step_name = ?, step_number = ?, 
               is_complete = ?, completed_steps = ?, business_id = ?
           WHERE user_id = ?`,
          [
            stepKey,
            stepInfo.stepName,
            stepInfo.stepNumber,
            isComplete ? 1 : 0,
            JSON.stringify(completedSteps),
            businessId || existingProgress.business_id,
            userId
          ]
        );
      } else {
        // Create new progress record
        const id = uuidv4();
        await executeQuery(
          `INSERT INTO car_rental_onboarding_progress_track 
           (id, user_id, business_id, current_step, step_name, step_number, is_complete, completed_steps)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            businessId,
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
      console.error('Error saving car rental progress:', error);
      throw error;
    }
  }

  /**
   * Mark a step as complete and move to next step
   */
  async completeStep(userId, stepKey, businessId = null) {
    try {
      // Mark current step as complete
      await this.saveProgress(userId, stepKey, businessId, true);

      // Determine next step
      const stepOrder = Object.keys(STEP_MAPPING);
      const currentIndex = stepOrder.indexOf(stepKey);
      
      if (currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1];
        await this.saveProgress(userId, nextStep, businessId, false);
        return STEP_MAPPING[nextStep];
      }

      // All steps complete
      return null;
    } catch (error) {
      console.error('Error completing car rental step:', error);
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
        // No progress found, start with first step
        return STEP_MAPPING['business-details'];
      }

      // If current step is complete, get next step
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
      console.error('Error getting next car rental step:', error);
      throw error;
    }
  }
}

module.exports = new CarRentalOnboardingProgressService();


