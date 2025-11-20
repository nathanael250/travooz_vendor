import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, email, userName, tourBusinessId } = location.state || {};
  
  // Store tourBusinessId in localStorage if available from state
  useEffect(() => {
    if (tourBusinessId) {
      localStorage.setItem('tour_business_id', tourBusinessId.toString());
      console.log('EmailVerification - Stored tourBusinessId from state:', tourBusinessId);
    } else {
      // Check localStorage as fallback
      const storedTourBusinessId = localStorage.getItem('tour_business_id');
      if (storedTourBusinessId) {
        console.log('EmailVerification - Found tourBusinessId in localStorage:', storedTourBusinessId);
      } else {
        console.warn('EmailVerification - No tourBusinessId found in state or localStorage. State:', location.state);
      }
    }
  }, [tourBusinessId, location.state]);
  
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

  // Redirect if no state data
  useEffect(() => {
    if (!userId || !email) {
      navigate('/tours/list-your-tour');
    }
  }, [userId, email, navigate]);

  // Send verification code automatically when component loads (after step 3)
  useEffect(() => {
    const sendInitialCode = async () => {
      if (!userId || !email || !userName || hasRequestedInitialCode.current) {
        return;
      }
      hasRequestedInitialCode.current = true;
      setIsSendingCode(true);
      try {
        await tourPackageSetupService.sendEmailVerificationCode(userId, email, userName);
      } catch (error) {
        console.error('Error sending initial verification code:', error);
        // Let user try again manually
      } finally {
        setIsSendingCode(false);
      }
    };

    sendInitialCode();
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
      const response = await tourPackageSetupService.verifyEmailCode(userId, email, verificationCode, tourBusinessId);
      
      if (response.verified || response.success) {
        setIsVerified(true);
        
        // Ensure tourBusinessId is available (check localStorage if missing from state)
        let finalTourBusinessId = tourBusinessId;
        if (!finalTourBusinessId) {
          finalTourBusinessId = localStorage.getItem('tour_business_id');
          console.log('EmailVerification - Retrieved tourBusinessId from localStorage:', finalTourBusinessId);
        }
        
        // Convert to string if it's a number
        if (finalTourBusinessId) {
          finalTourBusinessId = finalTourBusinessId.toString();
          // Store it again to ensure it's saved
          localStorage.setItem('tour_business_id', finalTourBusinessId);
        }
        
        console.log('EmailVerification - Navigating to BusinessOwnerInfoStep with:', {
          userId,
          tourBusinessId: finalTourBusinessId,
          email,
          userName
        });
        
        // Redirect to business owner info step (Step 2) after 2 seconds
        setTimeout(() => {
          navigate('/tours/setup/business-owner-info', {
            state: {
              userId,
              email,
              userName,
              tourBusinessId: finalTourBusinessId,
              location: location.state?.location || '',
              locationData: location.state?.locationData || {},
              step2Data: location.state?.step2Data || {},
              fromEmailVerification: true
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.response?.data?.message || error.message || 'Invalid verification code. Please try again.');
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
      await tourPackageSetupService.sendEmailVerificationCode(userId, email, userName);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Error resending code:', error);
      setError(error.response?.data?.message || 'Failed to resend verification code. Please try again.');
      setCanResend(true);
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
          {/* Progress Indicator - Step 1 Complete */}
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

