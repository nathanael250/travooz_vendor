import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, FileText, Phone, Mail, Globe, Clock, FileEdit } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { restaurantSetupService } from '../../services/eatingOutService';

export default function BusinessDetailsStep() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationData = location.state?.locationData || null;
  const step2Data = location.state?.step2Data || {};
  const userId = location.state?.userId;
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    restaurantName: step2Data.restaurantName || '',
    businessRegistrationNumber: '',
    contactNumber: step2Data.phone || '',
    emailAddress: email || '',
    website: '',
    socialMediaLinks: '',
    is24Hours: false,
    openingTime: '',
    closingTime: '',
    shortDescription: step2Data.description || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Validation
    const newErrors = {};
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
    } else if (!formData.emailAddress.includes('@')) {
      newErrors.emailAddress = 'Invalid email format';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const restaurantId = location.state?.restaurantId;
    if (!restaurantId) {
      setSubmitError('Restaurant ID is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save business details via API
      await restaurantSetupService.saveBusinessDetails(restaurantId, formData);
      
      // Navigate to next setup step (Media)
      navigate('/restaurant/setup/media', {
        state: {
          ...location.state,
          businessDetails: formData,
          restaurantId
        }
      });
    } catch (error) {
      console.error('Error saving business details:', error);
      setSubmitError(error.message || 'Failed to save business details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/restaurant/list-your-restaurant/step-3', {
      state: {
        location: location.state?.location || '',
        locationData: locationData,
        step2Data: step2Data
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  ✓
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  2
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  3
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  4
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  5
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  6
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  7
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Setup Step 2 of 8</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8" style={{ color: '#3CAF54' }} />
              <h1 className="text-3xl font-bold text-gray-900">
                Business Details
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Please provide your restaurant's business information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Enter restaurant name"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.restaurantName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.restaurantName && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
                )}
              </div>

              {/* Business Registration Number */}
              <div>
                <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="businessRegistrationNumber"
                    name="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={handleChange}
                    placeholder="Enter business registration number (optional)"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Contact Number and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+250 7XX XXX XXX"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="emailAddress"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="restaurant@example.com"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.emailAddress ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.emailAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
                  )}
                </div>
              </div>

              {/* Website and Social Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.example.com"
                      className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="socialMediaLinks" className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <input
                    type="text"
                    id="socialMediaLinks"
                    name="socialMediaLinks"
                    value={formData.socialMediaLinks}
                    onChange={handleChange}
                    placeholder="Facebook, Instagram, Twitter links"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Operating Hours
                </label>
                
                {/* 24/7 Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is24Hours"
                      checked={formData.is24Hours}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      style={{ accentColor: '#3CAF54' }}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Open 24/7
                    </span>
                  </label>
                </div>

                {/* Time Selectors - Only show if not 24/7 */}
                {!formData.is24Hours && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Time
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          id="openingTime"
                          name="openingTime"
                          value={formData.openingTime}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Closing Time
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          id="closingTime"
                          name="closingTime"
                          value={formData.closingTime}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Restaurant Description *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <FileEdit className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your restaurant, cuisine, atmosphere, etc."
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                      errors.shortDescription ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                )}
              </div>

              {/* Location Display */}
              {locationData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Selected Location:</p>
                  <p className="text-sm text-green-700">{locationData.formatted_address}</p>
                </div>
              )}

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </div>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  {isSubmitting ? (
                    <>
                      <span>Saving...</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
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

