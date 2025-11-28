import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ExternalLink, Info, Check } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function PricingModelStep() {
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
  const [pricingModel, setPricingModel] = useState(roomData.pricingModel || 'per-day');

  const handleNext = () => {
    // Update room data with pricing model
    const updatedRoomData = {
      ...roomData,
      pricingModel: pricingModel,
      step: 4
    };

    // Navigate to next step (step 5/6 - Base Rate)
    navigate('/stays/setup/base-rate', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 5
      }
    });
  };

  const handleBack = () => {
    // Go back to step 3 with room data
    navigate('/stays/setup/review-room-name', {
      state: {
        ...location.state,
        roomData: roomData,
        roomSetupStep: 3
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
        <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Let's get your pricing model set up</h1>
              <p className="text-gray-600">
                Your pricing model will be applied to this property. You'll have to contact us to change your pricing model, 
                so make sure you pick the one that's best for you.
              </p>
            </div>

            {/* Connectivity Provider Info Box */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Using connectivity provider?</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    If you use a channel manager, make sure to choose the pricing model that your channel manager supports.
                  </p>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle learn more link
                    }}
                  >
                    Learn more about connectivity provider
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Pricing Model Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select your pricing model</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Per-day Pricing Card */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    pricingModel === 'per-day'
                      ? 'border-[#3CAF54] bg-[#f0fdf4]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPricingModel('per-day')}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <input
                      type="radio"
                      name="pricingModel"
                      value="per-day"
                      checked={pricingModel === 'per-day'}
                      onChange={() => setPricingModel('per-day')}
                      className="mt-1 w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54] cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Per-day pricing</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This is the most common pricing option. You charge a nightly rate for one or two people. 
                        You can charge extra for additional guests.
                      </p>
                      
                      {/* Benefits */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Recommended if you have only a few people staying in your rooms
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            You'll only have one rate, so it's easier to manage
                          </span>
                        </div>
                      </div>

                      {/* Example Table */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-700">Example</span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          <div className="flex justify-between items-center px-4 py-3">
                            <span className="text-sm text-gray-700">
                              <span className="inline-block mr-2">👤</span>
                              <span className="inline-block mr-2">👤</span>
                              <span className="inline-block mr-2">x1</span>
                              <span className="text-gray-400">or</span>
                              <span className="inline-block mx-2">👤</span>
                              <span className="inline-block mx-2">👤</span>
                              <span className="inline-block mx-2">x2</span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">100/night</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                            <span className="text-sm text-gray-700">Extra person fee</span>
                            <span className="text-sm font-semibold text-gray-900">20/night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Occupancy-based Pricing Card */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    pricingModel === 'occupancy-based'
                      ? 'border-[#3CAF54] bg-[#f0fdf4]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPricingModel('occupancy-based')}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <input
                      type="radio"
                      name="pricingModel"
                      value="occupancy-based"
                      checked={pricingModel === 'occupancy-based'}
                      onChange={() => setPricingModel('occupancy-based')}
                      className="mt-1 w-5 h-5 text-[#3CAF54] focus:ring-[#3CAF54] cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Occupancy-based pricing</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This is a good option if you have a bunch of rooms with a high occupancy rate, like a hostel.
                      </p>
                      
                      {/* Benefits */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Recommended if you have different rates based on the number of travelers
                          </span>
                        </div>
                      </div>

                      {/* Example Table */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-700">Example</span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          <div className="flex justify-between items-center px-4 py-3">
                            <span className="text-sm text-gray-700">
                              <span className="inline-block mr-2">👤</span>
                              <span>x1</span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">80/night</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                            <span className="text-sm text-gray-700">
                              <span className="inline-block mr-2">👤</span>
                              <span className="inline-block mr-2">👤</span>
                              <span>x2</span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">100/night</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3">
                            <span className="text-sm text-gray-700">
                              <span className="inline-block mr-2">👤</span>
                              <span className="inline-block mr-2">👤</span>
                              <span className="inline-block mr-2">👤</span>
                              <span>x3</span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">120/night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                <span className="font-medium">4/6</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
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

