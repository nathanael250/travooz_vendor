import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
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

  // Check restaurant status
  const checkRestaurantStatus = async () => {
    if (!restaurantId) {
      setIsChecking(false);
      return;
    }

    try {
      const restaurant = await restaurantsAPI.getById(restaurantId);
      const status = restaurant?.status || restaurant?.data?.status;
      setRestaurantStatus(status);
      setIsChecking(false);

      // If approved (active), redirect to dashboard
      if (status === 'active') {
        toast.success('Your restaurant has been approved! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/restaurant/dashboard', { replace: true });
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Error checking restaurant status:', error);
      setIsChecking(false);
    }
  };

  // Check status on mount and periodically
  useEffect(() => {
    if (restaurantId) {
      checkRestaurantStatus();
      
      // Check every 10 seconds for status updates
      const intervalId = setInterval(() => {
        checkRestaurantStatus();
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [restaurantId]);

  const handleGoToDashboard = async () => {
    // Check status first
    if (restaurantId) {
      try {
        const restaurant = await restaurantsAPI.getById(restaurantId);
        const status = restaurant?.status || restaurant?.data?.status;
        
        if (status === 'active') {
          navigate('/restaurant/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }
    
    // Navigate to dashboard even if pending (user can see status there)
    navigate('/restaurant/dashboard', { replace: true });
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
            <p className="text-gray-600">Checking restaurant status...</p>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  // If approved, show success message
  if (restaurantStatus === 'active') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="h-12 w-12" style={{ color: '#3CAF54' }} />
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Restaurant Approved! 🎉
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Your restaurant has been approved and is now live on the platform!
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleGoToDashboard}
                  className="px-8 py-4 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
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
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-2xl w-full mx-auto">
          {/* Success Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                <CheckCircle className="h-12 w-12" style={{ color: '#3CAF54' }} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Setup Complete!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for completing your restaurant setup. Your information has been submitted successfully.
              </p>
            </div>

            {/* Review Notice */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 mb-6" style={{ borderColor: '#bfdbfe' }}>
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Review in Progress
                  </h3>
                  <p className="text-blue-800 mb-3">
                    Our Travooz staff team needs to review your restaurant information before making it live on the platform.
                  </p>
                  <p className="text-blue-700 text-sm">
                    This process typically takes 24-48 hours. You'll be notified once your restaurant is approved and goes live.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Next?
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitor your dashboard for updates on your restaurant's approval status</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You can update your restaurant information anytime from the dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Once approved, your restaurant will be visible to customers on the platform</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGoToDashboard}
                className="px-8 py-4 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Wait in the Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

