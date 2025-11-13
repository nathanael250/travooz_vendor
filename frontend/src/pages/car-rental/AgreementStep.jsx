import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import carRentalSetupService from '../../services/carRentalSetupService';

export default function AgreementStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const businessDetails = location.state?.businessDetails || {};
  const taxPayment = location.state?.taxPayment || {};
  const carRental = location.state?.carRental || null;
  const userId = location.state?.userId;
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');

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

    if (!carRentalBusinessId) {
      toast.error('Unable to locate your car rental registration. Please restart the onboarding flow.');
      return;
    }

    const finalUserId = userId || localStorage.getItem('car_rental_user_id');

    if (!finalUserId) {
      toast.error('Unable to determine the current user. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await carRentalSetupService.submitAgreement({
        carRentalBusinessId: Number(carRentalBusinessId),
        userId: finalUserId
      });
      
      toast.success('Registration submitted successfully!');
      
      navigate('/car-rental/setup/complete', {
        state: {
          ...location.state,
          businessDetails,
          taxPayment,
          carRental,
          userId: finalUserId,
          carRentalBusinessId
        }
      });
    } catch (error) {
      console.error('Error submitting agreement:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit registration. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/car-rental/setup/review', {
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
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  7
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  8
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 7 of 8: Sign Agreement & Submit</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Sign Agreement & Submit
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
                      As a vendor on our platform, you agree to provide accurate information about your car rentals, 
                      maintain high service standards, and comply with all applicable laws and regulations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Booking and Payment</h4>
                    <p className="mb-2">
                      All bookings made through the platform are subject to our booking policies. Payments will be 
                      processed according to the payment method you selected during registration.
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
                    <h4 className="font-semibold mb-2">4. Platform Fees</h4>
                    <p className="mb-2">
                      Platform fees and commission rates will be communicated separately. You agree to pay all 
                      applicable fees as outlined in our fee structure.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">5. Account Verification</h4>
                    <p className="mb-2">
                      Your account and documents will be reviewed by our team. Approval is subject to verification 
                      of all submitted information and documents.
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
                  information provided is accurate. I understand that my account will be reviewed before approval.
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
                    <ArrowLeft className="h-5 w-5" />
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
                      <span>Submit Registration</span>
                      <ArrowRight className="h-5 w-5" />
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















