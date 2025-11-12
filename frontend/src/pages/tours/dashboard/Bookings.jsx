import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      
      const response = await apiClient.get(`/tours/bookings${query}`);
      const bookingsData = response.data?.data || response.data || [];
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus, cancellationReason = null) => {
    try {
      const payload = { status: newStatus };
      if (cancellationReason) {
        payload.cancellation_reason = cancellationReason;
      }
      
      await apiClient.patch(`/tours/bookings/${bookingId}/status`, payload);
      toast.success('Booking status updated successfully');
      fetchBookings();
      if (selectedBooking && selectedBooking.booking_id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tour_package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `#${booking.booking_id || booking.id}`.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      pending_payment: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Pending Payment' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Refunded' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage customer bookings, statuses, and cancellations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID, customer name, email, or tour package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.booking_id || booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.booking_id || booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.customer_email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.package_name || booking.tour_package_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.tour_date ? new Date(booking.tour_date).toLocaleDateString() : 'N/A'}
                      {booking.tour_time && (
                        <div className="text-xs text-gray-400">{booking.tour_time}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.number_of_participants || booking.participants?.length || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.total_amount ? 
                        `${Number(booking.total_amount).toLocaleString()} ${booking.currency || 'RWF'}` : 
                        'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            fetchBookingDetails(booking.booking_id || booking.id);
                          }}
                          className="text-[#3CAF54] hover:text-[#2d8f42]"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.booking_id || booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-700"
                              title="Confirm"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.booking_id || booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking ID</label>
                  <p className="text-sm text-gray-900">#{selectedBooking.booking_id || selectedBooking.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-sm text-gray-900">{selectedBooking.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Email</label>
                  <p className="text-sm text-gray-900">{selectedBooking.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Phone</label>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.customer_country_code && selectedBooking.customer_phone
                      ? `${selectedBooking.customer_country_code} ${selectedBooking.customer_phone}`
                      : selectedBooking.customer_phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tour Package</label>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.package_name || selectedBooking.tour_package_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tour Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.tour_date ? new Date(selectedBooking.tour_date).toLocaleDateString() : 'N/A'}
                    {selectedBooking.tour_time && ` at ${selectedBooking.tour_time}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Participants</label>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.number_of_participants || selectedBooking.participants?.length || 1}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedBooking.total_amount ? 
                      `${Number(selectedBooking.total_amount).toLocaleString()} ${selectedBooking.currency || 'RWF'}` : 
                      'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor Payout</label>
                  <p className="text-sm font-semibold text-[#3CAF54]">
                    {selectedBooking.vendor_payout ? 
                      `${Number(selectedBooking.vendor_payout).toLocaleString()} ${selectedBooking.currency || 'RWF'}` : 
                      'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedBooking.payment_status || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-sm text-gray-900">{selectedBooking.payment_method || 'N/A'}</p>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requests</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBooking.special_requests}</p>
                </div>
              )}

              {selectedBooking.participants && selectedBooking.participants.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Participants</label>
                  <div className="space-y-2">
                    {selectedBooking.participants.map((participant, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-3">
                        <p className="text-sm font-medium text-gray-900">{participant.participant_name}</p>
                        {participant.participant_email && (
                          <p className="text-xs text-gray-600">{participant.participant_email}</p>
                        )}
                        {participant.participant_phone && (
                          <p className="text-xs text-gray-600">{participant.participant_phone}</p>
                        )}
                        {participant.participant_age && (
                          <p className="text-xs text-gray-600">Age: {participant.participant_age}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.booking_id || selectedBooking.id, 'confirmed');
                      }}
                      className="flex-1 px-4 py-2 bg-[#3CAF54] text-white rounded-lg hover:bg-[#2d8f42] transition-colors"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.booking_id || selectedBooking.id, 'cancelled');
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function fetchBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/tours/bookings/${bookingId}`);
      if (response.data.success && response.data.data) {
        setSelectedBooking(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    }
  }
};

export default Bookings;
