import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, MoreVertical, Info, Copy, CheckCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';

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

  const [activeTab, setActiveTab] = useState('finished');
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
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Steps 1-4 - Completed */}
                {[1, 2, 3, 4].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                      <span>✓</span>
                    </div>
                    <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                  </React.Fragment>
                ))}
                
                {/* Step 5 - Current */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  5
                </div>
                <div className="w-16 h-1 bg-gray-300"></div>
                
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

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Rooms and rates</h1>
              <p className="text-gray-600 text-base">
                We'll help you set up basic room info, room amenities, room name, and rates over the next few steps. 
                You can always update this after you're live.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b" style={{ borderColor: '#dcfce7' }}>
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('finished')}
                  className={`px-4 py-2 font-medium transition-colors relative ${
                    activeTab === 'finished'
                      ? 'text-[#3CAF54]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Finished room{finishedRooms.length > 0 && ` (${finishedRooms.length})`}
                  {activeTab === 'finished' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#3CAF54' }}></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unfinished')}
                  className={`px-4 py-2 font-medium transition-colors relative ${
                    activeTab === 'unfinished'
                      ? 'text-[#3CAF54]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Unfinished rooms
                  {activeTab === 'unfinished' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#3CAF54' }}></div>
                  )}
                </button>
              </div>
            </div>

            {/* Summary Section */}
            {finishedRooms.length > 0 && activeTab === 'finished' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border" style={{ borderColor: '#dcfce7' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 mb-1">
                      So far, you'll be listing <span className="font-semibold">{totalRoomTypes} room type{totalRoomTypes !== 1 ? 's' : ''}</span> for <span className="font-semibold">{totalRooms} rooms</span>.
                    </p>
                    <p className="text-sm text-gray-600">
                      Add additional room types for your remaining inventory to reach more travelers or click 'Next' to continue.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add room type</span>
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>{totalRooms} of {totalPropertyRooms} rooms</span>
                </div>
              </div>
            )}

            {/* Room Content */}
            {activeTab === 'finished' && finishedRooms.length === 0 ? (
              // Empty State
              <div className="border-2 border-dashed rounded-lg p-12 text-center" style={{ borderColor: '#d1d5db' }}>
                <p className="text-lg font-medium text-gray-700 mb-6">
                  Add your most popular room type to get started
                </p>
                <button
                  type="button"
                  onClick={handleAddRoomType}
                  className="px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg mb-4"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                >
                  Add room type
                </button>
                <p className="text-sm text-gray-500">
                  You can add more, but you need at least 1 to go live.
                </p>
              </div>
            ) : (
              // Room List
              <div className="space-y-4">
                {activeTab === 'finished' 
                  ? finishedRooms.map((room, index) => (
                      <div key={room.id || index} className="border rounded-lg p-6 relative" style={{ borderColor: '#dcfce7' }}>
                        {/* Room Count Badge */}
                        {room.numberOfRooms && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
                            {room.numberOfRooms} {room.numberOfRooms === 1 ? 'room' : 'rooms'}
                          </div>
                        )}
                        
                        <div className="pr-24">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {room.roomName || 'Room'}
                          </h3>
                          
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              {getRoomFeatures(room)}
                            </p>
                            
                            <p className="text-sm text-gray-600">
                              {formatBeds(room.numberOfBeds || room.beds)}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Base rate:</span>
                              <span className="text-lg font-semibold text-gray-900">
                                USD {room.baseRate?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleCopyRoom(room)}
                            className="px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            style={{ borderColor: '#d1d5db' }}
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy room</span>
                          </button>
                          
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowMoreActions(showMoreActions === room.id ? null : room.id)}
                              className="px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              style={{ borderColor: '#d1d5db' }}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span>More actions</span>
                            </button>
                            
                            {showMoreActions === room.id && (
                              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
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
                    ))
                  : rooms.filter(room => !room.roomSetupComplete).map((room, index) => (
                      <div key={room.id || index} className="border rounded-lg p-4" style={{ borderColor: '#dcfce7' }}>
                        <p className="text-gray-700">{room.roomName || `Room ${index + 1}`}</p>
                      </div>
                    ))
                }
                
                {/* Add Room Button */}
                {activeTab === 'finished' && (
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
                )}
              </div>
            )}

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
              
              <p className="text-sm text-gray-500 text-center">
                Moving on without adding all your rooms to Expedia?{' '}
                <a href="#" className="text-[#3CAF54] hover:underline">Tell us why.</a>
              </p>
              
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-[#3CAF54]" />
          <span>You have successfully added a room type.</span>
        </div>
      )}

      <StaysFooter />
    </div>
  );
}

