import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import carRentalSetupService from '../../services/carRentalSetupService';
import toast from 'react-hot-toast';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId: stateUserId, email: stateEmail, userName: stateUserName, carRentalBusinessId: stateCarRentalBusinessId } = location.state || {};
  
  // Use state values or fallback to localStorage
  const getUserId = () => {
    if (stateUserId) return stateUserId;
    const storedUserId = localStorage.getItem('car_rental_user_id');
    if (storedUserId) return storedUserId;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.user_id || user.id;
    }
    return null;
  };
  
  const getEmail = () => {
    if (stateEmail) return stateEmail;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser).email;
    }
    return null;
  };
  
  const getUserName = () => {
    if (stateUserName) return stateUserName;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser).name;
    }
    return null;
  };
  
  const getCarRentalBusinessId = () => {
    if (stateCarRentalBusinessId) return stateCarRentalBusinessId;
    return localStorage.getItem('car_rental_business_id');
  };
  
  const userId = getUserId();
  const email = getEmail();
  const userName = getUserName();
  const carRentalBusinessId = getCarRentalBusinessId();
  
  // Store carRentalBusinessId in localStorage if available from state
  useEffect(() => {
    if (stateCarRentalBusinessId) {
      localStorage.setItem('car_rental_business_id', stateCarRentalBusinessId);
      console.log('EmailVerification - Stored carRentalBusinessId from state:', stateCarRentalBusinessId);
    } else {
      // Check localStorage as fallback
      const storedCarRentalBusinessId = localStorage.getItem('car_rental_business_id');
      if (storedCarRentalBusinessId) {
        console.log('EmailVerification - Found carRentalBusinessId in localStorage:', storedCarRentalBusinessId);
      } else {
        console.warn('EmailVerification - No carRentalBusinessId found in state or localStorage. State:', location.state);
      }
    }
  }, [stateCarRentalBusinessId, location.state]);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const hasRequestedInitialCode = useRef(false);
  
  const inputRefs = useRef([]);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if no state data - but check localStorage first as fallback
  useEffect(() => {
    // Check if we have required data from state or localStorage
    const stateUserId = userId || location.state?.userId;
    const stateEmail = email || location.state?.email;
    
    // Also check localStorage for user data
    const storedUser = localStorage.getItem('user');
    const storedEmail = storedUser ? JSON.parse(storedUser).email : null;
    
    if (!stateUserId && !stateEmail && !storedEmail) {
      console.warn('EmailVerification: Missing required data, redirecting to step 3');
      navigate('/car-rental/list-your-car-rental/step-3', { replace: true });
      return;
    }
    
    // If we have email from localStorage but not from state, use it
    if (!stateEmail && storedEmail) {
      console.log('EmailVerification: Using email from localStorage:', storedEmail);
    }
  }, [userId, email, navigate, location.state]);

  // Send verification code automatically when component loads (after step 3)
  useEffect(() => {
    const sendInitialCode = async () => {
      if (!userId || !email || !userName || hasRequestedInitialCode.current) {
        return;
      }
      hasRequestedInitialCode.current = true;
      setIsSendingCode(true);
      try {
        await carRentalSetupService.sendEmailVerificationCode(userId, email, userName);
        toast.success('Verification code sent to your email');
        // Start countdown after successful send
        setCountdown(60);
        setCanResend(false);
      } catch (error) {
        console.error('Error sending initial verification code:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';
        
        // Handle rate limit error specifically
        if (error.response?.status === 429 || errorMessage.includes('Too many')) {
          toast.error('Too many verification requests. Please wait a moment and try again using the "Resend Code" button.');
          // Allow resend after countdown
          setCountdown(60);
          setCanResend(false);
        } else {
          toast.error(errorMessage);
          // Reset flag so user can try again
          hasRequestedInitialCode.current = false;
        }
      } finally {
        setIsSendingCode(false);
      }
    };

    // Only send if we have all required data
    if (userId && email && userName) {
      sendInitialCode();
    }
  }, [userId, email, userName]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await carRentalSetupService.verifyEmailCode(userId, email, verificationCode, carRentalBusinessId);
      
      if (response.verified || response.success) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        
        // Ensure carRentalBusinessId is available (check localStorage if missing from state)
        let finalCarRentalBusinessId = carRentalBusinessId;
        if (!finalCarRentalBusinessId) {
          finalCarRentalBusinessId = localStorage.getItem('car_rental_business_id');
          console.log('EmailVerification - Retrieved carRentalBusinessId from localStorage:', finalCarRentalBusinessId);
        }
        
        // Store it again to ensure it's saved
        if (finalCarRentalBusinessId) {
          localStorage.setItem('car_rental_business_id', finalCarRentalBusinessId);
        }
        
        // Ensure user data is still in localStorage (preserve authentication)
        const storedUser = localStorage.getItem('user');
        const storedUserId = localStorage.getItem('car_rental_user_id');
        
        if (!storedUser || !storedUserId) {
          console.warn('EmailVerification - User data missing, ensuring it is stored');
          // If user data is missing, reconstruct it
          if (!storedUser && userId && email) {
            const userData = {
              id: userId,
              user_id: userId,
              email: email,
              name: userName || email.split('@')[0],
              role: 'vendor'
            };
            localStorage.setItem('user', JSON.stringify(userData));
          }
          if (!storedUserId && userId) {
            localStorage.setItem('car_rental_user_id', String(userId));
          }
        }
        
        console.log('EmailVerification - User authenticated:', {
          hasUser: !!storedUser,
          hasUserId: !!storedUserId,
          userId,
          carRentalBusinessId: finalCarRentalBusinessId,
          email,
          userName,
          fromLogin: location.state?.fromLogin
        });
        
        // Check if user came from login - if so, check submission status and redirect accordingly
        if (location.state?.fromLogin) {
          // User logged in from another device - check where they should go
          setTimeout(async () => {
            try {
              if (finalCarRentalBusinessId) {
                const carRentalSetupService = (await import('../../services/carRentalSetupService')).default;
                const status = await carRentalSetupService.getSubmissionStatus(finalCarRentalBusinessId);
                const submissionStatus = status?.status || status?.data?.status || status?.data?.data?.status;
                
                if (submissionStatus === 'approved') {
                  navigate('/car-rental/dashboard', { replace: true });
                } else {
                  navigate('/car-rental/setup/complete', { replace: true });
                }
              } else {
                // No business yet - go to business details
                navigate('/car-rental/setup/business-details', {
                  state: {
                    userId,
                    email,
                    userName,
                    carRentalBusinessId: finalCarRentalBusinessId,
                    location: location.state?.location || '',
                    locationData: location.state?.locationData || null,
                    step2Data: location.state?.step2Data || {},
                    fromEmailVerification: true
                  }
                });
              }
            } catch (error) {
              console.error('Error checking submission status after email verification:', error);
              // Fallback to business details
              navigate('/car-rental/setup/business-details', {
                state: {
                  userId,
                  email,
                  userName,
                  carRentalBusinessId: finalCarRentalBusinessId,
                  location: location.state?.location || '',
                  locationData: location.state?.locationData || null,
                  step2Data: location.state?.step2Data || {},
                  fromEmailVerification: true
                }
              });
            }
          }, 1500);
        } else {
          // Normal flow - redirect to business details step after 2 seconds
          setTimeout(() => {
            navigate('/car-rental/setup/business-details', {
              state: {
                userId,
                email,
                userName,
                carRentalBusinessId: finalCarRentalBusinessId,
                location: location.state?.location || '',
                locationData: location.state?.locationData || null,
                step2Data: location.state?.step2Data || {},
                fromEmailVerification: true
              }
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.response?.data?.message || error.message || 'Invalid verification code. Please try again.');
      toast.error(error.response?.data?.message || error.message || 'Invalid verification code');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setCanResend(false);
    setCountdown(60);
    
    try {
      await carRentalSetupService.sendEmailVerificationCode(userId, email, userName);
      toast.success('Verification code resent successfully');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Error resending code:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend verification code';
      
      // Handle rate limit error specifically
      if (error.response?.status === 429 || errorMessage.includes('Too many')) {
        const errorMsg = 'Too many verification requests. Please wait a moment before trying again.';
        setError(errorMsg);
        toast.error(errorMsg);
        // Set a longer countdown for rate limit (5 minutes)
        setCountdown(300);
      } else {
        setError(errorMessage);
        toast.error('Failed to resend verification code');
        // Allow resend after shorter countdown for other errors
        setCountdown(60);
      }
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border text-center" style={{ borderColor: '#dcfce7' }}>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">Your email has been verified successfully.</p>
            <p className="text-sm text-gray-500">Redirecting you to continue setup...</p>
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
        <div className="max-w-md w-full mx-auto">
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
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  V
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 1 Complete: Verify Your Email</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                <Mail className="h-8 w-8" style={{ color: '#3CAF54' }} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Verify your email
              </h1>
              <p className="text-gray-600">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-gray-900 mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* Loading State */}
              {isSendingCode && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-800">Sending verification code to your email...</p>
                  </div>
                </div>
              )}

              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter verification code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-all ${
                        error
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20'
                      }`}
                      disabled={isVerifying || isVerified}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-3 text-sm text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifying || code.join('').length !== 6}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: isVerifying ? '#2d8f42' : '#3CAF54' }}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-[#3CAF54] hover:text-[#2d8f42] font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        <span>Resend code</span>
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend code in {countdown} seconds
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}

