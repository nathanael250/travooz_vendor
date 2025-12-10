import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourPackagesAPI, bookingsAPI } from '../../../services/tourDashboardService';
import { 
  DollarSign, TrendingUp, Calendar, Plane, Info, ArrowRight, FileText, Globe, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import NoTourPackagesCard from '../../../components/tours/NoTourPackagesCard';
import useTranslation from '../../../hooks/useTranslation';

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

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [hasPackages, setHasPackages] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [setupProgress, setSetupProgress] = useState(null);
  const [tourPackages, setTourPackages] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedDate]);

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

      // Get business ID from localStorage or fetch it
      let businessId = localStorage.getItem('tour_business_id');
      if (!businessId) {
        try {
          const apiClient = (await import('../../../services/apiClient')).default;
          const response = await apiClient.get('/tours/businesses/my');
          const businesses = response.data?.data || response.data || [];
          if (businesses.length > 0) {
            businessId = (businesses[0].tour_business_id || businesses[0].tourBusinessId)?.toString();
            if (businessId) {
              localStorage.setItem('tour_business_id', businessId);
            }
          }
        } catch (error) {
          console.error('Error fetching business ID:', error);
        }
      }
      
      // Fetch packages for this business (include all statuses, not just 'active')
      let tourPackages = [];
      if (businessId) {
        try {
          const apiClient = (await import('../../../services/apiClient')).default;
          const response = await apiClient.get(`/tours/packages/business/${businessId}`);
          tourPackages = response.data?.data || response.data || [];
        } catch (error) {
          console.error('Error fetching packages:', error);
          // Fallback to old method
          tourPackages = await tourPackagesAPI.getAll();
        }
      } else {
        tourPackages = await tourPackagesAPI.getAll();
      }
      
      const packagesCount = tourPackages.length;
      setHasPackages(packagesCount > 0);
      setTourPackages(tourPackages);

      // Fetch business info and setup progress
      try {
        const apiClient = (await import('../../../services/apiClient')).default;
        const businessResponse = await apiClient.get('/tours/businesses/my');
        const businesses = businessResponse.data?.data || businessResponse.data || [];
        if (businesses.length > 0) {
          const business = businesses[0];
          setBusinessInfo(business);
          
          // Fetch setup progress
          const businessId = business.tour_business_id || business.tourBusinessId;
          if (businessId) {
            try {
              const progressResponse = await apiClient.get(`/tours/setup/progress?tourBusinessId=${businessId}`);
              setSetupProgress(progressResponse.data?.data || progressResponse.data);
            } catch (error) {
              console.error('Error fetching setup progress:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching business info:', error);
      }

      const bookingsResponse = await bookingsAPI.getAll();
      // Handle both direct array and wrapped response
      const allBookings = Array.isArray(bookingsResponse) 
        ? bookingsResponse 
        : (bookingsResponse?.data || bookingsResponse?.data?.data || []);
      const bookings = Array.isArray(allBookings) ? allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date);
        return bookingDate >= startDate && bookingDate <= endDate;
      }) : [];

      const todayBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at || b.booking_date);
        return bookingDate.toDateString() === today.toDateString();
      }) || [];

      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed') || [];
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);

      // Booking status overview
      const statusCounts = {
        confirmed: bookings?.filter((b) => b.status === 'confirmed' || b.status === 'completed').length || 0,
        pending: bookings?.filter((b) => b.status === 'pending' || b.status === 'pending_payment').length || 0,
        cancelled: bookings?.filter((b) => b.status === 'cancelled').length || 0,
      };
      setBookingStatusData([
        { name: 'Confirmed', value: statusCounts.confirmed, color: '#10b981' },
        { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
        { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' },
      ]);

      // Tour package statistics
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

      // Booking Type Chart Data - Last 7 days
      const bookingTypeMap = new Map();
      const chartStartDate = new Date();
      chartStartDate.setDate(chartStartDate.getDate() - 6);
      chartStartDate.setHours(0, 0, 0, 0);
      
      const chartEndDate = new Date();
      chartEndDate.setHours(23, 59, 59, 999);
      
      const chartBookings = Array.isArray(allBookings) ? allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date);
        return bookingDate >= chartStartDate && bookingDate <= chartEndDate;
      }) : [];
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // If no packages, show only the message
  if (!loading && !hasPackages) {
    return (
      <NoTourPackagesCard 
        onCreateClick={() => navigate('/tours/dashboard/packages')}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Date Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 sm:p-6 rounded-lg border border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.overview')}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('tours.dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
          >
            <option value="today">{t('common.dateRange.today')}</option>
            <option value="week">{t('common.dateRange.week')}</option>
            <option value="month">{t('common.dateRange.month')}</option>
            <option value="year">{t('common.dateRange.year')}</option>
            <option value="custom">{t('common.dateRange.custom')}</option>
          </select>
          {dateRange === 'custom' && (
            <input
              type="date"
              value={formatDateInput(selectedDate)}
              onChange={(e) => {
                setSelectedDate(new Date(e.target.value));
              }}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3CAF54]"
            />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t('tours.dashboard.totalRevenue')}</h3>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.totalRevenue.toLocaleString()} RWF</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('tours.dashboard.allRevenueGenerated')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t('tours.dashboard.todayBookings')}</h3>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats.todayBookings}</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('tours.dashboard.bookingsMadeToday')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t('tours.dashboard.totalBookings')}</h3>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.totalBookings}</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('tours.dashboard.allTotalBookings')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase">{t('tours.dashboard.tourPackages')}</h3>
            <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.activePackages}</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('tours.dashboard.activePackagesDesc')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Booking Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('tours.dashboard.bookingStatusOverview')}</h2>
          <div className="space-y-4">
            {bookingStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 rounded"
                    style={{
                      width: `${Math.max(20, (item.value / Math.max(...bookingStatusData.map(d => d.value), 1)) * 200)}px`,
                      backgroundColor: item.color
                    }}
                  />
                  <span className="text-sm font-bold w-12 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tour Package Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Tour Package Performance</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tourPackageStats.length > 0 ? (
              tourPackageStats.map((pkg, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{pkg.name}</span>
                    <span className="text-sm font-bold text-gray-700">{pkg.total}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-green-600">{pkg.confirmed} confirmed</span>
                    <span>•</span>
                    <span className="text-orange-600">{pkg.pending} pending</span>
                    {pkg.cancelled > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">{pkg.cancelled} cancelled</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No tour packages yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Finish creating your products */}
      {(() => {
        // Calculate package completion percentage
        // Note: This uses only fields available in the basic package response (not nested relations)
        const calculatePackageCompletion = (pkg) => {
          // Step 1: Basic Info - check main fields (locations are in separate table, so we check if name/category/description exist)
          const hasBasicInfo = (pkg.name || pkg.title) && pkg.category && (pkg.short_description || pkg.description || pkg.full_description);
          
          // Step 2: Inclusions - check whats_included or guide_type
          const hasInclusions = pkg.whats_included || pkg.guide_type;
          
          // Step 3: Extra Info - check know_before_you_go (not_suitable_for is in separate table)
          const hasExtraInfo = pkg.know_before_you_go;
          
          // Step 4: Photos - we can't check this from basic response, assume incomplete if no indication
          // We'll be lenient here and not require photos for completion calculation
          const hasPhotos = true; // Photos are in separate table, can't verify from basic response
          
          // Step 5: Options - check availability_type and pricing_type (pricing_tiers are in separate table)
          const hasOptions = pkg.availability_type && pkg.pricing_type && (pkg.min_price || pkg.price); // If pricing exists, tiers likely exist
          
          const completedSteps = [
            hasBasicInfo,
            hasInclusions,
            hasExtraInfo,
            hasPhotos,
            hasOptions
          ].filter(Boolean).length;
          
          return Math.round((completedSteps / 5) * 100);
        };

        // Format date as "Day, Month DD, YYYY"
        const formatDateLong = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        };

        // Get incomplete packages (less than 100% complete)
        const incompletePackages = tourPackages.filter(pkg => {
          const completion = calculatePackageCompletion(pkg);
          return completion < 100;
        });

        if (incompletePackages.length === 0) return null;

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Finish creating your products</h2>
            
            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Build customer trust and protect your business from copycats, enhancing authenticity and booking confidence.
                </p>
              </div>
              <button
                onClick={() => navigate('/tours/setup')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
              >
                Verify now
              </button>
            </div>

            {/* Product Progress Cards */}
            {incompletePackages.slice(0, 3).map((pkg) => {
              const packageId = pkg.id || pkg.package_id;
              const packageName = pkg.title || pkg.name || 'Unnamed Package';
              const completion = calculatePackageCompletion(pkg);
              const createdDate = pkg.created_at || pkg.createdAt;
              
              return (
                <div key={packageId} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{packageName}</h3>
                      {createdDate && (
                        <p className="text-sm text-gray-500 mb-3">
                          Started on {formatDateLong(createdDate)}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#3CAF54] h-2 rounded-full transition-all"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/tours/dashboard/packages/create/${packageId}?businessId=${localStorage.getItem('tour_business_id') || ''}`)}
                      className="ml-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* What's next? */}
      {(() => {
        // Check task completion status
        const tasks = [
          {
            id: 'verify-business',
            title: 'Verify your business details',
            description: 'Build customer trust and protect your business from copycats, enhancing authenticity and booking confidence',
            icon: FileText,
            completed: businessInfo?.status === 'approved' || setupProgress?.step_6_complete === true,
            route: '/tours/setup'
          },
          {
            id: 'enhance-brand',
            title: 'Enhance your brand image',
            description: 'Add your logo social links and other details to get your brand more recognisable',
            icon: Globe,
            completed: false, // TODO: Check if logo/social links are added
            route: '/tours/dashboard/settings'
          },
          {
            id: 'liability-insurance',
            title: 'Add liability insurance number',
            description: 'If your products qualify for insurance, adding the insurance number can boost trust among travelers',
            icon: Image,
            completed: false, // TODO: Check if insurance number is added
            route: '/tours/dashboard/settings'
          },
          {
            id: 'payment-tax',
            title: 'Add payment & tax details',
            description: 'Set up how and when you want to be paid',
            icon: DollarSign,
            completed: false, // TODO: Check if payment/tax details are set up
            route: '/tours/dashboard/settings'
          }
        ];

        const completedTasksCount = tasks.filter(t => t.completed).length;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">What's next?</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Finish these tasks to complete your business profile (and get paid for your bookings!)
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{completedTasksCount}</span>
                <span className="text-gray-600"> of {tasks.length}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(task.route)}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${task.completed ? 'bg-green-100' : 'bg-gray-100'} group-hover:bg-green-50 transition-colors`}>
                        <Icon className={`h-6 w-6 ${task.completed ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
                          {task.completed && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-4" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DashboardOverview;

