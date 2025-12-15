const onboardingProgressService = require('../../services/stays/onboardingProgress.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

/**
 * Get current onboarding progress for the authenticated user
 */
const getProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const progress = await onboardingProgressService.getProgress(userId);
        
        if (!progress) {
            return sendSuccess(res, { progress: null, stepMapping: onboardingProgressService.getStepMapping() }, 'No progress found');
        }

        return sendSuccess(res, { 
            progress,
            stepMapping: onboardingProgressService.getStepMapping()
        }, 'Progress retrieved successfully');
    } catch (error) {
        console.error('Error getting progress:', error);
        return sendError(res, error.message || 'Failed to get progress', 500);
    }
};

/**
 * Save or update onboarding progress
 */
const saveProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { stepKey, propertyId, isComplete } = req.body;

        if (!stepKey) {
            return sendError(res, 'Step key is required', 400);
        }

        const progress = await onboardingProgressService.saveProgress(
            userId,
            stepKey,
            propertyId || null,
            isComplete || false
        );

        return sendSuccess(res, { progress }, 'Progress saved successfully');
    } catch (error) {
        console.error('Error saving progress:', error);
        return sendError(res, error.message || 'Failed to save progress', 500);
    }
};

/**
 * Mark a step as complete and move to next step
 */
const completeStep = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { stepKey, propertyId } = req.body;

        if (!stepKey) {
            return sendError(res, 'Step key is required', 400);
        }

        const nextStep = await onboardingProgressService.completeStep(
            userId,
            stepKey,
            propertyId || null
        );

        const progress = await onboardingProgressService.getProgress(userId);

        return sendSuccess(res, { 
            progress,
            nextStep
        }, 'Step completed successfully');
    } catch (error) {
        console.error('Error completing step:', error);
        return sendError(res, error.message || 'Failed to complete step', 500);
    }
};

/**
 * Get the next step the user should be on
 */
const getNextStep = async (req, res) => {
    try {
        const userId = req.user.userId;
        const nextStep = await onboardingProgressService.getNextStep(userId);

        return sendSuccess(res, { nextStep }, 'Next step retrieved successfully');
    } catch (error) {
        console.error('Error getting next step:', error);
        return sendError(res, error.message || 'Failed to get next step', 500);
    }
};

/**
 * Reset progress (for testing or restarting onboarding)
 */
const resetProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await onboardingProgressService.resetProgress(userId);

        return sendSuccess(res, result, 'Progress reset successfully');
    } catch (error) {
        console.error('Error resetting progress:', error);
        return sendError(res, error.message || 'Failed to reset progress', 500);
    }
};

module.exports = {
    getProgress,
    saveProgress,
    completeStep,
    getNextStep,
    resetProgress
};

