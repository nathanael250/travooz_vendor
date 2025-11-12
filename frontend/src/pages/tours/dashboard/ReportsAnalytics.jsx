import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Users, Star, Package, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const ReportsAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
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

      if (!businessId) {
        setAnalytics(null);
        return;
      }

      // Fetch bookings
      const bookingsResponse = await apiClient.get('/tours/bookings');
      const bookings = bookingsResponse.data?.data || bookingsResponse.data || [];

      // Fetch packages
      const packagesResponse = await apiClient.get(`/tours/packages/business/${businessId}`);
      const packages = packagesResponse.data?.data || packagesResponse.data || [];

      // Fetch reviews
      const reviewsResponse = await apiClient.get('/tours/reviews/stats');
      const reviewStats = reviewsResponse.data?.data || {};

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (selectedPeriod) {
        case 'last7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Filter bookings by date range
      const filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.booking_date || b.created_at);
        return bookingDate >= startDate;
      });

      // Calculate metrics
      const confirmedBookings = filteredBookings.filter(b => 
        b.status === 'confirmed' || b.status === 'completed'
      );
      const paidBookings = confirmedBookings.filter(b => b.payment_status === 'paid');

      // Revenue calculations
      const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const vendorPayout = paidBookings.reduce((sum, b) => sum + (b.vendor_payout || 0), 0);
      const commissionPaid = totalRevenue - vendorPayout;
      const avgBookingValue = paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;

      // Booking trends (last 7 days)
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayBookings = filteredBookings.filter(b => {
          const bookingDate = new Date(b.booking_date || b.created_at);
          return bookingDate >= date && bookingDate < nextDay;
        });
        
        const dayRevenue = dayBookings
          .filter(b => b.payment_status === 'paid')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        
        trends.push({
          date: date.toISOString().split('T')[0],
          bookings: dayBookings.length,
          revenue: dayRevenue,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const monthBookings = bookings.filter(b => {
          const bookingDate = new Date(b.booking_date || b.created_at);
          return bookingDate >= date && bookingDate < nextMonth && b.payment_status === 'paid';
        });
        
        const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const monthPayout = monthBookings.reduce((sum, b) => sum + (b.vendor_payout || 0), 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          payout: monthPayout,
          bookings: monthBookings.length
        });
      }

      // Package performance
      const packagePerformance = packages.map(pkg => {
        const pkgId = pkg.id || pkg.package_id;
        const pkgBookings = filteredBookings.filter(b => 
          (b.package_id || b.packageId)?.toString() === pkgId?.toString()
        );
        const confirmed = pkgBookings.filter(b => 
          b.status === 'confirmed' || b.status === 'completed'
        );
        const paid = confirmed.filter(b => b.payment_status === 'paid');
        const revenue = paid.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const payout = paid.reduce((sum, b) => sum + (b.vendor_payout || 0), 0);
        
        return {
          id: pkgId,
          name: pkg.name || pkg.title || 'Unnamed',
          bookings: pkgBookings.length,
          confirmed: confirmed.length,
          paid: paid.length,
          revenue,
          payout,
          conversion: pkgBookings.length > 0 ? (confirmed.length / pkgBookings.length * 100) : 0
        };
      }).filter(pkg => pkg.bookings > 0).sort((a, b) => b.revenue - a.revenue);

      // Status breakdown
      const statusBreakdown = {
        pending: filteredBookings.filter(b => b.status === 'pending').length,
        confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
        completed: filteredBookings.filter(b => b.status === 'completed').length,
        cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
      };

      // Previous period comparison
      const previousStartDate = new Date(startDate);
      const periodDays = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      previousStartDate.setDate(previousStartDate.getDate() - periodDays);
      
      const previousBookings = bookings.filter(b => {
        const bookingDate = new Date(b.booking_date || b.created_at);
        return bookingDate >= previousStartDate && bookingDate < startDate;
      });
      const previousPaid = previousBookings.filter(b => b.payment_status === 'paid');
      const previousRevenue = previousPaid.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue * 100)
        : (totalRevenue > 0 ? 100 : 0);
      
      const bookingsChange = previousBookings.length > 0
        ? ((filteredBookings.length - previousBookings.length) / previousBookings.length * 100)
        : (filteredBookings.length > 0 ? 100 : 0);

      setAnalytics({
        totalRevenue,
        vendorPayout,
        commissionPaid,
        totalBookings: filteredBookings.length,
        confirmedBookings: confirmedBookings.length,
        paidBookings: paidBookings.length,
        avgBookingValue,
        activePackages: packages.filter(p => p.status === 'active').length,
        totalPackages: packages.length,
        trends,
        monthlyRevenue,
        packagePerformance,
        statusBreakdown,
        reviewStats,
        revenueChange,
        bookingsChange
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Export functionality coming soon');
    // TODO: Implement CSV/PDF export
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600">Analytics will appear here once you have bookings</p>
        </div>
      </div>
    );
  }

  const maxTrendRevenue = Math.max(...analytics.trends.map(t => t.revenue), 1);
  const maxMonthlyRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Revenue, booking trends, customer feedback, and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.totalRevenue.toLocaleString()} RWF
          </p>
          <div className="flex items-center gap-1 text-sm">
            {analytics.revenueChange >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={analytics.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(analytics.revenueChange).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs previous period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Vendor Payout</p>
            <DollarSign className="h-5 w-5 text-[#3CAF54]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.vendorPayout.toLocaleString()} RWF
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Commission: {analytics.commissionPaid.toLocaleString()} RWF
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.totalBookings}
          </p>
          <div className="flex items-center gap-1 text-sm">
            {analytics.bookingsChange >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={analytics.bookingsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(analytics.bookingsChange).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs previous period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg. Booking Value</p>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.avgBookingValue.toLocaleString()} RWF
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Bookings</p>
              <p className="text-xl font-bold text-gray-900">{analytics.paidBookings}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Packages</p>
              <p className="text-xl font-bold text-gray-900">{analytics.activePackages}</p>
            </div>
            <Package className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.reviewStats?.averageRating || '0.0'}
              </p>
            </div>
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.reviewStats?.totalReviews || 0}
              </p>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart (Last 7 Days) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.trends.map((day, index) => {
            const height = maxTrendRevenue > 0 ? (day.revenue / maxTrendRevenue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-48 relative group">
                  <div
                    className="w-full bg-[#3CAF54] rounded-t transition-all hover:bg-[#2d8f42] cursor-pointer"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    title={`${day.revenue.toLocaleString()} RWF - ${day.bookings} bookings`}
                  ></div>
                  {day.revenue > 0 && (
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {day.revenue.toLocaleString()} RWF
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {day.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {day.bookings} booking{day.bookings !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 Months)</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.monthlyRevenue.map((month, index) => {
            const height = maxMonthlyRevenue > 0 ? (month.revenue / maxMonthlyRevenue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-48 relative group">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    title={`${month.revenue.toLocaleString()} RWF - ${month.bookings} bookings`}
                  ></div>
                  {month.revenue > 0 && (
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {month.revenue.toLocaleString()} RWF
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {month.month}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {month.bookings} booking{month.bookings !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">Confirmed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.statusBreakdown.confirmed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.statusBreakdown.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Cancelled</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.statusBreakdown.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Average Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {analytics.reviewStats?.averageRating || '0.0'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Reviews</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.reviewStats?.totalReviews || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Response Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.reviewStats?.responseRate || 0}%
              </span>
            </div>
            {analytics.reviewStats?.ratingDistribution && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Rating Distribution</p>
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(analytics.reviewStats.ratingDistribution[rating] / analytics.reviewStats.totalReviews) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">
                      {analytics.reviewStats.ratingDistribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.packagePerformance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No package performance data available
                  </td>
                </tr>
              ) : (
                analytics.packagePerformance.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pkg.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.confirmed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.paid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pkg.revenue.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3CAF54]">
                      {pkg.payout.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.conversion.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
