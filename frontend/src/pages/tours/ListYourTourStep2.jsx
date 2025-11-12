import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ListYourTourStep2() {
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
    tourBusinessName: '',
    tourType: '',
    tourTypeName: '',
    subcategoryId: '',
    description: '',
    phone: '',
    currency: 'RWF',
  });

  const [errors, setErrors] = useState({});

  // Tour types
  const tourTypes = [
    { subcategory_id: 1, name: 'Adventure Tours' },
    { subcategory_id: 2, name: 'Cultural Tours' },
    { subcategory_id: 3, name: 'Safari Tours' },
    { subcategory_id: 4, name: 'City Tours' },
    { subcategory_id: 5, name: 'Nature Tours' },
    { subcategory_id: 6, name: 'Wildlife Tours' },
    { subcategory_id: 7, name: 'Historical Tours' },
    { subcategory_id: 8, name: 'Multi-Day Tours' },
    { subcategory_id: 9, name: 'Other' }
  ];

  const currencies = [
    { value: 'RWF', label: 'RWF - Rwandan Franc' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If tour type changes, also update subcategoryId and name
    if (name === 'tourType') {
      const selectedType = tourTypes.find(type => type.subcategory_id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subcategoryId: selectedType ? selectedType.subcategory_id : '',
        tourTypeName: selectedType ? selectedType.name : ''
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
    if (!formData.tourBusinessName.trim()) {
      newErrors.tourBusinessName = 'Business name is required';
    }
    if (!formData.subcategoryId) {
      newErrors.tourType = 'Tour type is required';
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
    // The tour business will be created in Step 3 along with the user account
    navigate('/tours/list-your-tour/step-3', {
      state: {
        ...location.state,
        step2Data: formData
      }
    });
  };

  const isSubmitting = false; // No API call in this step

  const handleBack = () => {
    navigate('/tours/list-your-tour', {
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
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 2 of 3</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Tell us about your tour business
            </h1>
            
            <p className="text-gray-600 text-center mb-8">
              Provide some basic information about your tour business.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="tourBusinessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Business Name *
                </label>
                <input
                  type="text"
                  id="tourBusinessName"
                  name="tourBusinessName"
                  value={formData.tourBusinessName}
                  onChange={handleChange}
                  placeholder="Enter your tour business name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.tourBusinessName ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.tourBusinessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.tourBusinessName}</p>
                )}
              </div>

              <div>
                <label htmlFor="tourType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Type *
                </label>
                <select
                  id="tourType"
                  name="tourType"
                  value={formData.tourType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.tourType ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                >
                  <option value="">-- Select Type --</option>
                  {tourTypes.map(type => (
                    <option key={type.subcategory_id} value={type.subcategory_id.toString()}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.tourType && (
                  <p className="mt-1 text-sm text-red-600">{errors.tourType}</p>
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
                  placeholder="Describe your tour business, services, specialties, etc."
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

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all border-gray-300 focus:border-green-500"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {locationData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Selected Location:</p>
                  <p className="text-sm text-green-700">{locationData.formatted_address}</p>
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

