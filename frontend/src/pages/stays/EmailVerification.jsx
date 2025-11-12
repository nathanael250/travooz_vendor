import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { verifyEmailCode, sendEmailVerificationCode } from '../../services/staysService';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, email, userName, propertyId, verificationCode } = location.state || {};
  
  // Store propertyId in localStorage if available from state
  useEffect(() => {
    if (propertyId) {
      localStorage.setItem('stays_property_id', propertyId.toString());
      console.log('EmailVerification - Stored propertyId from state:', propertyId);
    } else {
      // Check localStorage as fallback
      const storedPropertyId = localStorage.getItem('stays_property_id');
      if (storedPropertyId) {
        console.log('EmailVerification - Found propertyId in localStorage:', storedPropertyId);
      } else {
        console.warn('EmailVerification - No propertyId found in state or localStorage. State:', location.state);
      }
    }
  }, [propertyId, location.state]);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devCode, setDevCode] = useState(verificationCode || null);
  
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
      navigate('/stays/list-your-property');
    }
  }, [userId, email, navigate]);

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
      const response = await verifyEmailCode(userId, email, verificationCode);
      
      if (response.verified || response.success) {
        setIsVerified(true);
        
        // Ensure propertyId is available (check localStorage if missing from state)
        let finalPropertyId = propertyId;
        if (!finalPropertyId) {
          finalPropertyId = localStorage.getItem('stays_property_id');
          console.log('EmailVerification - Retrieved propertyId from localStorage:', finalPropertyId);
        }
        
        // Convert to number if it's a string
        if (finalPropertyId) {
          finalPropertyId = typeof finalPropertyId === 'string' ? parseInt(finalPropertyId) : finalPropertyId;
          // Store it again to ensure it's saved
          localStorage.setItem('stays_property_id', finalPropertyId.toString());
        }
        
        console.log('EmailVerification - Navigating to ContractStep with:', {
          userId,
          propertyId: finalPropertyId,
          email,
          userName
        });
        
        // Redirect to contract step (Step 2 of setup) after 2 seconds
        setTimeout(() => {
          navigate('/stays/setup/contract', {
            state: {
              userId,
              email,
              userName,
              propertyId: finalPropertyId,
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
      await sendEmailVerificationCode(userId, email, userName);
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
            <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
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
              {/* Development Code Display */}
              {devCode && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Development Mode</p>
                  <p className="text-xs text-yellow-700 mb-2">Email sending failed. Use this verification code:</p>
                  <div className="bg-white border border-yellow-300 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-800 tracking-widest">{devCode}</p>
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

