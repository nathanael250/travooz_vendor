import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, AlertCircle, Wifi, Car, Coffee, Users, Home } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
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
    hasFrontDesk: 'no',
    frontDeskSchedule: 'everyday', // 'everyday' or 'select_days'
    deskOpens: '',
    deskCloses: '',
    frontDesk24Hours: false,
    checkInFrom: '',
    checkInTo: '',
    noCheckInEndTime: false,
    minimumCheckInAge: '15',
    
    // Internet
    offerInternet: 'no',
    
    // Parking
    offerParking: 'no',
    
    // Breakfast
    offerBreakfast: 'no',
    
    // Popular facilities and services
    poolAccess: 'no',
    diningVenues: 'no',
    spaServices: 'no',
    allowPets: 'no',
    accessibilityFeatures: 'no',
    guestServices: 'no',
    
    // Room conveniences
    inRoomConveniences: 'no',
    housekeeping: 'no',
    
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
      // Transform formData to match backend API expectations (camelCase)
      const amenitiesData = {
        minCheckInAge: formData.minCheckInAge ? parseInt(formData.minCheckInAge) : null,
        checkInTime: formData.checkInTime || null,
        checkInEnds: formData.checkInEnds || null,
        hasFrontDesk: formData.hasFrontDesk || 'no',
        frontDeskSchedule: formData.frontDeskSchedule || null,
        frontDesk24Hours: formData.frontDesk24Hours || false,
        deskOpens: formData.deskOpens || null,
        deskCloses: formData.deskCloses || null,
        offerBreakfast: formData.offerBreakfast || 'no',
        breakfastType: formData.breakfastType || null,
        offerInternet: formData.offerInternet || 'no',
        offerParking: formData.offerParking || 'no',
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
          <ProgressIndicator currentStep={4} totalSteps={10} />

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
                    <div className="flex gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerParking: 'yes' }))}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
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
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.offerParking === 'no'
                            ? 'bg-[#3CAF54] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
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
                      <div className="flex gap-3 md:gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [item.key]: 'yes' }))}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
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
                          className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
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

