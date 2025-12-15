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

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Redirect if no user data
  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/stays/login');
    }
  }, [location.state, navigate]);

  // Get room data from previous steps
  const roomData = location.state?.roomData || {};

  // Validate that room data exists - redirect if no valid room data
  useEffect(() => {
    // Check if roomData has minimum required fields (roomType is required to create a room)
    const hasValidRoomData = roomData && (
      roomData.roomType || 
      roomData.room_type || 
      roomData.room_id || 
      roomData.roomId || 
      roomData.id
    );

    if (!hasValidRoomData) {
      // No valid room data - redirect back to rooms setup
      console.warn('No valid room data found, redirecting to rooms setup');
      navigate('/stays/setup/rooms', {
        state: location.state,
        replace: true
      });
    }
  }, [roomData, navigate, location.state]);
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

  // Load room name from roomData if it exists, otherwise generate it
  // IMPORTANT: When editing, remove "(Copy)" suffix if present so user can change it
  const getInitialRoomName = () => {
    if (roomData.roomName) {
      // If editing a copied room, remove "(Copy)" suffix to allow user to change it
      const name = roomData.roomName.replace(/\s*\(Copy\)\s*$/, '').trim();
      return name || generateRoomName();
    }
    return generateRoomName();
  };

  const [roomName, setRoomName] = useState(() => getInitialRoomName());

  useEffect(() => {
    // Only update if we don't have a custom room name set
    // This preserves user's custom name when navigating back
    if (roomData.roomName && !customRoomName) {
      // Remove "(Copy)" suffix when loading for editing
      const cleanedName = roomData.roomName.replace(/\s*\(Copy\)\s*$/, '').trim();
      setRoomName(cleanedName || generateRoomName());
    } else if (!roomData.roomName && !customRoomName) {
      const generated = generateRoomName();
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
    // IMPORTANT: Remove "(Copy)" suffix if present - user may have edited the name
    const cleanedRoomName = roomName.replace(/\s*\(Copy\)\s*$/, '').trim() || roomName;
    
    // IMPORTANT: Explicitly preserve all ID fields for editing
    const updatedRoomData = {
      ...roomData,
      roomName: cleanedRoomName, // Use cleaned name without "(Copy)" suffix
      step: 3,
      // Preserve all ID fields explicitly (critical for editing existing rooms)
      room_id: roomData.room_id || roomData.roomId || roomData.id,
      roomId: roomData.roomId || roomData.room_id || roomData.id,
      id: roomData.id || roomData.roomId || roomData.room_id
    };

    // Navigate to next step (step 4/5 - Base Rate, skipping Pricing Model)
    // IMPORTANT: Preserve isEdit and isCopy flags
    navigate('/stays/setup/base-rate', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 4,
        isEdit: location.state?.isEdit || false,
        isCopy: location.state?.isCopy || false
      }
    });
  };

  const handleBack = () => {
    // Preserve current room name in roomData when going back
    // IMPORTANT: Remove "(Copy)" suffix if present
    const cleanedRoomName = roomName.replace(/\s*\(Copy\)\s*$/, '').trim() || roomName;
    
    // IMPORTANT: Explicitly preserve all ID fields for editing
    const updatedRoomData = {
      ...roomData,
      roomName: cleanedRoomName, // Save cleaned room name without "(Copy)" suffix
      step: 3,
      // Preserve all ID fields explicitly (critical for editing existing rooms)
      room_id: roomData.room_id || roomData.roomId || roomData.id,
      roomId: roomData.roomId || roomData.room_id || roomData.id,
      id: roomData.id || roomData.roomId || roomData.room_id
    };
    
    // Go back to step 2 with updated room data (preserving room name)
    // IMPORTANT: Preserve isEdit and isCopy flags
    navigate('/stays/setup/room-amenities', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 2,
        isEdit: location.state?.isEdit || false,
        isCopy: location.state?.isCopy || false
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
          <ProgressIndicator currentStep={4} totalSteps={10} />

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


