import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, Car, Users } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeCars: 0,
    averageBookingValue: 0,
    monthlyRevenue: [],
    bookingTrends: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // TODO: Fetch actual analytics from API
    setStats({
      totalRevenue: 0,
      totalBookings: 0,
      activeCars: 0,
      averageBookingValue: 0,
      monthlyRevenue: [],
      bookingTrends: []
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View your business performance and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6" style={{ color: '#3CAF54' }} />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Cars</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeCars}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Booking Value</h3>
          <p className="text-2xl font-bold text-gray-900">${stats.averageBookingValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <BarChart3 className="h-12 w-12" />
            <p className="ml-2">Chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <TrendingUp className="h-12 w-12" />
            <p className="ml-2">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

