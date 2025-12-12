import React from 'react';

/**
 * Responsive Progress Indicator Component for Restaurant Setup
 * @param {number} currentStep - Current backend step number (4-11, where 1-3 are combined and shown as completed)
 * @param {number} totalSteps - Total number of backend steps (should be 11)
 */
export default function SetupProgressIndicator({ currentStep, totalSteps = 11 }) {
  // Calculate percentage: steps 1-3 are always complete, so we add 3 to currentStep for percentage
  const totalBackendSteps = totalSteps; // Backend has steps 1-11
  const completedSteps = 3 + (currentStep - 4); // Steps 1-3 are complete, plus completed steps from 4 onwards
  const percentage = Math.round((completedSteps / totalBackendSteps) * 100);
  
  // Steps to show after the 3 checkmarks (steps 4-11, which is 8 steps)
  const stepsAfterCheckmarks = totalSteps - 3;

  // Calculate which steps to show on tablet (current ± 2 steps)
  // currentStep is backend step (4-11)
  const getTabletSteps = () => {
    const steps = [];
    const start = Math.max(4, currentStep - 2);
    const end = Math.min(totalSteps, currentStep + 2);
    
    for (let i = start; i <= end; i++) {
      steps.push(i);
    }
    return steps;
  };

  const tabletSteps = getTabletSteps();

  return (
    <div className="mb-8">
      {/* Mobile: Simple progress bar */}
      <div className="block md:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#1f6f31' }}>
            Step {currentStep} of {totalSteps}
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
          {/* Always show steps 1-3 as completed checkmarks */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show tablet steps (backend steps 4-11) */}
          {tabletSteps.map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      ✓
                    </div>
                    {step < tabletSteps[tabletSteps.length - 1] && (
                      <div className="w-8 sm:w-12 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
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
          {/* Always show steps 1-3 as completed checkmarks */}
          <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
            ✓
          </div>
          <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
          {/* Then show steps 4-11 (backend steps after the 3 checkmarks) */}
          {Array.from({ length: stepsAfterCheckmarks }, (_, i) => i + 4).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      ✓
                    </div>
                    {step < totalSteps && (
                      <div className="w-12 sm:w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      {step}
                    </div>
                    {step < totalSteps && (
                      <div className="w-12 sm:w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300 text-gray-400 flex-shrink-0">
                      {step}
                    </div>
                    {step < totalSteps && (
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
        Setup Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

