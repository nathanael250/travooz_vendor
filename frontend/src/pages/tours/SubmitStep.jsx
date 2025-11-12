import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, Check } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';
import toast from 'react-hot-toast';

export default function SubmitStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const step2Data = location.state?.step2Data || {};
  const businessOwnerInfo = location.state?.businessOwnerInfo || {};
  const identityProof = location.state?.identityProof || {};
  const businessProof = location.state?.businessProof || {};
  const userId = location.state?.userId;
  const tourBusinessId = location.state?.tourBusinessId || localStorage.getItem('tour_business_id');

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreed) {
      toast.error('Please accept the terms and conditions to continue');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!tourBusinessId) {
        throw new Error('Tour business ID is required. Please go back and complete the previous steps.');
      }
      
      // Submit all information for verification
      await tourPackageSetupService.submitForVerification(tourBusinessId);
      
      toast.success('Registration submitted successfully!');
      
      // Navigate to completion page
      navigate('/tours/setup/complete', {
        state: {
          ...location.state,
          step2Data,
          businessOwnerInfo,
          identityProof,
          businessProof,
          userId,
          tourBusinessId
        }
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit registration. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tours/setup/review', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  6
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 6 of 6: Submit for Verification</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Submit for Verification
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please review and accept the platform terms and conditions to finalize your registration.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Terms and Conditions */}
              <div className="border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Terms and Conditions / Vendor Agreement</h3>
                
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold mb-2">1. Vendor Responsibilities</h4>
                    <p className="mb-2">
                      As a vendor on our platform, you agree to provide accurate information about your tour packages, 
                      maintain high service standards, and comply with all applicable laws and regulations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Verification Process</h4>
                    <p className="mb-2">
                      All business information, identity documents, and professional certificates will be verified by our team. 
                      Approval is subject to verification of all submitted information and documents.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Content and Listings</h4>
                    <p className="mb-2">
                      You are responsible for the accuracy of all information, images, and content you provide. 
                      Misleading or false information may result in account suspension or termination.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">4. Legal Compliance</h4>
                    <p className="mb-2">
                      You confirm that all information provided is valid and legally accepted. You have the legal right 
                      to operate your tour business and all documents submitted are authentic.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">5. Account Verification</h4>
                    <p className="mb-2">
                      Your account and documents will be reviewed by our team. Approval is subject to verification 
                      of all submitted information and documents. Once approved, you can start creating tour packages.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">6. Termination</h4>
                    <p className="mb-2">
                      Either party may terminate this agreement with appropriate notice. Violation of terms may 
                      result in immediate termination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  style={{ accentColor: '#3CAF54' }}
                />
                <label htmlFor="agreement" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">I agree to the terms and conditions</span> and confirm that all 
                  information provided is accurate and legally valid. I understand that my account will be reviewed before approval.
                </label>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowRight className="h-5 w-5 rotate-180" />
                    <span>Back</span>
                  </div>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !agreed}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && agreed && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && agreed && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Submitting...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Submit for Verification</span>
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

