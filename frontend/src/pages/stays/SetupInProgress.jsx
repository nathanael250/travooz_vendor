import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function SetupInProgress() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  // Check completed steps
  const stepsCompleted = {
    step1: location.state?.userId ? true : false, // Profile created
    step2: localStorage.getItem('stays_contract_accepted') === 'true',
    step3: !!localStorage.getItem('stays_policies'),
    step4: !!localStorage.getItem('stays_amenities'),
    step5: !!localStorage.getItem('stays_rooms'),
    step6: false,
    step7: false,
    step8: false,
    step9: false,
    step10: false,
    step11: false
  };

  const allSteps = [
    { num: 1, name: 'Complete Profile', completed: stepsCompleted.step1 },
    { num: 2, name: 'Contract Agreement', completed: stepsCompleted.step2 },
    { num: 3, name: 'Policies and Settings', completed: stepsCompleted.step3 },
    { num: 4, name: 'Property Details', completed: stepsCompleted.step4 },
    { num: 5, name: 'Rooms & Rates', completed: stepsCompleted.step5 },
    { num: 6, name: 'Photos & Media', completed: stepsCompleted.step6 },
    { num: 7, name: 'Amenities', completed: stepsCompleted.step7 },
    { num: 8, name: 'Location Details', completed: stepsCompleted.step8 },
    { num: 9, name: 'Availability Calendar', completed: stepsCompleted.step9 },
    { num: 10, name: 'Payment Setup', completed: stepsCompleted.step10 },
    { num: 11, name: 'Review & Submit', completed: stepsCompleted.step11 }
  ];

  const completedCount = allSteps.filter(s => s.completed).length;
  const totalSteps = allSteps.length;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {allSteps.map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-md ${
                        step.completed
                          ? 'bg-[#3CAF54] text-white'
                          : step.num === completedCount + 1
                          ? 'bg-[#3CAF54] text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {step.completed ? '✓' : step.num}
                    </div>
                    {index < allSteps.length - 1 && (
                      <div
                        className={`w-16 h-1 ${
                          step.completed ? 'bg-[#3CAF54]' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>
              Step {completedCount + 1} of {totalSteps}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="text-center mb-8">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup In Progress</h1>
              <p className="text-gray-600">
                You've completed {completedCount} of {totalSteps} steps. More steps are coming soon!
              </p>
            </div>

            {/* Steps List */}
            <div className="space-y-3 mb-8">
              {allSteps.map((step) => (
                <div
                  key={step.num}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    step.completed ? 'bg-[#f0fdf4]' : 'bg-gray-50'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-[#3CAF54]" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={`flex-1 ${
                      step.completed ? 'text-gray-700 font-medium' : 'text-gray-500'
                    }`}
                  >
                    Step {step.num}: {step.name}
                  </span>
                  {step.completed && (
                    <span className="text-sm text-[#3CAF54] font-medium">Completed</span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((completedCount / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedCount / totalSteps) * 100}%`,
                    backgroundColor: '#3CAF54'
                  }}
                ></div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Steps 4-11 are currently being developed. Your progress has been saved, and you'll be able to continue once the remaining steps are ready.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/stays/setup/policies', { state: location.state })}
                className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#d1d5db' }}
              >
                <span>Back to Policies</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // For now, just show a message
                  alert('More setup steps coming soon! Your progress has been saved.');
                }}
                disabled
                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md opacity-50 cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
              >
                <span>Continue Setup</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

