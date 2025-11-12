import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

export default function BaseRateStep() {
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

  // Get room data from previous steps
  const roomData = location.state?.roomData || {};
  
  // Get recommended occupancy from room setup (Step 1)
  const recommendedOccupancy = roomData.recommendedOccupancy || roomData.numberOfBeds?.reduce((sum, bed) => sum + (parseInt(bed.quantity) || 0), 0) || 2;
  const maxOccupancy = Math.max(recommendedOccupancy, 2);

  const [baseRate, setBaseRate] = useState(roomData.baseRate || '');
  const [peopleIncluded, setPeopleIncluded] = useState(roomData.peopleIncluded || maxOccupancy.toString());
  
  // Generate occupancy options based on recommended/max occupancy
  const occupancyOptions = Array.from({ length: maxOccupancy }, (_, i) => i + 1).map(num => ({
    value: num.toString(),
    label: num === maxOccupancy ? `${num} (maximum occupancy)` : num.toString()
  }));

  const handleNext = () => {
    // Validate base rate
    if (!baseRate || parseFloat(baseRate) <= 0) {
      alert('Please enter a valid base rate');
      return;
    }

    // Update room data with base rate information
    const updatedRoomData = {
      ...roomData,
      baseRate: parseFloat(baseRate),
      peopleIncluded: parseInt(peopleIncluded),
      step: 5
    };

    // Navigate to next step (step 6/6 - Rate Plans)
    navigate('/stays/setup/rate-plans', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 6
      }
    });
  };

  const handleBack = () => {
    // Go back to step 4 with room data
    navigate('/stays/setup/pricing-model', {
      state: {
        ...location.state,
        roomData: roomData,
        roomSetupStep: 4
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
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Steps 1-5 - Completed */}
                {[1, 2, 3, 4, 5].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      {step === 5 ? '5' : <span>✓</span>}
                    </div>
                    {step < 5 && <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>}
                  </React.Fragment>
                ))}
                
                {/* Steps 6-10 - Not completed */}
                {[6, 7, 8, 9, 10].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300">
                      {step}
                    </div>
                    {step < 10 && <div className="w-16 h-1 bg-gray-300"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 5 of 10</p>
          </div>

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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Set your base rate to be competitive</h1>
              <p className="text-gray-600">
                Travelers will see these rates when searching for rooms. You can update this at any time. 
                Add rates for adults now - you can add rates for kids and infants after you're live.
              </p>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Rate Input */}
                <div>
                  <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Base rate per night (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="baseRate"
                      name="baseRate"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    This is the price travelers would pay, including taxes
                  </p>
                </div>

                {/* People Included Dropdown */}
                <div>
                  <label htmlFor="peopleIncluded" className="block text-sm font-medium text-gray-700 mb-2">
                    People included in base rate
                  </label>
                  <select
                    id="peopleIncluded"
                    name="peopleIncluded"
                    value={peopleIncluded}
                    onChange={(e) => setPeopleIncluded(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-lg appearance-none bg-white cursor-pointer"
                  >
                    {occupancyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div className="text-sm text-gray-500">
                <span className="font-medium">5/6</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!baseRate || parseFloat(baseRate) <= 0}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#2d8f42';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#3CAF54';
                  }
                }}
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

