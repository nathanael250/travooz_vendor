import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function SetUpRoomStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable scrolling for this page
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  const [formData, setFormData] = useState({
    roomType: '',
    roomClass: '',
    smokingPolicy: '',
    numberOfRooms: 1,
    beds: [{ bedType: '', quantity: 1 }],
    recommendedOccupancy: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Room type options
  const roomTypes = [
    'Single Room',
    'Double or Twin Room',
    'Triple Room',
    'Quad Room',
    'Suite',
    'Studio',
    'Apartment',
    'Villa',
    'Cottage',
    'Cabin',
    'Other'
  ];

  // Room class options (optional)
  const roomClasses = [
    'Standard',
    'Superior',
    'Deluxe',
    'Executive',
    'Premium',
    'Junior Suite',
    'Suite',
    'Presidential Suite',
    'Penthouse'
  ];

  // Smoking policy options
  const smokingPolicies = [
    'Non-smoking',
    'Smoking',
    'Smoking and Non-smoking'
  ];

  // Bed type options
  const bedTypes = [
    'Single bed',
    'Double bed',
    'Queen bed',
    'King bed',
    'Twin bed',
    'Bunk bed',
    'Sofa bed',
    'Futon',
    'Murphy bed'
  ];

  // Calculate recommended occupancy based on beds
  useEffect(() => {
    let occupancy = 0;
    formData.beds.forEach(bed => {
      if (bed.bedType && bed.quantity) {
        // Estimate occupancy based on bed type
        const bedCapacity = {
          'Single bed': 1,
          'Twin bed': 1,
          'Double bed': 2,
          'Queen bed': 2,
          'King bed': 2,
          'Bunk bed': 2,
          'Sofa bed': 1,
          'Futon': 1,
          'Murphy bed': 1
        };
        occupancy += (bedCapacity[bed.bedType] || 1) * bed.quantity;
      }
    });
    setFormData(prev => ({ ...prev, recommendedOccupancy: occupancy }));
  }, [formData.beds]);

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

  const handleBedChange = (index, field, value) => {
    const newBeds = [...formData.beds];
    newBeds[index] = {
      ...newBeds[index],
      [field]: field === 'quantity' ? parseInt(value) || 1 : value
    };
    setFormData(prev => ({
      ...prev,
      beds: newBeds
    }));

    // Clear bed errors
    if (errors[`bed_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`bed_${index}`];
        return newErrors;
      });
    }
  };

  const handleAddBed = () => {
    setFormData(prev => ({
      ...prev,
      beds: [...prev.beds, { bedType: '', quantity: 1 }]
    }));
  };

  const handleRemoveBed = (index) => {
    if (formData.beds.length > 1) {
      setFormData(prev => ({
        ...prev,
        beds: prev.beds.filter((_, i) => i !== index)
      }));
    }
  };

  const handleQuantityChange = (index, delta) => {
    const newBeds = [...formData.beds];
    const currentQuantity = newBeds[index].quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + delta);
    newBeds[index] = {
      ...newBeds[index],
      quantity: newQuantity
    };
    setFormData(prev => ({
      ...prev,
      beds: newBeds
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!formData.smokingPolicy) {
      newErrors.smokingPolicy = 'Smoking policy is required';
    }

    if (!formData.numberOfRooms || formData.numberOfRooms < 1) {
      newErrors.numberOfRooms = 'Number of rooms must be at least 1';
    }

    // Validate beds
    formData.beds.forEach((bed, index) => {
      if (!bed.bedType) {
        newErrors[`bed_${index}`] = 'Bed type is required';
      }
      if (!bed.quantity || bed.quantity < 1) {
        newErrors[`bed_${index}`] = 'Bed quantity must be at least 1';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    // Store room data temporarily (will be saved to backend in later steps)
    const roomData = {
      ...formData,
      step: 1, // Current step in room setup (1/6)
      id: Date.now() // Temporary ID
    };

    // Navigate to next step (step 2/6 - Room Amenities)
    navigate('/stays/setup/room-amenities', {
      state: {
        ...location.state,
        roomData: roomData,
        roomSetupStep: 2
      }
    });
  };

  const handleExit = () => {
    navigate('/stays/setup/rooms', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={5} totalSteps={10} />

          {/* Navigation Link */}
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit to Rooms and Rates overview</span>
          </button>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Set up your room</h1>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              {/* Start with the basics */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Start with the basics</h2>
                <p className="text-sm text-gray-600">
                  Room types are the basic description of a room, like if it's a single or double. 
                  If you add a room class, make sure to use it consistently across all rooms.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                      errors.roomType ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                    }`}
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.roomType && (
                    <p className="mt-1 text-sm text-red-600">{errors.roomType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room class (optional)
                  </label>
                  <select
                    name="roomClass"
                    value={formData.roomClass}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                  >
                    <option value="">Select room class</option>
                    {roomClasses.map((roomClass) => (
                      <option key={roomClass} value={roomClass}>{roomClass}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Smoking policy */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">What's the smoking policy?</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoking policy <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="smokingPolicy"
                    value={formData.smokingPolicy}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                      errors.smokingPolicy ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                    }`}
                  >
                    <option value="">Select smoking policy</option>
                    {smokingPolicies.map((policy) => (
                      <option key={policy} value={policy}>{policy}</option>
                    ))}
                  </select>
                  {errors.smokingPolicy && (
                    <p className="mt-1 text-sm text-red-600">{errors.smokingPolicy}</p>
                  )}
                </div>
              </div>

              {/* Number of rooms */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">How many of these rooms do you have?</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of rooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfRooms"
                    value={formData.numberOfRooms}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                      errors.numberOfRooms ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                    }`}
                  />
                  {errors.numberOfRooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.numberOfRooms}</p>
                  )}
                </div>
              </div>

              {/* Sleeping spaces */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Set up sleeping spaces</h2>
                <p className="text-sm text-gray-600">
                  Adding the number of beds and bed types sets the occupancy for this room. 
                  You can add cribs and rollaways after you're live.
                </p>
                
                {formData.beds.map((bed, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg" style={{ borderColor: '#dcfce7' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bed type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bed.bedType}
                        onChange={(e) => handleBedChange(index, 'bedType', e.target.value)}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors[`bed_${index}`] ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                        }`}
                      >
                        <option value="">Select bed type</option>
                        {bedTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors[`bed_${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`bed_${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How many of these beds?
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, -1)}
                          disabled={bed.quantity <= 1}
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderColor: '#3CAF54', color: '#3CAF54' }}
                          onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#f0fdf4')}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                          {bed.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, 1)}
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors"
                          style={{ borderColor: '#3CAF54', color: '#3CAF54' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {formData.beds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBed(index)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove bed type
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddBed}
                  className="flex items-center gap-2 text-[#3CAF54] hover:text-[#2d8f42] font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add another bed type</span>
                </button>
              </div>

              {/* Recommended occupancy */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-500">Recommended occupancy</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg font-semibold text-gray-700">
                    {formData.recommendedOccupancy > 0 
                      ? `${formData.recommendedOccupancy} ${formData.recommendedOccupancy === 1 ? 'guest' : 'guests'}`
                      : 'Calculated based on bed configuration'
                    }
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">1/6</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
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

