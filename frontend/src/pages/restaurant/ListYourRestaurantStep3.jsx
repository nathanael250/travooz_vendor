import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import { restaurantSetupService } from '../../services/eatingOutService';

export default function ListYourRestaurantStep3() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Check if user is already logged in (from localStorage)
  // IMPORTANT: For restaurant setup, we need to check if user exists in restaurant_users table
  // Just having a session from tours/stays doesn't mean they have a restaurant account
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // Check if this is a restaurant-specific user
  // We'll check this with the backend when the component loads
  const [isRestaurantUser, setIsRestaurantUser] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  
  // Check if user exists in restaurant_users table
  useEffect(() => {
    const checkRestaurantUser = async () => {
      if (!user?.email) {
        setCheckingUser(false);
        return;
      }
      
      try {
        // Check if user exists in restaurant_users via backend
        const response = await apiClient.post('/api/v1/restaurant/check-user', {
          email: user.email
        });
        if (response.data?.exists) {
          setIsRestaurantUser(true);
        }
      } catch (error) {
        // User doesn't exist in restaurant_users, that's fine - they'll create one
        setIsRestaurantUser(false);
      } finally {
        setCheckingUser(false);
      }
    };
    
    checkRestaurantUser();
  }, [user]);
  
  // Only skip account creation if user is specifically a restaurant_user
  const isVendor = isRestaurantUser && (user?.role || '').toLowerCase() === 'vendor';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+250', // Default to Rwanda
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [focusedFields, setFocusedFields] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Password strength and guidelines
  const passwordGuidelines = useMemo(() => {
    const password = formData.password;
    const firstName = formData.firstName.toLowerCase();
    const lastName = formData.lastName.toLowerCase();
    const passwordLower = password.toLowerCase();

    return {
      minLength: password.length >= 7,
      hasLetter: /[a-zA-Z]/.test(password),
      noNames: !firstName || !lastName || (!passwordLower.includes(firstName) && !passwordLower.includes(lastName)),
      hasNumber: /[0-9]/.test(password),
      notCommon: password.length >= 7 && !['password', '12345678', 'password123', 'qwerty123'].includes(passwordLower)
    };
  }, [formData.password, formData.firstName, formData.lastName]);

  const passwordStrength = useMemo(() => {
    const { minLength, hasLetter, noNames, hasNumber, notCommon } = passwordGuidelines;
    const metCriteria = Object.values(passwordGuidelines).filter(Boolean).length;
    
    if (metCriteria === 0) return { level: 'none', label: '', percentage: 0 };
    if (metCriteria === 5) return { level: 'strong', label: 'Strong', percentage: 100 };
    if (metCriteria >= 3) return { level: 'medium', label: 'Medium', percentage: 60 };
    return { level: 'weak', label: 'Weak', percentage: 30 };
  }, [passwordGuidelines]);

  // Common country codes (focusing on East Africa)
  const countryCodes = [
    { code: '+250', country: 'Rwanda' },
    { code: '+256', country: 'Uganda' },
    { code: '+255', country: 'Tanzania' },
    { code: '+254', country: 'Kenya' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+234', country: 'Nigeria' },
    { code: '+27', country: 'South Africa' }
  ];

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isVendor) {
      // User is already logged in, create restaurant listing only
      setIsSubmitting(true);
      setSubmitError('');

      try {
        const step2Data = location.state?.step2Data || {};
        const locationData = location.state?.locationData || null;

        // Create restaurant listing (user already exists)
        const result = await restaurantSetupService.createRestaurantListing({
          // Restaurant data only (user is already logged in)
          restaurantName: step2Data.restaurantName,
          restaurantType: step2Data.restaurantType,
          restaurantTypeName: step2Data.restaurantTypeName,
          subcategoryId: parseInt(step2Data.subcategoryId),
          description: step2Data.description,
          phone: step2Data.phone,
          currency: step2Data.currency,
          location: location.state?.location || '',
          locationData: locationData
        });

        const restaurantId = result.restaurantId || result.data?.restaurantId;

        // Store restaurantId in localStorage for persistence
        if (restaurantId) {
          localStorage.setItem('restaurant_id', restaurantId);
        }

        // Navigate to business details step
        navigate('/restaurant/setup/business-details', {
          state: {
            location: location.state?.location || '',
            locationData: locationData,
            step2Data: step2Data,
            userId: user.user_id || user.id,
            email: user.email,
            userName: user.name,
            restaurantId: restaurantId
          }
        });
      } catch (error) {
        console.error('Error creating restaurant listing:', error);
        setSubmitError(error.response?.data?.message || error.message || 'Failed to create restaurant listing. Please try again.');
        toast.error(error.response?.data?.message || error.message || 'Failed to create restaurant listing');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setSubmitError('');
    
    // Basic validation (optional fields can be empty)
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Cannot be left blank';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Cannot be left blank';
    } else {
      // Check password guidelines
      if (!passwordGuidelines.minLength) {
        newErrors.password = 'Password must be at least 7 characters';
      } else if (!passwordGuidelines.hasLetter) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!passwordGuidelines.noNames) {
        newErrors.password = 'Password cannot contain your first or last name';
      } else if (!passwordGuidelines.hasNumber) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!passwordGuidelines.notCommon) {
        newErrors.password = 'Password is too common or easily guessed';
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get restaurant data from Step 2
      const step2Data = location.state?.step2Data || {};
      const locationData = location.state?.locationData || null;

      // Create restaurant listing and user account in one API call
      const result = await restaurantSetupService.createRestaurantListing({
        // User account data
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        password: formData.password,
        // Restaurant data
        restaurantName: step2Data.restaurantName,
        restaurantType: step2Data.restaurantType,
        restaurantTypeName: step2Data.restaurantTypeName,
        subcategoryId: parseInt(step2Data.subcategoryId),
        description: step2Data.description,
        restaurantPhone: step2Data.phone,
        currency: step2Data.currency,
        location: location.state?.location || '',
        locationData: locationData
      });

      // Extract data from response
      const restaurantId = result.restaurantId || result.data?.restaurantId;
      const userId = result.userId || result.data?.userId;
      const token = result.token || result.data?.token;
      const userCreated = result.userCreated || result.data?.userCreated;

      // Store token if user was created
      if (token) {
        localStorage.setItem('token', token);
      }

      // Store user data in localStorage if user was created
      if (userCreated && userId) {
        const userData = {
          id: userId,
          user_id: userId,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          role: 'vendor'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }

      // Store restaurantId in localStorage for persistence
      if (restaurantId) {
        localStorage.setItem('restaurant_id', restaurantId);
      }

      toast.success('Account and restaurant listing created successfully!');
      
      // Navigate to business details step
      navigate('/restaurant/setup/business-details', {
        state: {
          location: location.state?.location || '',
          locationData: locationData,
          step2Data: step2Data,
          userId: userId,
          email: formData.email,
          userName: `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0],
          restaurantId: restaurantId
        }
      });

      // ACTUAL API CALL - Uncomment when backend is ready
      // // Register as vendor
      // await registerApi({
      //   role: 'vendor',
      //   name: `${formData.firstName} ${formData.lastName}`.trim(),
      //   email: formData.email,
      //   phone: `${formData.countryCode}${formData.phone}`,
      //   password: formData.password,
      //   confirmPassword: formData.password,
      //   address: '',
      // });

      // // Login to get token and user
      // const auth = await loginApi({ 
      //   email: formData.email, 
      //   password: formData.password 
      // });

      // if (auth?.tokens?.accessToken) {
      //   localStorage.setItem('token', auth.tokens.accessToken);
      // }
      // if (auth?.user) {
      //   setAuthUser(auth.user);
      // }

      // toast.success('Account created successfully!');

      // // Navigate to business details step
      // navigate('/restaurant/setup/business-details', {
      //   state: {
      //     location: location.state?.location || '',
      //     locationData: location.state?.locationData || null,
      //     step2Data: location.state?.step2Data || {},
      //     userId: auth?.user?.user_id || auth?.user?.id,
      //     email: formData.email,
      //     userName: `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0]
      //   }
      // });
    } catch (error) {
      console.error('Error creating account:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          // Map backend field names to frontend field names
          if (err.field === 'email') validationErrors.email = err.message;
          if (err.field === 'password') validationErrors.password = err.message;
          if (err.field === 'phone') validationErrors.phone = err.message;
        });
        setErrors(validationErrors);
      } else {
        setSubmitError(error.response?.data?.message || error.message || 'Failed to create account. Please try again.');
      }
      toast.error(error.response?.data?.message || error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/list-your-restaurant/step-2', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-2xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            {/* Mobile: Simple progress bar */}
            <div className="block md:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#1f6f31' }}>
                  Step 3 of 3
                </span>
                <span className="text-xs text-gray-500">100%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: '#3CAF54', width: '100%' }}
                ></div>
              </div>
            </div>

            {/* Desktop: Show all steps */}
            <div className="hidden md:flex items-center justify-center mb-4">
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
                  3
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium hidden md:block" style={{ color: '#1f6f31' }}>Step 3 of 3</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Create your account
            </h1>
            
            <p className="text-center text-gray-600 mb-8">
              Sign in to set up your new restaurant if you already have an account.{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#3CAF54] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>

            {checkingUser ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Checking account status...
                  </p>
                </div>
              </div>
            ) : isVendor && isRestaurantUser ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ You are logged in as restaurant vendor <strong>{user.name}</strong> ({user.email})
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                    onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                    onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name and Last Name - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedFields(prev => ({ ...prev, firstName: true }))}
                      onBlur={() => setFocusedFields(prev => ({ ...prev, firstName: false }))}
                      className={`w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                        errors.firstName ? 'border-red-500' : ''
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedFields.firstName || formData.firstName
                          ? 'top-2 text-xs text-gray-500'
                          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                      }`}
                    >
                      First name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedFields(prev => ({ ...prev, lastName: true }))}
                      onBlur={() => setFocusedFields(prev => ({ ...prev, lastName: false }))}
                      className={`w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                        errors.lastName ? 'border-red-500' : ''
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedFields.lastName || formData.lastName
                          ? 'top-2 text-xs text-gray-500'
                          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                      }`}
                    >
                      Last name
                    </label>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 appearance-none"
                    >
                      {countryCodes.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedFields(prev => ({ ...prev, phone: true }))}
                      onBlur={() => setFocusedFields(prev => ({ ...prev, phone: false }))}
                      className={`w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedFields.phone || formData.phone
                          ? 'top-2 text-xs text-gray-500'
                          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                      }`}
                    >
                      Phone
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedFields(prev => ({ ...prev, email: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, email: false }))}
                    className={`w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  <label
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      focusedFields.email || formData.email
                        ? 'top-2 text-xs text-gray-500'
                        : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                    }`}
                  >
                    Email address
                  </label>
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  {errors.email && (
                    <p className="mt-1 ml-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedFields(prev => ({ ...prev, password: true }))}
                      onBlur={() => setFocusedFields(prev => ({ ...prev, password: false }))}
                      className={`w-full px-4 pt-6 pb-2 pr-12 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedFields.password || formData.password
                          ? 'top-2 text-xs text-gray-500'
                          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                      }`}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Password strength</span>
                        {passwordStrength.label && (
                          <span 
                            className={`text-sm font-semibold ${
                              passwordStrength.level === 'strong' ? 'text-green-600' :
                              passwordStrength.level === 'medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.level === 'strong' ? 'bg-green-500' :
                            passwordStrength.level === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Guidelines */}
                  {formData.password && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Password guidelines</h4>
                      <ul className="space-y-2">
                        <li className={`flex items-center gap-2 text-sm ${
                          passwordGuidelines.minLength ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <Check className={`h-4 w-4 ${passwordGuidelines.minLength ? 'text-green-600' : 'text-gray-300'}`} />
                          At least 7 characters
                        </li>
                        <li className={`flex items-center gap-2 text-sm ${
                          passwordGuidelines.hasLetter ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <Check className={`h-4 w-4 ${passwordGuidelines.hasLetter ? 'text-green-600' : 'text-gray-300'}`} />
                          At least one letter
                        </li>
                        <li className={`flex items-center gap-2 text-sm ${
                          passwordGuidelines.noNames ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <Check className={`h-4 w-4 ${passwordGuidelines.noNames ? 'text-green-600' : 'text-gray-300'}`} />
                          No use of first and last names
                        </li>
                        <li className={`flex items-center gap-2 text-sm ${
                          passwordGuidelines.hasNumber ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <Check className={`h-4 w-4 ${passwordGuidelines.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                          At least one number
                        </li>
                        <li className={`flex items-center gap-2 text-sm ${
                          passwordGuidelines.notCommon ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <Check className={`h-4 w-4 ${passwordGuidelines.notCommon ? 'text-green-600' : 'text-gray-300'}`} />
                          No easy guesses and banned passwords
                        </li>
                      </ul>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-2 ml-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedFields(prev => ({ ...prev, confirmPassword: true }))}
                      onBlur={() => setFocusedFields(prev => ({ ...prev, confirmPassword: false }))}
                      className={`w-full px-4 pt-6 pb-2 pr-12 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedFields.confirmPassword || formData.confirmPassword
                          ? 'top-2 text-xs text-gray-500'
                          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                      }`}
                    >
                      Confirm password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && formData.password && (
                    <div className="mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}

                  {errors.confirmPassword && (
                    <p className="mt-2 ml-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs text-gray-600">
                    By continuing, you agree to allow Travooz to contact you regarding your restaurant registration, including via text message.
                  </p>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                    onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                    onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}
