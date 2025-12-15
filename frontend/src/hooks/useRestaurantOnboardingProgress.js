import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantOnboardingProgressService } from '../services/eatingOutService';
import restaurantAuthService from '../services/restaurantAuthService';

/**
 * Hook to check and manage restaurant onboarding progress
 * Redirects users to the correct step if they're not on it
 */
export const useRestaurantOnboardingProgress = (currentStepKey, redirectEnabled = true) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        // Check if user is authenticated
        const user = restaurantAuthService.getCurrentUser();
        if (!user || !user.user_id) {
          // Not authenticated, don't check progress
          setLoading(false);
          return;
        }

        // Get current progress
        const progressData = await restaurantOnboardingProgressService.getProgress();
        
        if (!progressData || !progressData.progress) {
          // No progress found - user hasn't completed first 3 steps yet
          setLoading(false);
          return;
        }

        setProgress(progressData.progress);

        // If redirect is enabled and user is not on the correct step, redirect them
        if (redirectEnabled && currentStepKey) {
          const currentStep = progressData.progress.current_step;
          
          // If user is trying to access a step that's not their current step, redirect
          if (currentStep !== currentStepKey) {
            const stepMapping = progressData.stepMapping || {};
            const targetStep = stepMapping[currentStep];
            
            if (targetStep && targetStep.route) {
              console.log(`Redirecting to correct step: ${targetStep.route}`);
              navigate(targetStep.route, { replace: true });
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error checking restaurant onboarding progress:', err);
        setError(err);
        setLoading(false);
        // Don't redirect on error - let user continue
      }
    };

    checkProgress();
  }, [currentStepKey, navigate, redirectEnabled]);

  return {
    progress,
    loading,
    error,
    refreshProgress: async () => {
      try {
        const progressData = await restaurantOnboardingProgressService.getProgress();
        setProgress(progressData?.progress || null);
        return progressData?.progress || null;
      } catch (err) {
        console.error('Error refreshing restaurant progress:', err);
        throw err;
      }
    }
  };
};

