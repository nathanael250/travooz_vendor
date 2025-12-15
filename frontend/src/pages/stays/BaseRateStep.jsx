import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService, getPropertyRooms } from '../../services/staysService';

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
  
  // Get recommended occupancy from room setup (Step 1)
  const recommendedOccupancy = roomData.recommendedOccupancy || roomData.numberOfBeds?.reduce((sum, bed) => sum + (parseInt(bed.quantity) || 0), 0) || 2;
  const maxOccupancy = Math.max(recommendedOccupancy, 2);

  // Load base rate and people included from roomData, preserving user changes
  const [baseRate, setBaseRate] = useState(() => {
    return roomData.baseRate || roomData.base_rate || '';
  });
  const [peopleIncluded, setPeopleIncluded] = useState(() => {
    return roomData.peopleIncluded || roomData.people_included || maxOccupancy.toString();
  });

  // Update form when roomData changes (e.g., when navigating back)
  useEffect(() => {
    if (roomData.baseRate || roomData.base_rate) {
      setBaseRate(roomData.baseRate || roomData.base_rate);
    }
    if (roomData.peopleIncluded || roomData.people_included) {
      setPeopleIncluded(roomData.peopleIncluded || roomData.people_included);
    }
  }, [roomData.baseRate, roomData.base_rate, roomData.peopleIncluded, roomData.people_included]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Generate occupancy options based on recommended/max occupancy
  const occupancyOptions = Array.from({ length: maxOccupancy }, (_, i) => i + 1).map(num => ({
    value: num.toString(),
    label: num === maxOccupancy ? `${num} (maximum occupancy)` : num.toString()
  }));

  const handleNext = async () => {
    // Validate base rate
    if (!baseRate || parseFloat(baseRate) <= 0) {
      setSaveError('Please enter a valid base rate');
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    if (!propertyId || propertyId === 0) {
      setSaveError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
    // Update room data with base rate information
    // IMPORTANT: Preserve all ID fields explicitly before spreading
    const updatedRoomData = {
      ...roomData,
      baseRate: parseFloat(baseRate),
      peopleIncluded: parseInt(peopleIncluded),
      step: 4,
      roomSetupComplete: true,
      // Explicitly preserve ID fields (room_id and roomId are the real database IDs)
      // Only use 'id' if room_id and roomId are not present
      room_id: roomData.room_id || roomData.roomId || (roomData.id && roomData.id < 1000000 ? roomData.id : null),
      roomId: roomData.roomId || roomData.room_id || (roomData.id && roomData.id < 1000000 ? roomData.id : null),
      // Only set id to room_id if it exists, otherwise keep original (but don't use Date.now() if we have room_id)
      id: roomData.room_id || roomData.roomId || roomData.id
    };

      // Helper function to convert undefined to null
      const nullIfUndefined = (value) => value === undefined ? null : value;
      
      // Clean beds array - ensure no undefined values
      const cleanBeds = (updatedRoomData.beds || []).map(bed => ({
        bedType: nullIfUndefined(bed.bedType) || 'queen',
        quantity: nullIfUndefined(bed.quantity) ?? 1
      })).filter(bed => bed.bedType !== null);
      
      // Check if this is an update (editing existing room) or create (new room)
      // PRIORITIZE room_id and roomId (database IDs) over id (which might be temporary Date.now())
      let existingRoomId = updatedRoomData.room_id || updatedRoomData.roomId;
      
      // Only check 'id' if room_id and roomId are not present, and only if it's a valid small integer
      if (!existingRoomId && updatedRoomData.id) {
        const parsedId = parseInt(updatedRoomData.id, 10);
        // Only use if it's a reasonable integer (not Date.now() which is > 1e12)
        if (!isNaN(parsedId) && parsedId > 0 && parsedId < 1000000) {
          existingRoomId = parsedId;
        }
      }
      
      console.log('[BaseRateStep] Room ID check:', {
        room_id: updatedRoomData.room_id,
        roomId: updatedRoomData.roomId,
        id: updatedRoomData.id,
        existingRoomId,
        isUpdate: !!existingRoomId
      });
      
      // Parse and validate room_id - must be a positive integer (not a temporary ID like Date.now())
      if (existingRoomId) {
        const parsedId = parseInt(existingRoomId, 10);
        // Only use if it's a valid positive integer and not a temporary ID (Date.now() would be > 1e12)
        // Valid room IDs from database should be reasonable integers (typically < 1e6)
        if (isNaN(parsedId) || parsedId <= 0 || parsedId > 1000000) {
          console.warn('[BaseRateStep] Invalid room_id detected, treating as new room:', existingRoomId);
          existingRoomId = null;
        } else {
          existingRoomId = parsedId;
        }
      }
      
      const isUpdate = !!existingRoomId;

      // Get amenities from nested structure (amenities object from RoomAmenitiesStep)
      const amenities = updatedRoomData.amenities || {};
      
      console.log('[BaseRateStep] Full amenities object:', amenities);
      console.log('[BaseRateStep] kitchenAmenities:', amenities.kitchenAmenities);
      
      // Convert roomSize from form (string with unit) to roomSizeSqm or roomSizeSqft
      let roomSizeSqm = null;
      let roomSizeSqft = null;
      if (amenities.roomSize) {
        const roomSizeValue = parseFloat(amenities.roomSize);
        if (!isNaN(roomSizeValue)) {
          if (amenities.roomSizeUnit === 'square_meters') {
            roomSizeSqm = roomSizeValue;
          } else {
            roomSizeSqft = roomSizeValue;
          }
        }
      }
      
      // Convert hasKitchen from 'yes'/'no' string to boolean
      const hasKitchen = amenities.hasKitchen === 'yes' || amenities.hasKitchen === true;
      
      // Convert hasView from 'yes'/'no' string to 'yes'/'no' (backend expects string)
      const hasView = amenities.hasView === 'yes' ? 'yes' : 'no';
      
      // Convert hasOutdoorSpace to individual balcony/terrace/patio flags
      // Note: The form has hasOutdoorSpace as 'yes'/'no', but we need individual flags
      // For now, we'll check if any outdoor space is set, or use the individual flags if they exist
      const hasBalcony = amenities.hasBalcony === true || amenities.hasBalcony === 1;
      const hasTerrace = amenities.hasTerrace === true || amenities.hasTerrace === 1;
      const hasPatio = amenities.hasPatio === true || amenities.hasPatio === 1;
      
      // Get kitchen facilities from kitchenAmenities object
      let kitchenFacilities = [];
      if (amenities.kitchenAmenities && typeof amenities.kitchenAmenities === 'object') {
        // Extract keys where value is true
        kitchenFacilities = Object.keys(amenities.kitchenAmenities).filter(key => amenities.kitchenAmenities[key] === true);
        console.log('[BaseRateStep] Extracted kitchen facilities from kitchenAmenities:', kitchenFacilities);
      } else if (Array.isArray(amenities.kitchenFacilities)) {
        kitchenFacilities = amenities.kitchenFacilities;
        console.log('[BaseRateStep] Using kitchenFacilities array:', kitchenFacilities);
      } else {
        console.warn('[BaseRateStep] No kitchen amenities found. amenities.kitchenAmenities:', amenities.kitchenAmenities);
      }

      // Transform room data for backend API (convert undefined to null for SQL)
      const roomDataForAPI = {
        // Include roomId if updating existing room (as integer)
        ...(isUpdate && { roomId: existingRoomId }),
        // Use the roomName from ReviewRoomNameStep (user's edited name, without "(Copy)" suffix)
        // If roomName exists, use it; otherwise fall back to roomType or default
        roomName: (updatedRoomData.roomName && updatedRoomData.roomName.trim()) || updatedRoomData.roomType || 'Standard Room',
        roomType: nullIfUndefined(updatedRoomData.roomType) || 'standard',
        roomClass: nullIfUndefined(updatedRoomData.roomClass) || 'standard',
        smokingPolicy: nullIfUndefined(updatedRoomData.smokingPolicy) || 'non-smoking',
        numberOfRooms: nullIfUndefined(updatedRoomData.numberOfRooms) ?? 1,
        recommendedOccupancy: nullIfUndefined(updatedRoomData.recommendedOccupancy) || nullIfUndefined(updatedRoomData.maxOccupancy) || parseInt(peopleIncluded),
        pricingModel: nullIfUndefined(updatedRoomData.pricingModel) || 'per-day',
        baseRate: nullIfUndefined(updatedRoomData.baseRate) ?? parseFloat(baseRate),
        peopleIncluded: nullIfUndefined(updatedRoomData.peopleIncluded) ?? parseInt(peopleIncluded),
        beds: cleanBeds,
        bathroomType: nullIfUndefined(updatedRoomData.bathroomType) || 'private',
        numberOfBathrooms: nullIfUndefined(updatedRoomData.numberOfBathrooms) ?? 1,
        bathroomAmenities: Array.isArray(updatedRoomData.bathroomAmenities) ? updatedRoomData.bathroomAmenities : [],
        // Amenities from RoomAmenitiesStep form
        hasKitchen: hasKitchen,
        kitchenFacilities: kitchenFacilities,
        hasAirConditioning: amenities.airConditioning === true || amenities.hasAirConditioning === true,
        airConditioningType: amenities.airConditioningType || null,
        hasHeating: false, // Not used in Rwanda
        hasView: hasView,
        roomView: nullIfUndefined(amenities.roomView) || null,
        roomSizeSqm: roomSizeSqm,
        roomSizeSqft: roomSizeSqft,
        hasBalcony: hasBalcony,
        hasTerrace: hasTerrace,
        hasPatio: hasPatio,
        desk: amenities.desk === true || amenities.desk === 1,
        separateSittingArea: amenities.separateSittingArea === true || amenities.separateSittingArea === 1,
        privateSpaTub: amenities.privateSpaTub === true || amenities.privateSpaTub === 1,
        laptopFriendlyWorkspace: amenities.laptopFriendlyWorkspace === true || amenities.laptopFriendlyWorkspace === 1,
        separateDiningArea: amenities.separateDiningArea === true || amenities.separateDiningArea === 1,
        privatePool: amenities.privatePool === true || amenities.privatePool === 1,
        roomLayout: Array.isArray(amenities.roomLayout) ? amenities.roomLayout : [],
        additionalAmenities: Array.isArray(amenities.additionalAmenities) ? amenities.additionalAmenities : [],
        ratePlans: [] // No rate plans
      };

      // Save room to database via API (will update if roomId is provided, create if not)
      const savedRoom = await staysSetupService.saveRoom(propertyId, roomDataForAPI);
      
      // Update localStorage - replace existing room if updating, add new if creating
      const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
      const roomToSave = {
        ...updatedRoomData,
        id: savedRoom.roomId || savedRoom.room_id || existingRoomId || Date.now().toString(),
        roomId: savedRoom.roomId || savedRoom.room_id || existingRoomId,
        room_id: savedRoom.roomId || savedRoom.room_id || existingRoomId,
        createdAt: updatedRoomData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isUpdate) {
        // Update existing room in localStorage
        const roomIndex = savedRooms.findIndex(r => 
          (r.room_id === existingRoomId || r.roomId === existingRoomId || r.id === existingRoomId)
        );
        if (roomIndex !== -1) {
          savedRooms[roomIndex] = roomToSave;
        } else {
          // If not found, add it (shouldn't happen, but fallback)
          savedRooms.push(roomToSave);
        }
      } else {
        // Add new room to localStorage
        savedRooms.push(roomToSave);
      }
      localStorage.setItem('stays_rooms', JSON.stringify(savedRooms));

      // Navigate back to rooms overview with success flag
      navigate('/stays/setup/rooms', {
      state: {
        ...location.state,
          propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
          roomAdded: true
      }
    });
    } catch (error) {
      console.error('Error saving room:', error);
      setSaveError(error.message || 'Failed to save room. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    // Preserve current form data in roomData when going back
    const updatedRoomData = {
      ...roomData,
      baseRate: baseRate ? parseFloat(baseRate) : null,
      peopleIncluded: parseInt(peopleIncluded) || maxOccupancy,
      step: 4
    };
    
    // Go back to step 3 with updated room data (preserving base rate changes)
    navigate('/stays/setup/review-room-name', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
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
        <div className="max-w-4xl mx-auto">
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
          <div className="bg-white rounded-lg shadow-xl p-8 border mb-8" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Set your base rate to be competitive</h1>
              <p className="text-gray-600">
                Travelers will see these rates when searching for rooms. You can update this at any time. 
                Add rates for adults now - you can add rates for kids and infants after you're live.
              </p>
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {saveError}
                </p>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Rate Input */}
                <div>
                  <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Base rate per night (RWF) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">RWF</span>
                    </div>
                    <input
                      type="number"
                      id="baseRate"
                      name="baseRate"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      min="0"
                      step="1"
                      className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] text-lg"
                      placeholder="0"
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
                <span className="font-medium">4/4</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!baseRate || parseFloat(baseRate) <= 0 || isSaving}
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
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Room</span>
                <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

