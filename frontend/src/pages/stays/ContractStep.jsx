import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Briefcase, Laptop, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService, getPropertiesByUserId, staysOnboardingProgressService } from '../../services/staysService';
import { useStaysOnboardingProgress } from '../../hooks/useStaysOnboardingProgress';

export default function ContractStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Contract step removed - redirect to policies step (first setup step)
  useEffect(() => {
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    const userId = location.state?.userId;
    const email = location.state?.email;
    const userName = location.state?.userName;
    
    navigate('/stays/setup/policies', {
      state: {
        userId,
        email,
        userName,
        propertyId
      },
      replace: true
    });
  }, [navigate, location.state]);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId && !progressLoading) {
      navigate('/stays/login');
    }
  }, [location.state, navigate, progressLoading]);

  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  // Get propertyId from state or localStorage
  useEffect(() => {
    const statePropertyId = location.state?.propertyId;
    const storedPropertyId = localStorage.getItem('stays_property_id');
    
    console.log('ContractStep - Checking propertyId:', {
      statePropertyId,
      storedPropertyId,
      fullState: location.state
    });
    
    if (statePropertyId) {
      const id = typeof statePropertyId === 'string' ? parseInt(statePropertyId) : statePropertyId;
      if (!isNaN(id) && id > 0) {
        setPropertyId(id);
        localStorage.setItem('stays_property_id', id.toString());
        console.log('Set propertyId from state:', id);
      }
    } else if (storedPropertyId) {
      const id = parseInt(storedPropertyId);
      if (!isNaN(id) && id > 0) {
        setPropertyId(id);
        console.log('Set propertyId from localStorage:', id);
      }
    } else {
      console.warn('Property ID not found in state or localStorage. State:', location.state);
      
      // Last resort: Try to fetch from backend using userId (no auth required)
      const userId = location.state?.userId;
      if (userId) {
        console.log('Attempting to fetch propertyId from backend using userId:', userId);
        getPropertiesByUserId(userId)
          .then(properties => {
            if (properties && Array.isArray(properties) && properties.length > 0) {
              // Get the most recent property (first one, as they're ordered by created_at DESC)
              const latestProperty = properties[0];
              const id = latestProperty.property_id || latestProperty.propertyId;
              if (id) {
                setPropertyId(id);
                localStorage.setItem('stays_property_id', id.toString());
                console.log('Successfully fetched propertyId from backend:', id);
                setError(''); // Clear error
              } else {
                console.warn('Property found but no property_id field:', latestProperty);
                setError('Property ID is missing. Please go back to the property creation step and try again.');
              }
            } else {
              console.warn('No properties found for userId:', userId);
              setError('Property ID is missing. Please go back to the property creation step and try again.');
            }
          })
          .catch(err => {
            console.error('Failed to fetch propertyId from backend:', err);
            setError('Property ID is missing. Please go back to the property creation step and try again.');
          });
      } else {
        setError('Property ID is missing. Please go back to the property creation step and try again.');
      }
    }
  }, [location.state]);

  const handleNext = async () => {
    if (!accepted) {
      setError('Please accept the terms to continue');
      return;
    }

    // Final check for propertyId
    const finalPropertyId = propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    if (!finalPropertyId || isNaN(finalPropertyId) || finalPropertyId <= 0) {
      setError('Property ID is missing. Please go back to the property creation step and try again.');
      console.error('Property ID validation failed:', { propertyId, finalPropertyId, localStorage: localStorage.getItem('stays_property_id') });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Save contract acceptance via API
      await staysSetupService.saveContract(finalPropertyId);
      
      // Store in localStorage as backup
      localStorage.setItem('stays_contract_accepted', 'true');

      // Navigate to next step (Step 3 - Policies and Settings)
      navigate('/stays/setup/policies', {
        state: {
          ...location.state,
          propertyId: finalPropertyId,
          contractAccepted: true
        }
      });
    } catch (err) {
      console.error('Error saving contract:', err);
      setError(err.message || 'Failed to save contract acceptance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Go back to previous step (email verification or profile)
    if (location.state?.fromEmailVerification) {
      navigate('/stays/list-your-property/verify-email', {
        state: location.state
      });
    } else {
      navigate('/stays/list-your-property/step-3', {
        state: location.state
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={2} totalSteps={10} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your contract</h1>
              <p className="text-gray-600">You're one step closer to listing your property with us.</p>
            </div>

            {/* What we do for you */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What we do for you</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                    <Globe className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Attract high-value travelers</h3>
                  <p className="text-sm text-gray-600">
                    Attract high-value travelers, including Travooz members and flight shoppers.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                    <Briefcase className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Generate global demand</h3>
                  <p className="text-sm text-gray-600">
                    Generate global demand across 75 countries in 35 different languages.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                    <Laptop className="h-6 w-6" style={{ color: '#3CAF54' }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exclusive tools and support</h3>
                  <p className="text-sm text-gray-600">
                    Develop exclusive tools and provide support to help maximize your revenue potential.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Terms */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Terms</h2>
              <div className="space-y-4">
                {/* No long-term commitment */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="font-bold text-gray-900 mb-2">No long-term commitment</h3>
                  <p className="text-sm text-gray-600">
                    You can terminate this agreement for any reason by giving us 30 days prior written notice.
                  </p>
                </div>

                {/* Agreement Type */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="font-bold text-gray-900 mb-2">Agreement Type: Travooz Traveler Preference</h3>
                  <p className="text-sm text-gray-600">
                    Travelers have the option to pay you when they stay, or pay us when they book. This is the most flexible payment option and appeals to the widest range of travelers.
                  </p>
                </div>

                {/* Compensation */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="font-bold text-gray-900 mb-2">18% Compensation</h3>
                  <p className="text-sm text-gray-600">
                    Travooz's compensation percentage only applies to confirmed bookings.
                  </p>
                </div>

                {/* Discount */}
                <div className="bg-white border-2 rounded-lg p-6" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="font-bold text-gray-900 mb-2">10% Exclusive Traveler Discount</h3>
                  <p className="text-sm text-gray-600">
                    A discount offered to exclusive traveler groups. These include loyalty program members, mobile app users, travelers purchasing packages (like rooms + flights, rooms + cars, etc.) and other high value groups.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    setError('');
                  }}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54] focus:ring-2"
                />
                <span className="text-sm text-gray-700">
                  By accepting, you acknowledge that you have read and agree to the Special Terms and the{' '}
                  <button
                    type="button"
                    onClick={() => {/* Open terms modal or navigate to terms page */}}
                    className="text-[#3CAF54] hover:underline font-medium"
                  >
                    General Terms
                  </button>
                  {' '}and that you are authorized to enter into this Lodging Agreement.
                </span>
              </label>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!accepted || isSubmitting}
                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accepted && !isSubmitting ? '#3CAF54' : '#9ca3af' }}
                onMouseEnter={(e) => accepted && !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                onMouseLeave={(e) => accepted && !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
              >
                <span>{isSubmitting ? 'Saving...' : 'Next'}</span>
                {!isSubmitting && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

