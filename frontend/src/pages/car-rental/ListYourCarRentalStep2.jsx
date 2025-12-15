import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ListYourCarRentalStep2() {
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

  const [formData, setFormData] = useState({
    carRentalBusinessName: '',
    carTypes: [], // Changed to array for multiple selections
    carTypeNames: [], // Array to store selected car type names
    subcategoryIds: [], // Array to store selected subcategory IDs
    description: '',
    phone: '',
    wantsNotifications: 'no',
    notificationReceiver: ''
  });

  const [errors, setErrors] = useState({});

  // Car rental types
  const carTypes = [
    { subcategory_id: 1, name: 'Economy Cars' },
    { subcategory_id: 2, name: 'Compact Cars' },
    { subcategory_id: 3, name: 'Mid-Size Cars' },
    { subcategory_id: 4, name: 'Full-Size Cars' },
    { subcategory_id: 5, name: 'Luxury Cars' },
    { subcategory_id: 6, name: 'SUVs' },
    { subcategory_id: 7, name: 'Vans & Minivans' },
    { subcategory_id: 8, name: 'Trucks' },
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
    
    // Handle other fields normally
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
    
    // Basic validation
    const newErrors = {};
    if (!formData.carRentalBusinessName.trim()) {
      newErrors.carRentalBusinessName = 'Business name is required';
    }
    if (!formData.subcategoryIds || formData.subcategoryIds.length === 0) {
      newErrors.carTypes = 'At least one car type is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Just collect data and navigate to next step (no API call yet)
    navigate('/car-rental/list-your-car-rental/step-3', {
      state: {
        ...location.state,
        step2Data: formData
      }
    });
  };

  const handleBack = () => {
    navigate('/car-rental/list-your-car-rental', {
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
              Tell us about your car rental business
            </h1>
            
            <p className="text-gray-600 text-center mb-8">
              Provide some basic information about your car rental business.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="carRentalBusinessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Car Rental Business Name *
                </label>
                <input
                  type="text"
                  id="carRentalBusinessName"
                  name="carRentalBusinessName"
                  value={formData.carRentalBusinessName}
                  onChange={handleChange}
                  placeholder="Enter your car rental business name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.carRentalBusinessName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.carRentalBusinessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.carRentalBusinessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Types * (Select all that apply)
                </label>
                <div className={`border-2 rounded-lg p-4 ${
                  errors.carTypes ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {carTypes.map(type => {
                      const isChecked = formData.subcategoryIds.includes(type.subcategory_id);
                      return (
                        <label
                          key={type.subcategory_id}
                          className="flex items-center cursor-pointer group p-2 rounded hover:bg-green-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => {
                                if (checked) {
                                  // Add to arrays
                                  return {
                                    ...prev,
                                    subcategoryIds: [...prev.subcategoryIds, type.subcategory_id],
                                    carTypeNames: [...prev.carTypeNames, type.name],
                                    carTypes: [...prev.carTypes, type.subcategory_id.toString()]
                                  };
                                } else {
                                  // Remove from arrays
                                  return {
                                    ...prev,
                                    subcategoryIds: prev.subcategoryIds.filter(id => id !== type.subcategory_id),
                                    carTypeNames: prev.carTypeNames.filter(name => name !== type.name),
                                    carTypes: prev.carTypes.filter(id => id !== type.subcategory_id.toString())
                                  };
                                }
                              });
                              // Clear error when user makes a selection
                              if (errors.carTypes) {
                                setErrors(prev => ({
                                  ...prev,
                                  carTypes: ''
                                }));
                              }
                            }}
                            className="w-4 h-4 mr-3 cursor-pointer"
                            style={{ accentColor: '#3CAF54' }}
                          />
                          <span className="text-gray-700 group-hover:text-[#3CAF54] transition-colors">
                            {type.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {errors.carTypes && (
                  <p className="mt-1 text-sm text-red-600">{errors.carTypes}</p>
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
                  placeholder="Describe your car rental business, services, specialties, etc."
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250 7XX XXX XXX"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
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
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5" />
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















