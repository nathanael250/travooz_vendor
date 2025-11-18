import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu,
  Bell,
  User,
  Home,
  LogOut,
  LayoutDashboard,
  Building2,
  Calendar as CalendarIcon,
  FileText,
  BookOpen,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { staysAuthService, staysBookingService, getMyPropertyListings } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';

const Bookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [property, setProperty] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!staysAuthService.isAuthenticated()) {
      navigate('/stays/login');
      return;
    }

    // Set initial sidebar state based on screen size
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobile(!isDesktop);
      if (isDesktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Get current user
    const currentUser = staysAuthService.getCurrentUser();
    setUser(currentUser);

    fetchPropertyAndBookings();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Apply filters whenever bookings, filters, or search query changes
    applyFilters();
  }, [bookings, statusFilter, searchQuery, startDate, endDate]);

  const fetchPropertyAndBookings = async () => {
    try {
      setLoading(true);
      
      // Get user's property
      const properties = await getMyPropertyListings();
      if (!properties || properties.length === 0) {
        toast.error('No property found. Please create a property first.');
        navigate('/stays/dashboard');
        return;
      }

      const currentProperty = properties[0];
      setProperty(currentProperty);
      
      // Check if property is live
      const propertyIsLive = 
        currentProperty.is_live === 1 || 
        currentProperty.isLive === true || 
        currentProperty.is_live === true ||
        currentProperty.status === 'approved';
      setIsPropertyLive(propertyIsLive);

      // Fetch bookings
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      const bookingsData = await staysBookingService.getBookings(filters);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
      if (error.response?.status === 401) {
        navigate('/stays/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.check_out_date) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.check_in_date) <= new Date(endDate)
      );
    }

    // Search filter (by booking ID, room name, guest name, email, or guest count)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.booking_id?.toString().includes(query) ||
        booking.room_name?.toLowerCase().includes(query) ||
        booking.guest_name?.toLowerCase().includes(query) ||
        booking.guest_email?.toLowerCase().includes(query) ||
        booking.guests?.toString().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 RWF';
    return `${parseFloat(amount).toLocaleString()} RWF`;
  };

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-800 text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarExpanded ? 'w-64' : 'w-20'} flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Travooz Logo" className="h-8 w-auto flex-shrink-0" />
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
              <span className="text-lg font-semibold whitespace-nowrap">Admin Dashboard</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-700 rounded flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="p-4 text-xs text-gray-400 uppercase tracking-wider">Menu</div>
          )}
          <nav className="px-2 pb-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard/my-property');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard/my-property' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Building2 className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>My Property</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard/property-images');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard/property-images' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <ImageIcon className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Property Images</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard/bookings');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard/bookings' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <CalendarIcon className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Bookings</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard/room-availability');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard/room-availability' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Room Availability</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/stays/dashboard/finance');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                currentPath === '/stays/dashboard/finance' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <DollarSign className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Finance</span>}
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                isPropertyLive 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              onClick={(e) => !isPropertyLive && e.preventDefault()}
            >
              <FileText className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Reports</span>}
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                isPropertyLive 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              onClick={(e) => !isPropertyLive && e.preventDefault()}
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>API Docs</span>}
            </a>
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Logout</span>}
          </button>
          {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              localhost:8080/dashboard
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-800 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base md:text-lg font-semibold">
                {property?.property_name || 'Property'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
            <div className="hidden sm:block border-l border-gray-700 pl-3">
              <select className="bg-gray-700 text-white text-xs sm:text-sm px-2 py-1 rounded">
                <option>EN</option>
              </select>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded px-2 py-1">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline text-sm">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#1f6f31' }}>
                Bookings
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage and view all your property bookings</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by booking ID, room name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Date Filters */}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={fetchPropertyAndBookings}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No bookings found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {bookings.length === 0 
                      ? 'You don\'t have any bookings yet.' 
                      : 'Try adjusting your filters to see more results.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.booking_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{booking.booking_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {booking.guest_name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {booking.room_name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(booking.check_in_date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(booking.check_out_date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {booking.guests || 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(booking.total_amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="text-green-600 hover:text-green-800 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Booking Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </main>
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1f6f31' }}>
                  Booking Details
                </h2>
                <button
                  onClick={() => setShowBookingDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Guest Information Section */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Guest Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Guest Name</label>
                      <p className="text-sm font-medium">{selectedBooking.guest_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Guest Email</label>
                      <p className="text-sm font-medium">{selectedBooking.guest_email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Guest Phone</label>
                      <p className="text-sm font-medium">{selectedBooking.guest_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Adults / Children</label>
                      <p className="text-sm font-medium">
                        {selectedBooking.number_of_adults || 0} Adults, {selectedBooking.number_of_children || 0} Children
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Booking ID</label>
                      <p className="text-sm font-medium">#{selectedBooking.booking_id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Booking Reference</label>
                      <p className="text-sm font-medium">{selectedBooking.booking_reference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Payment Status</label>
                      <p className="text-sm font-medium capitalize">{selectedBooking.payment_status || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Room</label>
                      <p className="text-sm font-medium">{selectedBooking.room_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Room Type</label>
                      <p className="text-sm font-medium">{selectedBooking.room_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Check-in Date</label>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.check_in_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Check-out Date</label>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.check_out_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Number of Guests</label>
                      <p className="text-sm font-medium">{selectedBooking.guests || 1}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Total Amount</label>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(selectedBooking.total_amount)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Created At</label>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Last Updated</label>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

