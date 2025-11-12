import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Responsive Progress Indicator Component
 * @param {number} currentStep - Current step number (1-10)
 * @param {number} totalSteps - Total number of steps (default: 10)
 */
export default function ProgressIndicator({ currentStep, totalSteps = 10 }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  // Calculate which steps to show on tablet (current ± 2 steps)
  const getTabletSteps = () => {
    const steps = [];
    const start = Math.max(1, currentStep - 2);
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
        <div className="flex items-center space-x-1">
          {tabletSteps[0] > 1 && (
            <>
              <div className="w-6 h-6 text-gray-400 rounded-full flex items-center justify-center text-xs font-semibold bg-white border-2 border-gray-300">
                1
              </div>
              <div className="w-6 h-1 bg-gray-300"></div>
              <div className="text-xs text-gray-400 mx-1">...</div>
            </>
          )}
          
          {tabletSteps.map((step, index) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const nextStep = tabletSteps[index + 1];
            const isLineCompleted = nextStep ? nextStep < currentStep : false;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div className="w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {index < tabletSteps.length - 1 && (
                      <div className="w-8 h-1" style={{ backgroundColor: isLineCompleted ? '#3CAF54' : '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      {step}
                    </div>
                    {index < tabletSteps.length - 1 && (
                      <div className="w-8 h-1 bg-gray-300"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 text-gray-400 rounded-full flex items-center justify-center text-xs font-semibold bg-white border-2 border-gray-300">
                      {step}
                    </div>
                    {index < tabletSteps.length - 1 && (
                      <div className="w-8 h-1 bg-gray-300"></div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
          
          {tabletSteps[tabletSteps.length - 1] < totalSteps && (
            <>
              <div className="text-xs text-gray-400 mx-1">...</div>
              <div className="w-6 h-6 text-gray-400 rounded-full flex items-center justify-center text-xs font-semibold bg-white border-2 border-gray-300">
                {totalSteps}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop: Show all steps */}
      <div className="hidden lg:flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    {step < totalSteps && (
                      <div className="w-16 h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                    )}
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                      {step}
                    </div>
                    {step < totalSteps && (
                      <div className="w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300 flex-shrink-0">
                      {step}
                    </div>
                    {step < totalSteps && (
                      <div className="w-16 h-1 bg-gray-300 flex-shrink-0"></div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Counter text - hidden on desktop */}
      <p className="text-center text-sm font-medium lg:hidden" style={{ color: '#1f6f31' }}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

