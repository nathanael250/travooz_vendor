import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, AlertCircle, Wifi, Car, Coffee, Users, Home, Sparkles } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { staysSetupService } from '../../services/staysService';

export default function PropertyAmenitiesStep() {
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

  const [activeTab, setActiveTab] = useState('standard'); // 'standard' or 'advanced'
  
  const [formData, setFormData] = useState({
    // Check-in / Check-out
    hasFrontDesk: 'yes',
    frontDeskSchedule: 'everyday', // 'everyday' or 'select_days'
    deskOpens: '',
    deskCloses: '',
    frontDesk24Hours: false,
    selfCheckInAvailable: 'yes',
    guestAccessMethod: '',
    mobileAppRequired: '',
    checkInFrom: '',
    checkInTo: '',
    noCheckInEndTime: false,
    lateCheckInAvailable: 'yes',
    lateCheckInCost: 'surcharge', // 'free' or 'surcharge'
    lateCheckInChargeType: 'amount', // 'amount', 'percent', 'varies'
    lateCheckInAmount: '',
    lateCheckInSurchargeFrom: '',
    lateCheckInSurchargeTo: '',
    advanceNoticeRequired: false,
    advanceNoticeHours: '',
    lateCheckInDifferentLocation: false,
    lateCheckInAddress: '',
    checkOutTime: '',
    minimumCheckInAge: '15',
    
    // Internet
    offerInternet: 'yes',
    wifiInGuestrooms: true,
    wifiGuestroomsFree: true,
    wifiGuestroomsSurcharge: '',
    wifiGuestroomsMinSpeed: '',
    wifiGuestroomsRestrictions: false,
    wifiInPublicAreas: true,
    wifiPublicAreasFree: true,
    wifiPublicAreasSurcharge: '',
    wifiPublicAreasRestrictions: false,
    
    // Parking
    offerParking: 'yes',
    selfParking: true,
    selfParkingFree: true,
    selfParkingSurcharge: '',
    selfParkingCovered: false,
    selfParkingUncovered: false,
    selfParkingSecured: false,
    valetParking: true,
    valetParkingFree: true,
    valetParkingSurcharge: '',
    valetParkingCovered: false,
    valetParkingUncovered: false,
    valetParkingSecured: false,
    extendedParking: true,
    extendedParkingCost: '',
    extendedParkingCovered: false,
    extendedParkingUncovered: false,
    extendedParkingSecured: false,
    offsiteParking: true,
    offsiteParkingFree: true,
    offsiteParkingSurcharge: '',
    offsiteParkingDistance: '',
    offsiteParkingDistanceUnit: '',
    offsiteParkingLotHours: false,
    offsiteParkingReservationsRequired: false,
    streetParking: false,
    offStreetParking: true,
    offStreetParkingGarage: false,
    offStreetParkingCarport: false,
    
    // Breakfast
    offerBreakfast: 'yes',
    
    // Popular facilities and services
    poolAccess: 'yes',
    diningVenues: 'yes',
    spaServices: 'yes',
    allowPets: 'yes',
    accessibilityFeatures: 'yes',
    guestServices: 'yes',
    
    // Room conveniences
    inRoomConveniences: 'yes',
    housekeeping: 'yes',
    
    // Additional Amenities
    uniqueAmenities: [],
    newAmenity: '',
    
    // Themes (auto-generated but can be displayed)
    themes: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddAmenity = () => {
    if (formData.newAmenity.trim() && !formData.uniqueAmenities.includes(formData.newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        uniqueAmenities: [...prev.uniqueAmenities, prev.newAmenity.trim()],
        newAmenity: ''
      }));
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      uniqueAmenities: prev.uniqueAmenities.filter(a => a !== amenity)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields based on selections
    if (formData.hasFrontDesk === 'yes' && formData.frontDeskSchedule === 'everyday') {
      if (!formData.deskOpens && !formData.frontDesk24Hours) {
        newErrors.deskOpens = 'Desk opening time is required';
      }
      if (!formData.deskCloses && !formData.frontDesk24Hours) {
        newErrors.deskCloses = 'Desk closing time is required';
      }
    }

    if (formData.selfCheckInAvailable === 'yes' && !formData.guestAccessMethod) {
      newErrors.guestAccessMethod = 'Guest access method is required';
    }

    if (!formData.checkOutTime) {
      newErrors.checkOutTime = 'Check-out time is required';
    }

    if (formData.lateCheckInAvailable === 'yes' && formData.lateCheckInCost === 'surcharge') {
      if (formData.lateCheckInChargeType === 'amount' && !formData.lateCheckInAmount) {
        newErrors.lateCheckInAmount = 'Late check-in amount is required';
      }
      if (formData.advanceNoticeRequired && !formData.advanceNoticeHours) {
        newErrors.advanceNoticeHours = 'Advance notice hours is required';
      }
      if (formData.lateCheckInDifferentLocation && !formData.lateCheckInAddress.trim()) {
        newErrors.lateCheckInAddress = 'Late check-in address is required';
      }
    }

    if (formData.offerInternet === 'yes' && formData.wifiInGuestrooms && !formData.wifiGuestroomsMinSpeed) {
      newErrors.wifiGuestroomsMinSpeed = 'Minimum Wi-Fi speed is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    if (!propertyId || propertyId === 0) {
      setSubmitError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Convert WiFi speed string values to numeric Mbps values
      const convertWifiSpeedToMbps = (speedValue) => {
        if (!speedValue) return null;
        const speedMap = {
          'basic': 1,           // < 1 Mbps -> use 1 Mbps
          'standard': 3,        // 1-5 Mbps -> use 3 Mbps (middle)
          'high': 7,            // 5-10 Mbps -> use 7 Mbps (middle)
          'very_high': 15       // > 10 Mbps -> use 15 Mbps
        };
        // If it's already a number, return it
        if (typeof speedValue === 'number' || !isNaN(parseInt(speedValue))) {
          return parseInt(speedValue);
        }
        // Otherwise, map the string value
        return speedMap[speedValue] || null;
      };

      // Transform formData to match backend API expectations (camelCase)
      const amenitiesData = {
        minCheckInAge: formData.minCheckInAge ? parseInt(formData.minCheckInAge) : null,
        checkInTime: formData.checkInTime || null,
        checkInEnds: formData.checkInEnds || null,
        checkOutTime: formData.checkOutTime || null,
        hasFrontDesk: formData.hasFrontDesk || 'no',
        frontDeskSchedule: formData.frontDeskSchedule || null,
        frontDesk24Hours: formData.frontDesk24Hours || false,
        deskOpens: formData.deskOpens || null,
        deskCloses: formData.deskCloses || null,
        selfCheckInAvailable: formData.selfCheckInAvailable || 'no',
        guestAccessMethod: formData.guestAccessMethod || null,
        lateCheckInAvailable: formData.lateCheckInAvailable || 'no',
        lateCheckInCost: formData.lateCheckInCost || null,
        lateCheckInChargeType: formData.lateCheckInChargeType || null,
        lateCheckInAmount: formData.lateCheckInAmount ? parseFloat(formData.lateCheckInAmount) : null,
        advanceNoticeRequired: formData.advanceNoticeRequired || false,
        advanceNoticeHours: formData.advanceNoticeHours ? parseInt(formData.advanceNoticeHours) : null,
        lateCheckInDifferentLocation: formData.lateCheckInDifferentLocation || false,
        lateCheckInAddress: formData.lateCheckInAddress || null,
        offerBreakfast: formData.offerBreakfast || 'no',
        breakfastType: formData.breakfastType || null,
        offerInternet: formData.offerInternet || 'no',
        wifiInGuestrooms: formData.wifiInGuestrooms || false,
        wifiGuestroomsMinSpeed: convertWifiSpeedToMbps(formData.wifiGuestroomsMinSpeed),
        wifiInPublicAreas: formData.wifiInPublicAreas || false,
        wiredInternet: formData.wiredInternet || false,
        wiredInternetInGuestrooms: formData.wiredInternetInGuestrooms || false,
        offerParking: formData.offerParking || 'no',
        selfParking: formData.selfParking || false,
        valetParking: formData.valetParking || false,
        electricCarCharging: formData.electricCarCharging || false,
        parkingFee: formData.parkingFee ? parseFloat(formData.parkingFee) : null,
        hasPool: formData.hasPool || false,
        poolType: formData.poolType || null,
        hasSpa: formData.hasSpa || false,
        hasFitnessCenter: formData.hasFitnessCenter || false,
        hasRestaurant: formData.hasRestaurant || false,
        hasBar: formData.hasBar || false,
        hasConcierge: formData.hasConcierge || false,
        hasLaundry: formData.hasLaundry || false,
        hasBusinessCenter: formData.hasBusinessCenter || false,
        petsAllowed: formData.petsAllowed || 'no',
        hasPetSurcharge: formData.hasPetSurcharge || 'no',
        petSurchargeAmount: formData.petSurchargeAmount ? parseFloat(formData.petSurchargeAmount) : null,
        petSurchargeCurrency: formData.petSurchargeCurrency || 'RWF',
        petSurchargeUnit: formData.petSurchargeUnit || 'per_pet',
        petSurchargePeriod: formData.petSurchargePeriod || 'per_night',
        petSurchargeMaxFeePerStay: formData.petSurchargeMaxFeePerStay || false,
        petSurchargeMaxFeeAmount: formData.petSurchargeMaxFeeAmount ? parseFloat(formData.petSurchargeMaxFeeAmount) : null,
        petFeeVariesByStayLength: formData.petFeeVariesByStayLength || false,
        additionalAmenities: formData.additionalAmenities || [],
        themes: formData.themes || []
      };

      // Save amenities via API
      await staysSetupService.saveAmenities(propertyId, amenitiesData);

      // Store in localStorage as backup
      localStorage.setItem('stays_amenities', JSON.stringify(formData));

      // Navigate to next step (Step 5 - Rooms and Rates)
      navigate('/stays/setup/rooms', {
        state: {
          ...location.state,
          amenities: formData
        }
      });
    } catch (err) {
      console.error('Error saving amenities:', err);
      setSubmitError(err.message || 'Failed to save amenities. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/stays/setup/policies', {
      state: location.state
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {/* Step 1 - Completed */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  <span>✓</span>
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                
                {/* Step 2 - Completed */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  <span>✓</span>
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                
                {/* Step 3 - Completed */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  <span>✓</span>
                </div>
                <div className="w-16 h-1" style={{ backgroundColor: '#3CAF54' }}></div>
                
                {/* Step 4 - Current */}
                <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md" style={{ backgroundColor: '#3CAF54' }}>
                  4
                </div>
                <div className="w-16 h-1 bg-gray-300"></div>
                
                {/* Steps 5-10 - Not completed */}
                {[5, 6, 7, 8, 9, 10].map((step) => (
                  <React.Fragment key={step}>
                    <div className="w-8 h-8 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold bg-white border-2 border-gray-300">
                      {step}
                    </div>
                    {step < 10 && <div className="w-16 h-1 bg-gray-300"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: '#1f6f31' }}>Step 4 of 10</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 border" style={{ borderColor: '#dcfce7' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Property amenities</h1>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              {/* Check-in / Check-out */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-in / Check-out</h2>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#dcfce7' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('standard')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'standard'
                        ? 'text-[#3CAF54] border-b-2 border-[#3CAF54]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Standard options
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('advanced')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'advanced'
                        ? 'text-[#3CAF54] border-b-2 border-[#3CAF54]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Advanced options
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Front Desk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is there a front desk at your property?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasFrontDesk"
                          value="yes"
                          checked={formData.hasFrontDesk === 'yes'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasFrontDesk"
                          value="no"
                          checked={formData.hasFrontDesk === 'no'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>

                    {formData.hasFrontDesk === 'yes' && (
                      <div className="ml-7 mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What is the front desk schedule?
                          </label>
                          <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="frontDeskSchedule"
                                value="everyday"
                                checked={formData.frontDeskSchedule === 'everyday'}
                                onChange={handleChange}
                                className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Everyday</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="frontDeskSchedule"
                                value="select_days"
                                checked={formData.frontDeskSchedule === 'select_days'}
                                onChange={handleChange}
                                className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Select days</span>
                            </label>
                          </div>
                          
                          {formData.frontDeskSchedule === 'everyday' && (
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Desk opens
                                </label>
                                <select
                                  name="deskOpens"
                                  value={formData.deskOpens}
                                  onChange={handleChange}
                                  disabled={formData.frontDesk24Hours}
                                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                    errors.deskOpens ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                >
                                  <option value="">-select-</option>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = String(i).padStart(2, '0');
                                    return (
                                      <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                                    );
                                  })}
                                </select>
                                {errors.deskOpens && (
                                  <p className="mt-1 text-sm text-red-600">{errors.deskOpens}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Desk closes
                                </label>
                                <select
                                  name="deskCloses"
                                  value={formData.deskCloses}
                                  onChange={handleChange}
                                  disabled={formData.frontDesk24Hours}
                                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                    errors.deskCloses ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                >
                                  <option value="">-select-</option>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = String(i).padStart(2, '0');
                                    return (
                                      <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                                    );
                                  })}
                                </select>
                                {errors.deskCloses && (
                                  <p className="mt-1 text-sm text-red-600">{errors.deskCloses}</p>
                                )}
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="frontDesk24Hours"
                                    checked={formData.frontDesk24Hours}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Open 24 hours</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Self Check-in */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is self check-in available?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selfCheckInAvailable"
                          value="yes"
                          checked={formData.selfCheckInAvailable === 'yes'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selfCheckInAvailable"
                          value="no"
                          checked={formData.selfCheckInAvailable === 'no'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>

                    {formData.selfCheckInAvailable === 'yes' && (
                      <div className="ml-7 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How will guests access their unit?
                        </label>
                        <select
                          name="guestAccessMethod"
                          value={formData.guestAccessMethod}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                            errors.guestAccessMethod ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                          }`}
                        >
                          <option value="">Select one</option>
                          <option value="key_pad">Key pad</option>
                          <option value="smart_lock">Smart lock</option>
                          <option value="lockbox">Lockbox</option>
                          <option value="key_in_mailbox">Key in mailbox</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.guestAccessMethod && (
                          <p className="mt-1 text-sm text-red-600">{errors.guestAccessMethod}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile App */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is a mobile app recommended or required?
                    </label>
                    <select
                      name="mobileAppRequired"
                      value={formData.mobileAppRequired}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    >
                      <option value="">-select-</option>
                      <option value="recommended">Recommended</option>
                      <option value="required">Required</option>
                      <option value="not_applicable">Not applicable</option>
                    </select>
                  </div>

                  {/* Check-in Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When can guests check in?
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <select
                          name="checkInFrom"
                          value={formData.checkInFrom}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                        >
                          <option value="">-select-</option>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <select
                          name="checkInTo"
                          value={formData.checkInTo}
                          onChange={handleChange}
                          disabled={formData.noCheckInEndTime}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">-select-</option>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="noCheckInEndTime"
                            checked={formData.noCheckInEndTime}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm text-gray-700">No check-in end time</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Late Check-in */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is late check-in available?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="lateCheckInAvailable"
                          value="yes"
                          checked={formData.lateCheckInAvailable === 'yes'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="lateCheckInAvailable"
                          value="no"
                          checked={formData.lateCheckInAvailable === 'no'}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>

                    {formData.lateCheckInAvailable === 'yes' && (
                      <div className="ml-7 mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Late check-in cost
                          </label>
                          <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="lateCheckInCost"
                                value="free"
                                checked={formData.lateCheckInCost === 'free'}
                                onChange={handleChange}
                                className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Free</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="lateCheckInCost"
                                value="surcharge"
                                checked={formData.lateCheckInCost === 'surcharge'}
                                onChange={handleChange}
                                className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Surcharge</span>
                            </label>
                          </div>

                          {formData.lateCheckInCost === 'surcharge' && (
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="lateCheckInChargeType"
                                    value="amount"
                                    checked={formData.lateCheckInChargeType === 'amount'}
                                    onChange={handleChange}
                                    className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Amount</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="lateCheckInChargeType"
                                    value="percent"
                                    checked={formData.lateCheckInChargeType === 'percent'}
                                    onChange={handleChange}
                                    className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Percent</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="lateCheckInChargeType"
                                    value="varies"
                                    checked={formData.lateCheckInChargeType === 'varies'}
                                    onChange={handleChange}
                                    className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Fee varies</span>
                                </label>
                              </div>

                              {formData.lateCheckInChargeType === 'amount' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (including taxes)
                                  </label>
                                  <input
                                    type="number"
                                    name="lateCheckInAmount"
                                    value={formData.lateCheckInAmount}
                                    onChange={handleChange}
                                    placeholder="e.g., 5000"
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                      errors.lateCheckInAmount ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                    }`}
                                  />
                                  {errors.lateCheckInAmount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.lateCheckInAmount}</p>
                                  )}
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  When does the late check-in surcharge apply?
                                </label>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <select
                                    name="lateCheckInSurchargeFrom"
                                    value={formData.lateCheckInSurchargeFrom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                  >
                                    <option value="">-select-</option>
                                    {Array.from({ length: 24 }, (_, i) => {
                                      const hour = String(i).padStart(2, '0');
                                      return (
                                        <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                                      );
                                    })}
                                  </select>
                                  <select
                                    name="lateCheckInSurchargeTo"
                                    value={formData.lateCheckInSurchargeTo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                  >
                                    <option value="">-select-</option>
                                    {Array.from({ length: 24 }, (_, i) => {
                                      const hour = String(i).padStart(2, '0');
                                      return (
                                        <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="advanceNoticeRequired"
                                    checked={formData.advanceNoticeRequired}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Advance notice required for late check-in</span>
                                </label>
                                {formData.advanceNoticeRequired && (
                                  <div className="ml-6">
                                    <select
                                      name="advanceNoticeHours"
                                      value={formData.advanceNoticeHours}
                                      onChange={handleChange}
                                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                        errors.advanceNoticeHours ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                      }`}
                                    >
                                      <option value="">-select-</option>
                                      <option value="1">1 hour</option>
                                      <option value="2">2 hours</option>
                                      <option value="4">4 hours</option>
                                      <option value="6">6 hours</option>
                                      <option value="12">12 hours</option>
                                      <option value="24">24 hours</option>
                                    </select>
                                    {errors.advanceNoticeHours && (
                                      <p className="mt-1 text-sm text-red-600">{errors.advanceNoticeHours}</p>
                                    )}
                                  </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="lateCheckInDifferentLocation"
                                    checked={formData.lateCheckInDifferentLocation}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                  />
                                  <span className="text-sm text-gray-700">Late check-in is at a different location</span>
                                </label>
                                {formData.lateCheckInDifferentLocation && (
                                  <div className="ml-6">
                                    <input
                                      type="text"
                                      name="lateCheckInAddress"
                                      value={formData.lateCheckInAddress}
                                      onChange={handleChange}
                                      placeholder="Late check in address"
                                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                        errors.lateCheckInAddress ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                      }`}
                                    />
                                    {errors.lateCheckInAddress && (
                                      <p className="mt-1 text-sm text-red-600">{errors.lateCheckInAddress}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Check-out Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When do guests need to check out?
                    </label>
                    <select
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        errors.checkOutTime ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                      }`}
                    >
                      <option value="">-select-</option>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = String(i).padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                        );
                      })}
                    </select>
                    {errors.checkOutTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.checkOutTime}</p>
                    )}
                  </div>

                  {/* Age Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum check-in age
                    </label>
                    <select
                      name="minimumCheckInAge"
                      value={formData.minimumCheckInAge}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 15).map(age => (
                        <option key={age} value={age.toString()}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Internet */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wifi className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Internet
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you offer internet?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerInternet: 'yes' }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.offerInternet === 'yes'
                            ? 'bg-[#3CAF54] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerInternet: 'no' }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.offerInternet === 'no'
                            ? 'bg-[#3CAF54] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {formData.offerInternet === 'yes' && (
                    <div className="ml-7 space-y-4">
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="wifiInGuestrooms"
                            checked={formData.wifiInGuestrooms}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Wi-Fi in guestrooms</span>
                        </label>
                        {formData.wifiInGuestrooms && (
                          <div className="ml-6 space-y-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wifiGuestroomsFree"
                                  checked={formData.wifiGuestroomsFree}
                                  onChange={() => setFormData(prev => ({ ...prev, wifiGuestroomsFree: true, wifiGuestroomsSurcharge: '' }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Free</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wifiGuestroomsFree"
                                  checked={!formData.wifiGuestroomsFree}
                                  onChange={() => setFormData(prev => ({ ...prev, wifiGuestroomsFree: false }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Surcharge</span>
                              </label>
                            </div>
                            {!formData.wifiGuestroomsFree && (
                              <input
                                type="number"
                                name="wifiGuestroomsSurcharge"
                                value={formData.wifiGuestroomsSurcharge}
                                onChange={handleChange}
                                placeholder="Surcharge amount"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Wi-Fi speed
                              </label>
                              <select
                                name="wifiGuestroomsMinSpeed"
                                value={formData.wifiGuestroomsMinSpeed}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                                  errors.wifiGuestroomsMinSpeed ? 'border-red-500' : 'border-gray-300 focus:border-[#3CAF54]'
                                }`}
                              >
                                <option value="">-select-</option>
                                <option value="basic">Basic (&lt; 1 Mbps)</option>
                                <option value="standard">Standard (1-5 Mbps)</option>
                                <option value="high">High (5-10 Mbps)</option>
                                <option value="very_high">Very High (&gt; 10 Mbps)</option>
                              </select>
                              {errors.wifiGuestroomsMinSpeed && (
                                <p className="mt-1 text-sm text-red-600">{errors.wifiGuestroomsMinSpeed}</p>
                              )}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="wifiGuestroomsRestrictions"
                                checked={formData.wifiGuestroomsRestrictions}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Restrictions apply</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="wifiInPublicAreas"
                            checked={formData.wifiInPublicAreas}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Wi-Fi in public areas</span>
                        </label>
                        {formData.wifiInPublicAreas && (
                          <div className="ml-6 space-y-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wifiPublicAreasFree"
                                  checked={formData.wifiPublicAreasFree}
                                  onChange={() => setFormData(prev => ({ ...prev, wifiPublicAreasFree: true, wifiPublicAreasSurcharge: '' }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Free</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wifiPublicAreasFree"
                                  checked={!formData.wifiPublicAreasFree}
                                  onChange={() => setFormData(prev => ({ ...prev, wifiPublicAreasFree: false }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Surcharge</span>
                              </label>
                            </div>
                            {!formData.wifiPublicAreasFree && (
                              <input
                                type="number"
                                name="wifiPublicAreasSurcharge"
                                value={formData.wifiPublicAreasSurcharge}
                                onChange={handleChange}
                                placeholder="Surcharge amount"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                            )}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="wifiPublicAreasRestrictions"
                                checked={formData.wifiPublicAreasRestrictions}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Restrictions apply</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="text-sm text-[#3CAF54] hover:underline font-medium"
                      >
                        More options
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Parking */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Parking
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you offer parking?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerParking: 'yes' }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.offerParking === 'yes'
                            ? 'bg-[#3CAF54] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerParking: 'no' }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.offerParking === 'no'
                            ? 'bg-[#3CAF54] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {formData.offerParking === 'yes' && (
                    <div className="ml-7 space-y-4">
                      {/* Self Parking */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="selfParking"
                            checked={formData.selfParking}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Self parking</span>
                        </label>
                        {formData.selfParking && (
                          <div className="ml-6 space-y-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="selfParkingFree"
                                  checked={formData.selfParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, selfParkingFree: true, selfParkingSurcharge: '' }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Free</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="selfParkingFree"
                                  checked={!formData.selfParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, selfParkingFree: false }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Surcharge</span>
                              </label>
                            </div>
                            {!formData.selfParkingFree && (
                              <input
                                type="number"
                                name="selfParkingSurcharge"
                                value={formData.selfParkingSurcharge}
                                onChange={handleChange}
                                placeholder="Surcharge amount"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                            )}
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="selfParkingCovered"
                                  checked={formData.selfParkingCovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Covered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="selfParkingUncovered"
                                  checked={formData.selfParkingUncovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Uncovered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="selfParkingSecured"
                                  checked={formData.selfParkingSecured}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Secured parking</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Valet Parking */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="valetParking"
                            checked={formData.valetParking}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Valet parking</span>
                        </label>
                        {formData.valetParking && (
                          <div className="ml-6 space-y-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="valetParkingFree"
                                  checked={formData.valetParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, valetParkingFree: true, valetParkingSurcharge: '' }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Free</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="valetParkingFree"
                                  checked={!formData.valetParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, valetParkingFree: false }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Surcharge</span>
                              </label>
                            </div>
                            {!formData.valetParkingFree && (
                              <input
                                type="number"
                                name="valetParkingSurcharge"
                                value={formData.valetParkingSurcharge}
                                onChange={handleChange}
                                placeholder="Surcharge amount"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                            )}
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="valetParkingCovered"
                                  checked={formData.valetParkingCovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Covered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="valetParkingUncovered"
                                  checked={formData.valetParkingUncovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Uncovered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="valetParkingSecured"
                                  checked={formData.valetParkingSecured}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Secured parking</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Extended Parking */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="extendedParking"
                            checked={formData.extendedParking}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Extended</span>
                        </label>
                        {formData.extendedParking && (
                          <div className="ml-6 space-y-3">
                            <select
                              name="extendedParkingCost"
                              value={formData.extendedParkingCost}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                            >
                              <option value="">-select-</option>
                              <option value="free">Free</option>
                              <option value="per_day">Per day</option>
                              <option value="per_week">Per week</option>
                              <option value="per_month">Per month</option>
                            </select>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="extendedParkingCovered"
                                  checked={formData.extendedParkingCovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Covered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="extendedParkingUncovered"
                                  checked={formData.extendedParkingUncovered}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Uncovered parking</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="extendedParkingSecured"
                                  checked={formData.extendedParkingSecured}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Secured parking</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Offsite Parking */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="offsiteParking"
                            checked={formData.offsiteParking}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Offsite</span>
                        </label>
                        {formData.offsiteParking && (
                          <div className="ml-6 space-y-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="offsiteParkingFree"
                                  checked={formData.offsiteParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, offsiteParkingFree: true, offsiteParkingSurcharge: '' }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Free</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="offsiteParkingFree"
                                  checked={!formData.offsiteParkingFree}
                                  onChange={() => setFormData(prev => ({ ...prev, offsiteParkingFree: false }))}
                                  className="w-4 h-4 border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Surcharge</span>
                              </label>
                            </div>
                            {!formData.offsiteParkingFree && (
                              <input
                                type="number"
                                name="offsiteParkingSurcharge"
                                value={formData.offsiteParkingSurcharge}
                                onChange={handleChange}
                                placeholder="Surcharge amount"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                            )}
                            <div className="grid md:grid-cols-2 gap-4">
                              <input
                                type="number"
                                name="offsiteParkingDistance"
                                value={formData.offsiteParkingDistance}
                                onChange={handleChange}
                                placeholder="Offsite parking distance from property"
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              />
                              <select
                                name="offsiteParkingDistanceUnit"
                                value={formData.offsiteParkingDistanceUnit}
                                onChange={handleChange}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                              >
                                <option value="">-select-</option>
                                <option value="meters">Meters</option>
                                <option value="kilometers">Kilometers</option>
                                <option value="feet">Feet</option>
                                <option value="miles">Miles</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="offsiteParkingLotHours"
                                  checked={formData.offsiteParkingLotHours}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Offsite parking lot hours</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="offsiteParkingReservationsRequired"
                                  checked={formData.offsiteParkingReservationsRequired}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Offsite parking reservations required</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="streetParking"
                                  checked={formData.streetParking}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Street parking</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Off-street Parking */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            name="offStreetParking"
                            checked={formData.offStreetParking}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                          />
                          <span className="text-sm font-medium text-gray-700">Off-street parking</span>
                        </label>
                        {formData.offStreetParking && (
                          <div className="ml-6 flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="offStreetParkingGarage"
                                checked={formData.offStreetParkingGarage}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Garage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="offStreetParkingCarport"
                                checked={formData.offStreetParkingCarport}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-[#3CAF54] focus:ring-[#3CAF54]"
                              />
                              <span className="text-sm text-gray-700">Carport</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="text-sm text-[#3CAF54] hover:underline font-medium"
                      >
                        More options
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Breakfast */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Breakfast
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you offer breakfast?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, offerBreakfast: 'yes' }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.offerBreakfast === 'yes'
                          ? 'bg-[#3CAF54] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, offerBreakfast: 'no' }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.offerBreakfast === 'no'
                          ? 'bg-[#3CAF54] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular Facilities and Services */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Popular facilities and services
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'poolAccess', label: 'Do your guests have pool access?' },
                    { key: 'diningVenues', label: 'Do you offer dining venues?' },
                    { key: 'spaServices', label: 'Do you have a spa or spa services?' },
                    { key: 'allowPets', label: 'Do you allow pets?' },
                    { key: 'accessibilityFeatures', label: 'Do you have accessibility features at your property?' },
                    { key: 'guestServices', label: 'Do you offer guest services such as laundry, smoking areas, or concierge?' }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {item.label}
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [item.key]: 'yes' }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            formData[item.key] === 'yes'
                              ? 'bg-[#3CAF54] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [item.key]: 'no' }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            formData[item.key] === 'no'
                              ? 'bg-[#3CAF54] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Conveniences */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Room conveniences
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'inRoomConveniences', label: 'Do you offer in-room conveniences such as ironing boards or safes?' },
                    { key: 'housekeeping', label: 'Do you provide housekeeping?' }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {item.label}
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [item.key]: 'yes' }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            formData[item.key] === 'yes'
                              ? 'bg-[#3CAF54] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [item.key]: 'no' }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            formData[item.key] === 'no'
                              ? 'bg-[#3CAF54] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Amenities */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#3CAF54' }} />
                  Additional Amenities (optional)
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.newAmenity}
                      onChange={(e) => setFormData(prev => ({ ...prev, newAmenity: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                      placeholder="What amenities make your property unique?"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-6 py-2 text-white font-semibold rounded-lg transition-colors"
                      style={{ backgroundColor: '#3CAF54' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                    >
                      Add amenities
                    </button>
                  </div>
                  
                  {formData.uniqueAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.uniqueAmenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0fdf4] border border-[#3CAF54] rounded-lg text-sm"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(amenity)}
                            className="text-[#3CAF54] hover:text-[#2d8f42]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Themes */}
              {formData.themes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Themes based on your feature amenities
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Themes are applied based on feature amenities you've selected.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#f0fdf4] border border-[#3CAF54] rounded-lg text-sm font-medium"
                        style={{ color: '#1f6f31' }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {submitError}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: '#dcfce7' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isSubmitting ? '#2d8f42' : '#3CAF54' }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2d8f42')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3CAF54')}
                >
                  <span>{isSubmitting ? 'Saving...' : 'Next'}</span>
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
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

