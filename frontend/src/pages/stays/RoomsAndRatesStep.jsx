import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, MoreVertical, Info, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService, getPropertyRooms } from '../../services/staysService';

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

  const [rooms, setRooms] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(null);

  // Load rooms from database (primary source) with localStorage as fallback
  useEffect(() => {
    const loadRooms = async () => {
      // Check if this is a NEW property (no propertyId or propertyId is 0)
      const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
      const isNewProperty = !propertyId || propertyId === 0;
      
      if (isNewProperty) {
        // For NEW properties, start with empty rooms (ignore old localStorage data)
        console.log('🆕 New property detected - clearing old room data');
        localStorage.removeItem('stays_rooms');
        setRooms([]);
      } else {
        // For EXISTING properties, load from database first
        try {
          console.log('📂 Existing property - loading rooms from database...');
          const dbRooms = await getPropertyRooms(propertyId);
          
          // Transform database rooms to match frontend format
          // IMPORTANT: Preserve all amenities data (both formats) for editing
          const transformedRooms = dbRooms.map(room => ({
            id: room.room_id,
            room_id: room.room_id,
            roomId: room.room_id,
            roomName: room.room_name,
            room_name: room.room_name,
            roomType: room.room_type,
            room_type: room.room_type,
            roomClass: room.room_class,
            room_class: room.room_class,
            smokingPolicy: room.smoking_policy,
            smoking_policy: room.smoking_policy,
            numberOfRooms: room.number_of_rooms,
            number_of_rooms: room.number_of_rooms,
            recommendedOccupancy: room.recommended_occupancy,
            recommended_occupancy: room.recommended_occupancy,
            baseRate: parseFloat(room.base_rate) || 0,
            base_rate: parseFloat(room.base_rate) || 0,
            peopleIncluded: room.people_included,
            people_included: room.people_included,
            beds: room.beds || [],
            // CRITICAL: Preserve amenities object as-is (includes both database and frontend formats)
            amenities: room.amenities || null,
            roomSetupComplete: true,
            property_id: room.property_id,
            propertyId: room.property_id
          }));
          
          setRooms(transformedRooms);
          
          // Update localStorage as cache (but database is source of truth)
          localStorage.setItem('stays_rooms', JSON.stringify(transformedRooms));
          console.log('✅ Loaded', transformedRooms.length, 'rooms from database');
        } catch (error) {
          console.error('❌ Error loading rooms from database, falling back to localStorage:', error);
          // Fallback to localStorage if database fails
          const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
          setRooms(savedRooms);
        }
      }

      // Show toast if coming from room setup completion
      if (location.state?.roomAdded) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    };

    loadRooms();
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

  const handleCopyRoom = async (room) => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    if (!propertyId || propertyId === 0) {
      alert('Property ID is missing. Please complete property setup first.');
      return;
    }

    try {
      // Prepare copied room data (remove ALL ID fields to create new room)
      const copiedRoomName = room.room_name ? `${room.room_name} (Copy)` : room.roomName ? `${room.roomName} (Copy)` : 'Room (Copy)';
      
      // Helper function to convert undefined to null
      const nullIfUndefined = (value) => value === undefined ? null : value;
      
      // Clean beds array
      const cleanBeds = (room.beds || room.room_beds || room.numberOfBeds || []).map(bed => ({
        bedType: nullIfUndefined(bed.bedType || bed.bed_type) || 'queen',
        quantity: nullIfUndefined(bed.quantity) ?? 1
      })).filter(bed => bed.bedType !== null);

      // Transform room data for backend API
      const roomDataForAPI = {
        // No roomId - this will create a new room
        roomName: copiedRoomName,
        roomType: nullIfUndefined(room.room_type || room.roomType) || 'standard',
        roomClass: nullIfUndefined(room.room_class || room.roomClass) || 'standard',
        smokingPolicy: nullIfUndefined(room.smoking_policy || room.smokingPolicy) || 'non-smoking',
        numberOfRooms: nullIfUndefined(room.number_of_rooms || room.numberOfRooms) ?? 1,
        recommendedOccupancy: nullIfUndefined(room.recommended_occupancy || room.recommendedOccupancy) || 2,
        pricingModel: nullIfUndefined(room.pricing_model || room.pricingModel) || 'per-day',
        baseRate: nullIfUndefined(room.base_rate || room.baseRate) || 0,
        peopleIncluded: nullIfUndefined(room.people_included || room.peopleIncluded) || 2,
        beds: cleanBeds,
        bathroomType: nullIfUndefined(room.bathroom_type || room.bathroomType) || 'private',
        numberOfBathrooms: nullIfUndefined(room.number_of_bathrooms || room.numberOfBathrooms) ?? 1,
        bathroomAmenities: Array.isArray(room.bathroom_amenities || room.bathroomAmenities) ? (room.bathroom_amenities || room.bathroomAmenities) : [],
        hasKitchen: room.amenities?.hasKitchen === 'yes' || room.amenities?.has_kitchen === 1 || false,
        kitchenFacilities: Array.isArray(room.amenities?.kitchenAmenities || room.amenities?.kitchen_facilities) ? (room.amenities?.kitchenAmenities || room.amenities?.kitchen_facilities) : [],
        hasAirConditioning: room.amenities?.airConditioning === true || room.amenities?.has_air_conditioning === 1 || false,
        hasHeating: false,
        hasView: nullIfUndefined(room.amenities?.hasView || room.amenities?.has_view) || 'no',
        roomView: nullIfUndefined(room.amenities?.roomView || room.amenities?.room_view),
        roomSizeSqm: nullIfUndefined(room.amenities?.roomSizeSqm || room.amenities?.room_size_sqm),
        roomSizeSqft: nullIfUndefined(room.amenities?.roomSizeSqft || room.amenities?.room_size_sqft),
        hasBalcony: room.amenities?.hasBalcony === true || room.amenities?.has_balcony === 1 || false,
        hasTerrace: room.amenities?.hasTerrace === true || room.amenities?.has_terrace === 1 || false,
        hasPatio: room.amenities?.hasPatio === true || room.amenities?.has_patio === 1 || false,
        roomLayout: Array.isArray(room.amenities?.roomLayout || room.amenities?.room_layout) ? (room.amenities?.roomLayout || room.amenities?.room_layout) : [],
        additionalAmenities: Array.isArray(room.amenities?.additionalAmenities || room.amenities?.additional_amenities) ? (room.amenities?.additionalAmenities || room.amenities?.additional_amenities) : [],
        ratePlans: []
      };

      // Save the copied room to database immediately
      console.log('[RoomsAndRatesStep] Saving copied room to database...');
      const savedRoom = await staysSetupService.saveRoom(propertyId, roomDataForAPI);
      console.log('[RoomsAndRatesStep] Copied room saved:', savedRoom);

      // Prepare the copied room data with the saved room ID
      const copiedRoomData = {
        ...room,
        // Set the NEW room_id from the saved room
        room_id: savedRoom.roomId || savedRoom.room_id,
        roomId: savedRoom.roomId || savedRoom.room_id,
        id: savedRoom.roomId || savedRoom.room_id,
        // Update room name
        room_name: copiedRoomName,
        roomName: copiedRoomName,
        // Ensure amenities are included
        amenities: room.amenities || room.roomAmenities || null,
        // Ensure beds are included
        beds: room.beds || room.room_beds || room.numberOfBeds || [],
        room_beds: room.room_beds || room.beds || [],
        // Mark as complete so it shows in the list
        roomSetupComplete: true
      };

      // Reload rooms from database (source of truth) instead of just updating localStorage
      try {
        const dbRooms = await getPropertyRooms(propertyId);
        
        // Transform database rooms to match frontend format
        const transformedRooms = dbRooms.map(room => ({
          id: room.room_id,
          room_id: room.room_id,
          roomId: room.room_id,
          roomName: room.room_name,
          room_name: room.room_name,
          roomType: room.room_type,
          room_type: room.room_type,
          roomClass: room.room_class,
          room_class: room.room_class,
          smokingPolicy: room.smoking_policy,
          smoking_policy: room.smoking_policy,
          numberOfRooms: room.number_of_rooms,
          number_of_rooms: room.number_of_rooms,
          recommendedOccupancy: room.recommended_occupancy,
          recommended_occupancy: room.recommended_occupancy,
          baseRate: parseFloat(room.base_rate) || 0,
          base_rate: parseFloat(room.base_rate) || 0,
          peopleIncluded: room.people_included,
          people_included: room.people_included,
          beds: room.beds || [],
          amenities: room.amenities || null,
          roomSetupComplete: true,
          property_id: room.property_id,
          propertyId: room.property_id
        }));
        
        // Update state from database
        setRooms(transformedRooms);
        
        // Update localStorage as cache
        localStorage.setItem('stays_rooms', JSON.stringify(transformedRooms));
      } catch (error) {
        console.error('[RoomsAndRatesStep] Error reloading rooms after copy:', error);
        // Fallback: update localStorage manually
        const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
        const roomToSave = {
          ...copiedRoomData,
          id: savedRoom.roomId || savedRoom.room_id,
          roomId: savedRoom.roomId || savedRoom.room_id,
          room_id: savedRoom.roomId || savedRoom.room_id,
          createdAt: new Date().toISOString()
        };
        savedRooms.push(roomToSave);
        localStorage.setItem('stays_rooms', JSON.stringify(savedRooms));
        setRooms(savedRooms);
      }
      
      // Show success message
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      
      // Stay on the same page - don't navigate to edit
      // User can click "Edit" on the copied room if they want to edit it
    } catch (error) {
      console.error('[RoomsAndRatesStep] Error copying room:', error);
      alert(`Failed to copy room: ${error.message || 'Unknown error'}`);
    }
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
          <ProgressIndicator currentStep={4} totalSteps={10} />

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
                                    
                                    // CRITICAL: Get the actual database room_id from the room object
                                    // Priority: room_id (database field) > roomId > id (but only if id is a valid small integer)
                                    let actualRoomId = room.room_id || room.roomId;
                                    
                                    // Only use 'id' if it's a valid database ID (not Date.now() which is > 1e12)
                                    if (!actualRoomId && room.id) {
                                      const parsedId = parseInt(room.id, 10);
                                      if (!isNaN(parsedId) && parsedId > 0 && parsedId < 1000000) {
                                        actualRoomId = parsedId;
                                      }
                                    }
                                    
                                    // Ensure all room data is passed, including beds and amenities
                                    // IMPORTANT: Preserve ALL ID fields so the backend knows to UPDATE, not CREATE
                                    const roomDataToEdit = {
                                      ...room,
                                      // CRITICAL: Explicitly set all ID fields to the actual database room_id
                                      room_id: actualRoomId,
                                      roomId: actualRoomId,
                                      id: actualRoomId, // Use database ID, not temporary Date.now()
                                      // Ensure beds are included - could be beds, room_beds, or numberOfBeds
                                      beds: room.beds || room.room_beds || room.numberOfBeds || [],
                                      room_beds: room.room_beds || room.beds || [],
                                      // Ensure amenities are included
                                      amenities: room.amenities || room.roomAmenities || null,
                                      // Map all possible field names
                                      room_type: room.room_type || room.roomType,
                                      room_class: room.room_class || room.roomClass,
                                      smoking_policy: room.smoking_policy || room.smokingPolicy,
                                      number_of_rooms: room.number_of_rooms || room.numberOfRooms,
                                      recommended_occupancy: room.recommended_occupancy || room.recommendedOccupancy,
                                      // Preserve base rate and people included if they exist
                                      baseRate: room.base_rate || room.baseRate,
                                      peopleIncluded: room.people_included || room.peopleIncluded
                                    };
                                    
                                    console.log('[RoomsAndRatesStep] Editing room:', {
                                      originalRoom: room,
                                      actualRoomId,
                                      roomDataToEdit
                                    });
                                    
                                    navigate('/stays/setup/room-setup', {
                                      state: {
                                        ...location.state,
                                        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
                                        roomData: roomDataToEdit,
                                        roomSetupStep: 1,
                                        isEdit: true, // Flag to indicate this is an edit
                                        isCopy: false // Explicitly mark as NOT a copy
                                      }
                                    });
                                  }}
                                >
                                  Edit room
                                </button>
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  onClick={async () => {
                                    // Get propertyId and roomId
                                    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
                                    const roomId = room.room_id || room.roomId || room.id;
                                    
                                    // Confirm deletion
                                    if (!window.confirm(`Are you sure you want to delete "${room.roomName || room.room_name || 'this room'}"? This action cannot be undone.`)) {
                                      return;
                                    }
                                    
                                    try {
                                      // If room has a database ID and property ID, delete from database
                                      if (roomId && propertyId && roomId < 1000000) {
                                        // Valid database room_id - delete from backend
                                        await staysSetupService.deleteRoom(propertyId, roomId);
                                        console.log('[RoomsAndRatesStep] Room deleted from database:', roomId);
                                      }
                                      
                                      // Remove from local state and localStorage
                                      const updatedRooms = rooms.filter(r => {
                                        const rId = r.room_id || r.roomId || r.id;
                                        return rId !== roomId;
                                      });
                                      setRooms(updatedRooms);
                                      localStorage.setItem('stays_rooms', JSON.stringify(updatedRooms));
                                      setShowMoreActions(null);
                                      
                                      // Show success message
                                      toast.success('Room deleted successfully');
                                    } catch (error) {
                                      console.error('[RoomsAndRatesStep] Error deleting room:', error);
                                      toast.error(error?.message || 'Failed to delete room. Please try again.');
                                    }
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

