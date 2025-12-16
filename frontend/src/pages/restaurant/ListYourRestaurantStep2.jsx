import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import PhoneInput from '../../components/common/PhoneInput';

export default function ListYourRestaurantStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationData = location.state?.locationData || null;
  const previousLocation = location.state?.location || '';

  // Enable scrolling for this page
  React.useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Try to prefill step2 form from navigation state or localStorage (auto-fill previously entered phone)
  const getInitialFormData = () => {
    // Prefer navigation state (when user navigates back/forward between steps)
    const navStep2 = location.state?.step2Data || null;

    // Also accept a few localStorage keys that may contain previous content (graceful fallback)
    const rawLocalPhone = (() => {
      const candidates = [
        localStorage.getItem('phone'),
        localStorage.getItem('restaurant_step2'),
        localStorage.getItem('step2Data'),
        localStorage.getItem('vendor_step2')
      ];
      for (const c of candidates) {
        if (!c) continue;
        // If this looks like JSON, try to parse and extract phone
        try {
          const parsed = JSON.parse(c);
          if (parsed && parsed.phone) return parsed.phone;
        } catch (e) {
          // not JSON - maybe it's the phone string itself
          return c;
        }
      }
      return null;
    })();

    const prevPhone = navStep2?.phone || rawLocalPhone || '';

    // Parse phone string into countryCode and phoneNumber
    let countryCode = '+250';
    let phoneNumber = '';
    if (prevPhone && prevPhone.toString().trim()) {
      const p = prevPhone.toString().trim();
      // If starts with + and digits: +250789xxx
      const match = p.match(/^(\+\d{1,4})(\d+)$/);
      if (match) {
        countryCode = match[1];
        phoneNumber = match[2];
      } else {
        // Strip non-digits and try to heuristically split
        const digits = p.replace(/\D/g, '');
        if (digits.length >= 7 && digits.length <= 9) {
          // likely local number, keep default country code
          phoneNumber = digits;
        } else if (digits.length > 9) {
          // assume leading digits are country code
          const ccLen = digits.length - 9; // assume national number is last 9 digits
          countryCode = `+${digits.slice(0, ccLen)}`;
          phoneNumber = digits.slice(ccLen);
        } else {
          // fallback: set whatever we have
          phoneNumber = digits;
        }
      }
    }

    return {
      restaurantName: navStep2?.restaurantName || '',
      restaurantType: navStep2?.restaurantType || '',
      restaurantTypeName: navStep2?.restaurantTypeName || '',
      subcategoryId: navStep2?.subcategoryId || '',
      description: navStep2?.description || '',
      countryCode,
      phoneNumber,
      wantsNotifications: navStep2?.wantsNotifications || 'no',
      notificationReceiver: navStep2?.notificationReceiver || ''
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const [errors, setErrors] = useState({});

  // Mock restaurant types for testing
  const restaurantTypes = [
    { subcategory_id: 1, name: 'Fine Dining' },
    { subcategory_id: 2, name: 'Casual Dining' },
    { subcategory_id: 3, name: 'Fast Food' },
    { subcategory_id: 4, name: 'Cafe' },
    { subcategory_id: 5, name: 'Bar & Grill' },
    { subcategory_id: 6, name: 'Buffet' },
    { subcategory_id: 7, name: 'Food Truck' },
    { subcategory_id: 8, name: 'Bakery' },
    { subcategory_id: 9, name: 'Other' }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear notification receiver email if user selects "no"
    if (name === 'wantsNotifications' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        notificationReceiver: ''
      }));
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }
    
    // If restaurant type changes, also update subcategoryId and name
    if (name === 'restaurantType') {
      const selectedType = restaurantTypes.find(type => type.subcategory_id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subcategoryId: selectedType ? selectedType.subcategory_id : '',
        restaurantTypeName: selectedType ? selectedType.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    // Basic validation
    const newErrors = {};
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    if (!formData.subcategoryId) {
      newErrors.restaurantType = 'Restaurant type is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Just collect data and navigate to next step (no API call yet)
    // The restaurant listing will be created in Step 3 along with the user account
    navigate('/restaurant/list-your-restaurant/step-3', {
        state: {
        ...location.state,
        step2Data: {
          ...formData,
          phone: `${formData.countryCode}${formData.phoneNumber}`
        }
      }
    });
  };

  const isSubmitting = false; // No API call in this step

  const handleBack = () => {
    navigate('/restaurant/list-your-restaurant', {
      state: {
        location: previousLocation,
        locationData: locationData
      }
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
                  Step 2 of 3
                </span>
                <span className="text-xs text-gray-500">67%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: '#3CAF54', width: '67%' }}
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
                  2
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  3
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium hidden md:block" style={{ color: '#1f6f31' }}>Step 2 of 3</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Tell us about your restaurant
            </h1>
            
            <p className="text-gray-600 text-center mb-8">
              Provide some basic information about your restaurant.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="restaurantName"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Enter your restaurant name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.restaurantName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.restaurantName && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
                )}
              </div>

              <div>
                <label htmlFor="restaurantType" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Type *
                </label>
                <select
                  id="restaurantType"
                  name="restaurantType"
                  value={formData.restaurantType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.restaurantType ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                >
                  <option value="">-- Select Type --</option>
                  {restaurantTypes.map(type => (
                    <option key={type.subcategory_id} value={type.subcategory_id.toString()}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.restaurantType && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantType}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your restaurant, cuisine, atmosphere, etc."
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <PhoneInput
                    countryCode={formData.countryCode}
                    phone={formData.phoneNumber}
                    phoneName="phoneNumber"
                    onChange={(code, phoneNum) => {
                      setFormData(prev => ({
                        ...prev,
                        countryCode: code,
                        phoneNumber: phoneNum
                      }));
                      // Clear error
                      if (errors.phoneNumber) {
                        setErrors(prev => ({
                          ...prev,
                          phoneNumber: ''
                        }));
                      }
                    }}
                    placeholder="7XX XXX XXX"
                    error={!!errors.phoneNumber}
                    errorMessage={errors.phoneNumber}
                    required
                  />
                </div>
              </div>

              {locationData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Selected Location:</p>
                  <p className="text-sm text-green-700">{locationData.formatted_address}</p>
                </div>
              )}

              {/* Notification Receiver Section */}
              <div className="bg-gray-50 rounded-lg p-5 border" style={{ borderColor: '#e5e7eb' }}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you want to receive notifications from travooz.com?
                </label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="wantsNotifications"
                      value="yes"
                      checked={formData.wantsNotifications === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4 mr-2 cursor-pointer"
                      style={{ accentColor: '#3CAF54' }}
                    />
                    <span className="text-gray-700 group-hover:text-[#3CAF54] transition-colors">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="wantsNotifications"
                      value="no"
                      checked={formData.wantsNotifications === 'no'}
                      onChange={handleChange}
                      className="w-4 h-4 mr-2 cursor-pointer"
                      style={{ accentColor: '#3CAF54' }}
                    />
                    <span className="text-gray-700 group-hover:text-[#3CAF54] transition-colors">No</span>
                  </label>
                </div>
                {formData.wantsNotifications === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Receiver Email *
                    </label>
                    <input
                      type="email"
                      name="notificationReceiver"
                      value={formData.notificationReceiver}
                      onChange={handleChange}
                      placeholder="Enter email address for notifications"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This email will receive important notifications and updates from travooz.com
                    </p>
                  </div>
                )}
              </div>

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
                      <span>Creating...</span>
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

