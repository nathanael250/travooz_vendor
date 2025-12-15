import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, FileText, Phone, Mail, Globe, Clock, FileEdit } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService, restaurantOnboardingProgressService } from '../../services/eatingOutService';
import SetupProgressIndicator from '../../components/restaurant/SetupProgressIndicator';

export default function BusinessDetailsStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Get restaurantId from state, localStorage, or progress
  const restaurantIdFromState = location.state?.restaurantId;
  const restaurantIdFromStorage = localStorage.getItem('restaurant_id');
  const progressFromStorage = localStorage.getItem('restaurant_setup_progress');
  
  // Determine restaurantId - prioritize state, then storage, then progress
  let restaurantId = restaurantIdFromState || restaurantIdFromStorage;
  if (!restaurantId && progressFromStorage) {
    try {
      const progress = JSON.parse(progressFromStorage);
      restaurantId = progress.restaurant_id;
    } catch (e) {
      console.error('Error parsing progress from storage:', e);
    }
  }

  // Store restaurantId in localStorage if we have it
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('restaurant_id', restaurantId);
    }
  }, [restaurantId]);

  // Check authentication and email verification on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // Check if user is logged in
      if (!storedUser || !storedToken) {
        console.warn('BusinessDetailsStep - No user or token found, redirecting to login');
        navigate('/restaurant/login', { replace: true });
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        const finalUserId = userId || user.user_id || user.id;
        
        // Verify token is valid by checking profile
        const apiClient = (await import('../../services/apiClient')).default;
        try {
          await apiClient.get('/eating-out/setup/auth/profile');
        } catch (authError) {
          if (authError.response?.status === 401) {
            console.warn('BusinessDetailsStep - Token invalid, redirecting to login');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            navigate('/restaurant/login', { replace: true });
            return;
          }
        }

        // Check email verification status
        if (finalUserId) {
          try {
            const progress = await restaurantSetupService.getSetupProgress(restaurantId || user.restaurant_id);
            // If we can't get progress, user might not have completed steps 1-3
            if (!progress || !progress.step_1_3_complete) {
              console.warn('BusinessDetailsStep - Steps 1-3 not complete, redirecting to step 3');
              navigate('/restaurant/list-your-restaurant/step-3', { replace: true });
              return;
            }
          } catch (progressError) {
            console.error('BusinessDetailsStep - Error checking progress:', progressError);
            // Don't block if progress check fails, but log it
          }
        }
      } catch (error) {
        console.error('BusinessDetailsStep - Error checking auth:', error);
        navigate('/restaurant/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, userId, restaurantId]);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    restaurantName: step2Data.restaurantName || '',
    businessRegistrationNumber: '',
    contactNumber: step2Data.phone || '',
    emailAddress: email || '',
    website: '',
    socialMediaLinks: '',
    is24Hours: false,
    openingTime: '',
    closingTime: '',
    shortDescription: step2Data.description || '',
    operatingSchedule: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
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
        // First, try to get the actual restaurant data from the database
        try {
          const restaurantData = await restaurantSetupService.getRestaurant(restaurantId);
          
          if (restaurantData) {
            // Map database fields to form fields
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            let mappedSchedule = {};
            
            // If restaurant has schedules, map them
            if (restaurantData.schedules && Array.isArray(restaurantData.schedules) && restaurantData.schedules.length > 0) {
              restaurantData.schedules.forEach((schedule) => {
                const dayIndex = schedule.day_of_week;
                if (dayIndex >= 0 && dayIndex < dayNames.length) {
                  const dayName = dayNames[dayIndex];
                  mappedSchedule[dayName] = {
                    open: schedule.opens || '',
                    close: schedule.closes || '',
                    closed: schedule.is_closed === 1 || schedule.is_closed === true
                  };
                }
              });
            }
            
            // Update form with restaurant data
            setFormData(prev => {
              // Map database schedules to form format
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              let mappedSchedule = {};
              
              // If restaurant has schedules, map them
              if (restaurantData.schedules && Array.isArray(restaurantData.schedules) && restaurantData.schedules.length > 0) {
                restaurantData.schedules.forEach((schedule) => {
                  const dayIndex = schedule.day_of_week;
                  if (dayIndex >= 0 && dayIndex < dayNames.length) {
                    const dayName = dayNames[dayIndex];
                    mappedSchedule[dayName] = {
                      open: schedule.opens || '',
                      close: schedule.closes || '',
                      closed: schedule.is_closed === 1 || schedule.is_closed === true
                    };
                  }
                });
              }
              
              return {
                ...prev,
                restaurantName: restaurantData.name || prev.restaurantName,
                businessRegistrationNumber: restaurantData.business_registration_number || prev.businessRegistrationNumber,
                contactNumber: restaurantData.contact_number || prev.contactNumber,
                emailAddress: restaurantData.email_address || prev.emailAddress,
                website: restaurantData.website || prev.website,
                socialMediaLinks: restaurantData.social_media_links || prev.socialMediaLinks,
                is24Hours: restaurantData.is_24_hours === 1 || restaurantData.is_24_hours === true || prev.is24Hours,
                openingTime: restaurantData.opening_time || prev.openingTime,
                closingTime: restaurantData.closing_time || prev.closingTime,
                shortDescription: restaurantData.description || prev.shortDescription,
                operatingSchedule: Object.keys(mappedSchedule).length > 0 ? mappedSchedule : prev.operatingSchedule,
              };
            });
          }
        } catch (restaurantError) {
          console.log('Could not fetch restaurant data, trying progress data:', restaurantError);
        }
        
        // Also try to get progress from API as fallback
        try {
          const progress = await restaurantSetupService.getSetupProgress(restaurantId);
          
          if (progress && progress.step_data && progress.step_data.step_4) {
            const savedStep4Data = progress.step_data.step_4;
            
            // Only update fields that weren't already set from restaurant data
            setFormData(prev => ({
              ...prev,
              restaurantName: prev.restaurantName || savedStep4Data.restaurantName,
              businessRegistrationNumber: prev.businessRegistrationNumber || savedStep4Data.businessRegistrationNumber,
              contactNumber: prev.contactNumber || savedStep4Data.contactNumber,
              emailAddress: prev.emailAddress || savedStep4Data.emailAddress,
              website: prev.website || savedStep4Data.website,
              socialMediaLinks: prev.socialMediaLinks || savedStep4Data.socialMediaLinks,
              is24Hours: prev.is24Hours !== false ? (savedStep4Data.is24Hours || prev.is24Hours) : prev.is24Hours,
              openingTime: prev.openingTime || savedStep4Data.openingTime,
              closingTime: prev.closingTime || savedStep4Data.closingTime,
              shortDescription: prev.shortDescription || savedStep4Data.shortDescription,
              operatingSchedule: (prev.operatingSchedule && Object.keys(prev.operatingSchedule).length > 0) 
                ? prev.operatingSchedule 
                : (savedStep4Data.operatingSchedule || prev.operatingSchedule),
            }));
          }
        } catch (progressError) {
          console.log('No saved progress found:', progressError);
        }
      } catch (error) {
        console.log('Error loading saved data:', error);
        // Not an error - user might be filling this step for the first time
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [restaurantId]);

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

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        [day]: {
          ...prev.operatingSchedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        [day]: {
          ...prev.operatingSchedule[day],
          closed: !prev.operatingSchedule[day].closed
        }
      }
    }));
  };

  const applyToAllDays = (field, value) => {
    setFormData(prev => {
      const newSchedule = { ...prev.operatingSchedule };
      Object.keys(newSchedule).forEach(day => {
        if (!newSchedule[day].closed) {
          newSchedule[day] = {
            ...newSchedule[day],
            [field]: value
          };
        }
      });
      return {
        ...prev,
        operatingSchedule: newSchedule
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
    } else if (!formData.emailAddress.includes('@')) {
      newErrors.emailAddress = 'Invalid email format';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use the restaurantId we determined earlier
    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back to the previous step and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save business details via API
      await restaurantSetupService.saveBusinessDetails(restaurantId, formData);
      // Persist operating schedule separately to backend table
      try {
        await restaurantSetupService.saveOperatingSchedule(restaurantId, { operatingSchedule: formData.operatingSchedule, exceptions: [] });
      } catch (scheduleErr) {
        // Don't block the flow if schedule save fails; log for debugging
        console.warn('BusinessDetailsStep - Failed to save operating schedule:', scheduleErr);
      }
      
      // Navigate to next setup step (Media)
      navigate('/restaurant/setup/media', {
        state: {
          ...location.state,
          locationData,
          step2Data,
          userId,
          email,
          userName,
          businessDetails: formData,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving business details:', error);
      setSubmitError(error.message || 'Failed to save business details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/list-your-restaurant/step-3', {
      state: {
        location: location.state?.location || '',
        locationData: locationData,
        step2Data: step2Data,
        restaurantId: restaurantId, // Pass restaurantId when going back
        userId: userId,
        email: email,
        userName: userName
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <SetupProgressIndicator currentStepKey="business-details" currentStepNumber={4} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Business Details
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide your restaurant's business information.
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Enter restaurant name"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.restaurantName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.restaurantName && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
                )}
              </div>

              {/* Business Registration Number */}
              <div>
                <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="businessRegistrationNumber"
                    name="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={handleChange}
                    placeholder="Enter business registration number (optional)"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Contact Number and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+250 7XX XXX XXX"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="emailAddress"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="restaurant@example.com"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.emailAddress ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.emailAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Operating Hours
                </label>
                
                {/* 24/7 Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is24Hours"
                      checked={formData.is24Hours}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      style={{ accentColor: '#3CAF54' }}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Open 24/7 (All Days)
                    </span>
                  </label>
                </div>

                {/* Weekly Schedule - Only show if not 24/7 */}
                {!formData.is24Hours && (
                  <div className="space-y-3 border-2 rounded-lg p-3 sm:p-4" style={{ borderColor: '#dcfce7' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <p className="text-sm font-medium text-gray-700">Weekly Schedule</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const defaultTime = formData.operatingSchedule.monday.open;
                            applyToAllDays('open', defaultTime);
                          }}
                          className="text-xs px-2 py-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
                        >
                          Apply Open Time to All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultTime = formData.operatingSchedule.monday.close;
                            applyToAllDays('close', defaultTime);
                          }}
                          className="text-xs px-2 py-1.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
                        >
                          Apply Close Time to All
                        </button>
                      </div>
                    </div>
                    
                    {Object.entries(formData.operatingSchedule).map(([day, hours]) => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="w-20 sm:w-24 flex-shrink-0">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">{day}</h4>
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={!hours.closed}
                              onChange={() => handleDayToggle(day)}
                              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                              style={{ accentColor: '#3CAF54' }}
                            />
                            <span className="text-sm text-gray-700 whitespace-nowrap">Open</span>
                          </label>
                        </div>
                        
                        {!hours.closed ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-3 sm:flex-shrink-0">
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                              <label className="text-xs text-gray-600 whitespace-nowrap">Open:</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                                className="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500 min-w-0"
                              />
                            </div>
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                              <label className="text-xs text-gray-600 whitespace-nowrap">Close:</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                                className="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500 min-w-0"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-red-600 font-medium sm:flex-shrink-0">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Restaurant Description *
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
                    rows={4}
                    placeholder="Describe your restaurant, cuisine, atmosphere, etc."
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                      errors.shortDescription ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                )}
              </div>

              {/* Location Display */}
              {locationData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Selected Location:</p>
                  <p className="text-sm text-green-700">{locationData.formatted_address}</p>
                </div>
              )}

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

