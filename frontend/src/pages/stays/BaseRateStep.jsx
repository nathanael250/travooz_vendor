import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService } from '../../services/staysService';

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
    const updatedRoomData = {
      ...roomData,
      baseRate: parseFloat(baseRate),
      peopleIncluded: parseInt(peopleIncluded),
        step: 4,
        roomSetupComplete: true
    };

      // Helper function to convert undefined to null
      const nullIfUndefined = (value) => value === undefined ? null : value;
      
      // Clean beds array - ensure no undefined values
      const cleanBeds = (updatedRoomData.beds || []).map(bed => ({
        bedType: nullIfUndefined(bed.bedType) || 'queen',
        quantity: nullIfUndefined(bed.quantity) ?? 1
      })).filter(bed => bed.bedType !== null);
      
      // Transform room data for backend API (convert undefined to null for SQL)
      const roomDataForAPI = {
        roomName: nullIfUndefined(updatedRoomData.roomName) || updatedRoomData.roomType || 'Standard Room',
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
        hasKitchen: updatedRoomData.hasKitchen === true || updatedRoomData.hasKitchen === 'yes',
        kitchenFacilities: Array.isArray(updatedRoomData.kitchenFacilities) ? updatedRoomData.kitchenFacilities : [],
        hasAirConditioning: updatedRoomData.airConditioning === true || updatedRoomData.hasAirConditioning === true,
        hasHeating: false, // Not used in Rwanda
        hasView: nullIfUndefined(updatedRoomData.hasView) || 'no',
        roomView: nullIfUndefined(updatedRoomData.roomView),
        roomSizeSqm: nullIfUndefined(updatedRoomData.roomSizeSqm),
        roomSizeSqft: nullIfUndefined(updatedRoomData.roomSizeSqft),
        hasBalcony: updatedRoomData.hasBalcony === true,
        hasTerrace: updatedRoomData.hasTerrace === true,
        hasPatio: updatedRoomData.hasPatio === true,
        roomLayout: Array.isArray(updatedRoomData.roomLayout) ? updatedRoomData.roomLayout : [],
        additionalAmenities: Array.isArray(updatedRoomData.additionalAmenities) ? updatedRoomData.additionalAmenities : [],
        ratePlans: [] // No rate plans
      };

      // Save room to database via API
      const savedRoom = await staysSetupService.saveRoom(propertyId, roomDataForAPI);
      
      // Also save to localStorage as backup
      const savedRooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
      const roomToSave = {
        ...updatedRoomData,
        id: savedRoom.roomId || savedRoom.room_id || Date.now().toString(),
        roomId: savedRoom.roomId || savedRoom.room_id,
        createdAt: new Date().toISOString()
      };
      savedRooms.push(roomToSave);
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
    // Go back to step 3 (Review Room Name) with room data
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

