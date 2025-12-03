import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import restaurantAuthService from '../../services/restaurantAuthService';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await restaurantAuthService.requestPasswordReset(email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#dcfce7' }}>
                    <Mail className="h-8 w-8" style={{ color: '#3CAF54' }} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-[#3CAF54]/20"
                      style={{ focusBorderColor: '#3CAF54' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3CAF54', '&:hover': { backgroundColor: '#2d8f42' } }}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/restaurant/login"
                    className="inline-flex items-center gap-2 font-medium"
                    style={{ color: '#3CAF54' }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: '#3CAF54' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and follow the instructions to reset your password.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: '#3CAF54' }}
                  >
                    Try Again
                  </button>
                  <Link
                    to="/restaurant/login"
                    className="block w-full text-center font-medium py-3"
                    style={{ color: '#3CAF54' }}
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-600">
            <p>Need help? Contact support at support@travooz.com</p>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
};

export default ForgotPassword;
