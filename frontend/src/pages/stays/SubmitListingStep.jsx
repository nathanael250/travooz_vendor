import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileCheck, Building2, AlertCircle, Loader2 } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { staysSetupService } from '../../services/staysService';

export default function SubmitListingStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [incompleteSteps, setIncompleteSteps] = useState([]);

  // Map step keys to user-friendly names and routes
  const stepNames = {
    'step1_email': { name: 'Email Verification', route: '/stays/list-your-property/verify-email' },
    'step2_contract': { name: 'Contract Acceptance', route: '/stays/setup/contract' },
    'step3_policies': { name: 'Policies and Settings', route: '/stays/setup/policies' },
    'step4_amenities': { name: 'Property Amenities', route: '/stays/setup/amenities' },
    'step5_rooms': { name: 'Rooms and Rates', route: '/stays/setup/rooms' },
    'step7_promotions': { name: 'Promote Listing', route: '/stays/setup/promote-listing' },
    'step8_images': { name: 'Image Management', route: '/stays/setup/images' },
    'step9_taxes': { name: 'Tax Details', route: '/stays/setup/taxes' },
    'step10_connectivity': { name: 'Connectivity Settings', route: '/stays/setup/connectivity' }
  };

  const handleSubmit = async () => {
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    if (!propertyId || propertyId === 0) {
      setSubmitError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setIncompleteSteps([]);

    try {
      // Submit listing via API
      const result = await staysSetupService.submitListing(propertyId);
      
      if (result.success) {
        // Mark setup as complete in localStorage
        localStorage.setItem('stays_setup_complete', 'true');
        
        // Navigate to dashboard
        navigate('/stays/dashboard', {
          state: {
            ...location.state,
            setupComplete: true,
            listingSubmitted: true,
            propertyId
          }
        });
      } else {
        // Show incomplete steps if provided
        if (result.incompleteSteps && Array.isArray(result.incompleteSteps) && result.incompleteSteps.length > 0) {
          setIncompleteSteps(result.incompleteSteps);
        }
        setSubmitError(result.message || 'Failed to submit listing. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      
      // Extract incompleteSteps from error (could be in error.incompleteSteps or error.response?.data?.incompleteSteps)
      const incompleteStepsList = error.incompleteSteps || error.response?.data?.incompleteSteps || [];
      
      if (incompleteStepsList.length > 0) {
        setIncompleteSteps(incompleteStepsList);
      }
      
      // Extract error message
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit listing. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToStep = (stepKey) => {
    const step = stepNames[stepKey];
    if (step) {
      const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
      navigate(step.route, {
        state: {
          ...location.state,
          propertyId: propertyId > 0 ? propertyId : location.state?.propertyId
        }
      });
    }
  };

  const handleBack = () => {
    navigate('/stays/setup/review', {
      state: location.state
    });
  };

  const handleGoAboveAndBeyond = () => {
    // Navigate back to rooms section to add more room types
    navigate('/stays/setup/rooms', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Link */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Submit for Review */}
            <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Before you can go live, we'll need to check a few details
              </h1>
              <p className="text-gray-600 mb-8">
                We'll look over your listing and let you know if we have any questions or concerns. 
                You can expect to hear back from us in 2 to 3 days.
              </p>
              
              {/* Error Display */}
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    {submitError}
                  </p>
                  
                  {/* Show incomplete steps */}
                  {incompleteSteps.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-red-700 mb-2">Please complete the following steps:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {incompleteSteps.map((stepKey) => {
                          const step = stepNames[stepKey];
                          if (step) {
                            return (
                              <li key={stepKey} className="text-sm text-red-600">
                                <button
                                  type="button"
                                  onClick={() => handleGoToStep(stepKey)}
                                  className="underline hover:text-red-800 font-medium"
                                >
                                  {step.name}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>

            {/* Right Section - Illustration */}
            <div className="flex items-center justify-center">
              <div className="bg-blue-50 rounded-lg p-12 flex items-center justify-center">
                <div className="relative">
                  <FileCheck className="h-32 w-32 text-blue-400" />
                  <div className="absolute -bottom-2 -right-2">
                    <div className="w-12 h-12 bg-[#3CAF54] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Below and Beyond Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want to go above and beyond?
            </h2>
            <p className="text-gray-600 mb-6">
              By adding a little more detail, you can make your property more attractive for travellers to book.
            </p>
            
            {/* Interactive Card */}
            <button
              type="button"
              onClick={handleGoAboveAndBeyond}
              className="w-full bg-white rounded-lg shadow-lg border-2 hover:border-[#3CAF54] transition-all p-6 flex items-center gap-6 group"
              style={{ borderColor: '#dcfce7' }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#3CAF54] transition-colors">
                  Give travellers flexibility with more room types and rate plans
                </h3>
                <p className="text-sm text-gray-600">
                  Offer a range of choices to travellers through different rate plans and room types, giving them more options to find the perfect stay for their needs.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-[#3CAF54] transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

