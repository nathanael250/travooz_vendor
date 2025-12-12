import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Users } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';
import toast from 'react-hot-toast';
import SetupProgressIndicator from '../../components/restaurant/SetupProgressIndicator';

export default function CapacityStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    capacity: location.state?.capacity || '',
    availableSeats: location.state?.availableSeats || ''
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
        
        if (progress && progress.step_data && progress.step_data.step_7) {
          const savedStep7Data = progress.step_data.step_7;
          
          setFormData(prev => ({
            ...prev,
            capacity: savedStep7Data.capacity?.toString() || prev.capacity,
            availableSeats: savedStep7Data.availableSeats?.toString() || prev.availableSeats
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-calculate available seats if capacity is set
    if (name === 'capacity' && numericValue) {
      const capacityNum = parseInt(numericValue) || 0;
      const currentAvailable = parseInt(formData.availableSeats) || capacityNum;
      // Available seats should not exceed capacity
      if (currentAvailable > capacityNum) {
        setFormData(prev => ({
          ...prev,
          availableSeats: numericValue
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Total capacity is required';
    } else {
      const capacityNum = parseInt(formData.capacity);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        newErrors.capacity = 'Capacity must be a positive number';
      } else if (capacityNum > 10000) {
        newErrors.capacity = 'Capacity seems too high. Please enter a reasonable number.';
      }
    }

    if (!formData.availableSeats.trim()) {
      newErrors.availableSeats = 'Available seats is required';
    } else {
      const availableNum = parseInt(formData.availableSeats);
      const capacityNum = parseInt(formData.capacity) || 0;
      if (isNaN(availableNum) || availableNum < 0) {
        newErrors.availableSeats = 'Available seats must be a non-negative number';
      } else if (availableNum > capacityNum) {
        newErrors.availableSeats = 'Available seats cannot exceed total capacity';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await restaurantSetupService.saveCapacity(restaurantId, {
        capacity: parseInt(formData.capacity),
        availableSeats: parseInt(formData.availableSeats)
      });

      toast.success('Restaurant capacity saved successfully!');
      
      // Navigate to next step (Tax & Legal)
      navigate('/restaurant/setup/tax-legal', {
        state: {
          ...location.state,
          capacity: formData.capacity,
          availableSeats: formData.availableSeats,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving capacity:', error);
      const errorMessage = error.message || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to save capacity. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/setup/media', {
      state: {
        ...location.state,
        restaurantId: restaurantId // Pass restaurantId when going back
      }
    });
  };

  const capacityNum = parseInt(formData.capacity) || 0;
  const availableNum = parseInt(formData.availableSeats) || 0;
  const occupiedSeats = capacityNum - availableNum;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-2xl w-full mx-auto">
          {/* Progress Indicator */}
          <SetupProgressIndicator currentStep={7} totalSteps={11} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                How is your restaurant capacity?
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Configure your restaurant's seating capacity. This information helps customers book tables for dine-in.
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
              {/* Total Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity (Number of Seats) *
                </label>
                <input
                  type="text"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter the maximum number of people your restaurant can accommodate at once.
                </p>
              </div>

              {/* Available Seats */}
              <div>
                <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 mb-2">
                  Currently Available Seats *
                </label>
                <input
                  type="text"
                  id="availableSeats"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.availableSeats ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.availableSeats && (
                  <p className="mt-1 text-sm text-red-600">{errors.availableSeats}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter how many seats are currently available (not occupied or reserved).
                </p>
              </div>

              {/* Capacity Summary */}
              {capacityNum > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border-2" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Capacity Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#3CAF54' }}>{capacityNum}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Capacity</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{availableNum}</p>
                      <p className="text-xs text-gray-600 mt-1">Available</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{occupiedSeats}</p>
                      <p className="text-xs text-gray-600 mt-1">Occupied</p>
                    </div>
                  </div>
                </div>
              )}

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
                  style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
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

