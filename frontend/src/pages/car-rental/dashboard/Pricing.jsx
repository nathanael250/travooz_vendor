import React, { useState, useEffect } from 'react';
import { DollarSign, Car, Edit, Save, X } from 'lucide-react';
import carRentalService from '../../../services/carRentalService';
import toast from 'react-hot-toast';

const Pricing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [pricingData, setPricingData] = useState({});

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        const response = await carRentalService.getCars(businessId);
        setCars(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car.car_id);
    setPricingData({
      daily_rate: car.daily_rate || '',
      weekly_rate: car.weekly_rate || '',
      monthly_rate: car.monthly_rate || '',
      security_deposit: car.security_deposit || ''
    });
  };

  const handleSave = async (carId) => {
    try {
      await carRentalService.updateCar(carId, pricingData);
      toast.success('Pricing updated successfully');
      setEditingCar(null);
      fetchCars();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    }
  };

  const handleCancel = () => {
    setEditingCar(null);
    setPricingData({});
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Rates</h1>
          <p className="text-gray-600 mt-1">Manage pricing for your cars</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading pricing...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No cars available. Add cars to set pricing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weekly Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Security Deposit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.car_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{car.brand} {car.model}</div>
                          <div className="text-sm text-gray-500">{car.license_plate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCar === car.car_id ? (
                        <input
                          type="number"
                          value={pricingData.daily_rate}
                          onChange={(e) => setPricingData({ ...pricingData, daily_rate: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">${car.daily_rate || '0.00'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCar === car.car_id ? (
                        <input
                          type="number"
                          value={pricingData.weekly_rate}
                          onChange={(e) => setPricingData({ ...pricingData, weekly_rate: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">${car.weekly_rate || '0.00'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCar === car.car_id ? (
                        <input
                          type="number"
                          value={pricingData.monthly_rate}
                          onChange={(e) => setPricingData({ ...pricingData, monthly_rate: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">${car.monthly_rate || '0.00'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCar === car.car_id ? (
                        <input
                          type="number"
                          value={pricingData.security_deposit}
                          onChange={(e) => setPricingData({ ...pricingData, security_deposit: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">${car.security_deposit || '0.00'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCar === car.car_id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(car.car_id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(car)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;

