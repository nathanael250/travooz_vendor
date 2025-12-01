import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, MoreVertical, Info, Copy, CheckCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function RoomsAndRatesStep() {
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

  const [rooms, setRooms] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(null);

  // Load rooms from localStorage
  useEffect(() => {
    const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
    setRooms(savedRooms);

    // Show toast if coming from room setup completion
    if (location.state?.roomAdded) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  }, [location.state]);

  // Calculate totals
  const finishedRooms = rooms.filter(room => room.roomSetupComplete);
  const totalRoomTypes = finishedRooms.length;
  const totalRooms = finishedRooms.reduce((sum, room) => sum + (room.numberOfRooms || 0), 0);
  const totalPropertyRooms = 40; // This should come from property data

  const handleNext = () => {
    if (finishedRooms.length === 0) {
      alert('Please add at least one room type before continuing.');
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');

    localStorage.setItem('stays_rooms', JSON.stringify(rooms));
    navigate('/stays/setup/promote-listing', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
        rooms: rooms
      }
    });
  };

  const handleBack = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    navigate('/stays/setup/amenities', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId
      }
    });
  };

  const handleAddRoomType = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    navigate('/stays/setup/room-setup', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
        roomSetupStep: 1
      }
    });
  };

  const handleCopyRoom = (room) => {
    const newRoom = {
      ...room,
      id: Date.now().toString(),
      roomName: `${room.roomName} (Copy)`,
      createdAt: new Date().toISOString()
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('stays_rooms', JSON.stringify(updatedRooms));
  };

  const formatBeds = (beds) => {
    if (!beds || !Array.isArray(beds)) return 'No beds';
    const bedCounts = beds.reduce((acc, bed) => {
      const count = parseInt(bed.quantity) || 0;
      const type = bed.bedType || 'Unknown';
      acc[type] = (acc[type] || 0) + count;
      return acc;
    }, {});

    return Object.entries(bedCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const getRoomFeatures = (room) => {
    const features = [];
    const occupancy = room.recommendedOccupancy || room.peopleIncluded || 0;
    if (occupancy > 0) features.push(`Sleeps ${occupancy}`);
    
    const bathrooms = room.amenities?.bathroomType || '1 bathroom';
    if (bathrooms) features.push(bathrooms);
    
    const smoking = room.smokingPolicy || 'non smoking';
    features.push(smoking.toLowerCase());
    
    return features.join(' • ');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={5} totalSteps={10} />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Rooms and rates</h1>
              <p className="text-gray-600 text-sm md:text-base">
                We'll help you set up basic room info, room amenities, room name, and rates over the next few steps. 
                You can always update this after you're live.
              </p>
            </div>

            {/* Summary Section */}
            {finishedRooms.length > 0 && (
              <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border" style={{ borderColor: '#dcfce7' }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-1 text-sm md:text-base">
                      So far, you'll be listing <span className="font-semibold">{totalRoomTypes} room type{totalRoomTypes !== 1 ? 's' : ''}</span> for <span className="font-semibold">{totalRooms} rooms</span>.
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Add additional room types for your remaining inventory to reach more travelers or click 'Next' to continue.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="w-full md:w-auto px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add room type</span>
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>{totalRooms} of {totalPropertyRooms} rooms</span>
                </div>
              </div>
            )}

            {/* Room Content */}
            {finishedRooms.length === 0 ? (
              // Empty State
              <div className="border-2 border-dashed rounded-lg p-6 md:p-12 text-center" style={{ borderColor: '#d1d5db' }}>
                <p className="text-base md:text-lg font-medium text-gray-700 mb-4 md:mb-6">
                  Add your most popular room type to get started
                </p>
                <button
                  type="button"
                  onClick={handleAddRoomType}
                  className="w-full md:w-auto px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg mb-4"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                >
                  Add room type
                </button>
                <p className="text-xs md:text-sm text-gray-500">
                  You can add more, but you need at least 1 to go live.
                </p>
              </div>
            ) : (
              // Room List
              <div className="space-y-4">
                {finishedRooms.map((room, index) => (
                  <div key={room.id || index} className="border rounded-lg p-4 md:p-6 relative" style={{ borderColor: '#dcfce7' }}>
                        {/* Room Count Badge */}
                        {room.numberOfRooms && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 px-2 md:px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
                            {room.numberOfRooms} {room.numberOfRooms === 1 ? 'room' : 'rooms'}
                          </div>
                        )}
                        
                    <div className="pr-16 md:pr-24">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                            {room.roomName || 'Room'}
                          </h3>
                          
                      <div className="space-y-2 md:space-y-3">
                        <p className="text-xs md:text-sm text-gray-600">
                              {getRoomFeatures(room)}
                            </p>
                            
                        <p className="text-xs md:text-sm text-gray-600">
                              {formatBeds(room.numberOfBeds || room.beds)}
                            </p>
                            
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-xs md:text-sm font-medium text-gray-700">Base rate:</span>
                          <span className="text-base md:text-lg font-semibold text-gray-900">
                            RWF {room.baseRate?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => handleCopyRoom(room)}
                        className="flex-1 sm:flex-none px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                            style={{ borderColor: '#d1d5db' }}
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy room</span>
                          </button>
                          
                      <div className="relative flex-1 sm:flex-none">
                            <button
                              type="button"
                              onClick={() => setShowMoreActions(showMoreActions === room.id ? null : room.id)}
                          className="w-full sm:w-auto px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                              style={{ borderColor: '#d1d5db' }}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span>More actions</span>
                            </button>
                            
                            {showMoreActions === room.id && (
                          <div className="absolute top-full right-0 sm:left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => {
                                    // Edit room functionality
                                    // Get propertyId from state or localStorage
                                    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
                                    
                                    navigate('/stays/setup/room-setup', {
                                      state: {
                                        ...location.state,
                                        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
                                        roomData: room,
                                        roomSetupStep: 1
                                      }
                                    });
                                  }}
                                >
                                  Edit room
                                </button>
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    const updatedRooms = rooms.filter(r => r.id !== room.id);
                                    setRooms(updatedRooms);
                                    localStorage.setItem('stays_rooms', JSON.stringify(updatedRooms));
                                    setShowMoreActions(null);
                                  }}
                                >
                                  Delete room
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                ))}
                
                {/* Add Room Button */}
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#3CAF54' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" style={{ color: '#3CAF54' }} />
                      <span className="font-medium" style={{ color: '#3CAF54' }}>Add room type</span>
                    </div>
                  </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-6 md:pt-8 mt-6 md:mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm md:text-base"
                style={{ borderColor: '#d1d5db' }}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto text-white font-semibold py-2 md:py-3 px-6 md:px-8 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm md:text-base"
                style={{ backgroundColor: '#3CAF54' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-gray-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 z-50 animate-fadeIn">
          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#3CAF54] flex-shrink-0" />
          <span className="text-sm md:text-base">You have successfully added a room type.</span>
        </div>
      )}

      <StaysFooter />
    </div>
  );
}

