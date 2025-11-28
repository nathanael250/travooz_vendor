import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LogOut, Home, Settings, Building2, Mail, AlertCircle, 
  Menu, Bell, Calendar, DollarSign, BarChart3, 
  ChevronDown, ChevronLeft, ChevronRight, User, LayoutDashboard, FileText, TrendingUp, BookOpen, Image as ImageIcon
} from 'lucide-react';
import logo from '../../assets/images/cdc_logo.jpg';
import { staysAuthService, getMyPropertyListings, staysSetupService } from '../../services/staysService';

export default function StaysDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(true);
  const [setupStatus, setSetupStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hidden by default on mobile, visible on desktop
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // For desktop collapse/expand
  const [isMobile, setIsMobile] = useState(false); // Track if we're on mobile
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedDateValue, setSelectedDateValue] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
  const [isPropertyLive, setIsPropertyLive] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    averageDailyRate: 0,
    totalPayment: 0,
    revPAR: 0,
    occupancyToday: 0,
    occupancyYesterday: 0
  });

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
        // Desktop: sidebar always visible and expanded by default
        setSidebarOpen(true);
      } else {
        // Mobile: sidebar hidden by default
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Get current user
    const currentUser = staysAuthService.getCurrentUser();
    setUser(currentUser);

    // Load user's properties first, then check setup status
    const initializeDashboard = async () => {
      try {
        // Load properties for the authenticated user from backend
        const userProperties = await getMyPropertyListings();
        const propertiesArray = Array.isArray(userProperties) ? userProperties : [];
        setProperties(propertiesArray);
        
        // Set the current property (most recent or first one)
        if (propertiesArray.length > 0) {
          const latestProperty = propertiesArray[0];
          setCurrentProperty(latestProperty);
          
          // Check if property is live - check both is_live and status
          const propertyIsLive = 
            latestProperty.is_live === 1 || 
            latestProperty.isLive === true || 
            latestProperty.is_live === true ||
            latestProperty.status === 'approved';
          setIsPropertyLive(propertyIsLive);
          
          // Store property ID in localStorage for persistence
          const propertyId = latestProperty.property_id || latestProperty.propertyId;
          if (propertyId) {
            localStorage.setItem('stays_property_id', propertyId.toString());
            
            try {
              // Check setup status from backend
              console.log('[Dashboard] Checking setup status for propertyId:', propertyId, 'type:', typeof propertyId);
              const status = await staysSetupService.getSetupStatus(propertyId);
              console.log('[Dashboard] Setup status received:', status);
              console.log('[Dashboard] step3_policies:', status.steps?.step3_policies);
              setSetupStatus(status);
              setSetupComplete(status.setupComplete || status.allComplete);
            } catch (statusError) {
              console.error('[Dashboard] Error checking setup status:', statusError);
              // Fallback to localStorage check
              const setupCompleteLocal = localStorage.getItem('stays_setup_complete') === 'true';
              setSetupComplete(setupCompleteLocal);
            }

            // TODO: Fetch bookings and rooms data when API endpoints are available
            // For now, initialize with empty arrays
            // try {
            //   const [bookingsData, roomsData] = await Promise.all([
            //     staysApiClient.get(`/stays/bookings?property_id=${propertyId}`),
            //     staysApiClient.get(`/stays/rooms?property_id=${propertyId}`)
            //   ]);
            //   setBookings(bookingsData?.data?.data || bookingsData?.data || []);
            //   setRooms(roomsData?.data?.data || roomsData?.data || []);
            // } catch (error) {
            //   console.error('Error fetching bookings/rooms:', error);
            //   setBookings([]);
            //   setRooms([]);
            // }
          } else {
            // No propertyId, check localStorage
            const setupCompleteLocal = localStorage.getItem('stays_setup_complete') === 'true';
            setSetupComplete(setupCompleteLocal);
          }
        } else {
          // No properties found - check if there's a propertyId in localStorage
          const storedPropertyId = localStorage.getItem('stays_property_id');
          if (storedPropertyId) {
            try {
              // Try to get property by ID (if user has access)
              // This is a fallback if getMyPropertyListings doesn't return properties
              const status = await staysSetupService.getSetupStatus(parseInt(storedPropertyId));
              setSetupStatus(status);
              setSetupComplete(status.setupComplete || status.allComplete);
            } catch (error) {
              console.error('Error checking setup status with stored propertyId:', error);
            }
          }
          
          // Check localStorage for setup completion
          const setupCompleteLocal = localStorage.getItem('stays_setup_complete') === 'true';
          setSetupComplete(setupCompleteLocal);
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        // Fallback to localStorage check
        const setupCompleteLocal = localStorage.getItem('stays_setup_complete') === 'true';
        setSetupComplete(setupCompleteLocal);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleLogout = () => {
    staysAuthService.logout();
    navigate('/stays/login');
  };

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    const userId = rawUser.user_id || rawUser.userId || rawUser.id;
    const email = rawUser.email || rawUser.user_email;
    const name =
      rawUser.name ||
      rawUser.full_name ||
      [rawUser.first_name, rawUser.last_name].filter(Boolean).join(' ') ||
      rawUser.username ||
      rawUser.email ||
      'User';

    return {
      userId,
      email,
      name,
      emailVerified:
        rawUser.email_verified ||
        rawUser.emailVerified ||
        rawUser.is_email_verified ||
        false,
    };
  };

  const handleContinueSetup = () => {
    const currentUser = user || staysAuthService.getCurrentUser();
    const normalizedUser = normalizeUser(currentUser);

    if (!normalizedUser || !normalizedUser.userId) {
      toast.error('Session expired or user information missing. Please log in again to continue setup.');
      navigate('/stays/login', { replace: true });
      return;
    }

    // Get propertyId from properties or localStorage
    const propertyId = properties.length > 0 
      ? (properties[0].property_id || properties[0].propertyId)
      : parseInt(localStorage.getItem('stays_property_id') || '0', 10);

    if (!propertyId || Number.isNaN(propertyId)) {
      toast.error('We could not determine which property to finish setting up. Please start the setup again.');
      navigate('/stays/list-your-property/start');
      return;
    }

    // Redirect to appropriate setup step based on what's incomplete
    if (!normalizedUser.emailVerified) {
      navigate('/stays/list-your-property/verify-email', {
        state: {
          userId: normalizedUser.userId,
          email: normalizedUser.email,
          userName: normalizedUser.name,
          propertyId
        }
      });
    } else if (setupStatus && setupStatus.steps) {
      // Use backend status to determine next step
      const { steps } = setupStatus;
      
      if (!steps.step2_contract) {
        navigate('/stays/setup/contract', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step3_policies) {
        navigate('/stays/setup/policies', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step4_amenities) {
        navigate('/stays/setup/amenities', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step5_rooms) {
        navigate('/stays/setup/rooms', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step8_images) {
        navigate('/stays/setup/images', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step9_taxes) {
        navigate('/stays/setup/taxes', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else if (!steps.step10_connectivity) {
        navigate('/stays/setup/connectivity', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else {
        // All steps complete, go to review
        navigate('/stays/setup/review', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      }
    } else {
      // Fallback to localStorage check
      const contractAccepted = localStorage.getItem('stays_contract_accepted');
      if (!contractAccepted) {
        navigate('/stays/setup/contract', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      } else {
        navigate('/stays/setup/policies', {
          state: {
            userId: normalizedUser.userId,
            email: normalizedUser.email,
            userName: normalizedUser.name,
            propertyId
          }
        });
      }
    }
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Filter bookings
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const todayBookings = confirmedBookings.filter(b => {
      const bookingDate = new Date(b.check_in_date || b.booking_date || b.created_at);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });
    const yesterdayBookings = confirmedBookings.filter(b => {
      const bookingDate = new Date(b.check_in_date || b.booking_date || b.created_at);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === yesterday.getTime();
    });
    
    // Calculate Total Revenue
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.total_amount || b.amount || 0)), 0);
    
    // Calculate Average Daily Rate (ADR) - Average revenue per occupied room per day
    const totalRoomNights = confirmedBookings.reduce((sum, b) => sum + (Number(b.nights || 1)), 0);
    const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;
    
    // Calculate Total Payment (same as total revenue for now, or can be filtered by payment_status)
    const totalPayment = confirmedBookings
      .filter(b => b.payment_status === 'paid' || b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.total_amount || b.amount || 0)), 0);
    
    // Calculate RevPAR (Revenue per Available Room) - Total Revenue / (Total Rooms * Days)
    const totalRooms = rooms.length || (currentProperty?.number_of_rooms || 0);
    const daysInPeriod = 30; // Last 30 days for calculation
    const revPAR = totalRooms > 0 && daysInPeriod > 0 ? totalRevenue / (totalRooms * daysInPeriod) : 0;
    
    // Calculate Occupancy
    const occupancyToday = totalRooms > 0 ? (todayBookings.length / totalRooms) * 100 : 0;
    const occupancyYesterday = totalRooms > 0 ? (yesterdayBookings.length / totalRooms) * 100 : 0;
    
    setDashboardStats({
      totalRevenue,
      averageDailyRate,
      totalPayment,
      revPAR,
      occupancyToday: Math.min(occupancyToday, 100),
      occupancyYesterday: Math.min(occupancyYesterday, 100)
    });
  };

  // Recalculate metrics when bookings or rooms change
  useEffect(() => {
    if (bookings.length >= 0 && rooms.length >= 0) {
      calculateMetrics();
    }
  }, [bookings, rooms, currentProperty]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CAF54] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show setup incomplete message if needed
  if (!setupComplete) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Incomplete</h2>
            <p className="text-gray-600 mb-6">
              Please complete your property setup to access the dashboard.
            </p>
            <button
              onClick={handleContinueSetup}
              className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#3CAF54' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8f42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3CAF54'}
            >
              Continue Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show property not live message if property exists but is not live
  if (currentProperty && !isPropertyLive && setupComplete) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Sidebar - Responsive */}
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
                {sidebarOpen && (
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
            {sidebarOpen && (
              <div className="p-4 text-xs text-gray-400 uppercase tracking-wider">Menu</div>
            )}
            <nav className="px-2 pb-4">
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700 text-white mb-1 opacity-50 cursor-not-allowed"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>Dashboard</span>}
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              >
                <Building2 className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>Properties</span>}
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              >
                <Calendar className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>Bookings</span>}
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>Rooms</span>}
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              >
                <FileText className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>Reports</span>}
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>API Docs</span>}
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
              {sidebarOpen && <span>Logout</span>}
            </button>
            {sidebarOpen && (
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

        {/* Main Content - Property Not Live Message */}
        <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
          {/* Top Header - Responsive */}
          <header className="bg-gray-800 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => {
                  // On desktop (lg breakpoint): toggle expand/collapse
                  // On mobile: toggle show/hide
                  if (!isMobile) {
                    setSidebarExpanded(!sidebarExpanded);
                    // Ensure sidebar is open on desktop
                    if (!sidebarOpen) setSidebarOpen(true);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="p-2 hover:bg-gray-700 rounded-lg flex-shrink-0"
                title={!isMobile ? (sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar') : 'Toggle sidebar'}
              >
                <Menu className="h-5 w-5" />
              </button>
              {currentProperty && currentProperty.property_name ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                  <span className="text-sm sm:text-lg font-semibold truncate">{currentProperty.property_name}</span>
                </div>
              ) : properties.length > 0 && properties[0].property_name ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                  <span className="text-sm sm:text-lg font-semibold truncate">{properties[0].property_name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                  <span className="text-sm sm:text-lg font-semibold">My Property</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="relative">
                <Bell className="h-5 w-5 cursor-pointer opacity-50" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center hidden sm:flex">3</span>
              </div>
              <select className="bg-gray-700 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm opacity-50 hidden sm:block" disabled>
                <option>EN</option>
                <option>FR</option>
              </select>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer opacity-50 flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </header>

          {/* Not Live Message - Responsive */}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 pt-8 sm:pt-12 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-6 sm:p-8 border text-center">
              <div className="mb-4 sm:mb-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Property Under Review</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5">
                  Your property <strong className="break-words">{currentProperty?.property_name || 'property'}</strong> is being reviewed by our admin team. 
                  You'll receive an email notification once a decision is made. This typically takes 2-3 business days.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 text-left">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    <strong>Need to logout?</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Click on the <strong>three horizontal lines (☰)</strong> icon in the top left corner to open the menu, then select <strong>"Logout"</strong> to sign out. You can return later to check your property status.
                  </p>
                </div>
              </div>
            </div>
          </main>
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
              <Calendar className="h-5 w-5 flex-shrink-0" />
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
                // On desktop (lg breakpoint): toggle expand/collapse
                // On mobile: toggle show/hide
                if (!isMobile) {
                  setSidebarExpanded(!sidebarExpanded);
                  // Ensure sidebar is open on desktop
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
            {currentProperty && currentProperty.property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold truncate">{currentProperty.property_name}</span>
              </div>
            ) : properties.length > 0 && properties[0].property_name ? (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold truncate">{properties[0].property_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" style={{ color: '#3CAF54' }} />
                <span className="text-sm sm:text-base md:text-lg font-semibold">My Property</span>
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
            {/* Property Status Banner - Show if not live */}
            {!isPropertyLive && currentProperty && (
              <div className="mb-3 sm:mb-4 md:mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-3 md:p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-yellow-700">
                      <strong>Property Under Review:</strong> Your property is currently being reviewed by our admin team. 
                      Once approved, it will go live and you'll have full dashboard access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Header */}
            <div className="mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#1f6f31' }}>Dashboard Overview</h1>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={!isPropertyLive}
                  className={`text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white flex-1 sm:flex-none ${!isPropertyLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
                <input
                  type="date"
                  value={selectedDateValue}
                  onChange={(e) => setSelectedDateValue(e.target.value)}
                  disabled={!isPropertyLive}
                  className={`text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white flex-1 sm:flex-none ${!isPropertyLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

          {/* Key Metrics Cards - Mobile: 2x2 grid, Desktop: 4 columns */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 ${!isPropertyLive ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 leading-tight">TOTAL REVENUE</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: '#1f6f31' }}>
                {dashboardStats.totalRevenue.toLocaleString()} RWF
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight">All The Revenue Generated</p>
            </div>

            {/* Average Daily Rate */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 leading-tight">AVERAGE DAILY RATE</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 text-blue-600">
                {dashboardStats.averageDailyRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} RWF
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight">Average Rate Per Room</p>
            </div>

            {/* Total Payment */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 leading-tight">TOTAL PAYMENT</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 text-green-600">
                {dashboardStats.totalPayment.toLocaleString()} RWF
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight">Total Payments Received</p>
            </div>

            {/* RevPAR */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 leading-tight">RevPAR</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 text-purple-600">
                {dashboardStats.revPAR.toLocaleString('en-US', { maximumFractionDigits: 0 })} RWF
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight">Revenue Per Available Room</p>
            </div>
          </div>

          {/* Occupancy and Reservation Statistics Row */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6 ${!isPropertyLive ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Occupancy Today and Yesterday */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Occupancy</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="border-r pr-2 sm:pr-3 md:pr-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Today</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#3CAF54' }}>
                    {dashboardStats.occupancyToday.toFixed(1)}%
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-tight">
                    {bookings.filter(b => {
                      const bookingDate = new Date(b.check_in_date || b.booking_date || b.created_at);
                      bookingDate.setHours(0, 0, 0, 0);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return bookingDate.getTime() === today.getTime() && (b.status === 'confirmed' || b.status === 'completed');
                    }).length} rooms occupied
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Yesterday</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600">
                    {dashboardStats.occupancyYesterday.toFixed(1)}%
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-tight">
                    {bookings.filter(b => {
                      const bookingDate = new Date(b.check_in_date || b.booking_date || b.created_at);
                      bookingDate.setHours(0, 0, 0, 0);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      yesterday.setHours(0, 0, 0, 0);
                      return bookingDate.getTime() === yesterday.getTime() && (b.status === 'confirmed' || b.status === 'completed');
                    }).length} rooms occupied
                  </p>
                </div>
              </div>
            </div>

            {/* Reservation Statistics */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Reservation Statistics</h2>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Total Reservations</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Confirmed</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Pending</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending' || b.status === 'pending_payment').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Cancelled</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-red-600">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Setup Status */}
          <div className={`bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 ${!isPropertyLive ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Property Setup Status</h2>
            {setupStatus && setupStatus.steps ? (
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Contract Accepted</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step2_contract ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step2_contract ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Policies & Settings</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step3_policies ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step3_policies ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Amenities</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step4_amenities ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step4_amenities ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Rooms</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step5_rooms ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step5_rooms ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Promotions</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step7_promotions ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step7_promotions ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Images</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step8_images ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step8_images ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Tax Details</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step9_taxes ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step9_taxes ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700">Connectivity</span>
                  <span className={`text-xs sm:text-sm font-semibold ${setupStatus.steps.step10_connectivity ? 'text-green-600' : 'text-gray-400'}`}>
                    {setupStatus.steps.step10_connectivity ? '✓ Complete' : 'Pending'}
                  </span>
                </div>
                <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Overall Status</span>
                    <span className={`text-sm sm:text-base font-bold ${setupStatus.setupComplete || setupStatus.allComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {setupStatus.setupComplete || setupStatus.allComplete ? '✓ Complete' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500">Setup status not available</p>
            )}
          </div>

          {/* Bottom Section - Property Status Overview */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${!isPropertyLive ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Property Status Overview */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Status Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Available Properties</span>
                    <span className="text-sm font-semibold">{properties.filter(p => p.status === 'approved' || p.status === 'active').length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: '#3CAF54', 
                        width: `${properties.length > 0 ? (properties.filter(p => p.status === 'approved' || p.status === 'active').length / properties.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Pending Approval</span>
                    <span className="text-sm font-semibold">
                      {properties.filter(p => p.status === 'pending').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-orange-500" 
                      style={{ 
                        width: `${properties.length > 0 ? (properties.filter(p => p.status === 'pending').length / properties.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Cancelled</span>
                    <span className="text-sm font-semibold">
                      {properties.filter(p => p.status === 'cancelled' || p.status === 'rejected').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-500" 
                      style={{ 
                        width: `${properties.length > 0 ? (properties.filter(p => p.status === 'cancelled' || p.status === 'rejected').length / properties.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Statistics Table */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Property</th>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Available</th>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Booked</th>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Out of Service</th>
                      <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          No properties found
                        </td>
                      </tr>
                    ) : (
                      properties.map((property) => (
                        <tr key={property.property_id} className="border-b">
                          <td className="py-2 px-4 text-sm">{property.property_name || 'Unnamed Property'}</td>
                          <td className="py-2 px-4 text-sm">{property.available_rooms || 0}</td>
                          <td className="py-2 px-4 text-sm">{property.booked_rooms || 0}</td>
                          <td className="py-2 px-4 text-sm">{property.out_of_service_rooms || 0}</td>
                          <td className="py-2 px-4 text-sm font-semibold">{property.number_of_rooms || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
