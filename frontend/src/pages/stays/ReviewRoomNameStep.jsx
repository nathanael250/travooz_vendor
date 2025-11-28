import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Edit2 } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function ReviewRoomNameStep() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  // Generate room name based on selections
  const generateRoomName = () => {
    const parts = [];
    
    // Add room type
    if (roomData.roomType) {
      parts.push(roomData.roomType);
    }
    
    // Add room view if available
    if (roomData.amenities?.hasView === 'yes' && roomData.amenities?.roomView) {
      parts.push(roomData.amenities.roomView);
    }
    
    // Add room class if available
    if (roomData.roomClass) {
      parts.push(roomData.roomClass);
    }

    return parts.length > 0 ? parts.join(', ') : 'Room';
  };

  const [roomName, setRoomName] = useState(() => {
    return generateRoomName();
  });

  useEffect(() => {
    const generated = generateRoomName();
    if (!customRoomName) {
      setRoomName(generated);
    }
  }, [roomData]);

  const handleEdit = () => {
    setIsEditing(true);
    setCustomRoomName(roomName);
  };

  const handleSave = () => {
    if (customRoomName.trim()) {
      setRoomName(customRoomName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCustomRoomName('');
  };

  const handleNext = () => {
    // Update room data with final room name
    const updatedRoomData = {
      ...roomData,
      roomName: roomName,
      step: 3
    };

    // Navigate to next step (step 4/5 - Base Rate, skipping Pricing Model)
    navigate('/stays/setup/base-rate', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 4
      }
    });
  };

  const handleBack = () => {
    // Go back to step 2 with room data
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
          <div className="flex gap-8">
            {/* Left Column - Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Review the room name</h1>
                  <p className="text-gray-600">
                    Based on your selections from previous steps, we created this name using details travelers find important. 
                    This makes it easier for them to compare rooms and to know what to expect when booking.
                  </p>
                </div>

                {/* Room Name Display */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      This is what travelers will see
                    </label>
                    {!isEditing ? (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="flex-1 text-lg font-semibold text-gray-900">
                          {roomName || 'Room'}
                        </p>
                        <button
                          type="button"
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={customRoomName}
                          onChange={(e) => setCustomRoomName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-lg font-semibold"
                          placeholder="Enter room name"
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 text-white font-semibold rounded-lg transition-colors"
                            style={{ backgroundColor: '#3CAF54' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50"
                            style={{ borderColor: '#d1d5db' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
                    <span className="font-medium">3/4</span>
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

            {/* Right Column - Sidebar Note */}
            <div className="w-80">
              <div className="bg-white rounded-lg shadow-xl p-6 border sticky top-8" style={{ borderColor: '#dcfce7' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  A quick note about room names
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We recommend a standard room name for a few different reasons:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#3CAF54] mt-1">•</span>
                    <span>It's created based off of information you gave us</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#3CAF54] mt-1">•</span>
                    <span>It's consistent across the site which makes it easier for travelers to find and compare rooms</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#3CAF54] mt-1">•</span>
                    <span>It's translated into different languages which makes it easier to understand for international travelers</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600">
                  If you'd like a custom room name, you can contact us after your listing is live and request one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}


