import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function ListYourPropertyStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationData = location.state?.locationData || null;
  const previousLocation = location.state?.location || '';

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: '',
    numberOfRooms: '',
    legalName: '',
    partOfChain: 'no',
    bookingComUrl: ''
  });

  const [errors, setErrors] = useState({});

  const propertyTypes = [
    'Hotel',
    'Apartment',
    'Guesthouse',
    'Hostel',
    'Resort',
    'Villa',
    'Cottage',
    'Cabin',
    'Other'
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation is optional - user can proceed without filling all fields
    // Navigate to next step with form data
    navigate('/stays/list-your-property/step-3', {
      state: {
        ...location.state,
        step2Data: formData
      }
    });
  };

  const handleBack = () => {
    navigate('/stays/list-your-property', {
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
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#bbf7d0', color: '#1f6f31' }}>
                  1
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#bbf7d0' }}></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Tell us about your property
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                />
              </div>

              {/* Property type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property type <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                >
                  <option value="">-- Select property type --</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Number of rooms/units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of rooms/units <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  name="numberOfRooms"
                  value={formData.numberOfRooms}
                  onChange={handleChange}
                  placeholder="Enter number of rooms"
                  min="1"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                />
              </div>

              {/* Legal name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal name of your property <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder="Enter legal name"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                />
              </div>

              {/* Part of chain */}
              {/*
            <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is this property part of a chain?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="partOfChain"
                    value="yes"
                    checked={formData.partOfChain === 'yes'}
                    onChange={handleChange}
                    className="w-4 h-4 mr-2 cursor-pointer"
                    style={{ accentColor: '#3CAF54' }}
                  />
                  <span className="text-gray-700 group-hover:text-[#3CAF54] transition-colors">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="partOfChain"
                    value="no"
                    checked={formData.partOfChain === 'no'}
                    onChange={handleChange}
                    className="w-4 h-4 mr-2 cursor-pointer"
                    style={{ accentColor: '#3CAF54' }}
                  />
                  <span className="text-gray-700 group-hover:text-[#3CAF54] transition-colors">No</span>
                </label>
              </div>
            </div>
*/}
              {/* Booking.com URL Section */}
              {/* <div className="p-5 rounded-lg border-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Link your Booking.com listing (optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect your Booking.com listing to automatically import property details.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="bookingComUrl"
                  value={formData.bookingComUrl}
                  onChange={handleChange}
                  placeholder="https://www.booking.com/hotel/..."
                  className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[#3CAF54] focus:ring-2 focus:ring-[#3CAF54]/20"
                />
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg font-medium text-white transition-colors shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                >
                  Add
                </button>
              </div>
            </div> */}

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
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
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

