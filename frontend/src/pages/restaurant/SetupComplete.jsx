import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, LogOut } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantsAPI } from '../../services/restaurantDashboardService';
import toast from 'react-hot-toast';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Get restaurant ID from location state or try to find user's restaurant
  useEffect(() => {
    const idFromState = location.state?.restaurantId;
    if (idFromState) {
      setRestaurantId(idFromState);
      localStorage.setItem('restaurant_id', idFromState);
    } else {
      // Try to get from localStorage
      const storedId = localStorage.getItem('restaurant_id');
      if (storedId) {
        setRestaurantId(storedId);
      } else {
        // Try to fetch user's restaurants
        fetchUserRestaurants();
      }
    }
  }, [location]);

  // Also check restaurant status from user data if restaurantId is not available
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData && !restaurantId) {
      try {
        const user = JSON.parse(userData);
        if (user.restaurant_id) {
          setRestaurantId(user.restaurant_id);
          localStorage.setItem('restaurant_id', user.restaurant_id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [restaurantId]);

  const fetchUserRestaurants = async () => {
    try {
      const restaurants = await restaurantsAPI.getAll();
      if (restaurants && restaurants.length > 0) {
        const firstRestaurant = restaurants[0];
        setRestaurantId(firstRestaurant.id);
        localStorage.setItem('restaurant_id', firstRestaurant.id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Prevent multiple redirects
  const redirectRef = useRef(false);

  // Check restaurant status
  const checkRestaurantStatus = async () => {
    // If already redirecting, don't check again
    if (redirectRef.current) {
      console.log('⏸️ Redirect already in progress, skipping status check');
      return;
    }

    // Try to get restaurant ID if not available
    let currentRestaurantId = restaurantId;
    if (!currentRestaurantId) {
      // Try to get from localStorage
      currentRestaurantId = localStorage.getItem('restaurant_id');
      if (currentRestaurantId) {
        setRestaurantId(currentRestaurantId);
      } else {
        // Try to get from API
        try {
          const myRestaurant = await restaurantsAPI.getMyRestaurant();
          if (myRestaurant && myRestaurant.id) {
            currentRestaurantId = myRestaurant.id;
            setRestaurantId(currentRestaurantId);
            localStorage.setItem('restaurant_id', currentRestaurantId);
          }
        } catch (error) {
          console.error('Error fetching restaurant:', error);
        }
      }
    }

    if (!currentRestaurantId) {
      setIsChecking(false);
      return;
    }

    // First, check if email is verified - if not, redirect to email verification
    // Setup progress is only created after email verification (step 1-3), so if it doesn't exist,
    // the user needs to verify their email first
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user.user_id || user.id;
        const userEmail = user.email;
        
        if (userId && userEmail) {
          // Check if setup progress exists - if not, email is not verified
          const { restaurantSetupService } = await import('../../services/eatingOutService');
          try {
            const progress = await restaurantSetupService.getSetupProgress(currentRestaurantId);
            
            // If progress exists, email is verified (progress is created after email verification)
            console.log('🔍 Setup progress exists - email is verified');
          } catch (progressError) {
            // If progress doesn't exist (404), user hasn't verified email yet
            // OR if error mentions email verification, redirect to email verification
            const errorMessage = progressError?.response?.data?.message || progressError?.message || '';
            const isNotFound = progressError?.response?.status === 404;
            const isEmailError = errorMessage.toLowerCase().includes('email verification') || 
                                errorMessage.toLowerCase().includes('email_verified') ||
                                errorMessage.toLowerCase().includes('email verification required');
            
            if (isNotFound || isEmailError) {
              console.log('📧 Email not verified or setup not complete - redirecting to email verification');
              redirectRef.current = true;
              navigate('/restaurant/setup/email-verification', {
                state: {
                  userId,
                  email: userEmail,
                  userName: user.name || userEmail.split('@')[0],
                  restaurantId: currentRestaurantId,
                  fromSetupComplete: true
                },
                replace: true
              });
              return;
            }
            // If it's a different error, continue with status check
            console.warn('⚠️ Error checking setup progress (non-email error):', progressError);
          }
        }
      }
    } catch (emailCheckError) {
      console.error('Error checking email verification:', emailCheckError);
      // Continue with status check even if email check fails
    }

    try {
      // Try getById first, then fallback to getMyRestaurant
      let restaurant = null;
      let status = null;
      
      try {
        restaurant = await restaurantsAPI.getById(currentRestaurantId);
        // If restaurant is null and we have restaurant_id in session, it was deleted
        if (restaurant === null && localStorage.getItem('restaurant_id') === currentRestaurantId) {
          console.log('⚠️ Restaurant was deleted - logout handled by getById');
          return;
        }
        status = restaurant?.status || restaurant?.data?.status;
        console.log('🔍 Restaurant status from getById:', status, 'Restaurant:', restaurant);
      } catch (getByIdError) {
        // Check if it's a restaurant not found error
        const { isRestaurantNotFoundError } = await import('../../utils/restaurantAuth');
        if (isRestaurantNotFoundError(getByIdError)) {
          console.log('⚠️ Restaurant not found error - logout handled');
          return;
        }
        console.log('⚠️ getById failed, trying getMyRestaurant:', getByIdError.message);
        const myRestaurant = await restaurantsAPI.getMyRestaurant();
        // If restaurant is null and we have restaurant_id in session, it was deleted
        if (myRestaurant === null && localStorage.getItem('restaurant_id')) {
          console.log('⚠️ Restaurant was deleted - logout handled by getMyRestaurant');
          return;
        }
        if (myRestaurant) {
          restaurant = myRestaurant;
          status = myRestaurant.status || myRestaurant.data?.status;
          console.log('🔍 Restaurant status from getMyRestaurant:', status, 'Restaurant:', myRestaurant);
        }
      }

      if (status !== null && status !== undefined) {
        // Normalize status to lowercase for comparison
        const normalizedStatus = String(status).trim().toLowerCase();
        setRestaurantStatus(normalizedStatus);
        setIsChecking(false);

        console.log('🔍 SetupComplete - Status check:', {
          rawStatus: status,
          normalizedStatus: normalizedStatus,
          isActive: normalizedStatus === 'active'
        });

        // If approved, redirect to dashboard (only once)
        if ((normalizedStatus === 'approved' || normalizedStatus === 'active') && !redirectRef.current) {
          redirectRef.current = true;
          console.log('✅ Restaurant is approved! Redirecting to dashboard...');
          toast.success('Your restaurant has been approved! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/restaurant/dashboard', { replace: true });
          }, 1500);
          return;
        } else {
          console.log('⏳ Restaurant status is:', normalizedStatus, '- showing waiting page');
        }
      } else {
        console.log('⚠️ No status found for restaurant (status is null/undefined)');
        // If no status, assume pending
        setRestaurantStatus('pending');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('❌ Error checking restaurant status:', error);
      setIsChecking(false);
    }
  };

  // Check status on mount and periodically
  useEffect(() => {
    // Check immediately on mount
    checkRestaurantStatus();
    
    // Check every 10 seconds for status updates
    const intervalId = setInterval(() => {
      checkRestaurantStatus();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [restaurantId]); // Re-run when restaurantId changes

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('restaurant_id');
    localStorage.removeItem('restaurant_setup_progress');
    
    toast.success('Logged out successfully');
    
    // Navigate to login page
    navigate('/restaurant/login', { replace: true });
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#3CAF54] mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Checking restaurant status...</p>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  // If approved, show success message (check normalized status)
  const normalizedCurrentStatus = restaurantStatus ? String(restaurantStatus).toLowerCase() : null;
  if (normalizedCurrentStatus === 'approved' || normalizedCurrentStatus === 'active') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 border" style={{ borderColor: '#dcfce7' }}>
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#3CAF54' }} />
                </div>
              </div>
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Restaurant Approved! 🎉
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Your restaurant is now live on the platform!
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                >
                  <span>Logout</span>
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="max-w-2xl w-full mx-auto">
          {/* Success Content */}
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Success Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#3CAF54' }} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Restaurant Setup Complete!
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Your information has been submitted successfully.
              </p>
            </div>

            {/* Review Notice */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border-2 mb-6" style={{ borderColor: '#bfdbfe' }}>
              <div className="flex items-start gap-3 sm:gap-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-1.5 sm:mb-2">
                    Review in Progress
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 mb-2 sm:mb-3">
                    Our team is reviewing your restaurant information.
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700">
                    This typically takes 24-48 hours. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Logout</span>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

