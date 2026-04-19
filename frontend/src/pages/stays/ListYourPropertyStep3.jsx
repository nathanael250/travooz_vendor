import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import toast from 'react-hot-toast';
import { createProperty } from '../../services/staysService';
import PhoneInput from '../../components/common/PhoneInput';
import { setToken, getToken, SERVICES } from '../../utils/tokenManager';

export default function ListYourPropertyStep3() {
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
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const isVendor = (user?.role || '').toLowerCase() === 'vendor';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+250',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const step2Data = location.state?.step2Data || {};
  const selectedLocation = location.state?.location || '';
  const selectedLocationData = location.state?.locationData || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!step2Data || Object.keys(step2Data).length === 0) {
      toast.error('Please provide your property information first.');
      return;
    }

    if (!isVendor) {
      setSubmitError('');

      const newErrors = {};

      if (!formData.email.trim()) {
        newErrors.email = 'Cannot be left blank';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Cannot be left blank';
      } else {
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
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        // Location data from Step 1
        location: selectedLocation,
        locationData: selectedLocationData,
        // Property data from Step 2
        propertyName: step2Data.propertyName || '',
        propertyType: step2Data.propertyType || '',
        numberOfRooms: step2Data.numberOfRooms ? parseInt(step2Data.numberOfRooms) : undefined,
        legalName: step2Data.legalName || '',
        currency: step2Data.currency || 'RWF',
        channelManager: step2Data.channelManager || 'no',
        partOfChain: step2Data.partOfChain || 'no',
        bookingComUrl: step2Data.bookingComUrl || '',
        // User account data from Step 3
        firstName: formData.firstName,
        lastName: formData.lastName,
        countryCode: formData.countryCode,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      };

      const apiResponse = await createProperty(payload);
      const responseData = apiResponse || {};

      const propertyId = responseData.property_id;
      const userId = responseData.user_id;
      const token = responseData.token;

      if (!propertyId || !userId) {
        toast.error('Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Store token using tokenManager
      if (token) {
        setToken(SERVICES.STAYS, token);
      }

      // Store user data
      const derivedName = `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0];
      const createdUser = {
        id: userId,
        user_id: userId,
        role: 'vendor',
        name: derivedName,
        email: formData.email,
        phone: formData.phone || null,
        property_id: propertyId
      };
      localStorage.setItem('user', JSON.stringify(createdUser));
      localStorage.setItem('stays_property_id', String(propertyId));
      localStorage.setItem('service_type', 'stays');
      setUser(createdUser);

      toast.success('Property registration saved successfully!');

      // Navigate to email verification
      const finalEmail = formData.email;
      const finalUserName = `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0];

      setTimeout(() => {
        navigate('/stays/list-your-property/verify-email', {
          state: {
            ...location.state,
            location: selectedLocation,
            locationData: selectedLocationData,
            step2Data: step2Data,
            propertyId,
            userId,
            email: finalEmail,
            userName: finalUserName
          }
        });
      }, 100);
    } catch (error) {
      console.error('Error creating property:', error);

      if (error.errors) {
        const validationErrors = {};
        error.errors.forEach((err) => {
          if (err.field === 'email') validationErrors.email = err.message;
          if (err.field === 'password') validationErrors.password = err.message;
          if (err.field === 'phone') validationErrors.phone = err.message;
        });
        setErrors(validationErrors);
      } else {
        setSubmitError(error.message || 'Failed to create property. Please try again.');
      }

      toast.error(error.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/stays/list-your-property/step-2', {
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
              Sign in to set up your new property if you already have an account.{' '}
              <button
                type="button"
                onClick={() => navigate('/stays/login')}
                className="text-[#3CAF54] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name and Last Name */}
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
              <div>
                <PhoneInput
                  countryCode={formData.countryCode}
                  phone={formData.phone}
                  onChange={(code, phoneNum) => {
                    setFormData(prev => ({
                      ...prev,
                      countryCode: code,
                      phone: phoneNum
                    }));
                    setFocusedFields(prev => ({ ...prev, phone: true }));
                    if (errors.phone) {
                      setErrors(prev => ({
                        ...prev,
                        phone: ''
                      }));
                    }
                  }}
                  placeholder="7XX XXX XXX"
                  error={!!errors.phone}
                  errorMessage={errors.phone}
                  required
                />
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
                
                {/* Password Strength Indicator */}
                {formData.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.level === 'strong' ? 'text-green-600' :
                        passwordStrength.level === 'medium' ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.level === 'strong' ? 'bg-green-500' :
                          passwordStrength.level === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
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

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              )}

              {/* Buttons */}
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
                      <span>Creating...</span>
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
          </div>
        </div>
      </div>
      <StaysFooter />
    </div>
  );
}
