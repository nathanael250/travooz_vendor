import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Wifi, Car, Coffee, Dumbbell, Utensils, Wine, Waves, Sparkles } from 'lucide-react';
import { staysSetupService } from '../../services/staysService';
import toast from 'react-hot-toast';

const AmenitiesTabContent = ({ property, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amenitiesData, setAmenitiesData] = useState({
    // Internet
    offerInternet: 'no',
    wifiInGuestrooms: false,
    wifiInPublicAreas: false,
    wiredInternet: false,
    
    // Parking
    offerParking: 'no',
    selfParking: false,
    valetParking: false,
    electricCarCharging: false,
    parkingFee: '',
    
    // Breakfast
    offerBreakfast: 'no',
    breakfastType: '',
    
    // Facilities
    hasPool: false,
    poolType: '',
    hasSpa: false,
    hasFitnessCenter: false,
    hasRestaurant: false,
    hasBar: false,
    hasConcierge: false,
    hasLaundry: false,
    hasBusinessCenter: false,
    
    // Pets
    petsAllowed: 'no',
    hasPetSurcharge: 'no',
    petSurchargeAmount: '',
    
    // Front Desk
    hasFrontDesk: 'yes',
    frontDesk24Hours: false,
    deskOpens: '',
    deskCloses: '',
    
    // Check-in/out
    minCheckInAge: '',
    checkInTime: '',
    checkInEnds: '',
    checkOutTime: ''
  });

  useEffect(() => {
    if (property?.amenities) {
      setAmenitiesData({
        offerInternet: property.amenities.offer_internet || 'no',
        wifiInGuestrooms: property.amenities.wifi_in_guestrooms || false,
        wifiInPublicAreas: property.amenities.wifi_in_public_areas || false,
        wiredInternet: property.amenities.wired_internet || false,
        offerParking: property.amenities.offer_parking || 'no',
        selfParking: property.amenities.self_parking || false,
        valetParking: property.amenities.valet_parking || false,
        electricCarCharging: property.amenities.electric_car_charging || false,
        parkingFee: property.amenities.parking_fee || '',
        offerBreakfast: property.amenities.offer_breakfast || 'no',
        breakfastType: property.amenities.breakfast_type || '',
        hasPool: property.amenities.has_pool || false,
        poolType: property.amenities.pool_type || '',
        hasSpa: property.amenities.has_spa || false,
        hasFitnessCenter: property.amenities.has_fitness_center || false,
        hasRestaurant: property.amenities.has_restaurant || false,
        hasBar: property.amenities.has_bar || false,
        hasConcierge: property.amenities.has_concierge || false,
        hasLaundry: property.amenities.has_laundry || false,
        hasBusinessCenter: property.amenities.has_business_center || false,
        petsAllowed: property.amenities.pets_allowed || 'no',
        hasPetSurcharge: property.amenities.has_pet_surcharge || 'no',
        petSurchargeAmount: property.amenities.pet_surcharge_amount || '',
        hasFrontDesk: property.amenities.has_front_desk || 'yes',
        frontDesk24Hours: property.amenities.front_desk_24_hours || false,
        deskOpens: property.amenities.desk_opens || '',
        deskCloses: property.amenities.desk_closes || '',
        minCheckInAge: property.amenities.min_check_in_age || '',
        checkInTime: property.amenities.check_in_time || '',
        checkInEnds: property.amenities.check_in_ends || '',
        checkOutTime: property.amenities.check_out_time || ''
      });
    }
  }, [property]);

  const handleChange = (field, value) => {
    setAmenitiesData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await staysSetupService.saveAmenities(property.property_id, amenitiesData);
      toast.success('Amenities updated successfully');
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving amenities:', error);
      toast.error(error.message || 'Failed to save amenities');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset to original data
    if (property?.amenities) {
      setAmenitiesData({
        offerInternet: property.amenities.offer_internet || 'no',
        wifiInGuestrooms: property.amenities.wifi_in_guestrooms || false,
        wifiInPublicAreas: property.amenities.wifi_in_public_areas || false,
        // ... reset all fields
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Edit Amenities
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Internet Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Internet</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Internet?</label>
            {editing ? (
              <select
                value={amenitiesData.offerInternet}
                onChange={(e) => handleChange('offerInternet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="no">No</option>
                <option value="yes_free">Yes - Free</option>
                <option value="yes_paid">Yes - Paid</option>
              </select>
            ) : (
              <p className="text-gray-900">{amenitiesData.offerInternet === 'yes_free' ? 'Yes - Free' : amenitiesData.offerInternet === 'yes_paid' ? 'Yes - Paid' : 'No'}</p>
            )}
          </div>

          {amenitiesData.offerInternet !== 'no' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenitiesData.wifiInGuestrooms}
                  onChange={(e) => handleChange('wifiInGuestrooms', e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">WiFi in Guest Rooms</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenitiesData.wifiInPublicAreas}
                  onChange={(e) => handleChange('wifiInPublicAreas', e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">WiFi in Public Areas</label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Parking Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Car className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Parking</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Parking?</label>
            {editing ? (
              <select
                value={amenitiesData.offerParking}
                onChange={(e) => handleChange('offerParking', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="no">No</option>
                <option value="yes_free">Yes - Free</option>
                <option value="yes_paid">Yes - Paid</option>
              </select>
            ) : (
              <p className="text-gray-900">{amenitiesData.offerParking === 'yes_free' ? 'Yes - Free' : amenitiesData.offerParking === 'yes_paid' ? 'Yes - Paid' : 'No'}</p>
            )}
          </div>

          {amenitiesData.offerParking !== 'no' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenitiesData.selfParking}
                  onChange={(e) => handleChange('selfParking', e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Self Parking</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenitiesData.valetParking}
                  onChange={(e) => handleChange('valetParking', e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Valet Parking</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={amenitiesData.electricCarCharging}
                  onChange={(e) => handleChange('electricCarCharging', e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Electric Car Charging</label>
              </div>
              {amenitiesData.offerParking === 'yes_paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parking Fee</label>
                  {editing ? (
                    <input
                      type="number"
                      value={amenitiesData.parkingFee}
                      onChange={(e) => handleChange('parkingFee', e.target.value)}
                      placeholder="Enter fee amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{amenitiesData.parkingFee || 'Not set'}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Breakfast Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Coffee className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Breakfast</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Breakfast?</label>
            {editing ? (
              <select
                value={amenitiesData.offerBreakfast}
                onChange={(e) => handleChange('offerBreakfast', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="no">No</option>
                <option value="yes_free">Yes - Free</option>
                <option value="yes_paid">Yes - Paid</option>
              </select>
            ) : (
              <p className="text-gray-900">{amenitiesData.offerBreakfast === 'yes_free' ? 'Yes - Free' : amenitiesData.offerBreakfast === 'yes_paid' ? 'Yes - Paid' : 'No'}</p>
            )}
          </div>

          {amenitiesData.offerBreakfast !== 'no' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast Type</label>
              {editing ? (
                <select
                  value={amenitiesData.breakfastType}
                  onChange={(e) => handleChange('breakfastType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select type</option>
                  <option value="continental">Continental</option>
                  <option value="buffet">Buffet</option>
                  <option value="full_english">Full English</option>
                  <option value="american">American</option>
                </select>
              ) : (
                <p className="text-gray-900">{amenitiesData.breakfastType || 'Not specified'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Facilities Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Facilities</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasPool}
              onChange={(e) => handleChange('hasPool', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Waves className="h-4 w-4 text-gray-500" />
            <label className="text-sm text-gray-700">Swimming Pool</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasSpa}
              onChange={(e) => handleChange('hasSpa', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Sparkles className="h-4 w-4 text-gray-500" />
            <label className="text-sm text-gray-700">Spa</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasFitnessCenter}
              onChange={(e) => handleChange('hasFitnessCenter', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Dumbbell className="h-4 w-4 text-gray-500" />
            <label className="text-sm text-gray-700">Fitness Center</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasRestaurant}
              onChange={(e) => handleChange('hasRestaurant', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Utensils className="h-4 w-4 text-gray-500" />
            <label className="text-sm text-gray-700">Restaurant</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasBar}
              onChange={(e) => handleChange('hasBar', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Wine className="h-4 w-4 text-gray-500" />
            <label className="text-sm text-gray-700">Bar/Lounge</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasConcierge}
              onChange={(e) => handleChange('hasConcierge', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Concierge Service</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasLaundry}
              onChange={(e) => handleChange('hasLaundry', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Laundry Service</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={amenitiesData.hasBusinessCenter}
              onChange={(e) => handleChange('hasBusinessCenter', e.target.checked)}
              disabled={!editing}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Business Center</label>
          </div>
        </div>

        {amenitiesData.hasPool && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pool Type</label>
            {editing ? (
              <select
                value={amenitiesData.poolType}
                onChange={(e) => handleChange('poolType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select type</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="both">Both</option>
              </select>
            ) : (
              <p className="text-gray-900">{amenitiesData.poolType || 'Not specified'}</p>
            )}
          </div>
        )}
      </div>

      {/* Check-in/Check-out Times */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in & Check-out</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
            {editing ? (
              <input
                type="time"
                value={amenitiesData.checkInTime}
                onChange={(e) => handleChange('checkInTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{amenitiesData.checkInTime || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
            {editing ? (
              <input
                type="time"
                value={amenitiesData.checkOutTime}
                onChange={(e) => handleChange('checkOutTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{amenitiesData.checkOutTime || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Check-in Age</label>
            {editing ? (
              <input
                type="number"
                value={amenitiesData.minCheckInAge}
                onChange={(e) => handleChange('minCheckInAge', e.target.value)}
                placeholder="18"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{amenitiesData.minCheckInAge || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pets Policy */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Policy</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pets Allowed?</label>
            {editing ? (
              <select
                value={amenitiesData.petsAllowed}
                onChange={(e) => handleChange('petsAllowed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="assistance_only">Assistance Animals Only</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {amenitiesData.petsAllowed === 'yes' ? 'Yes' : amenitiesData.petsAllowed === 'assistance_only' ? 'Assistance Animals Only' : 'No'}
              </p>
            )}
          </div>

          {amenitiesData.petsAllowed === 'yes' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Surcharge?</label>
                {editing ? (
                  <select
                    value={amenitiesData.hasPetSurcharge}
                    onChange={(e) => handleChange('hasPetSurcharge', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{amenitiesData.hasPetSurcharge === 'yes' ? 'Yes' : 'No'}</p>
                )}
              </div>
              {amenitiesData.hasPetSurcharge === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surcharge Amount</label>
                  {editing ? (
                    <input
                      type="number"
                      value={amenitiesData.petSurchargeAmount}
                      onChange={(e) => handleChange('petSurchargeAmount', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{amenitiesData.petSurchargeAmount || 'Not set'}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmenitiesTabContent;





