import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantOnboardingProgressService } from '../../services/eatingOutService';

/**
 * Responsive Progress Indicator Component for Restaurant Setup
 * Uses onboarding progress tracking to show accurate progress
 */
export default function SetupProgressIndicator({ currentStepKey, currentStepNumber }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step mapping for restaurant onboarding (after first 3 steps)
  // Correct order: Business Details → Media → Capacity → Tax & Legal → Menu → Review → Complete
  const STEP_ORDER = [
    'business-details',    // Display Step 2 (Backend Step 4)
    'media',               // Display Step 3 (Backend Step 5)
    'capacity',            // Display Step 4 (Backend Step 6)
    'tax-legal',           // Display Step 5 (Backend Step 7)
    'menu',                // Display Step 6 (Backend Step 8)
    'review',              // Display Step 7 (Backend Step 9)
    'complete'             // Display Step 8 (Backend Step 10)
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await restaurantOnboardingProgressService.getProgress();
        if (progressData) {
          setProgress(progressData.progress);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentStepKey, currentStepNumber]); // Re-fetch when step changes

  // Determine current step and completed steps
  const getCurrentStepInfo = () => {
    // Use provided currentStepKey if available, otherwise use progress
    const actualCurrentStep = currentStepKey || progress?.current_step || 'business-details';
    const completedSteps = progress?.completed_steps || [];
    
    // Find current step index in STEP_ORDER
    const currentIndex = STEP_ORDER.indexOf(actualCurrentStep);
    
    // Determine backend step number
    // Priority: 1) currentStepNumber prop, 2) calculated from currentIndex, 3) default to 4
    let backendStepNum;
    if (currentStepNumber) {
      backendStepNum = currentStepNumber; // Use provided backend step number
    } else if (currentIndex >= 0) {
      backendStepNum = currentIndex + 4; // Calculate from index (step 0 = backend 4, step 1 = backend 5, etc.)
    } else {
      backendStepNum = 4; // Default to first onboarding step
    }
    
    // Display step number calculation:
    // - Backend step 4 (Business Details) = Display step 2
    // - Backend step 5 (Media) = Display step 3
    // - Backend step 6 (Capacity) = Display step 4
    // - Backend step 7 (Tax & Legal) = Display step 5
    // - Backend step 8 (Menu) = Display step 6
    // - Backend step 9 (Review) = Display step 7
    // - Backend step 10 (Complete) = Display step 8
    // Formula: displayStep = backendStep - 2
    const displayStepNum = backendStepNum - 2;
    
    // Calculate completed count
    // Step 1 (initial 3 steps) is always complete = 1
    // Plus count how many onboarding steps are completed
    let onboardingCompletedCount = 0;
    
    // Count steps that are explicitly in completedSteps array
    if (completedSteps && Array.isArray(completedSteps)) {
      onboardingCompletedCount = completedSteps.filter(step => STEP_ORDER.includes(step)).length;
    }
    
    // Also count steps that are before the current step
    // If we're on backend step 7 (capacity, display step 5), then steps 2-4 (backend steps 4-6) should be complete
    // currentIndex is 0-based: 0 = business-details, 1 = media, 2 = payments-pricing, etc.
    // If currentIndex is 3 (capacity), then steps 0, 1, 2 (business-details, media, payments-pricing) should be complete
    if (currentIndex >= 0) {
      // Only count steps that are BEFORE the current step (not including current step)
      onboardingCompletedCount = Math.max(onboardingCompletedCount, currentIndex);
    } else if (backendStepNum >= 4) {
      // Fallback: if we have backendStepNum but not currentIndex, estimate
      const estimatedIndex = backendStepNum - 4;
      // Only count steps before current (not including current)
      onboardingCompletedCount = Math.max(onboardingCompletedCount, estimatedIndex);
    }
    
    const completedCount = 1 + onboardingCompletedCount; // 1 for initial steps + onboarding steps
    const totalSteps = 8; // 1 initial (steps 1-3 combined) + 7 onboarding steps
    
    return {
      currentStepNum: displayStepNum, // Display step number (2-10)
      backendStepNum, // Backend step number (4-12) for internal use
      completedCount,
      totalSteps,
      currentStepKey: actualCurrentStep,
      completedSteps
    };
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3CAF54]"></div>
        </div>
      </div>
    );
  }

  const stepInfo = getCurrentStepInfo();
  const { currentStepNum, backendStepNum, completedCount, totalSteps, currentStepKey: actualStepKey, completedSteps } = stepInfo;
  const percentage = Math.round((completedCount / totalSteps) * 100);
  
  // Steps to show after the initial checkmark (display steps 2-10, which map to backend steps 4-12)
  const stepsAfterCheckmark = STEP_ORDER.length;

  // Calculate which steps to show on tablet (current ± 2 steps in display numbers)
  // Note: display steps start from 2 (since step 1 is the initial checkmark)
  const getTabletSteps = () => {
    const steps = [];
    const start = Math.max(2, currentStepNum - 2); // Start from display step 2 (Business Details)
    const end = Math.min(8, currentStepNum + 2); // End at display step 8 (Complete)
    
    for (let i = start; i <= end; i++) {
      steps.push(i);
    }
    return steps;
  };

  const tabletSteps = getTabletSteps();

  // Helper to convert display step number to backend step number
  const displayToBackendStep = (displayStep) => {
    if (displayStep === 1) return null; // Step 1 is the initial checkmark
    return displayStep + 2; // Display step 2 = backend step 4, etc.
  };

  // Helper to check if a step is completed
  const isStepCompleted = (displayStepNum) => {
    // Step 1 represents the initial 3 steps combined - always complete
    // But we should never call this for step 1 in the onboarding steps list
    // since step 1 is shown separately as a checkmark
    if (displayStepNum === 1) {
      console.warn('isStepCompleted called for step 1 - this should not happen in onboarding steps');
      return true;
    }
    
    const backendStep = displayToBackendStep(displayStepNum);
    if (!backendStep || backendStep < 4) return false;
    
    const stepIndex = backendStep - 4;
    if (stepIndex < 0 || stepIndex >= STEP_ORDER.length) return false;
    
    const stepKey = STEP_ORDER[stepIndex];
    
    // Check if this step is explicitly in the completed steps array
    if (completedSteps && Array.isArray(completedSteps) && completedSteps.includes(stepKey)) {
      return true;
    }
    
    // Also check if current step is past this step
    // If we're on backend step 7 (capacity, display step 5), then backend steps 4, 5, 6 (display steps 2, 3, 4) should be complete
    // We need to compare the step indices, not the backend step numbers
    // IMPORTANT: stepIndex must be STRICTLY less than currentStepIndex (not equal)
    const currentStepIndex = STEP_ORDER.indexOf(actualStepKey);
    if (currentStepIndex >= 0 && stepIndex < currentStepIndex) {
      return true;
    }
    
    // Fallback: if we have backendStepNum, compare directly
    // IMPORTANT: backendStep must be STRICTLY less than backendStepNum (not equal)
    if (backendStepNum && backendStep < backendStepNum) {
      return true;
    }
    
    return false;
  };

  // Helper to check if a step is current
  const isStepCurrent = (displayStepNum) => {
    return displayStepNum === currentStepNum;
  };

  // Helper to get route for a display step number
  const getStepRoute = (displayStepNum) => {
    if (displayStepNum === 1) {
      return null; // Step 1 is the initial checkmark, not navigable
    }
    // Convert display step to backend step
    const backendStep = displayStepNum + 2; // Display step 2 = backend step 4
    const stepIndex = backendStep - 4; // Get index in STEP_ORDER
    if (stepIndex >= 0 && stepIndex < STEP_ORDER.length) {
      const stepKey = STEP_ORDER[stepIndex];
      const stepMapping = {
        'business-details': '/restaurant/setup/business-details',
        'media': '/restaurant/setup/media',
        'capacity': '/restaurant/setup/capacity',
        'tax-legal': '/restaurant/setup/tax-legal',
        'menu': '/restaurant/setup/menu',
        'review': '/restaurant/setup/review',
        'complete': '/restaurant/setup/complete'
      };
      return stepMapping[stepKey] || null;
    }
    return null;
  };

  // Handle step click navigation
  const handleStepClick = (displayStepNum) => {
    // Only allow clicking on completed steps or the current step
    const isCompleted = isStepCompleted(displayStepNum);
    const isCurrent = isStepCurrent(displayStepNum);
    
    if (isCompleted || isCurrent) {
      const route = getStepRoute(displayStepNum);
      if (route) {
        navigate(route);
      }
    }
  };

  return (
    <div className="mb-8">
      {/* Mobile: Simple progress bar */}
      <div className="block md:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#1f6f31' }}>
            Step {currentStepNum} of {totalSteps}
          </span>
          <span className="text-xs text-gray-500">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: '#3CAF54', width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tablet: Show current step ± 2 steps */}
      <div className="hidden md:flex lg:hidden items-center justify-center mb-4">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
          {/* Show steps 1-3 as one completed checkmark */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show tablet steps (display steps 2-8) */}
          {tabletSteps.map((step) => {
            // Check if current first, then completed
            const isCurrent = isStepCurrent(step);
            const isCompleted = !isCurrent && isStepCompleted(step); // Don't mark current step as completed
            const isClickable = isCompleted || isCurrent;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div 
                      onClick={() => handleStepClick(step)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      style={{ backgroundColor: '#3CAF54' }}
                      title={`Go to step ${step}`}
                    >
                      ✓
                    </div>
                    {step < tabletSteps[tabletSteps.length - 1] && (
                      <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0"
                      style={{ backgroundColor: '#3CAF54' }}
                    >
                      {step}
                    </div>
                    {step < tabletSteps[tabletSteps.length - 1] && (
                      <div className="w-8 sm:w-12 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold bg-white border-2 border-gray-300 text-gray-400 flex-shrink-0">
                      {step}
                    </div>
                    {step < tabletSteps[tabletSteps.length - 1] && (
                      <div className="w-8 sm:w-12 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Desktop: Show all steps */}
      <div className="hidden lg:flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          {/* Show steps 1-3 as one completed checkmark */}
          <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show steps 2-8 (onboarding steps in display numbering) */}
          {Array.from({ length: stepsAfterCheckmark }, (_, i) => i + 2).map((step) => {
            // Check if current first, then completed
            const isCurrent = isStepCurrent(step);
            const isCompleted = !isCurrent && isStepCompleted(step); // Don't mark current step as completed
            const isClickable = isCompleted || isCurrent;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div 
                      onClick={() => handleStepClick(step)}
                      className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      style={{ backgroundColor: '#3CAF54' }}
                      title={`Go to step ${step}`}
                    >
                      ✓
                    </div>
                    {step < 8 && (
                      <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      {step}
                    </div>
                    {step < 8 && (
                      <div className="w-12 sm:w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300 text-gray-400 flex-shrink-0">
                      {step}
                    </div>
                    {step < 8 && (
                      <div className="w-12 sm:w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <p className="text-center text-sm font-medium hidden md:block" style={{ color: '#1f6f31' }}>
        Setup Step {currentStepNum} of {totalSteps}
      </p>
    </div>
  );
}
