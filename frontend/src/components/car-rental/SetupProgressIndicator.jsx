import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import carRentalSetupService from '../../services/carRentalSetupService';

/**
 * Responsive Progress Indicator Component for Car Rental Setup
 * Shows progress through the car rental setup steps
 */
export default function SetupProgressIndicator({ currentStepKey, currentStepNumber }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step mapping for car rental setup
  // Initial 3 steps (location, step-2, step-3) are combined as Step 1
  // Then: Business Details → Tax & Payment → Review → Agreement → Complete
  const STEP_ORDER = [
    'business-details',    // Display Step 2
    'tax-payment',          // Display Step 3
    'review',               // Display Step 4
    'agreement',            // Display Step 5
    'complete'              // Display Step 6
  ];

  // Step route mapping
  const STEP_ROUTES = {
    'business-details': '/car-rental/setup/business-details',
    'tax-payment': '/car-rental/setup/tax-payment',
    'review': '/car-rental/setup/review',
    'agreement': '/car-rental/setup/agreement',
    'complete': '/car-rental/setup/complete'
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await carRentalSetupService.getProgress();
        if (progressData) {
          setProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentStepKey, currentStepNumber]); // Re-fetch when step changes

  useEffect(() => {
    // Determine current step from URL, props, or progress
    const pathname = location.pathname;
    let stepKey = currentStepKey;

    if (!stepKey) {
      // Use progress data if available
      if (progress && progress.current_step) {
        stepKey = progress.current_step;
      } else {
        // Determine from URL
        if (pathname.includes('/setup/business-details')) {
          stepKey = 'business-details';
        } else if (pathname.includes('/setup/tax-payment')) {
          stepKey = 'tax-payment';
        } else if (pathname.includes('/setup/review')) {
          stepKey = 'review';
        } else if (pathname.includes('/setup/agreement')) {
          stepKey = 'agreement';
        } else if (pathname.includes('/setup/complete')) {
          stepKey = 'complete';
        } else if (pathname.includes('/list-your-car-rental')) {
          // Initial steps (location, step-2, step-3) - these are Step 1
          stepKey = 'initial';
        }
      }
    }

    setCurrentStep(stepKey);
  }, [location.pathname, currentStepKey, progress]);

  // Determine current step info
  const getCurrentStepInfo = () => {
    const actualCurrentStep = currentStep || 'initial';
    
    // Find current step index in STEP_ORDER
    const currentIndex = actualCurrentStep === 'initial' ? -1 : STEP_ORDER.indexOf(actualCurrentStep);
    
    // Display step number calculation:
    // - Initial steps (location, step-2, step-3) = Display step 1 (checkmark)
    // - Business Details = Display step 2
    // - Tax & Payment = Display step 3
    // - Review = Display step 4
    // - Agreement = Display step 5
    // - Complete = Display step 6
    let displayStepNum;
    if (actualCurrentStep === 'initial') {
      displayStepNum = 1;
    } else if (currentIndex >= 0) {
      displayStepNum = currentIndex + 2; // Step 0 = display 2, step 1 = display 3, etc.
    } else {
      displayStepNum = 1; // Default to initial
    }
    
    const totalSteps = 6; // 1 initial + 5 setup steps
    
    // Calculate completed count using progress data if available
    let completedCount = 0;
    const completedSteps = progress?.completed_steps || [];
    
    if (actualCurrentStep !== 'initial') {
      completedCount = 1; // Initial steps are complete
      
      // Count steps that are explicitly in completedSteps array
      if (completedSteps && Array.isArray(completedSteps)) {
        const onboardingCompletedCount = completedSteps.filter(step => STEP_ORDER.includes(step)).length;
        completedCount += onboardingCompletedCount;
      }
      
      // Also count steps that are before the current step
      if (currentIndex >= 0 && currentIndex > 0) {
        // Only count steps before current (not including current)
        completedCount = Math.max(completedCount, 1 + currentIndex);
      }
      
      // If we're on 'complete', all steps are done
      if (actualCurrentStep === 'complete') {
        completedCount = totalSteps; // All steps complete
      }
    }
    
    return {
      currentStepNum: displayStepNum,
      completedCount,
      totalSteps,
      currentStepKey: actualCurrentStep,
      currentIndex,
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
  const { currentStepNum, completedCount, totalSteps, currentStepKey: actualStepKey, currentIndex, completedSteps } = stepInfo;
  // Calculate percentage: if on complete step, show 100%, otherwise calculate normally
  const percentage = actualStepKey === 'complete' ? 100 : Math.round((completedCount / totalSteps) * 100);

  // Calculate which steps to show on tablet (current ± 2 steps in display numbers)
  const getTabletSteps = () => {
    const steps = [];
    const start = Math.max(2, currentStepNum - 2); // Start from display step 2
    const end = Math.min(6, currentStepNum + 2); // End at display step 6
    
    for (let i = start; i <= end; i++) {
      steps.push(i);
    }
    return steps;
  };

  const tabletSteps = getTabletSteps();

  // Helper to check if a step is completed
  const isStepCompleted = (displayStepNum) => {
    // If we're on complete step, all steps are completed
    if (actualStepKey === 'complete') {
      return true;
    }
    
    // Step 1 (initial) is always complete if we're past it
    if (displayStepNum === 1) {
      return actualStepKey !== 'initial';
    }
    
    // Convert display step to STEP_ORDER index
    const stepIndex = displayStepNum - 2;
    if (stepIndex < 0 || stepIndex >= STEP_ORDER.length) {
      return false;
    }
    
    const stepKey = STEP_ORDER[stepIndex];
    
    // Check if step is explicitly in completedSteps array
    if (completedSteps && Array.isArray(completedSteps) && completedSteps.includes(stepKey)) {
      return true;
    }
    
    // Also check if current step is past this step
    const currentStepIndex = STEP_ORDER.indexOf(actualStepKey);
    if (currentStepIndex >= 0 && stepIndex < currentStepIndex) {
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
      return '/car-rental/list-your-car-rental'; // Initial step
    }
    const stepIndex = displayStepNum - 2; // Convert display step to STEP_ORDER index
    if (stepIndex >= 0 && stepIndex < STEP_ORDER.length) {
      const stepKey = STEP_ORDER[stepIndex];
      return STEP_ROUTES[stepKey] || null;
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

  // Steps to show after the initial checkmark (display steps 2-6)
  const stepsAfterCheckmark = STEP_ORDER.length;

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
          {/* Show initial steps as one completed checkmark */}
          <div 
            onClick={() => handleStepClick(1)}
            className={`w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0 ${actualStepKey !== 'initial' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            style={{ backgroundColor: '#3CAF54' }}
            title="Go to initial steps"
          >
            {actualStepKey === 'initial' ? '1' : '✓'}
          </div>
          <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show tablet steps (display steps 2-6) */}
          {tabletSteps.map((step) => {
            // Check if current first, then completed
            const isCurrent = isStepCurrent(step);
            const isCompleted = !isCurrent && isStepCompleted(step);
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
          {/* Show initial steps as one checkmark */}
          <div 
            onClick={() => handleStepClick(1)}
            className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0 ${actualStepKey !== 'initial' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            style={{ backgroundColor: '#3CAF54' }}
            title="Go to initial steps"
          >
            {actualStepKey === 'initial' ? '1' : '✓'}
          </div>
          <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show steps 2-6 */}
          {Array.from({ length: stepsAfterCheckmark }, (_, i) => i + 2).map((step) => {
            // Check if current first, then completed
            const isCurrent = isStepCurrent(step);
            const isCompleted = !isCurrent && isStepCompleted(step);
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
                    {step < 6 && (
                      <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      {step}
                    </div>
                    {step < 6 && (
                      <div className="w-12 sm:w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300 text-gray-400 flex-shrink-0">
                      {step}
                    </div>
                    {step < 6 && (
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

