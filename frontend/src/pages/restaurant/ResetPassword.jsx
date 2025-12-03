import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import restaurantAuthService from '../../services/restaurantAuthService';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/restaurant/forgot-password');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await restaurantAuthService.resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => {
        navigate('/restaurant/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password');
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
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#dcfce7' }}>
                    <Lock className="h-8 w-8" style={{ color: '#3CAF54' }} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                  <p className="text-gray-600">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-[#3CAF54]/20 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 ml-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-[#3CAF54]/20 ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 ml-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3CAF54' }}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/restaurant/login"
                    className="font-medium"
                    style={{ color: '#3CAF54' }}
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: '#3CAF54' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <Link
                  to="/restaurant/login"
                  className="block w-full py-3 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#3CAF54' }}
                >
                  Go to Login
                </Link>
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

export default ResetPassword;
