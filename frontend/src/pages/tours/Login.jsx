import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { tourPackageSetupService } from '../../services/tourPackageService';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

export default function ToursLogin() {
  const navigate = useNavigate();
  const [isHandlingError, setIsHandlingError] = useState(false);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if already logged in and verified
  // Only check once on mount, not on every navigate change
  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // Only auto-redirect if we have both user and token
      if (user && token) {
        try {
          const userData = JSON.parse(user);
          // If this user also has a restaurant account, make sure the restaurant is approved
          // If not approved, send them to the restaurant waiting page so they cannot access other services
          try {
            const restaurantId = userData.restaurant_id || localStorage.getItem('restaurant_id');
            if (restaurantId) {
              const restaurantsAPI = (await import('../../services/restaurantDashboardService')).restaurantsAPI;
              const rest = await restaurantsAPI.getById(restaurantId);
              const restStatus = rest?.status || rest?.data?.status;
              const normalizedRestStatus = restStatus ? String(restStatus).toLowerCase() : null;
              if (normalizedRestStatus && normalizedRestStatus !== 'approved' && normalizedRestStatus !== 'active') {
                navigate('/restaurant/setup/complete', { replace: true });
                return;
              }
            }
          } catch (e) {
            // ignore restaurant check errors here - fall back to normal tours logic
            console.warn('⚠️ Could not check restaurant approval during tours auth check:', e);
          }
          
          // Verify this is actually a tour user by checking the token
          // If token is invalid, clear it and stay on login page
          const tourBusinessId = localStorage.getItem('tour_business_id');
          
          if (tourBusinessId) {
            try {
              const status = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
              
              // Check if this is a "no submission found" response (database cleared)
              const apiMessage = status?.message || status?.data?.message || '';
              const dataStatus = status?.data?.status;
              
              if (apiMessage.includes('No submission found') || 
                  apiMessage.includes('No submission') ||
                  (dataStatus === null && apiMessage)) {
                console.log('🗑️ Database appears to be cleared. Clearing stale data...');
                localStorage.removeItem('tour_business_id');
                localStorage.removeItem('tour_submission_status');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('auth_token');
                // Stay on login page
                return;
              }
              
              const submissionStatus = status?.status || status?.data?.status || status?.data?.data?.status;
              
              if (submissionStatus === null || submissionStatus === undefined) {
                console.log('⚠️ No submission data found. Clearing stale data...');
                localStorage.removeItem('tour_business_id');
                localStorage.removeItem('tour_submission_status');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('auth_token');
                return;
              }
              
              if (submissionStatus === 'approved') {
                navigate('/tours/dashboard', { replace: true });
              } else {
                navigate('/tours/setup/complete', { replace: true });
              }
            } catch (statusError) {
              // If 401 or 404, token is invalid or submission not found - clear everything
              if (statusError.response?.status === 401 || 
                  statusError.response?.status === 404 || 
                  statusError.message?.includes('not found') || 
                  statusError.message?.includes('No submission')) {
                console.log('🗑️ Invalid token or submission not found. Clearing all data...');
                localStorage.removeItem('tour_business_id');
                localStorage.removeItem('tour_submission_status');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('auth_token');
                // Stay on login page - don't redirect
                return;
              }
              console.error('Error checking submission status:', statusError);
            }
          } else {
            // No tour business ID - might be stale user data, clear it
            console.log('⚠️ No tour business ID found. Clearing stale user data...');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          // Clear stale data on error
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
        }
      }
    };
    
    checkAuth();
    // Only run once on mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Login to tours_users table
      const response = await apiClient.post('/tours/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const result = response.data.data || response.data;
      
      // Store token
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('auth_token', result.token);
      }

      // Store user data
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Store service type to prevent cross-service conflicts
        localStorage.setItem('service_type', 'tours');
      }

      // Store tour business ID if available
      if (result.tourBusinessId) {
        localStorage.setItem('tour_business_id', result.tourBusinessId.toString());
      }

      // After login, if the user owns a restaurant and it's not approved, force restaurant waiting page
      try {
        const restaurantIdAfter = result.user?.restaurant_id || localStorage.getItem('restaurant_id');
        if (restaurantIdAfter) {
          const restaurantsAPI = (await import('../../services/restaurantDashboardService')).restaurantsAPI;
          const rest = await restaurantsAPI.getById(restaurantIdAfter);
          const restStatus = rest?.status || rest?.data?.status;
          const normalizedRestStatus = restStatus ? String(restStatus).toLowerCase() : null;
          if (normalizedRestStatus && normalizedRestStatus !== 'approved' && normalizedRestStatus !== 'active') {
            toast.success('Login successful! Your restaurant is pending approval.');
            navigate('/restaurant/setup/complete', { replace: true });
            return;
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not perform post-login restaurant approval check for tours:', e);
      }

      toast.success('Login successful!');

      // Check submission status and redirect accordingly
      const tourBusinessId = result.tourBusinessId || localStorage.getItem('tour_business_id');
      
      if (tourBusinessId) {
        try {
          const status = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
          
          // Check if this is a "no submission found" response (database cleared)
          const apiMessage = status?.message || status?.data?.message || '';
          const dataStatus = status?.data?.status;
          
          if (apiMessage.includes('No submission found') || 
              apiMessage.includes('No submission') ||
              (dataStatus === null && apiMessage)) {
            console.log('🗑️ Database appears to be cleared. Clearing stale data and redirecting...');
            localStorage.removeItem('tour_business_id');
            localStorage.removeItem('tour_submission_status');
            navigate('/tours/list-your-tour', { replace: true });
            return;
          }
          
          const submissionStatus = status?.status || status?.data?.status || status?.data?.data?.status;
          
          if (submissionStatus === null || submissionStatus === undefined) {
            console.log('⚠️ No submission data found. Clearing stale data and redirecting...');
            localStorage.removeItem('tour_business_id');
            localStorage.removeItem('tour_submission_status');
            navigate('/tours/list-your-tour', { replace: true });
            return;
          }
          
          if (submissionStatus === 'approved') {
            navigate('/tours/dashboard', { replace: true });
          } else {
            navigate('/tours/setup/complete', { replace: true });
          }
        } catch (statusError) {
          // If 404 or "not found", database was cleared
          if (statusError.response?.status === 404 || 
              statusError.message?.includes('not found') || 
              statusError.message?.includes('No submission')) {
            console.log('🗑️ Submission not found. Clearing stale data and redirecting...');
            localStorage.removeItem('tour_business_id');
            localStorage.removeItem('tour_submission_status');
            navigate('/tours/list-your-tour', { replace: true });
            return;
          }
          
          // For other errors, redirect to complete page
          navigate('/tours/setup/complete', { replace: true });
        }
      } else {
        // No tour business yet - redirect to listing form
        navigate('/tours/list-your-tour', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      
      // CRITICAL: Set error handling flag to prevent any redirects
      setIsHandlingError(true);
      setIsSubmitting(false);
      
      // Prevent any automatic redirects that might be triggered by error handlers
      // Clear any stays-related tokens that might trigger stays redirects
      if (error.response?.status === 401) {
        // This is a login error - don't let any interceptor redirect
        console.log('🚫 Login failed with 401 - preventing any redirects');
        console.log('🚫 Current path:', window.location.pathname);
        console.log('🚫 Will NOT navigate - staying on tour login page');
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
        setSubmitError('');
      } else {
        // Extract error message from response
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Invalid email or password. Please check your credentials and try again.';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        
        // Clear any field-specific errors
        setErrors({});
      }
      
      // ABSOLUTELY DO NOT NAVIGATE - stay on login page
      // Return early to prevent any further execution
      // Reset error handling flag after a short delay
      setTimeout(() => setIsHandlingError(false), 100);
      return;
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="mb-6">
              <button
                onClick={() => navigate('/auth/service-selection')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Service Selection
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to manage your tour packages</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 ml-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 ml-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/tours/forgot-password')}
                  className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/tours/list-your-tour')}
                  className="text-[#3CAF54] hover:text-[#2d8f3f] font-semibold transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <StaysFooter />
    </div>
  );
}

