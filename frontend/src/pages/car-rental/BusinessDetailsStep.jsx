import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, FileText, Briefcase, FileEdit } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import carRentalSetupService from '../../services/carRentalSetupService';
import SetupProgressIndicator from '../../components/car-rental/SetupProgressIndicator';

export default function BusinessDetailsStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const step2Data = location.state?.step2Data || {};
  const carRentalBusinessId = location.state?.carRentalBusinessId || localStorage.getItem('car_rental_business_id');
  const resolvedUserId = userId || localStorage.getItem('car_rental_user_id');

  // Check if carRentalBusinessId is missing and redirect to login
  // Also check if email is verified - if not, redirect to email verification
  React.useEffect(() => {
    if (!carRentalBusinessId) {
      toast.error('Something went wrong. Please sign in again.');
      localStorage.removeItem('car_rental_user_id');
      localStorage.removeItem('car_rental_business_id');
      localStorage.removeItem('user');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user came from email verification
    // If not, and we don't have fromEmailVerification flag, redirect to email verification
    const fromEmailVerification = location.state?.fromEmailVerification;
    if (!fromEmailVerification && resolvedUserId && email) {
      // Check if email is verified by checking user profile
      const checkEmailVerification = async () => {
        try {
          // Try to get user profile to check email verification status
          const apiClient = (await import('../../services/apiClient')).default;
          try {
            const profileResponse = await apiClient.get('/car-rental/auth/profile');
            const userProfile = profileResponse.data?.data || profileResponse.data;
            
            // If email is not verified, redirect to email verification
            if (userProfile && userProfile.email_verified !== 1 && userProfile.email_verified !== true) {
              console.log('BusinessDetailsStep - Email not verified, redirecting to email verification');
              navigate('/car-rental/setup/email-verification', {
                state: {
                  ...location.state,
                  userId: resolvedUserId,
                  email: email,
                  userName: userName,
                  carRentalBusinessId: carRentalBusinessId
                },
                replace: true
              });
              return;
            }
          } catch (profileError) {
            // If profile check fails, assume email needs verification
            console.warn('BusinessDetailsStep - Could not verify email status, redirecting to email verification');
            navigate('/car-rental/setup/email-verification', {
              state: {
                ...location.state,
                userId: resolvedUserId,
                email: email,
                userName: userName,
                carRentalBusinessId: carRentalBusinessId
              },
              replace: true
            });
          }
        } catch (error) {
          console.error('BusinessDetailsStep - Error checking email verification:', error);
        }
      };
      
      checkEmailVerification();
    }
  }, [carRentalBusinessId, navigate, resolvedUserId, email, userName, location.state]);

  const [formData, setFormData] = useState({
    businessName: location.state?.businessDetails?.businessName || step2Data.carRentalBusinessName || '',
    businessType: location.state?.businessDetails?.businessType || '',
    shortDescription: location.state?.businessDetails?.shortDescription || step2Data.description || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const businessTypes = [
    'Car Rental Agency',
    'Taxi Service',
    'Ride-Sharing Service',
    'Luxury Car Rental',
    'Commercial Vehicle Rental',
    'Self-Drive Car Rental',
    'Chauffeur Service',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.trim().length < 20) {
      newErrors.shortDescription = 'Description must be at least 20 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!carRentalBusinessId) {
      toast.error('Unable to locate your car rental registration. Please restart the onboarding flow.');
      return;
    }

    const finalUserId = resolvedUserId || null;

    if (!finalUserId) {
      toast.error('Unable to determine the current user. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await carRentalSetupService.saveBusinessDetails({
        carRentalBusinessId: Number(carRentalBusinessId),
        userId: finalUserId,
        businessDetails: formData
      });
      
      // Save step progress
      try {
        await carRentalSetupService.saveStepData(carRentalBusinessId, 2, {
          businessName: formData.businessName,
          businessType: formData.businessType,
          shortDescription: formData.shortDescription
        });
        // Mark step as complete
        await carRentalSetupService.completeStep('business-details', carRentalBusinessId);
      } catch (progressError) {
        console.error('⚠️ Failed to save progress:', progressError);
        // Don't block navigation if progress save fails
      }
      
      toast.success('Business details saved successfully');
      
      navigate('/car-rental/setup/tax-payment', {
        state: {
          ...location.state,
          businessDetails: formData,
          carRentalBusinessId,
          userId: finalUserId,
          step2Data,
          email,
          userName
        }
      });
    } catch (error) {
      console.error('Error saving business details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save business details. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/car-rental/list-your-car-rental/step-3', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <SetupProgressIndicator currentStepKey="business-details" currentStepNumber={2} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Business Details
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide information about your car rental business or company.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Business / Car Rental Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                )}
              </div>

              {/* Business Type */}
              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Business *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all appearance-none bg-white ${
                      errors.businessType ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description of Your Business *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <FileEdit className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your business, services, specialties, and what makes you unique..."
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                      errors.shortDescription ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 20 characters. Describe your car rental services, vehicle types, and unique offerings.
                </p>
                {errors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                )}
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
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Saving...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
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















