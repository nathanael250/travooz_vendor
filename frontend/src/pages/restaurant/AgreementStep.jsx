import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileText, X, CheckCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';
import SetupProgressIndicator from '../../components/restaurant/SetupProgressIndicator';

export default function AgreementStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Monitor error state and auto-logout on auth errors
  React.useEffect(() => {
    if (error) {
      const lowerError = error.toLowerCase();
      const isAuthError = lowerError.includes('access token is required') ||
                         lowerError.includes('token is required') ||
                         lowerError.includes('authentication required') ||
                         lowerError.includes('access denied');
      
      if (isAuthError) {
        console.log('🚪 Auth error detected in error state - logging out');
        // Clear error state first
        setError('');
        // Import and call logout handler
        import('../../utils/restaurantAuth').then(({ handleRestaurantNotFound }) => {
          handleRestaurantNotFound();
        });
      }
    }
  }, [error]);

  const handleConfirm = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureSubmit = async () => {
    if (signatureText.toLowerCase().trim() !== 'confirm') {
      setError('Please type "confirm" to proceed');
      return;
    }

    const restaurantId = location.state?.restaurantId;
    if (!restaurantId) {
      setError('Restaurant ID is missing. Please go back and try again.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Save agreement via API
      await restaurantSetupService.saveAgreement(restaurantId, {
        signature: signatureText,
        confirmed: true
      });

      // Navigate to setup complete page
      navigate('/restaurant/setup/complete', {
        state: {
          ...location.state,
          agreementAccepted: true,
          setupComplete: true
        }
      });
    } catch (err) {
      console.error('Error submitting agreement:', err);
      
      // Check if it's an authentication error (401) or access denied
      const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || '';
      const lowerMessage = errorMessage.toLowerCase();
      const isAuthError = err?.response?.status === 401 || 
                         err?.response?.status === 403 ||
                         lowerMessage.includes('access token is required') ||
                         lowerMessage.includes('token is required') ||
                         lowerMessage.includes('authentication required') ||
                         lowerMessage.includes('access denied');
      
      if (isAuthError) {
        // Authentication error - logout and redirect
        console.log('🚪 Authentication error in AgreementStep - logging out');
        setIsSubmitting(false); // Reset submitting state
        
        // Import and call logout handler immediately
        const { handleRestaurantNotFound } = await import('../../utils/restaurantAuth');
        handleRestaurantNotFound();
        
        // Prevent any further execution
        return;
      }
      
      setError(err.message || 'Failed to submit agreement. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/review', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <SetupProgressIndicator currentStepKey="agreement" currentStepNumber={11} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Agreement
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please read and confirm the agreement to complete your restaurant setup.
            </p>

            {/* Confirmation Statement */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 mb-6" style={{ borderColor: '#dcfce7' }}>
              <p className="text-lg font-semibold text-gray-900 mb-4">
                I confirm that the information provided is accurate and truthful.
              </p>
            </div>

            {/* Agreement Content */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 mb-6 max-h-96 overflow-y-auto" style={{ borderColor: '#dcfce7' }}>
              <h3 className="font-semibold text-gray-900 mb-4">Terms and Conditions Agreement</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <p>
                  By proceeding, you agree to the following terms and conditions:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Provide accurate and truthful information about your restaurant</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Maintain food safety standards and comply with local health regulations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Honor all bookings and reservations made through the platform</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Keep menu information, prices, and availability up to date</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Respond promptly to customer inquiries and reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Comply with Travooz's platform policies and guidelines</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Maintain valid business licenses and certifications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ensure all food items meet quality and safety standards</span>
                  </div>
                </div>

                <p className="mt-4">
                  I understand that I am responsible for maintaining accurate information and complying with all applicable laws and regulations. 
                  Failure to comply may result in suspension or termination of my account.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                style={{ borderColor: '#d1d5db' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </div>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Confirm</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Agreement</h2>
              <button
                type="button"
                onClick={() => {
                  setShowSignatureModal(false);
                  setSignatureText('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Please type <span className="font-semibold text-gray-900">"confirm"</span> to proceed with the agreement.
            </p>

            <input
              type="text"
              value={signatureText}
              onChange={(e) => {
                setSignatureText(e.target.value);
                setError('');
              }}
              placeholder="Type 'confirm' here"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500 mb-4"
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSignatureModal(false);
                  setSignatureText('');
                  setError('');
                }}
                className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                style={{ borderColor: '#d1d5db' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignatureSubmit}
                disabled={isSubmitting}
                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

