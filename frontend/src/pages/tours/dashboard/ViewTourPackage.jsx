import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Clock, DollarSign, Users, Camera, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getTourPackage } from '../../../services/tourPackageService';
import { transformApiDataToFormData } from '../../../services/tourPackageService';
import toast from 'react-hot-toast';

const ViewTourPackage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackageData();
  }, [packageId]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTourPackage(packageId);
      if (response.success && response.data) {
        // Transform API data to form data format for easier display
        const transformed = transformApiDataToFormData(response.data);
        setPackageData(transformed);
      } else {
        setError('Package not found');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      setError(error.response?.data?.message || 'Failed to load package details');
      toast.error('Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value) => {
    if (value === true || value === 1 || value === '1') return 'Yes';
    if (value === false || value === 0 || value === '0') return 'No';
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading package</h3>
          <p className="text-gray-600 mb-6">{error || 'Package not found'}</p>
          <button
            onClick={() => navigate('/tours/dashboard/packages')}
            className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tours/dashboard/packages')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{packageData.name || 'Unnamed Package'}</h1>
            <p className="text-sm text-gray-600 mt-1">View all package details</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/tours/dashboard/packages/create/${packageId}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Package</span>
        </button>
      </div>

      {/* Step 1: Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#3CAF54]" />
          Step 1: Basic Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Package Name</label>
            <p className="text-gray-900 mt-1">{packageData.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Category</label>
            <p className="text-gray-900 mt-1">{packageData.category || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Short Description</label>
            <p className="text-gray-900 mt-1">{packageData.shortDescription || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Full Description</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{packageData.fullDescription || 'N/A'}</p>
          </div>
          {packageData.highlights && packageData.highlights.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Highlights</label>
              <ul className="mt-1 list-disc list-inside space-y-1">
                {packageData.highlights.filter(h => h && h.trim()).map((highlight, idx) => (
                  <li key={idx} className="text-gray-900">{highlight}</li>
                ))}
              </ul>
            </div>
          )}
          {packageData.locations && packageData.locations.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </label>
              <div className="mt-2 space-y-2">
                {packageData.locations.map((location, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 font-medium">
                      {location.name || location.formatted_address || 'Location'}
                    </p>
                    {location.formatted_address && (
                      <p className="text-sm text-gray-600 mt-1">{location.formatted_address}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {packageData.tags && packageData.tags.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {packageData.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Inclusions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-[#3CAF54]" />
          Step 2: Inclusions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">What's Included</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{packageData.whatsIncluded || 'N/A'}</p>
          </div>
          {packageData.whatsNotIncluded && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">What's Not Included</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{packageData.whatsNotIncluded}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Guide Type</label>
            <p className="text-gray-900 mt-1">{packageData.guideType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Guide Language</label>
            <p className="text-gray-900 mt-1">{packageData.guideLanguage || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Food Included</label>
            <p className="text-gray-900 mt-1">{formatBoolean(packageData.foodIncluded)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Drinks Included</label>
            <p className="text-gray-900 mt-1">{formatBoolean(packageData.drinksIncluded)}</p>
          </div>
          {packageData.meals && packageData.meals.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Meals</label>
              <div className="mt-2 space-y-2">
                {packageData.meals.map((meal, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 font-medium">{meal.type || meal.meal_type}</p>
                    {meal.description && (
                      <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {packageData.transportationTypes && packageData.transportationTypes.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Transportation Types</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {packageData.transportationTypes.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {type.type || type.transportation_type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Extra Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#3CAF54]" />
          Step 3: Extra Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Know Before You Go</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{packageData.knowBeforeYouGo || 'N/A'}</p>
          </div>
          {packageData.notSuitableFor && packageData.notSuitableFor.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Not Suitable For</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {packageData.notSuitableFor.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {packageData.mandatoryItems && packageData.mandatoryItems.length > 0 && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Mandatory Items</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {packageData.mandatoryItems.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Emergency Phone</label>
            <p className="text-gray-900 mt-1">
              {packageData.emergencyCountryCode} {packageData.emergencyPhone || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Pet Policy</label>
            <p className="text-gray-900 mt-1">{formatBoolean(packageData.petPolicy)}</p>
          </div>
          {packageData.petPolicyDetails && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Pet Policy Details</label>
              <p className="text-gray-900 mt-1">{packageData.petPolicyDetails}</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Photos */}
      {packageData.photos && packageData.photos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#3CAF54]" />
            Step 4: Photos ({packageData.photos.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {packageData.photos.map((photo, idx) => {
              const photoUrl = typeof photo === 'string' 
                ? photo 
                : photo.photo_url || photo.url || photo.image_url || photo.imageUrl;
              return (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photoUrl}
                    alt={`Package photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#3CAF54]" />
          Step 5: Options
        </h2>
        <div className="space-y-6">
          {/* Option Setup */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Option Setup</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference Code</label>
                <p className="text-gray-900 mt-1">{packageData.optionReferenceCode || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Max Group Size</label>
                <p className="text-gray-900 mt-1">{packageData.maxGroupSize || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration Type</label>
                <p className="text-gray-900 mt-1">{packageData.durationType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration Value</label>
                <p className="text-gray-900 mt-1">{packageData.durationValue || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Meeting Point */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Meeting Point</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Arrival Type</label>
                <p className="text-gray-900 mt-1">{packageData.customerArrivalType || 'N/A'}</p>
              </div>
              {packageData.pickupType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pickup Type</label>
                  <p className="text-gray-900 mt-1">{packageData.pickupType}</p>
                </div>
              )}
              {packageData.pickupTime && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pickup Time</label>
                  <p className="text-gray-900 mt-1">{packageData.pickupTime}</p>
                </div>
              )}
              {packageData.pickupDescription && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Pickup Description</label>
                  <p className="text-gray-900 mt-1">{packageData.pickupDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Availability & Pricing */}
          {packageData.availabilityType && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Availability & Pricing</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Availability Type</label>
                  <p className="text-gray-900 mt-1">{packageData.availabilityType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pricing Type</label>
                  <p className="text-gray-900 mt-1">{packageData.pricingType}</p>
                </div>
                {packageData.pricingCategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pricing Category</label>
                    <p className="text-gray-900 mt-1">{packageData.pricingCategory}</p>
                  </div>
                )}
                {packageData.minParticipants && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Min Participants</label>
                    <p className="text-gray-900 mt-1">{packageData.minParticipants}</p>
                  </div>
                )}
                {packageData.maxParticipants && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Max Participants</label>
                    <p className="text-gray-900 mt-1">{packageData.maxParticipants}</p>
                  </div>
                )}
              </div>

              {/* Pricing Tiers */}
              {packageData.pricingTiers && packageData.pricingTiers.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Pricing Tiers</label>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer Pays</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Person</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {packageData.pricingTiers.map((tier, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{tier.minParticipants || tier.min_participants || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{tier.maxParticipants || tier.max_participants || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {tier.customerPays || tier.customer_pays 
                                ? `${Number(tier.customerPays || tier.customer_pays).toLocaleString()} ${tier.currency || 'RWF'}`
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {tier.pricePerParticipant || tier.price_per_participant
                                ? `${Number(tier.pricePerParticipant || tier.price_per_participant).toLocaleString()} ${tier.currency || 'RWF'}`
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{tier.currency || 'RWF'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTourPackage;

