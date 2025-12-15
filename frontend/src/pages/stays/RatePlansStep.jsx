import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, Eye, ChevronDown, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import ProgressIndicator from '../../components/stays/ProgressIndicator';
import { staysSetupService } from '../../services/staysService';

export default function RatePlansStep() {
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
  const baseRate = roomData.baseRate || 0;
  const peopleIncluded = roomData.peopleIncluded || 2;
  const maxOccupancy = roomData.recommendedOccupancy || peopleIncluded;

  const [selectedRatePlans, setSelectedRatePlans] = useState(roomData.ratePlans || []);
  const [ratePlanDetails, setRatePlanDetails] = useState(roomData.ratePlanDetails || {});
  const [previewGuests, setPreviewGuests] = useState(peopleIncluded.toString());
  const [showLegalText, setShowLegalText] = useState(false);
  const [openModal, setOpenModal] = useState(null); // 'breakfast' | 'non-refundable' | null
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form states for breakfast rate plan
  const [breakfastForm, setBreakfastForm] = useState({
    rateType: 'increase', // 'increase' or 'discount'
    amount: '',
    description: ''
  });

  // Form states for non-refundable rate plan
  const [nonRefundableForm, setNonRefundableForm] = useState({
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    description: ''
  });

  // Generate preview guest options
  const previewGuestOptions = Array.from({ length: maxOccupancy }, (_, i) => i + 1).map(num => ({
    value: num.toString(),
    label: num.toString()
  }));

  // Calculate preview rates
  const discountPercentage = 10; // Exclusive traveler discount
  const discountedRate = baseRate * (1 - discountPercentage / 100);

  const handleAddRatePlan = (planType) => {
    setOpenModal(planType);
  };

  const handleSaveBreakfastRate = () => {
    if (!breakfastForm.amount || parseFloat(breakfastForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const details = {
      type: 'breakfast',
      rateType: breakfastForm.rateType,
      amount: parseFloat(breakfastForm.amount),
      description: breakfastForm.description,
      rate: breakfastForm.rateType === 'increase' 
        ? baseRate + parseFloat(breakfastForm.amount)
        : baseRate - parseFloat(breakfastForm.amount)
    };

    setRatePlanDetails({
      ...ratePlanDetails,
      breakfast: details
    });

    if (!selectedRatePlans.includes('breakfast')) {
      setSelectedRatePlans([...selectedRatePlans, 'breakfast']);
    }

    setOpenModal(null);
    setBreakfastForm({ rateType: 'increase', amount: '', description: '' });
  };

  const handleSaveNonRefundableRate = () => {
    if (!nonRefundableForm.discountValue || parseFloat(nonRefundableForm.discountValue) <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    const discountAmount = nonRefundableForm.discountType === 'percentage'
      ? baseRate * (parseFloat(nonRefundableForm.discountValue) / 100)
      : parseFloat(nonRefundableForm.discountValue);

    const details = {
      type: 'non-refundable',
      discountType: nonRefundableForm.discountType,
      discountValue: parseFloat(nonRefundableForm.discountValue),
      description: nonRefundableForm.description,
      rate: baseRate - discountAmount
    };

    setRatePlanDetails({
      ...ratePlanDetails,
      nonRefundable: details
    });

    if (!selectedRatePlans.includes('non-refundable')) {
      setSelectedRatePlans([...selectedRatePlans, 'non-refundable']);
    }

    setOpenModal(null);
    setNonRefundableForm({ discountType: 'percentage', discountValue: '', description: '' });
  };

  const handleCancelModal = () => {
    setOpenModal(null);
    setBreakfastForm({ rateType: 'increase', amount: '', description: '' });
    setNonRefundableForm({ discountType: 'percentage', discountValue: '', description: '' });
  };

  const handleRemoveRatePlan = (planType) => {
    setSelectedRatePlans(selectedRatePlans.filter(plan => plan !== planType));
    const updatedDetails = { ...ratePlanDetails };
    delete updatedDetails[planType];
    setRatePlanDetails(updatedDetails);
  };

  const handleNext = async () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    if (!propertyId || propertyId === 0) {
      setSaveError('Property ID is missing. Please go back and try again.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // Update room data with rate plans
      const updatedRoomData = {
        ...roomData,
        ratePlans: selectedRatePlans,
        ratePlanDetails: ratePlanDetails,
        step: 6,
        roomSetupComplete: true
      };

      // Helper function to convert = undefined to null
      const nullIfUndefined = (value) => value === undefined ? null : value;
      
      // Clean beds array - ensure no = undefined values
      const cleanBeds = (updatedRoomData.beds || []).map(bed => ({
        bedType: nullIfUndefined(bed.bedType) || 'queen',
        quantity: nullIfUndefined(bed.quantity) ?? 1
      })).filter(bed => bed.bedType !== null);
      
      // Transform room data for backend API (convert = undefined to null for SQL)
      const roomDataForAPI = {
        roomName: nullIfUndefined(updatedRoomData.roomName) || updatedRoomData.roomType || 'Standard Room',
        roomType: nullIfUndefined(updatedRoomData.roomType) || 'standard',
        roomClass: nullIfUndefined(updatedRoomData.roomClass) || 'standard',
        smokingPolicy: nullIfUndefined(updatedRoomData.smokingPolicy) || 'non-smoking',
        numberOfRooms: nullIfUndefined(updatedRoomData.numberOfRooms) ?? 1,
        recommendedOccupancy: nullIfUndefined(updatedRoomData.recommendedOccupancy) || nullIfUndefined(updatedRoomData.maxOccupancy) || peopleIncluded,
        pricingModel: nullIfUndefined(updatedRoomData.pricingModel) || 'per-day',
        baseRate: nullIfUndefined(updatedRoomData.baseRate) ?? baseRate,
        peopleIncluded: nullIfUndefined(updatedRoomData.peopleIncluded) ?? peopleIncluded,
        beds: cleanBeds,
        bathroomType: nullIfUndefined(updatedRoomData.bathroomType) || 'private',
        numberOfBathrooms: nullIfUndefined(updatedRoomData.numberOfBathrooms) ?? 1,
        bathroomAmenities: Array.isArray(updatedRoomData.bathroomAmenities) ? updatedRoomData.bathroomAmenities  : [],
        hasKitchen: updatedRoomData.hasKitchen === true,
        kitchenFacilities: Array.isArray(updatedRoomData.kitchenFacilities) ? updatedRoomData.kitchenFacilities  : [],
        hasAirConditioning: updatedRoomData.hasAirConditioning === true,
        hasHeating: updatedRoomData.hasHeating === true,
        hasView: nullIfUndefined(updatedRoomData.hasView) || 'no',
        roomView: nullIfUndefined(updatedRoomData.roomView),
        roomSizeSqm: nullIfUndefined(updatedRoomData.roomSizeSqm),
        roomSizeSqft: nullIfUndefined(updatedRoomData.roomSizeSqft),
        hasBalcony: updatedRoomData.hasBalcony === true,
        hasTerrace: updatedRoomData.hasTerrace === true,
        hasPatio: updatedRoomData.hasPatio === true,
        roomLayout: Array.isArray(updatedRoomData.roomLayout) ? updatedRoomData.roomLayout  : [],
        additionalAmenities: Array.isArray(updatedRoomData.additionalAmenities) ? updatedRoomData.additionalAmenities  : [],
        ratePlans: selectedRatePlans.map(planType => {
          const planDetails = ratePlanDetails[planType] || {};
          return {
            planType,
            rateType: nullIfUndefined(planDetails.rateType),
            amount: planDetails.amount !== undefined ? (planDetails.amount === '' ? null : parseFloat(planDetails.amount)) : null,
            description: nullIfUndefined(planDetails.description),
            discountType: nullIfUndefined(planDetails.discountType),
            discountValue: planDetails.discountValue !== undefined ? (planDetails.discountValue === '' ? null : parseFloat(planDetails.discountValue)) : null
          };
        }).filter(plan => plan.planType) // Remove any plans without planType
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
    // Go back to step 4 (Base Rate) with room data
    navigate('/stays/setup/base-rate', {
      state: {
        ...location.state,
        roomData: roomData,
        roomSetupStep: 4
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Boost traveler interest with rate plans</h1>
                  <p className="text-gray-600">
                    These will be shown to travelers when they're searching for places to stay. This is optional and can be set up after you're live. 
                    You can add other rate plans after going live, too.
                  </p>
                </div>

                {/* Rate Plans */}
                <div className="space-y-6 mb-8">
                  {/* Breakfast-included rate */}
                  <div className="border-2 rounded-lg p-6" style={{ borderColor: selectedRatePlans.includes('breakfast') ? '#3CAF54' : '#e5e7eb' }}>
                    {selectedRatePlans.includes('breakfast') && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                          Added
                        </span>
                      </div>
                    )}
                    {!selectedRatePlans.includes('breakfast') && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                          Popular among travelers
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Breakfast-included rate</h3>
                    <p className="text-gray-600 mb-4">
                      Include breakfast and increase your base rate, or offer breakfast at a discounted price. 
                      We recommend that you don't charge more for breakfast than you do onsite to avoid unhappy travelers.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          Breakfast is one of the most popular amenities properties can offer
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          Can attract budget-conscious travelers if you give a discounted price on breakfast
                        </span>
                      </div>
                    </div>
                    {selectedRatePlans.includes('breakfast') ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveRatePlan('breakfast')}
                          className="px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          style={{ borderColor: '#d1d5db' }}
                        >
                          Remove rate plan
                        </button>
                        {ratePlanDetails.breakfast && (
                          <div className="text-sm text-gray-600 mt-2">
                            <p className="font-medium">Configured:</p>
                            <p>
                              {ratePlanDetails.breakfast.rateType === 'increase' ? 'Increase by' : 'Discount'} 
                              {' $' + ratePlanDetails.breakfast.amount.toFixed(2)}
                            </p>
                            <p>Final rate: ${ratePlanDetails.breakfast.rate.toFixed(2)}/night</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddRatePlan('breakfast')}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add rate plan</span>
                      </button>
                    )}
                  </div>

                  {/* Non-refundable rate */}
                  <div className="border-2 rounded-lg p-6" style={{ borderColor: selectedRatePlans.includes('non-refundable') ? '#3CAF54' : '#e5e7eb' }}>
                    {selectedRatePlans.includes('non-refundable') && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                          Added
                        </span>
                      </div>
                    )}
                    {!selectedRatePlans.includes('non-refundable') && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                          Recommended
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Non-refundable rate</h3>
                    <p className="text-gray-600 mb-4">
                      Attract travelers who plan ahead and fill up your inventory by offering a non-refundable rate. 
                      Non-refundable rates help keep your inventory booked without losing out on revenue.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          Properties with a non-refundable rate saw 5.3% increase in revenue, on average
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#3CAF54] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          On average, properties saw 5.6% increase in visibility on search results page views
                        </span>
                      </div>
                    </div>
                    {selectedRatePlans.includes('non-refundable') ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveRatePlan('non-refundable')}
                          className="px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          style={{ borderColor: '#d1d5db' }}
                        >
                          Remove rate plan
                        </button>
                        {ratePlanDetails.nonRefundable && (
                          <div className="text-sm text-gray-600 mt-2">
                            <p className="font-medium">Configured:</p>
                            <p>
                              Discount: {ratePlanDetails.nonRefundable.discountType === 'percentage' ? '' : '$'}
                              {ratePlanDetails.nonRefundable.discountValue}
                              {ratePlanDetails.nonRefundable.discountType === 'percentage' ? '%' : ''}
                            </p>
                            <p>Final rate: ${ratePlanDetails.nonRefundable.rate.toFixed(2)}/night</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddRatePlan('non-refundable')}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: '#3CAF54' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add rate plan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Included in your contract */}
                <div className="mb-8 pb-8 border-b" style={{ borderColor: '#dcfce7' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Included in your contract</h3>
                  <p className="text-sm text-gray-600">
                    Some rate plans are included in your contract and can't be removed or changed.
                  </p>
                </div>

                {/* Exclusive traveler discount */}
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ backgroundColor: '#a78bfa' }}>
                      10%
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Exclusive traveler discount</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Your special traveler discounts are available to select groups which may include members, 
                        those booking packages, and users on mobile devices.
                      </p>
                      <button
                        type="button"
                        className="text-sm text-[#3CAF54] hover:text-[#2d8f42] font-medium"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legal Text */}
                {showLegalText && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                      Expedia Group partners with you to promote your property's promotions on our sites. 
                      Please ensure all promotions comply with consumer protection and advertising laws.
                    </p>
                  </div>
                )}

                {/* Legal Text Toggle */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => setShowLegalText(!showLegalText)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
                  >
                    <span>{showLegalText ? 'See less' : 'See more'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showLegalText ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Error Display */}
                {saveError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {saveError}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: '#dcfce7' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ borderColor: '#d1d5db' }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">5/5</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3CAF54' }}
                    onMouseEnter={(e) => !isSaving && (e.target.style.backgroundColor = '#2d8f42')}
                    onMouseLeave={(e) => !isSaving && (e.target.style.backgroundColor = '#3CAF54')}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preview Sidebar */}
            <div className="w-80 relative">
              {/* Preview Sidebar */}
              <div className={`bg-white rounded-lg shadow-xl p-6 border sticky top-8 transition-opacity ${openModal ? 'opacity-50' : ''}`} style={{ borderColor: '#dcfce7' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-[#3CAF54]" />
                  <h3 className="text-lg font-semibold text-gray-900">Preview your rates</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  See how much guests would pay for one night.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of guests staying in the room
                  </label>
                  <select
                    value={previewGuests}
                    onChange={(e) => setPreviewGuests(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] bg-white cursor-pointer"
                  >
                    {previewGuestOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#dcfce7' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Base rate</span>
                    <span className="text-sm font-semibold text-gray-900">USD {baseRate.toFixed(2)}</span>
                  </div>
                  {ratePlanDetails.breakfast && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Breakfast-included rate</span>
                      <span className="text-sm font-semibold text-gray-900">USD {ratePlanDetails.breakfast.rate.toFixed(2)}</span>
                    </div>
                  )}
                  {ratePlanDetails.nonRefundable && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Non-refundable rate</span>
                      <span className="text-sm font-semibold text-gray-900">USD {ratePlanDetails.nonRefundable.rate.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Package rate / member-only deal / mobile deal</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-gray-900">{discountedRate.toFixed(2)}</span>
                      <span className="text-xs text-[#3CAF54] font-medium">-{discountPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Plan Modal */}
              {openModal && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-end animate-fadeIn" onClick={handleCancelModal}>
                  <div className="bg-white shadow-2xl w-96 h-full overflow-y-auto animate-slideInRight" onClick={(e) => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: '#dcfce7' }}>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {openModal === 'breakfast' ? 'Breakfast-included rate' : 'Non-refundable rate'}
                      </h2>
                      <button
                        type="button"
                        onClick={handleCancelModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 space-y-6">
                      {openModal === 'breakfast' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              How would you like to price breakfast?
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="rateType"
                                  value="increase"
                                  checked={breakfastForm.rateType === 'increase'}
                                  onChange={(e) => setBreakfastForm({ ...breakfastForm, rateType: e.target.value })}
                                  className="w-4 h-4 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Increase base rate</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="rateType"
                                  value="discount"
                                  checked={breakfastForm.rateType === 'discount'}
                                  onChange={(e) => setBreakfastForm({ ...breakfastForm, rateType: e.target.value })}
                                  className="w-4 h-4 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Offer breakfast at a discount</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {breakfastForm.rateType === 'increase' ? 'Amount to increase (USD)' : 'Discount amount (USD)'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                value={breakfastForm.amount}
                                onChange={(e) => setBreakfastForm({ ...breakfastForm, amount: e.target.value })}
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                placeholder="0.00"
                                required
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {breakfastForm.rateType === 'increase' 
                                ? `Final rate: $${(baseRate + (parseFloat(breakfastForm.amount) || 0)).toFixed(2)}/night`
                                : `Final rate: $${(baseRate - (parseFloat(breakfastForm.amount) || 0)).toFixed(2)}/night`
                              }
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Breakfast description (optional)
                            </label>
                            <textarea
                              value={breakfastForm.description}
                              onChange={(e) => setBreakfastForm({ ...breakfastForm, description: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] resize-none"
                              placeholder="e.g., Continental breakfast included"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Discount type
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="discountType"
                                  value="percentage"
                                  checked={nonRefundableForm.discountType === 'percentage'}
                                  onChange={(e) => setNonRefundableForm({ ...nonRefundableForm, discountType: e.target.value })}
                                  className="w-4 h-4 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Percentage discount</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="discountType"
                                  value="fixed"
                                  checked={nonRefundableForm.discountType === 'fixed'}
                                  onChange={(e) => setNonRefundableForm({ ...nonRefundableForm, discountType: e.target.value })}
                                  className="w-4 h-4 text-[#3CAF54] focus:ring-[#3CAF54]"
                                />
                                <span className="text-sm text-gray-700">Fixed amount discount</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {nonRefundableForm.discountType === 'percentage' ? 'Discount percentage' : 'Discount amount (USD)'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              {nonRefundableForm.discountType === 'percentage' ? (
                                <>
                                  <input
                                    type="number"
                                    value={nonRefundableForm.discountValue}
                                    onChange={(e) => setNonRefundableForm({ ...nonRefundableForm, discountValue: e.target.value })}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                    placeholder="0"
                                    required
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">%</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">$</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={nonRefundableForm.discountValue}
                                    onChange={(e) => setNonRefundableForm({ ...nonRefundableForm, discountValue: e.target.value })}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54]"
                                    placeholder="0.00"
                                    required
                                  />
                                </>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Final rate: $
                              {nonRefundableForm.discountType === 'percentage'
                                ? (baseRate * (1 - (parseFloat(nonRefundableForm.discountValue) || 0) / 100)).toFixed(2)
                                : (baseRate - (parseFloat(nonRefundableForm.discountValue) || 0)).toFixed(2)
                              }
                              /night
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description (optional)
                            </label>
                            <textarea
                              value={nonRefundableForm.description}
                              onChange={(e) => setNonRefundableForm({ ...nonRefundableForm, description: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3CAF54] resize-none"
                              placeholder="e.g., Non-refundable rate - best value"
                            />
                          </div>
                        </>
                      )}

                      {/* Modal Actions */}
                      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#dcfce7' }}>
                        <button
                          type="button"
                          onClick={handleCancelModal}
                          className="flex-1 px-4 py-2 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          style={{ borderColor: '#d1d5db' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={openModal === 'breakfast' ? handleSaveBreakfastRate : handleSaveNonRefundableRate}
                          className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-colors"
                          style={{ backgroundColor: '#3CAF54' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <StaysFooter />
    </div>
  );
}

