import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';

export default function RoomAmenitiesStep() {
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

  // Get room data from previous step
  const previousRoomData = location.state?.roomData || {};

  const [formData, setFormData] = useState({
    // Kitchen
    hasKitchen: 'no',
    addKitchenToAll: true,
    kitchenAmenities: {
      cookware: false,
      stovetop: false,
      oven: false,
      microwave: false,
      refrigerator: false,
      dishwasher: false
    },
    addKitchenAmenitiesToAll: true,
    
    // Climate control
    airConditioning: false,
    airConditioningType: 'in-room',
    addAirConditioningToAll: true,
    
    // Room view
    hasView: 'yes',
    roomView: '',
    
    // Room size
    roomSize: '',
    roomSizeUnit: 'square_feet',
    
    // Outdoor space
    hasOutdoorSpace: 'no',
    addOutdoorSpaceToAll: true,
    
    // Room layout
    desk: false,
    addDeskToAll: true,
    separateSittingArea: false,
    addSittingAreaToAll: true,
    privateSpaTub: false,
    laptopFriendlyWorkspace: false,
    separateDiningArea: false,
    privatePool: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('kitchenAmenities.')) {
        const amenityKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          kitchenAmenities: {
            ...prev.kitchenAmenities,
            [amenityKey]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const roomViews = [
    'Garden view',
    'City view',
    'Ocean view',
    'Mountain view',
    'Pool view',
    'Park view',
    'Lake view',
    'River view',
    'Courtyard view',
    'No view'
  ];

  const roomSizeUnits = [
    { value: 'square_feet', label: 'Square feet' },
    { value: 'square_meters', label: 'Square meters' }
  ];

  const handleNext = () => {
    // Combine previous room data with amenities
    const updatedRoomData = {
      ...previousRoomData,
      amenities: formData,
      step: 2
    };

    // Navigate to next step (step 3/6 - Review Room Name)
    navigate('/stays/setup/review-room-name', {
      state: {
        ...location.state,
        roomData: updatedRoomData,
        roomSetupStep: 3
      }
    });
  };

  const handleBack = () => {
    // Go back to step 1 with previous room data
    navigate('/stays/setup/room-setup', {
      state: {
        ...location.state,
        roomData: previousRoomData,
        roomSetupStep: 1
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Attract travelers with in-room amenities</h1>
              <p className="text-sm text-gray-600">
                Add room amenities to give travelers a sense of what their stay will be like. Amenities will be added to all rooms, 
                unless you deselect Add to all rooms. If you don't see what your room has, we have more amenities you can add after you're live.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              {/* Kitchen Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Kitchen</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does this room have a kitchen?
                  </label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasKitchen"
                        value="yes"
                        checked={formData.hasKitchen === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasKitchen"
                        value="no"
                        checked={formData.hasKitchen === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="addKitchenToAll"
                      checked={formData.addKitchenToAll}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm text-gray-700">Add to all rooms</span>
                  </label>
                </div>

                {formData.hasKitchen === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 mb-3">
                      Kitchen amenities
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'cookware', label: 'Cookware, dishware, and utensils' },
                        { key: 'stovetop', label: 'Stovetop' },
                        { key: 'oven', label: 'Oven' },
                        { key: 'microwave', label: 'Microwave' },
                        { key: 'refrigerator', label: 'Refrigerator' },
                        { key: 'dishwasher', label: 'Dishwasher' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name={`kitchenAmenities.${item.key}`}
                            checked={formData.kitchenAmenities[item.key]}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="addKitchenAmenitiesToAll"
                        checked={formData.addKitchenAmenitiesToAll}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">Add to all rooms</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Climate Control Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Climate control</h2>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      name="airConditioning"
                      checked={formData.airConditioning}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm font-medium text-gray-700">Air conditioning</span>
                  </label>
                  {formData.airConditioning && (
                    <div className="ml-6 space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="airConditioningType"
                            value="air-conditioning"
                            checked={formData.airConditioningType === 'air-conditioning'}
                            onChange={handleChange}
                            className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm text-gray-700">Air conditioning</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="airConditioningType"
                            value="in-room"
                            checked={formData.airConditioningType === 'in-room'}
                            onChange={handleChange}
                            className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm text-gray-700">In-room climate control</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Choose In-room if guests can control the temperature in their room.</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="addAirConditioningToAll"
                          checked={formData.addAirConditioningToAll}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Add to all rooms</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Room View Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Room view</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does this room have a view?
                  </label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasView"
                        value="yes"
                        checked={formData.hasView === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasView"
                        value="no"
                        checked={formData.hasView === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {formData.hasView === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room views
                      </label>
                      <select
                        name="roomView"
                        value={formData.roomView}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                      >
                        <option value="">Select room view</option>
                        {roomViews.map((view) => (
                          <option key={view} value={view}>{view}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Size Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Room size</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is the room size?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <input
                      type="number"
                      name="roomSize"
                      value={formData.roomSize}
                      onChange={handleChange}
                      placeholder="Room size"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    />
                    <select
                      name="roomSizeUnit"
                      value={formData.roomSizeUnit}
                      onChange={handleChange}
                      className="w-full sm:w-auto sm:min-w-[140px] px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    >
                      {roomSizeUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Outdoor Space Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Outdoor space</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does this room have an outdoor space?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasOutdoorSpace"
                        value="yes"
                        checked={formData.hasOutdoorSpace === 'yes'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasOutdoorSpace"
                        value="no"
                        checked={formData.hasOutdoorSpace === 'no'}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="addOutdoorSpaceToAll"
                      checked={formData.addOutdoorSpaceToAll}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                    />
                    <span className="text-sm text-gray-700">Add to all rooms</span>
                  </label>
                </div>
              </div>

              {/* Room Layout Section */}
              <div className="space-y-6 pt-6 border-t" style={{ borderColor: '#dcfce7' }}>
                <h2 className="text-xl font-semibold text-gray-900">Room layout</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="desk"
                        checked={formData.desk}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Desk</span>
                    </label>
                    {formData.desk && (
                      <label className="flex items-center gap-2 cursor-pointer ml-6 mt-2">
                        <input
                          type="checkbox"
                          name="addDeskToAll"
                          checked={formData.addDeskToAll}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Add to all rooms</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="separateSittingArea"
                        checked={formData.separateSittingArea}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Separate sitting area</span>
                    </label>
                    {formData.separateSittingArea && (
                      <label className="flex items-center gap-2 cursor-pointer ml-6 mt-2">
                        <input
                          type="checkbox"
                          name="addSittingAreaToAll"
                          checked={formData.addSittingAreaToAll}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Add to all rooms</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="privateSpaTub"
                        checked={formData.privateSpaTub}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Private spa tub</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="laptopFriendlyWorkspace"
                        checked={formData.laptopFriendlyWorkspace}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Laptop friendly workspace</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="separateDiningArea"
                        checked={formData.separateDiningArea}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Separate dining area</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="privatePool"
                        checked={formData.privatePool}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                      />
                      <span className="text-sm font-medium text-gray-700">Private pool</span>
                    </label>
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
                  <span className="font-medium">2/6</span>
                </div>
                <button
                  type="submit"
                  className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#3CAF54' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
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

