import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';

export default function PaymentsPricingStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const businessDetails = location.state?.businessDetails || {};
  const media = location.state?.media || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Get restaurantId from multiple sources
  const restaurantIdFromState = location.state?.restaurantId;
  const restaurantIdFromStorage = localStorage.getItem('restaurant_id');
  const progressFromStorage = localStorage.getItem('restaurant_setup_progress');
  
  let restaurantId = restaurantIdFromState || restaurantIdFromStorage;
  if (!restaurantId && progressFromStorage) {
    try {
      const progress = JSON.parse(progressFromStorage);
      restaurantId = progress.restaurant_id;
    } catch (e) {
      console.error('Error parsing progress from storage:', e);
    }
  }

  // Store restaurantId in localStorage
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('restaurant_id', restaurantId);
    }
  }, [restaurantId]);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    averagePriceRange: location.state?.paymentsPricing?.averagePriceRange || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Load saved progress data when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!restaurantId) return;

      setIsLoadingProgress(true);
      try {
        const progress = await restaurantSetupService.getSetupProgress(restaurantId);
        
        if (progress && progress.step_data && progress.step_data.step_6) {
          const savedStep6Data = progress.step_data.step_6;
          
          setFormData(prev => ({
            ...prev,
            averagePriceRange: savedStep6Data.averagePriceRange || prev.averagePriceRange
          }));
        }
      } catch (error) {
        console.log('No saved progress found or error loading:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [restaurantId]);

  const priceRanges = [
    { value: '', label: '-- Select Price Range --' },
    { value: 'budget', label: 'Budget (Under $10)' },
    { value: 'moderate', label: 'Moderate ($10 - $25)' },
    { value: 'upscale', label: 'Upscale ($25 - $50)' },
    { value: 'fine-dining', label: 'Fine Dining ($50+)' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
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
    
    if (!formData.averagePriceRange) {
      newErrors.averagePriceRange = 'Please select an average price range';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back to the previous step and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save payments & pricing via API
      await restaurantSetupService.savePaymentsPricing(restaurantId, formData);
      
      // Navigate to next setup step (Capacity)
      navigate('/restaurant/setup/capacity', {
        state: {
          ...location.state,
          locationData,
          step2Data,
          businessDetails,
          media,
          paymentsPricing: formData,
          userId,
          email,
          userName,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving payments & pricing:', error);
      setSubmitError(error.message || 'Failed to save payments & pricing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/media', {
      state: {
        location: location.state?.location || '',
        locationData: locationData,
        step2Data: step2Data,
        businessDetails: businessDetails,
        media: media,
        userId,
        email,
        userName,
        restaurantId: restaurantId // Pass restaurantId when going back
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4 overflow-x-auto pb-2">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-max px-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold shadow-md flex-shrink-0" style={{ backgroundColor: '#3CAF54' }}>
                  4
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold flex-shrink-0" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  5
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold flex-shrink-0" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
                <div className="w-8 sm:w-16 h-0.5 sm:h-1 flex-shrink-0" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold flex-shrink-0" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm font-medium" style={{ color: '#1f6f31' }}>Setup Step 4 of 8</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Payments & Pricing
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Set your pricing information for customers.
            </p>

            {isLoadingProgress && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Loading your saved progress...</p>
              </div>
            )}

            {!restaurantId && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Restaurant ID is missing. Please go back to the previous step and complete the account creation process.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Average Price Range */}
              <div>
                <label htmlFor="averagePriceRange" className="block text-sm font-medium text-gray-700 mb-2">
                  Average Price Range per Meal *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="averagePriceRange"
                    name="averagePriceRange"
                    value={formData.averagePriceRange}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.averagePriceRange ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.averagePriceRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.averagePriceRange}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  This helps customers understand your pricing level
                </p>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
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
                      <span>Continue</span>
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

