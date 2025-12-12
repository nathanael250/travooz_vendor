import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

export default function RestaurantLogin() {
  const navigate = useNavigate();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    // Only auto-redirect if we have a token and an explicit approval/status indicating the
    // restaurant is live. Previously we redirected any vendor/admin directly which caused
    // a bounce between dashboard and the waiting page when approval was still pending.
    if (!token || !user) return;

    let cancelled = false;
    (async () => {
      try {
        const userData = JSON.parse(user);
        if (!(userData.role === 'vendor' || userData.role === 'admin')) return;

        const normalizedStatus = userData.restaurant_status ? String(userData.restaurant_status).toLowerCase() : null;
        if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          if (!cancelled) navigate('/restaurant/dashboard');
          return;
        }

        // If status is missing/unknown, ask the setup service for an explicit approval flag
        if (!normalizedStatus && userData.restaurant_id) {
          try {
            const { restaurantSetupService } = await import('../../services/eatingOutService');
            const setupInfo = await restaurantSetupService.getSetupStatus(userData.restaurant_id);
            const setupApproved = !!(
              setupInfo?.approved ||
              setupInfo?.is_approved ||
              (typeof setupInfo?.status === 'string' && setupInfo.status.toLowerCase().includes('approved'))
            );

            if (setupApproved && !cancelled) {
              navigate('/restaurant/dashboard');
            }
          } catch (e) {
            // Ignore errors here and do not redirect; let the user stay on the login page
            // so they can complete the proper flow (or manually sign-in again).
            console.warn('⚠️ Could not determine setup approval on page load:', e);
          }
        }
      } catch (error) {
        // Invalid user data or parse error — do not redirect
        console.warn('⚠️ Login redirect check failed:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

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
      // Login using general auth endpoint (profiles table)
      // Note: This assumes restaurants use the profiles table for authentication
      const response = await apiClient.post('/auth/login', {
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
        
        // Store restaurant status if available
        if (result.user.restaurant_status) {
          localStorage.setItem('restaurant_status', result.user.restaurant_status);
        }
      }

      // Verify the login was successful before showing success message
      if (result.token && result.user) {
        // Check restaurant status and redirect accordingly
        const restaurantStatus = result.user.restaurant_status;
        const restaurantId = result.user.restaurant_id;
        
        // Store restaurant ID if available
        if (restaurantId) {
          localStorage.setItem('restaurant_id', restaurantId);
        }
        
        // Normalize status to lowercase for comparison
        const normalizedStatus = restaurantStatus ? String(restaurantStatus).toLowerCase() : null;
        
        console.log('🔍 Login - Restaurant status check:', {
          status: restaurantStatus,
          normalized: normalizedStatus,
          restaurantId
        });
        
        // Check restaurant status and redirect
        if (normalizedStatus && normalizedStatus !== 'approved' && normalizedStatus !== 'active') {
          // Restaurant is pending - redirect to waiting page
          console.log('⏳ Restaurant is pending, redirecting to waiting page');
          toast.success('Login successful! Your restaurant is pending approval.');
          setTimeout(() => {
            navigate('/restaurant/setup/complete', { replace: true });
          }, 100);
        } else if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          // Restaurant is approved - go to dashboard
          console.log('✅ Restaurant is approved, redirecting to dashboard');
          toast.success('Login successful!');
          setTimeout(() => {
            navigate('/restaurant/dashboard', { replace: true });
          }, 100);
        } else {
          // If status is missing/unknown, check the setup service for an authoritative approval flag
          let setupApproved = false;
          try {
            const { restaurantSetupService } = await import('../../services/eatingOutService');
            const setupInfo = await restaurantSetupService.getSetupStatus(restaurantId);
            // Only treat explicit approval flags or an explicit 'approved' status as approval.
            // Do NOT treat setupComplete/setup_complete as admin approval; that's vendor-completion.
            setupApproved = !!(
              setupInfo?.approved || setupInfo?.is_approved ||
              (typeof setupInfo?.status === 'string' && setupInfo.status.toLowerCase().includes('approved'))
            );
            console.log('🔍 Login - setup service check:', setupInfo, 'approved:', setupApproved);
          } catch (e) {
            console.warn('⚠️ Login - could not fetch setup status, falling back to restaurant record', e);
          }

          if (setupApproved) {
            toast.success('Login successful!');
            setTimeout(() => navigate('/restaurant/dashboard', { replace: true }), 100);
          } else {
            // No restaurant yet or status unknown - check if restaurant exists
            if (restaurantId) {
              // Has restaurant ID but no status - check restaurant status
              try {
                const restaurantsAPI = (await import('../../services/restaurantDashboardService')).restaurantsAPI;
                const restaurant = await restaurantsAPI.getById(restaurantId);
                const status = restaurant?.status || restaurant?.data?.status;
                const normalizedStatusFromAPI = status ? String(status).toLowerCase() : null;

                console.log('🔍 Login - Fetched restaurant status:', {
                  status,
                  normalized: normalizedStatusFromAPI
                });

                if (normalizedStatusFromAPI && normalizedStatusFromAPI !== 'approved' && normalizedStatusFromAPI !== 'active') {
                  console.log('⏳ Restaurant is pending (from API), redirecting to waiting page');
                  toast.success('Login successful! Your restaurant is pending approval.');
                  setTimeout(() => {
                    navigate('/restaurant/setup/complete', { replace: true });
                  }, 100);
                } else {
                  console.log('✅ Restaurant is approved or no status (from API), going to dashboard');
                  toast.success('Login successful!');
                  setTimeout(() => {
                    navigate('/restaurant/dashboard', { replace: true });
                  }, 100);
                }
              } catch (error) {
                console.error('Error checking restaurant status:', error);
                // Error checking status - go to dashboard (might be in setup)
                toast.success('Login successful!');
                setTimeout(() => {
                  navigate('/restaurant/dashboard', { replace: true });
                }, 100);
              }
            } else {
              // No restaurant ID - might be in setup or new user
              console.log('⚠️ No restaurant ID, going to dashboard');
              toast.success('Login successful!');
              setTimeout(() => {
                navigate('/restaurant/dashboard', { replace: true });
              }, 100);
            }
          }
        }
      } else {
        throw new Error('Login response missing token or user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      
      // Don't redirect on error - stay on login page
      setIsSubmitting(false);
      
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
                            error.response?.data?.error ||
                            error.message || 
                            'Invalid email or password. Please check your credentials and try again.';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        
        // Clear any field-specific errors
        setErrors({});
      }
      
      // Don't navigate anywhere - stay on login page
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
              <p className="text-gray-600">Sign in to manage your restaurant</p>
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
                  onClick={() => navigate('/restaurant/forgot-password')}
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
                  onClick={() => navigate('/restaurant/list-your-restaurant')}
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

