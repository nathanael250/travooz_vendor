import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Bed, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Menu,
  Bell,
  User,
  Home,
  LogOut,
  LayoutDashboard,
  Building2,
  FileText,
  BookOpen,
  Clock,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { staysBookingService, getPropertyWithAllData, getMyPropertyListings, staysAuthService } from '../../services/staysService';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';

const RoomAvailability = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [property, setProperty] = useState(null);

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

    fetchData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (currentDate) {
      fetchAvailability();
    }
  }, [currentDate, property]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get property
      const properties = await getMyPropertyListings();
      if (properties && properties.length > 0) {
        const propertyId = properties[0].property_id;
        const propertyData = await getPropertyWithAllData(propertyId);
        setProperty(propertyData);
        setRooms(propertyData.rooms || []);
        
        if (propertyData.rooms && propertyData.rooms.length > 0) {
          setSelectedRoom(propertyData.rooms[0]);
        }

        // Check if property is live
        const propertyIsLive = 
          propertyData.is_live === 1 || 
          propertyData.isLive === true || 
          propertyData.is_live === true ||
          propertyData.status === 'approved';
        setIsPropertyLive(propertyIsLive);
      }

      // Fetch bookings
      const bookingsData = await staysBookingService.getBookings();
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      if (!property) return;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const availabilityData = await staysBookingService.getRoomAvailability(startDate, endDate);
      setAvailability(availabilityData || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isDateInRange = (date, startDate, endDate) => {
    if (!date || !startDate) return false;
    const dateKey = getDateKey(date);
    const startKey = getDateKey(new Date(startDate));
    if (!endDate) return dateKey === startKey;
    const endKey = getDateKey(new Date(endDate));
    return dateKey >= startKey && dateKey <= endKey;
  };

  const getAvailabilityForDate = (date, roomId) => {
    if (!date || !roomId) return { available: 0, booked: 0, total: 0 };
    
    const roomAvailability = availability.find(a => a.room_id === roomId);
    if (!roomAvailability) return { available: 0, booked: 0, total: 0 };

    const dateKey = getDateKey(date);
    const dayAvailability = roomAvailability.availability?.[dateKey];
    
    if (dayAvailability) {
      return {
        available: dayAvailability.available || 0,
        booked: dayAvailability.booked || 0,
        total: dayAvailability.total || 0
      };
    }

    // Default to room's total if no specific availability data
    return {
      available: roomAvailability.total_rooms || 1,
      booked: 0,
      total: roomAvailability.total_rooms || 1
    };
  };

  const getBookingsForDate = (date, roomId) => {
    if (!date || !roomId) return [];
    
    const roomAvailability = availability.find(a => a.room_id === roomId);
    if (!roomAvailability) return [];

    const dateKey = getDateKey(date);
    const dayAvailability = roomAvailability.availability?.[dateKey];
    
    return dayAvailability?.bookings || [];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading room availability...</p>
          </div>
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
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (!isMobile) {
                  setSidebarExpanded(!sidebarExpanded);
                  if (!sidebarOpen) setSidebarOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
              title={!isMobile ? (sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar') : 'Toggle sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            {property && property.property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold truncate">{property.property_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold">Room Availability</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <div className="relative">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">3</span>
            </div>
            <select className="bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hidden sm:block">
              <option>EN</option>
              <option>FR</option>
            </select>
            <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer flex-shrink-0">
              <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Room Availability</h1>
            <p className="text-sm text-gray-600 mt-1">View and manage room availability calendar</p>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
              <Bed className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-6">Create rooms in your property setup to manage availability</p>
              <button
                onClick={() => navigate('/stays/setup/in-progress')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Setup Rooms
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Room Selector */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                <select
                  value={selectedRoom ? selectedRoom.room_id : ''}
                  onChange={(e) => {
                    const room = rooms.find(r => r.room_id.toString() === e.target.value);
                    setSelectedRoom(room);
                  }}
                  className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {rooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_name} ({room.room_type || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendar View */}
              {selectedRoom && (
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Availability Calendar</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="text-sm sm:text-base font-medium text-gray-900 min-w-[140px] sm:min-w-[160px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="ml-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-[10px] sm:text-xs font-medium text-gray-600 text-center p-1"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="h-12 sm:h-14"></div>;
                      }

                      const dateKey = getDateKey(date);
                      const isToday = dateKey === getDateKey(today);
                      const isPast = date < today;
                      const avail = getAvailabilityForDate(date, selectedRoom.room_id);
                      const dateBookings = getBookingsForDate(date, selectedRoom.room_id);
                      const isFullyBooked = avail.available === 0 && avail.total > 0;
                      const isPartiallyBooked = avail.booked > 0 && avail.available > 0;

                      return (
                        <div
                          key={dateKey}
                          className={`h-12 sm:h-14 border border-gray-200 rounded p-1 flex flex-col items-center justify-center text-[10px] sm:text-xs ${
                            isToday ? 'ring-1 ring-green-500' : ''
                          } ${
                            isPast ? 'bg-gray-50 opacity-60' : 
                            isFullyBooked ? 'bg-red-50' :
                            isPartiallyBooked ? 'bg-yellow-50' :
                            'bg-green-50 hover:bg-green-100'
                          } cursor-pointer transition-colors`}
                          title={`${dateKey}: ${avail.available} available, ${avail.booked} booked`}
                        >
                          <span className={`font-medium ${isToday ? 'text-green-600' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </span>
                          {!isPast && (
                            <div className="mt-0.5 text-[9px] text-gray-600 leading-tight">
                              {avail.available}/{avail.total}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 border border-gray-200 rounded"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-50 border border-gray-200 rounded"></div>
                      <span className="text-gray-600">Partially Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-50 border border-gray-200 rounded"></div>
                      <span className="text-gray-600">Fully Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                      <span className="text-gray-600">Past Date</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings List */}
              {selectedRoom && (
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Bookings for {selectedRoom.room_name}
                  </h2>
                  {bookings.filter(b => b.room_id === selectedRoom.room_id).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No bookings found for this room</p>
                  ) : (
                    <div className="space-y-2">
                      {bookings
                        .filter(b => b.room_id === selectedRoom.room_id)
                        .map((booking) => (
                          <div
                            key={booking.booking_id}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                                </span>
                                {booking.total_amount && (
                                  <span className="text-sm font-semibold text-gray-900">
                                    {parseFloat(booking.total_amount).toLocaleString()} {property?.currency || 'RWF'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RoomAvailability;

