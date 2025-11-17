import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableBookingsAPI, restaurantsAPI } from '../../services/restaurantDashboardService';
import { Search, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`;
};

const TableBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [restaurant, filterStatus, filterDate]);

  const fetchRestaurant = async () => {
    try {
      const data = await restaurantsAPI.getMyRestaurant();
      if (data) {
        setRestaurant(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to fetch restaurant');
    }
  };

  const fetchBookings = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (filterDate) filters.booking_date = filterDate;
      
      const data = await tableBookingsAPI.getAll(filters);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching table bookings:', error);
      toast.error('Failed to fetch table bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await tableBookingsAPI.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'seated':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading table bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Table Bookings</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Manage table reservations for {restaurant?.name || 'your restaurant'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-600 whitespace-nowrap">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-600 whitespace-nowrap">Booking Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bookings ({filteredBookings.length})
          </h2>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Guests</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{booking.customer_name || 'N/A'}</p>
                        {booking.special_requests && (
                          <p className="text-xs text-gray-500 mt-1 italic">{booking.special_requests}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <p>{booking.customer_phone || 'N/A'}</p>
                        {booking.customer_email && (
                          <p className="text-gray-500">{booking.customer_email}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(booking.booking_date)}
                        </div>
                        {booking.booking_time && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {booking.booking_time}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="w-3 h-3 text-gray-500" />
                          <span className="font-medium">{booking.number_of_guests || 1} {booking.number_of_guests === 1 ? 'guest' : 'guests'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs border rounded-md flex items-center gap-1 w-fit ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'seated')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md"
                            >
                              Seat
                            </button>
                          )}
                          {booking.status === 'seated' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customer_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.customer_phone || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs border rounded-md flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(booking.booking_date)}</p>
                      </div>
                    </div>
                    {booking.booking_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium">{booking.booking_time}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Guests</p>
                        <p className="font-medium">{booking.number_of_guests || 1}</p>
                      </div>
                    </div>
                    {booking.customer_email && (
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium text-xs">{booking.customer_email}</p>
                      </div>
                    )}
                  </div>

                  {booking.special_requests && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                      <p className="text-sm text-gray-900 italic">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'seated')}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium"
                      >
                        Seat
                      </button>
                    )}
                    {booking.status === 'seated' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs font-medium"
                      >
                        Complete
                      </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">
              {searchQuery || filterStatus !== 'all' || filterDate
                ? 'No bookings found matching your filters'
                : 'No table bookings yet'}
            </p>
            {restaurant && (
              <p className="text-xs text-gray-400">
                Table bookings will appear here when customers make dine-in orders
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBookings;

