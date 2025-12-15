import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, LogOut, XCircle, AlertCircle, X } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { getMyPropertyListings, staysAuthService } from '../../services/staysService';

export default function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [property, setProperty] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('pending'); // 'pending' or 'approved'

  useEffect(() => {
    // Check if user is logged in
    if (!staysAuthService.isAuthenticated()) {
      navigate('/stays/login', { replace: true });
      return;
    }

    // Check property status
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const properties = await getMyPropertyListings();
        const propertiesArray = Array.isArray(properties) ? properties : [];
        
        if (propertiesArray.length === 0) {
          // No properties found - redirect to start
          console.log('⚠️ No properties found. Redirecting to start...');
          navigate('/stays/list-your-property/start', { replace: true });
          return;
        }

        const latestProperty = propertiesArray[0];
        setProperty(latestProperty);
        
        // Get property status
        const status = latestProperty.status || latestProperty.property_status || 'pending';
        const isLive = 
          latestProperty.is_live === 1 || 
          latestProperty.isLive === true || 
          latestProperty.is_live === true ||
          status === 'approved';
        
        console.log('📊 SetupComplete - Property status:', status, 'isLive:', isLive);
        
        setPropertyStatus(status);
        setIsChecking(false);
        
        // Store status in localStorage for quick access
        localStorage.setItem('stays_property_status', status);
        
        // If approved, automatically redirect to dashboard immediately
        // But only if status is explicitly approved
        if (status === 'approved' || isLive) {
          console.log('✅ Property approved! Redirecting to dashboard immediately...');
          // Small delay to ensure state is set
          setTimeout(() => {
            navigate('/stays/dashboard', { replace: true });
          }, 100);
          return;
        }
        
        // If not approved, stay on waiting screen (don't redirect)
        console.log('⏳ Property not approved yet, staying on waiting screen');
      } catch (error) {
        console.error('❌ Error checking property status:', error);
        
        // For errors, check localStorage as fallback
        const storedStatus = localStorage.getItem('stays_property_status');
        if (storedStatus) {
          console.log('📦 Using stored status from localStorage after error:', storedStatus);
          setPropertyStatus(storedStatus);
          setIsChecking(false);
          
          if (storedStatus === 'approved') {
            navigate('/stays/dashboard', { replace: true });
            return;
          }
        } else {
          // No stored status either, redirect to start
          console.log('⚠️ No stored status found. Redirecting to start...');
          navigate('/stays/list-your-property/start', { replace: true });
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
      const properties = await getMyPropertyListings();
      const propertiesArray = Array.isArray(properties) ? properties : [];
      
      if (propertiesArray.length === 0) {
        navigate('/stays/list-your-property/start', { replace: true });
        return;
      }

      const latestProperty = propertiesArray[0];
      setProperty(latestProperty);
      
      const status = latestProperty.status || latestProperty.property_status || 'pending';
      const isLive = 
        latestProperty.is_live === 1 || 
        latestProperty.isLive === true || 
        latestProperty.is_live === true ||
        status === 'approved';
      
      setPropertyStatus(status);
      localStorage.setItem('stays_property_status', status);
      
      if (status === 'approved' || isLive) {
        // Approved - redirect to dashboard
        setModalType('approved');
        setModalMessage('Your property has been approved! Redirecting to dashboard...');
        setShowStatusModal(true);
        
        // Redirect after showing modal briefly
        setTimeout(() => {
          navigate('/stays/dashboard', { replace: true });
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
    staysAuthService.logout();
    navigate('/stays/login', { replace: true });
  };

  // Show loading state while checking
  if (isChecking || propertyStatus === null) {
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

  const isApproved = propertyStatus === 'approved';
  const isRejected = propertyStatus === 'rejected' || propertyStatus === 'rejected';

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
                {isApproved ? 'Your Property is Approved!' : isRejected ? 'Property Needs Corrections' : "We're Reviewing Your Property"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-4">
                {isApproved
                  ? 'Your property is approved and live. You can now manage bookings and view your dashboard.'
                  : isRejected
                  ? 'Our team reviewed your property, but we need a few corrections before we can approve it.'
                  : 'Thanks for submitting your property details. Our team is reviewing everything to ensure quality and accuracy.'}
              </p>
            </div>

            {!isApproved && !isRejected && (
              <div className="rounded-lg bg-green-50 text-green-800 text-xs sm:text-sm p-3 sm:p-4 mx-2 sm:mx-0">
                We usually wrap up reviews within 1–3 business days. You'll receive an email as soon as we're done.
              </div>
            )}

            {property && (
              <div className="rounded-lg bg-gray-50 p-3 sm:p-4 text-left mx-2 sm:mx-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Property Name:</p>
                <p className="text-xs sm:text-sm text-gray-700 break-words">{property.property_name || property.name || 'Unnamed Property'}</p>
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
                    {modalType === 'approved' ? 'Property Approved!' : 'Status Check'}
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

