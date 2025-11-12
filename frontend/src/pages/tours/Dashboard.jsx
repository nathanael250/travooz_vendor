import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourPackagesAPI, bookingsAPI } from '../../services/tourDashboardService';
import { tourPackageSetupService } from '../../services/tourPackageService';
import { 
  Plane, DollarSign, TrendingUp, Calendar, Users, Menu, 
  LayoutDashboard, FileText, BookOpen, LogOut, Bell, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/images/cdc_logo.jpg';

// Helper function to format date as "MMM dd"
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  return `${month} ${day}`;
};

// Helper function to format date as "yyyy-MM-dd" for input
const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    totalBookings: 0,
    activePackages: 0,
  });

  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [tourPackageStats, setTourPackageStats] = useState([]);
  const [bookingTypeData, setBookingTypeData] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  // Check if user is verified before allowing dashboard access
  useEffect(() => {
    const checkVerification = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // If not logged in, redirect to listing form
      if (!user || !token) {
        navigate('/tours/list-your-tour', { replace: true });
        return;
      }

      const tourBusinessId = localStorage.getItem('tour_business_id');
      
      // If no tour business ID, redirect to listing form
      if (!tourBusinessId) {
        navigate('/tours/list-your-tour', { replace: true });
        setIsCheckingVerification(false);
        return;
      }

      try {
        // Check submission status
        const status = await tourPackageSetupService.getSubmissionStatus(tourBusinessId);
        
        // Check if this is a "no submission found" response (database cleared)
        const apiMessage = status?.message || status?.data?.message || '';
        const dataStatus = status?.data?.status;
        
        if (apiMessage.includes('No submission found') || 
            apiMessage.includes('No submission') ||
            (dataStatus === null && apiMessage)) {
          console.log('🗑️ Database appears to be cleared. No submission found. Clearing stale data and redirecting...');
          
          // Clear stale localStorage data but keep user session
          localStorage.removeItem('tour_business_id');
          localStorage.removeItem('tour_submission_status');
          
          // Redirect to start fresh (user stays logged in)
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
        
        const submissionStatus = status?.status || status?.data?.status || status?.data?.data?.status;
        
        console.log('🔍 Dashboard - Checking verification status:', submissionStatus);
        
        // Handle null/undefined status (no data in database)
        if (submissionStatus === null || submissionStatus === undefined) {
          console.log('⚠️ No submission data found. Database may be cleared. Redirecting to start fresh...');
          localStorage.removeItem('tour_business_id');
          localStorage.removeItem('tour_submission_status');
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
        
        if (submissionStatus === 'approved') {
          // User is approved, allow dashboard access
          console.log('✅ User approved, allowing dashboard access');
          setIsCheckingVerification(false);
        } else {
          // User is not approved yet - redirect to waiting page
          console.log('⏳ User not approved yet, redirecting to complete page');
          navigate('/tours/setup/complete', { replace: true });
          return;
        }
      } catch (error) {
        console.error('❌ Error checking verification status:', error);
        
        // If it's a 404 or "not found" error, database was likely cleared
        if (error.response?.status === 404 || 
            error.message?.includes('not found') || 
            error.message?.includes('No submission')) {
          console.log('🗑️ Submission not found (database may be cleared). Clearing stale data and redirecting...');
          localStorage.removeItem('tour_business_id');
          localStorage.removeItem('tour_submission_status');
          navigate('/tours/list-your-tour', { replace: true });
          return;
        }
        
        // For other errors, redirect to complete page (safer - requires verification)
        navigate('/tours/setup/complete', { replace: true });
        return;
      }
    };

    checkVerification();
  }, [navigate]);

  useEffect(() => {
    // Only set up dashboard if verification check passed
    if (isCheckingVerification) {
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

    fetchDashboardData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dateRange, selectedDate, isCheckingVerification]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tour_setup_data');
    localStorage.removeItem('tour_setup_complete');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'custom') {
        startDate.setTime(selectedDate.getTime());
        startDate.setHours(0, 0, 0, 0);
        endDate.setTime(selectedDate.getTime());
        endDate.setHours(23, 59, 59, 999);
      }

      const tourPackages = await tourPackagesAPI.getAll('active');
      const packagesCount = tourPackages.length;

      const allBookings = await bookingsAPI.getAll();
      const bookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date);
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      const todayBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at || b.booking_date);
        return bookingDate.toDateString() === today.toDateString();
      }) || [];

      const completedBookings = bookings?.filter(b => b.status === 'completed' || b.status === 'confirmed') || [];
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.total_amount || booking.price || 0), 0);

      // Booking status overview
      const statusCounts = {
        confirmed: bookings?.filter((b) => b.status === 'confirmed' || b.status === 'completed').length || 0,
        pending: bookings?.filter((b) => b.status === 'pending' || b.status === 'pending_payment').length || 0,
        cancelled: bookings?.filter((b) => b.status === 'cancelled').length || 0,
      };
      setBookingStatusData([
        { name: 'Confirmed Bookings', value: statusCounts.confirmed, color: '#10b981' },
        { name: 'Pending Bookings', value: statusCounts.pending, color: '#f59e0b' },
        { name: 'Cancelled Bookings', value: statusCounts.cancelled, color: '#ef4444' },
      ]);

      // Tour Package statistics
      const packageStatsData = [];
      for (const tourPackage of tourPackages) {
        const packageBookings = bookings.filter(booking => 
          booking.tour_package_id === tourPackage.id || booking.package_id === tourPackage.id
        );
        
        const confirmed = packageBookings?.filter((b) => b.status === 'confirmed' || b.status === 'completed').length || 0;
        const pending = packageBookings?.filter((b) => b.status === 'pending' || b.status === 'pending_payment').length || 0;
        const cancelled = packageBookings?.filter((b) => b.status === 'cancelled').length || 0;
        const total = packageBookings?.length || 0;
        
        packageStatsData.push({
          name: tourPackage.title || tourPackage.name || 'Unnamed Package',
          confirmed,
          pending,
          cancelled,
          total,
        });
      }
      setTourPackageStats(packageStatsData);

      // Booking Type Chart Data - Last 7 days (by tour type or destination)
      const bookingTypeMap = new Map();
      const chartStartDate = new Date();
      chartStartDate.setDate(chartStartDate.getDate() - 6);
      chartStartDate.setHours(0, 0, 0, 0);
      
      const chartEndDate = new Date();
      chartEndDate.setHours(23, 59, 59, 999);
      
      const chartBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date);
        return bookingDate >= chartStartDate && bookingDate <= chartEndDate;
      });
      
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayKey = formatDate(date);
        days.push(dayKey);
        bookingTypeMap.set(dayKey, { 'Adventure': 0, 'Cultural': 0, 'Safari': 0 });
      }
      
      chartBookings.forEach(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date);
        const dayKey = formatDate(bookingDate);
        // Try to get tour type from booking or package
        const tourType = booking.tour_type || booking.package_type || 'Adventure';
        const typeKey = tourType.includes('Cultural') ? 'Cultural' : tourType.includes('Safari') ? 'Safari' : 'Adventure';
        
        if (bookingTypeMap.has(dayKey)) {
          const counts = bookingTypeMap.get(dayKey);
          counts[typeKey] = (counts[typeKey] || 0) + 1;
        }
      });
      
      const bookingTypeChartData = days.map(day => ({
        month: day,
        'Adventure': bookingTypeMap.get(day)?.['Adventure'] || 0,
        'Cultural': bookingTypeMap.get(day)?.['Cultural'] || 0,
        'Safari': bookingTypeMap.get(day)?.['Safari'] || 0,
      }));
      
      setBookingTypeData(bookingTypeChartData);

      setStats({
        totalRevenue,
        todayBookings: todayBookings.length,
        totalBookings: bookings?.length || 0,
        activePackages: packagesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking verification
  if (isCheckingVerification) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying account access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white transition-all duration-300 z-50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="Travooz Logo" className="h-8 w-auto flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && (
                <span className="text-lg font-semibold whitespace-nowrap">Tour Agent</span>
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700 text-white mb-1"
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1"
            >
              <Plane className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Tour Packages</span>}
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1"
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Bookings</span>}
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1"
            >
              <FileText className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || (!isMobile && sidebarExpanded)) && <span>Reports</span>}
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1"
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
              localhost:8080/tours/dashboard
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
        <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6" style={{ color: '#3CAF54' }} />
              <span className="text-lg font-semibold">Tour Agent Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </div>
            <select className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
              <option>EN</option>
              <option>FR</option>
            </select>
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {/* Header with Date Filters */}
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <input
                type="date"
                value={formatDateInput(selectedDate)}
                onChange={(e) => {
                  setSelectedDate(new Date(e.target.value));
                  setDateRange('custom');
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TOTAL REVENUE</h3>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-xl font-bold text-green-500">{stats.totalRevenue.toLocaleString()} RWF</div>
          <p className="text-xs text-gray-500 mt-1">All Revenue Generated</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TODAY BOOKINGS</h3>
            <Calendar className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-orange-500">{stats.todayBookings}</div>
          <p className="text-xs text-gray-500 mt-1">Bookings Made Today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TOTAL BOOKINGS</h3>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-500">{stats.totalBookings}</div>
          <p className="text-xs text-gray-500 mt-1">All Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TOUR PACKAGES</h3>
            <Plane className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-xl font-bold text-green-500">{stats.activePackages}</div>
          <p className="text-xs text-gray-500 mt-1">Active Packages</p>
        </div>
          </div>

          {/* Booking Status Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Booking Status Overview</h2>
            <div className="space-y-3">
              {bookingStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 rounded"
                      style={{
                        width: `${Math.max(15, (item.value / Math.max(...bookingStatusData.map(d => d.value), 1)) * 150)}px`,
                        backgroundColor: item.color
                      }}
                    />
                    <span className="text-xs font-bold w-8 text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Tour Package Statistics Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Tour Package Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Package</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Confirmed</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Pending</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Cancelled</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourPackageStats.length > 0 ? (
                      tourPackageStats.map((stat, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-2 text-xs font-medium text-gray-900">{stat.name}</td>
                          <td className="py-2 px-2 text-xs text-green-600">{stat.confirmed}</td>
                          <td className="py-2 px-2 text-xs text-orange-600">{stat.pending}</td>
                          <td className="py-2 px-2 text-xs text-red-600">{stat.cancelled}</td>
                          <td className="py-2 px-2 text-xs text-gray-600">{stat.total}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-500 text-xs py-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
              </table>
            </div>
            </div>

            {/* Booking Type Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Booking Types (Last 7 Days)</h2>
              <div className="space-y-2">
                {bookingTypeData.map((day, index) => {
                  const maxValue = Math.max(...bookingTypeData.map(d => Math.max(d['Adventure'], d['Cultural'], d['Safari'])), 1);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-16">{day.month}</span>
                      <div className="flex-1 flex gap-1">
                        {day['Adventure'] > 0 && (
                          <div
                            className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                            style={{ width: `${(day['Adventure'] / maxValue) * 100}%` }}
                          >
                            {day['Adventure']}
                          </div>
                        )}
                        {day['Cultural'] > 0 && (
                          <div
                            className="bg-purple-500 text-white text-xs px-2 py-1 rounded"
                            style={{ width: `${(day['Cultural'] / maxValue) * 100}%` }}
                          >
                            {day['Cultural']}
                          </div>
                        )}
                        {day['Safari'] > 0 && (
                          <div
                            className="bg-orange-500 text-white text-xs px-2 py-1 rounded"
                            style={{ width: `${(day['Safari'] / maxValue) * 100}%` }}
                          >
                            {day['Safari']}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Adventure</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">Cultural</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Safari</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

