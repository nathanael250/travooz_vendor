import React, { useState, useEffect } from 'react';
import { Calendar, Car, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Availability = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const businessId = localStorage.getItem('car_rental_business_id');
      if (businessId) {
        // TODO: Fetch actual cars from API
        setCars([]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability & Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your car availability and calendar</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading availability...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cars available. Add cars to manage availability.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cars.map((car) => (
              <div key={car.car_id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Car className="h-8 w-8 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{car.brand} {car.model}</h3>
                    <p className="text-sm text-gray-600">{car.license_plate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;

