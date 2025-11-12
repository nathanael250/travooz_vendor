import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Percent, Plus, Edit, Trash2, Package, Users, Tag, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';

const PricingOffers = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState(null);

  useEffect(() => {
    fetchPackages();
    fetchCommission();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      fetchPackageDetails(selectedPackage);
    }
  }, [selectedPackage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      let businessId = localStorage.getItem('tour_business_id');
      if (!businessId) {
        const response = await apiClient.get('/tours/businesses/my');
        const businesses = response.data?.data || response.data || [];
        if (businesses.length > 0) {
          businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
          if (businessId) {
            localStorage.setItem('tour_business_id', businessId);
          }
        }
      }

      if (businessId) {
        const response = await apiClient.get(`/tours/packages/business/${businessId}`);
        const packagesData = response.data?.data || response.data || [];
        setPackages(packagesData);
        if (packagesData.length > 0 && !selectedPackage) {
          setSelectedPackage(packagesData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async (pkg) => {
    try {
      const packageId = pkg.id || pkg.package_id;
      const response = await apiClient.get(`/tours/packages/${packageId}`);
      if (response.data.success && response.data.data) {
        setPackageDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast.error('Failed to fetch package details');
    }
  };

  const fetchCommission = async () => {
    try {
      const response = await apiClient.get('/tours/commission/active');
      if (response.data.success && response.data.data) {
        setCommission(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching commission:', error);
      // Set default if API fails
      setCommission({ commission_percentage: 15, currency: 'RWF' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Offers</h1>
          <p className="text-sm text-gray-600 mt-1">Set per-person/group pricing, discounts, and special offers</p>
        </div>
        {selectedPackage && (
          <button
            onClick={() => navigate(`/tours/dashboard/packages/create/${selectedPackage.id || selectedPackage.package_id}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Pricing</span>
          </button>
        )}
      </div>

      {/* Commission Info */}
      {commission && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Platform Commission</h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  {commission.commission_percentage}% commission applies to all tour bookings
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-900">{commission.commission_percentage}%</div>
              <div className="text-xs text-blue-600">{commission.currency || 'RWF'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Package Selector */}
      {packages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
          <select
            value={selectedPackage ? (selectedPackage.id || selectedPackage.package_id) : ''}
            onChange={(e) => {
              const pkg = packages.find(p => (p.id || p.package_id).toString() === e.target.value);
              setSelectedPackage(pkg);
            }}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          >
            {packages.map((pkg) => {
              const id = pkg.id || pkg.package_id;
              const name = pkg.title || pkg.name || 'Unnamed Package';
              return (
                <option key={id} value={id}>{name}</option>
              );
            })}
          </select>
        </div>
      )}

      {packages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tour packages found</h3>
          <p className="text-gray-600 mb-6">Create a tour package to set pricing and offers</p>
          <button
            onClick={() => navigate('/tours/dashboard/packages/create')}
            className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
          >
            Create Package
          </button>
        </div>
      ) : selectedPackage && packageDetails && (
        <div className="space-y-6">
          {/* Pricing Tiers */}
          {packageDetails.schedules && packageDetails.schedules.length > 0 && (
            <>
              {packageDetails.schedules.map((schedule, scheduleIdx) => {
                const pricingTiers = schedule.pricingTiers || schedule.pricing_tiers || [];
                const capacity = schedule.capacity;
                const addons = schedule.addons || [];

                return (
                  <div key={scheduleIdx} className="space-y-4">
                    {/* Schedule Header */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {schedule.schedule_name || 'Default Schedule'}
                          </h2>
                          {schedule.start_date && (
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(schedule.start_date).toLocaleDateString()}
                              {schedule.end_date && ` - ${new Date(schedule.end_date).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                        {schedule.pricingCategory && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {schedule.pricingCategory === 'same-price' ? 'Same Price' : 'Age-Based'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Capacity */}
                    {capacity && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#3CAF54]" />
                          Capacity
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Min Participants</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {capacity.min_participants || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Max Participants</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {capacity.max_participants || 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing Tiers */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-[#3CAF54]" />
                          Pricing Tiers
                        </h3>
                        {pricingTiers.length === 0 && (
                          <span className="text-sm text-gray-500">No pricing tiers configured</span>
                        )}
                      </div>
                      
                      {pricingTiers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No pricing tiers configured for this schedule</p>
                          <p className="text-sm mt-2">Edit the package to add pricing tiers</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Pays</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Person</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {pricingTiers.map((tier, tierIdx) => {
                                const minParticipants = tier.minParticipants || tier.min_participants;
                                const maxParticipants = tier.maxParticipants || tier.max_participants;
                                const customerPays = tier.customerPays || tier.customer_pays;
                                const commissionPercentage = tier.commissionPercentage || tier.commission_percentage || commission?.commission_percentage;
                                const pricePerParticipant = tier.pricePerParticipant || tier.price_per_participant;
                                const currency = tier.currency || 'RWF';

                                return (
                                  <tr key={tierIdx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {minParticipants !== null && maxParticipants !== null
                                        ? `${minParticipants} - ${maxParticipants}`
                                        : minParticipants !== null
                                        ? `${minParticipants}+`
                                        : 'Any'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                      {customerPays ? `${Number(customerPays).toLocaleString()} ${currency}` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {commissionPercentage ? `${commissionPercentage}%` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-[#3CAF54]">
                                      {pricePerParticipant ? `${Number(pricePerParticipant).toLocaleString()} ${currency}` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{currency}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Add-ons */}
                    {addons.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-[#3CAF54]" />
                          Add-ons
                        </h3>
                        <div className="space-y-4">
                          {addons.map((addon, addonIdx) => {
                            const addonTiers = addon.tiers || addon.addonTiers || [];
                            return (
                              <div key={addonIdx} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{addon.addon_name || addon.name}</h4>
                                    {addon.description && (
                                      <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                                    )}
                                    {addon.is_required && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {addon.customer_pays && (
                                      <div className="text-lg font-bold text-[#3CAF54]">
                                        {Number(addon.customer_pays).toLocaleString()} {addon.currency || 'RWF'}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Add-on Tiers */}
                                {addonTiers.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h5 className="text-xs font-medium text-gray-500 mb-2">Quantity-based Pricing</h5>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer Pays</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Payout</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Currency</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {addonTiers.map((tier, tierIdx) => {
                                            const minQty = tier.minQuantity || tier.min_quantity;
                                            const maxQty = tier.maxQuantity || tier.max_quantity;
                                            const customerPays = tier.customerPays || tier.customer_pays;
                                            const payout = tier.payout;
                                            const currency = tier.currency || 'RWF';

                                            return (
                                              <tr key={tierIdx}>
                                                <td className="px-3 py-2 text-gray-900">
                                                  {minQty !== null && maxQty !== null
                                                    ? `${minQty} - ${maxQty}`
                                                    : minQty !== null
                                                    ? `${minQty}+`
                                                    : 'Any'}
                                                </td>
                                                <td className="px-3 py-2 font-semibold text-gray-900">
                                                  {customerPays ? `${Number(customerPays).toLocaleString()} ${currency}` : 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                  {payout ? `${Number(payout).toLocaleString()} ${currency}` : 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">{currency}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* No Schedules Message */}
          {(!packageDetails.schedules || packageDetails.schedules.length === 0) && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing configured</h3>
              <p className="text-gray-600 mb-6">This package doesn't have any schedules or pricing tiers set up yet</p>
              <button
                onClick={() => navigate(`/tours/dashboard/packages/create/${selectedPackage.id || selectedPackage.package_id}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
                className="px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
              >
                Configure Pricing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingOffers;
