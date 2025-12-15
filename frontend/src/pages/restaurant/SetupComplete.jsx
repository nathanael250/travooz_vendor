import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, LogOut, XCircle, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantsAPI } from '../../services/restaurantDashboardService';
import { restaurantOnboardingProgressService } from '../../services/eatingOutService';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('pending'); // 'pending' or 'approved'

  useEffect(() => {
    // Check restaurant status and onboarding progress
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        // First, check onboarding progress to see if setup is actually complete
        try {
          const progressData = await restaurantOnboardingProgressService.getProgress();
          if (progressData && progressData.progress) {
            const progress = progressData.progress;
            const stepMapping = progressData.stepMapping || {};
            
            // Check if setup is incomplete (not at 'complete' step)
            const isComplete = progress.current_step === 'complete' || progress.is_complete;
            
            if (!isComplete) {
              // Setup is not complete - redirect to the current step
              const currentStepInfo = stepMapping[progress.current_step];
              const targetRoute = currentStepInfo?.route || '/restaurant/setup/business-details';
              
              console.log('🔄 SetupComplete - Setup incomplete, redirecting to step:', progress.current_step, '->', targetRoute);
              
              // Store progress data in localStorage for restoration
              localStorage.setItem('restaurant_setup_progress', JSON.stringify(progress));
              if (progress.restaurant_id) {
                localStorage.setItem('restaurant_id', progress.restaurant_id);
              }
              
              navigate(targetRoute, { 
                replace: true,
                state: { 
                  progress,
                  restaurantId: progress.restaurant_id 
                }
              });
              return;
            }
          }
        } catch (progressError) {
          console.log('⚠️ Could not check onboarding progress:', progressError);
          // Continue to check restaurant status
        }

        const myRestaurant = await restaurantsAPI.getMyRestaurant();
        
        // If restaurant is null and we have restaurant_id in session, it was deleted
        if (myRestaurant === null && localStorage.getItem('restaurant_id')) {
          console.log('⚠️ Restaurant was deleted - logout handled by getMyRestaurant');
          return;
        }
        
        if (!myRestaurant) {
          // No restaurant found - redirect to start
          console.log('⚠️ No restaurant found. Redirecting to start...');
          navigate('/restaurant/list-your-restaurant', { replace: true });
          return;
        }

        setRestaurant(myRestaurant);
        
        // Get restaurant status
        const status = myRestaurant.status || myRestaurant.data?.status || 'pending';
        const normalizedStatus = String(status).trim().toLowerCase();
        
        console.log('📊 SetupComplete - Restaurant status:', status, 'normalized:', normalizedStatus);
        
        setRestaurantStatus(normalizedStatus);
        setIsChecking(false);
        
        // Store status in localStorage for quick access
        localStorage.setItem('restaurant_status', normalizedStatus);
        
        // If approved, automatically redirect to dashboard immediately
        if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          console.log('✅ Restaurant approved! Redirecting to dashboard immediately...');
          // Small delay to ensure state is set
          setTimeout(() => {
            navigate('/restaurant/dashboard', { replace: true });
          }, 100);
          return;
        }
        
        // If not approved, stay on waiting screen (don't redirect)
        console.log('⏳ Restaurant not approved yet, staying on waiting screen');
      } catch (error) {
        console.error('❌ Error checking restaurant status:', error);
        
        // For errors, check localStorage as fallback
        const storedStatus = localStorage.getItem('restaurant_status');
        if (storedStatus) {
          console.log('📦 Using stored status from localStorage after error:', storedStatus);
          setRestaurantStatus(storedStatus);
          setIsChecking(false);
          
          if (storedStatus === 'approved' || storedStatus === 'active') {
            navigate('/restaurant/dashboard', { replace: true });
            return;
          }
        } else {
          // No stored status either, redirect to start
          console.log('⚠️ No stored status found. Redirecting to start...');
          navigate('/restaurant/list-your-restaurant', { replace: true });
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on mount
    checkStatus();
  }, [navigate]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      
      if (!myRestaurant) {
        navigate('/restaurant/list-your-restaurant', { replace: true });
        return;
      }

      setRestaurant(myRestaurant);
      
      const status = myRestaurant.status || myRestaurant.data?.status || 'pending';
      const normalizedStatus = String(status).trim().toLowerCase();
      
      setRestaurantStatus(normalizedStatus);
      localStorage.setItem('restaurant_status', normalizedStatus);
      
      if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
        // Approved - redirect to dashboard
        setModalType('approved');
        setModalMessage('Your restaurant has been approved! Redirecting to dashboard...');
        setShowStatusModal(true);
        
        // Redirect after showing modal briefly
        setTimeout(() => {
          navigate('/restaurant/dashboard', { replace: true });
        }, 1500);
        return;
      } else {
        // Still pending - show modal
        setModalType('pending');
        setModalMessage('Your account is still being reviewed. Thanks for your patience.');
        setShowStatusModal(true);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setModalType('pending');
      setModalMessage('Unable to check status at this time. Please try again later.');
      setShowStatusModal(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoToDashboard = async () => {
    // Always check status first when button is clicked
    await handleCheckStatus();
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('restaurant_id');
    localStorage.removeItem('restaurant_setup_progress');
    localStorage.removeItem('restaurant_status');
    
    navigate('/restaurant/login', { replace: true });
  };

  // Show loading state while checking
  if (isChecking || restaurantStatus === null) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4 flex items-center justify-center min-h-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Checking status...</p>
          </div>
        </div>
        <StaysFooter />
      </div>
    );
  }

  const isApproved = restaurantStatus === 'approved' || restaurantStatus === 'active';
  const isRejected = restaurantStatus === 'rejected';

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6 flex items-start sm:items-center justify-center min-h-0">
        <div className="max-w-xl w-full mx-auto my-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6" style={{ borderColor: isRejected ? '#fee2e2' : '#dcfce7' }}>
            <div className="flex justify-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7' }}
              >
                {isApproved ? (
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#3CAF54' }} />
                ) : isRejected ? (
                  <XCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#ef4444' }} />
                ) : (
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#f59e0b' }} />
                )}
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-2">
                {isApproved ? 'Your Restaurant is Approved!' : isRejected ? 'Restaurant Needs Corrections' : "We're Reviewing Your Restaurant"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-4">
                {isApproved
                  ? 'Your restaurant is approved and live. You can now manage orders and view your dashboard.'
                  : isRejected
                  ? 'Our team reviewed your restaurant, but we need a few corrections before we can approve it.'
                  : 'Thanks for submitting your restaurant details. Our team is reviewing everything to ensure quality and accuracy.'}
              </p>
            </div>

            {!isApproved && !isRejected && (
              <div className="rounded-lg bg-green-50 text-green-800 text-xs sm:text-sm p-3 sm:p-4 mx-2 sm:mx-0">
                We usually wrap up reviews within 1–3 business days. You'll receive an email as soon as we're done.
              </div>
            )}

            {restaurant && (
              <div className="rounded-lg bg-gray-50 p-3 sm:p-4 text-left mx-2 sm:mx-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Restaurant Name:</p>
                <p className="text-xs sm:text-sm text-gray-700 break-words">{restaurant.name || restaurant.restaurant_name || 'Unnamed Restaurant'}</p>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3 pt-2">
              {isApproved ? (
                <button
                  onClick={handleGoToDashboard}
                  className="w-full text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="w-full text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => !isChecking && (e.target.style.backgroundColor = '#2d8f42')}
                    onMouseLeave={(e) => !isChecking && (e.target.style.backgroundColor = '#3CAF54')}
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span>Checking Status...</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Check Status</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-gray-50 text-sm sm:text-base"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <StaysFooter />

      {/* Status Check Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 my-auto">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    modalType === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}
                >
                  {modalType === 'approved' ? (
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {modalType === 'approved' ? 'Restaurant Approved!' : 'Status Check'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 break-words">
              {modalMessage}
            </p>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  modalType === 'approved'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {modalType === 'approved' ? 'Continue' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
