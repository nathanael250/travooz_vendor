import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Edit, Home, Bed, Briefcase, FileText, Building, Calendar, Link, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import StaysNavbar from '../../components/stays/StaysNavbar';
import StaysFooter from '../../components/stays/StaysFooter';
import { getPropertyListing, getPropertyImageLibrary, staysAuthService } from '../../services/staysService';

export default function ReviewListingStep() {
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

  const [propertyData, setPropertyData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all data from API and localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get propertyId from state or localStorage
        const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
        
        let property = {};
        let propertyImages = [];
        
        // Try to fetch from API if propertyId exists
        if (propertyId && propertyId > 0) {
          try {
            // Fetch property data from API
            const propertyData = await getPropertyListing(propertyId);
            property = {
              propertyId: propertyId,
              propertyName: propertyData.property_name || propertyData.propertyName || '',
              location: propertyData.location || '',
              address: propertyData.location_data?.formatted_address || 
                       propertyData.location_data?.name || 
                       propertyData.location || 
                       '',
              phone: propertyData.phone || '',
              ...propertyData
            };
            
            // Fetch user profile to get phone number
            try {
              const userProfile = await staysAuthService.getProfile();
              if (userProfile?.phone) {
                property.phone = userProfile.phone;
              }
            } catch (profileError) {
              console.log('Could not fetch user profile:', profileError);
              // Try to get phone from localStorage user data
              const storedUser = JSON.parse(localStorage.getItem('stays_user') || '{}');
              if (storedUser?.phone) {
                property.phone = storedUser.phone;
              }
            }
            
            // Fetch property images from API
            const imageLibrary = await getPropertyImageLibrary(propertyId);
            propertyImages = imageLibrary?.propertyImages || imageLibrary?.images || [];
            
            // Update localStorage with fetched data
            if (propertyImages.length > 0) {
              localStorage.setItem('stays_property_images', JSON.stringify(propertyImages));
            }
          } catch (apiError) {
            console.log('Could not fetch from API, using localStorage:', apiError);
            // Fallback to localStorage if API fails
            const storedProperty = JSON.parse(localStorage.getItem('stays_property') || '{}');
            property = { ...storedProperty };
            
            // Try to get phone from localStorage user data
            const storedUser = JSON.parse(localStorage.getItem('stays_user') || '{}');
            if (storedUser?.phone && !property.phone) {
              property.phone = storedUser.phone;
            }
            
            propertyImages = JSON.parse(localStorage.getItem('stays_property_images') || '[]');
          }
        } else {
          // No propertyId, use localStorage only
          const storedProperty = JSON.parse(localStorage.getItem('stays_property') || '{}');
          property = { ...storedProperty };
          
          // Try to get phone from localStorage user data
          const storedUser = JSON.parse(localStorage.getItem('stays_user') || '{}');
          if (storedUser?.phone && !property.phone) {
            property.phone = storedUser.phone;
          }
          
          propertyImages = JSON.parse(localStorage.getItem('stays_property_images') || '[]');
        }
        
        // Merge with state data
        const stateProperty = location.state?.property || {};
        property = { ...property, ...stateProperty };
        
        if (location.state?.propertyName) {
          property.propertyName = location.state.propertyName;
        }
        if (location.state?.location) {
          property.location = location.state.location;
        }
        if (location.state?.address) {
          property.address = location.state.address;
        }
        if (location.state?.phone) {
          property.phone = location.state.phone;
        }

        // Load other data from localStorage
        const policies = JSON.parse(localStorage.getItem('stays_policies') || '{}');
        const amenities = JSON.parse(localStorage.getItem('stays_amenities') || '{}');
        const rooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
        const taxData = JSON.parse(localStorage.getItem('stays_tax_data') || '{}');
        const connectivityData = JSON.parse(localStorage.getItem('stays_connectivity_data') || '{}');

        setPropertyData({
          property,
          policies,
          amenities,
          rooms: rooms.filter(r => r.roomSetupComplete),
          propertyImages,
          taxData,
          connectivityData
        });
      } catch (error) {
        console.error('Error loading review data:', error);
        // Fallback to localStorage only on error
        const storedProperty = JSON.parse(localStorage.getItem('stays_property') || '{}');
        const propertyImages = JSON.parse(localStorage.getItem('stays_property_images') || '[]');
        const policies = JSON.parse(localStorage.getItem('stays_policies') || '{}');
        const amenities = JSON.parse(localStorage.getItem('stays_amenities') || '{}');
        const rooms = JSON.parse(localStorage.getItem('stays_rooms') || '[]');
        const taxData = JSON.parse(localStorage.getItem('stays_tax_data') || '{}');
        const connectivityData = JSON.parse(localStorage.getItem('stays_connectivity_data') || '{}');
        
        setPropertyData({
          property: storedProperty,
          policies,
          amenities,
          rooms: rooms.filter(r => r.roomSetupComplete),
          propertyImages,
          taxData,
          connectivityData
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [location.state]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEdit = (section) => {
    const routes = {
      'listing-basics': '/stays/list-your-property',
      'photos': '/stays/setup/images',
      'rooms': '/stays/setup/rooms',
      'amenities': '/stays/setup/amenities',
      'policies': '/stays/setup/policies',
      'tax': '/stays/setup/taxes',
      'connectivity': '/stays/setup/connectivity'
    };

    if (routes[section]) {
      navigate(routes[section], {
        state: location.state
      });
    }
  };

  const handleNext = () => {
    // Get propertyId from state or localStorage
    const propertyId = location.state?.propertyId || parseInt(localStorage.getItem('stays_property_id') || '0');
    
    // Navigate to submit page
    navigate('/stays/setup/submit', {
      state: {
        ...location.state,
        propertyId: propertyId > 0 ? propertyId : location.state?.propertyId,
        setupComplete: true
      }
    });
  };

  if (loading || !propertyData) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
        <StaysNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
        <StaysFooter />
      </div>
    );
  }

  const { property, policies, amenities, rooms, propertyImages, taxData, connectivityData } = propertyData;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <StaysNavbar />
      
      <div className="flex-1 w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review your listing</h1>
            <p className="text-gray-600">
              Review all the details you've entered for your property. You can edit any section before finalizing your listing.
            </p>
          </div>

          {/* Listing Basics Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Listing basics</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('listing-basics')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-gray-900 font-medium">{property.propertyName || property.property_name || 'Property Name'}</p>
              <p className="text-gray-600 text-sm">
                {property.address || 
                 property.location_data?.formatted_address || 
                 property.location_data?.name || 
                 property.location || 
                 'Address not set'}
              </p>
              <p className="text-gray-600 text-sm">{property.phone || 'Phone not set'}</p>
            </div>

            {/* Photos Subsection */}
            <div className="border-t pt-4 mt-4" style={{ borderColor: '#dcfce7' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
                <button
                  type="button"
                  onClick={() => handleEdit('photos')}
                  className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium text-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
              {propertyImages.length < 4 ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">You are required to have at least 4 photos to go live. You currently have {propertyImages.length} photo{propertyImages.length !== 1 ? 's' : ''}.</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#3CAF54]">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">{propertyImages.length} photo{propertyImages.length !== 1 ? 's' : ''} uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Rooms and Rates Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Rooms and rates</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('rooms')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div key={room.id || index} className="border rounded-lg p-4" style={{ borderColor: '#dcfce7' }}>
                    <p className="font-semibold text-gray-900 mb-2">{room.roomName || 'Room'}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Base rate:  {room.baseRate?.toFixed(2) || '0.00'}</p>
                      {room.numberOfBeds && (
                        <p>{room.numberOfBeds.length} {room.numberOfBeds[0]?.bedType || 'bed'}{room.numberOfBeds.length > 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No rooms added yet</p>
            )}
          </div>

          {/* Property Amenities Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Property amenities</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('amenities')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>Breakfast: {amenities.offerBreakfast === 'yes' ? 'Yes' : 'No breakfast'}</p>
              {amenities.minCheckInAge && <p>Minimum check-in age is: {amenities.minCheckInAge}</p>}
              {amenities.checkInTime && <p>Check-in time starts at {amenities.checkInTime}</p>}
              {amenities.checkOutTime && <p>Check-out time is {amenities.checkOutTime}</p>}
              {amenities.hasFrontDesk === 'yes' && <p>Staffed front desk</p>}
              {amenities.selfCheckInAvailable === 'yes' && <p>Self check-in available - Yes</p>}
              <p>Internet: {amenities.offerInternet === 'yes' ? 'Wi-Fi available' : 'No Wi-Fi'}</p>
              <p>Parking: {amenities.offerParking === 'yes' ? 'Available' : 'Not available'}</p>
              <p>Pets: {amenities.petsAllowed === 'yes' ? 'Allowed' : 'Pets not allowed'}</p>
            </div>
          </div>

          {/* Policies and Settings Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Policies and settings</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('policies')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p className="text-gray-500 italic">
                Your booking cut-off time is currently set to {policies.cutOffTime || '6:00 PM'}. 
                You can change this after the property is live in the Fees, policies, and settings page.
              </p>
              <div>
                <p className="font-medium text-gray-700 mb-1">Payment method accepted:</p>
                <p>
                  {[
                    policies.acceptCash && 'Cash',
                    policies.acceptCreditDebitCards && 'Debit cards',
                    policies.cardTypes?.visa && 'Visa',
                    policies.cardTypes?.mastercard && 'Mastercard'
                  ].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Cancellation policy:</p>
                <p>
                  Travelers who cancel {policies.cancellationPolicy === 'flexible' ? '24 hours or more' : 'less than 24 hours'} 
                  before {policies.cutOffTime || '6:00 PM'} on the day of check-in are charged no fee.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Taxes and fees:</p>
                <p>Included in the room rate</p>
                {policies.taxRate && <p>VAT (Value Added Tax): {policies.taxRate}% per stay</p>}
              </div>
            </div>
          </div>

          {/* Tax Details Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Tax Details</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('tax')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 italic mb-4">
              Unless otherwise noted, this information is for internal record only and won't be visible to travelers.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>Legal name of your property: {taxData.legalName || 'Not set'}</p>
              <p>Is this property registered for VAT/GST? {taxData.vatRegistered === 'yes' ? 'Yes' : 'No'}</p>
              {taxData.vatRegistered === 'yes' && taxData.vatId && (
                <p>VAT/GST ID: {taxData.vatId}</p>
              )}
            </div>
          </div>

          {/* Rates and Availability Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Rates and availability</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[#3CAF54]">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Your rates and availability are confirmed.</p>
            </div>
          </div>

          {/* Connectivity Settings Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border mb-4" style={{ borderColor: '#dcfce7' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link className="h-5 w-5 text-[#3CAF54]" />
                <h2 className="text-xl font-semibold text-gray-900">Connectivity settings</h2>
              </div>
              <button
                type="button"
                onClick={() => handleEdit('connectivity')}
                className="flex items-center gap-2 px-4 py-2 text-[#3CAF54] hover:bg-[#f0fdf4] rounded-lg transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              {connectivityData.addConnectivityProvider === 'yes' 
                ? 'You have added a connectivity provider.' 
                : "You didn't add a connectivity provider."}
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleNext}
              className="text-white font-semibold py-4 px-12 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-lg"
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

      <StaysFooter />
    </div>
  );
}

