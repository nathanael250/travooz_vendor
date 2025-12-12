import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI, ordersAPI } from '../../services/restaurantDashboardService';
import { Store, DollarSign, TrendingUp, ShoppingBag, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    totalOrders: 0,
  });

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [orderTypeData, setOrderTypeData] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedDate]);

  // Check restaurant approval status on mount
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const myRestaurant = await restaurantsAPI.getMyRestaurant();
        
        // If restaurant is null and we have restaurant_id in session, it was deleted
        // getMyRestaurant will handle the logout
        if (myRestaurant === null && localStorage.getItem('restaurant_id')) {
          console.log('⚠️ Restaurant was deleted - logout handled by getMyRestaurant');
          return;
        }
        
        if (myRestaurant) {
          const restaurantStatus = myRestaurant.status || myRestaurant.data?.status;
          // Normalize status to lowercase for comparison
          const normalizedStatus = restaurantStatus ? String(restaurantStatus).toLowerCase() : null;
          
          console.log('🔍 Dashboard - Restaurant status check:', {
            status: restaurantStatus,
            normalized: normalizedStatus,
            restaurant: myRestaurant
          });
          
          // If restaurant is not approved, redirect to waiting page
          if (normalizedStatus && normalizedStatus !== 'approved' && normalizedStatus !== 'active') {
            console.log('⏳ Restaurant not approved yet (status:', normalizedStatus, '), redirecting to waiting page');
            navigate('/restaurant/setup/complete', { replace: true });
            return;
          } else if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
            console.log('✅ Restaurant is approved, showing dashboard');
          }
        }
      } catch (error) {
        // Check if it's a restaurant not found error
        const { isRestaurantNotFoundError } = await import('../../utils/restaurantAuth');
        if (isRestaurantNotFoundError(error)) {
          console.log('⚠️ Restaurant not found error - logout handled');
          return;
        }
        console.error('Error checking restaurant approval status:', error);
        // Continue - might be in setup process
      }
    };

    checkApprovalStatus();
  }, [navigate]);

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

      // Get vendor's restaurant (one restaurant per vendor)
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      
      // If restaurant is null and we have restaurant_id in session, it was deleted
      if (myRestaurant === null && localStorage.getItem('restaurant_id')) {
        console.log('⚠️ Restaurant was deleted during data fetch - logout handled');
        return;
      }
      
      // Check status before setting restaurant
      if (!myRestaurant) {
        // No restaurant found and no restaurant_id in session - might be new user
        setRestaurant(null);
        setLoading(false);
        return;
      }
      
      if (myRestaurant) {
        const restaurantStatus = myRestaurant.status || myRestaurant.data?.status;
        // Normalize status to lowercase for comparison
        const normalizedStatus = restaurantStatus ? String(restaurantStatus).toLowerCase() : null;
        
        console.log('🔍 fetchDashboardData - Restaurant status:', {
          status: restaurantStatus,
          normalized: normalizedStatus
        });
        
        // If restaurant is not approved, redirect to waiting page
        if (normalizedStatus && normalizedStatus !== 'approved' && normalizedStatus !== 'active') {
          console.log('⏳ Restaurant not approved yet (status:', normalizedStatus, '), redirecting to waiting page');
          navigate('/restaurant/setup/complete', { replace: true });
          return;
        } else if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          console.log('✅ Restaurant is approved, loading dashboard data');
        }
      }
      
      setRestaurant(myRestaurant);

      if (!myRestaurant) {
        // Don't show error toast - just show empty state
        // The user might be in the middle of setup
        setLoading(false);
        return;
      }

      // Get orders for vendor's restaurant
      const allOrders = await ordersAPI.getAll(myRestaurant.id);
      const orders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });

      const todayOrders = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === today.toDateString();
      }) || [];

      const completedOrders = orders?.filter(o => o.status === 'completed') || [];
      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

      // Order status overview
      const statusCounts = {
        completed: orders?.filter((o) => o.status === 'completed').length || 0,
        active: orders?.filter((o) => o.status === 'confirmed' || o.status === 'pending').length || 0,
        cancelled: orders?.filter((o) => o.status === 'cancelled').length || 0,
      };
      setOrderStatusData([
        { name: 'Completed Orders', value: statusCounts.completed, color: '#10b981' },
        { name: 'Active Orders', value: statusCounts.active, color: '#f59e0b' },
        { name: 'Cancelled Orders', value: statusCounts.cancelled, color: '#ef4444' },
      ]);

      // Order Type Chart Data - Last 7 days
      const orderTypeMap = new Map();
      const chartStartDate = new Date();
      chartStartDate.setDate(chartStartDate.getDate() - 6);
      chartStartDate.setHours(0, 0, 0, 0);
      
      const chartEndDate = new Date();
      chartEndDate.setHours(23, 59, 59, 999);
      
      const chartOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= chartStartDate && orderDate <= chartEndDate;
      });
      
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayKey = formatDate(date);
        days.push(dayKey);
        orderTypeMap.set(dayKey, { 'Dine-In': 0, 'Delivery': 0 });
      }
      
      chartOrders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dayKey = formatDate(orderDate);
        const orderType = order.order_type?.toLowerCase() || '';
        
        if (orderTypeMap.has(dayKey)) {
          const counts = orderTypeMap.get(dayKey);
          if (orderType === 'dine-in') {
            counts['Dine-In']++;
          } else if (orderType === 'delivery') {
            counts['Delivery']++;
          }
        }
      });
      
      const orderTypeChartData = days.map(day => ({
        month: day,
        'Dine-In': orderTypeMap.get(day)?.['Dine-In'] || 0,
        'Delivery': orderTypeMap.get(day)?.['Delivery'] || 0,
      }));
      
      setOrderTypeData(orderTypeChartData);

      setStats({
        totalRevenue,
        todayOrders: todayOrders.length,
        totalOrders: orders?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch dashboard data';
      toast.error(errorMessage);
      // Set empty data on error to prevent UI issues
      setStats({
        totalRevenue: 0,
        todayOrders: 0,
        totalOrders: 0,
      });
      setOrderStatusData([]);
      setOrderTypeData([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Show message if no restaurant found (might be in setup process)
  if (!restaurant) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Found</h2>
          <p className="text-gray-600 mb-6">
            Please complete your restaurant setup to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Waiting for Approval Banner */}
      {restaurant && restaurant.status && restaurant.status !== 'approved' && restaurant.status !== 'active' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-1.5 sm:mb-2">
                Waiting for Approval
              </h3>
              <p className="text-sm sm:text-base text-blue-800 mb-2 sm:mb-3">
                Your restaurant is currently under review by our team.
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                This process typically takes 24-48 hours. You'll be notified once your restaurant is approved and goes live.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          {restaurant && (
            <p className="text-sm text-gray-600 mt-1">My Restaurant: {restaurant.name}</p>
          )}
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
          <div className="text-xl font-bold text-green-500">{stats.totalRevenue.toLocaleString()} FRW</div>
          <p className="text-xs text-gray-500 mt-1">All The Revenue Generated</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TODAY BOOKING</h3>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-orange-500">{stats.todayOrders}</div>
          <p className="text-xs text-gray-500 mt-1">All Bookings Made</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">TOTAL ORDERS</h3>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-500">{stats.totalOrders}</div>
          <p className="text-xs text-gray-500 mt-1">All Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">MY RESTAURANT</h3>
            <Store className={`h-4 w-4 ${
              (restaurant?.status === 'approved' || restaurant?.status === 'active') ? 'text-green-500' : 
              restaurant?.status === 'pending' ? 'text-blue-500' : 
              'text-gray-500'
            }`} />
          </div>
          <div className={`text-xl font-bold ${
            (restaurant?.status === 'approved' || restaurant?.status === 'active') ? 'text-green-500' : 
            restaurant?.status === 'pending' ? 'text-blue-500' : 
            'text-gray-500'
          }`}>
            {(restaurant?.status === 'approved' || restaurant?.status === 'active') ? 'Approved' : 
             restaurant?.status === 'pending' ? 'Pending' : 
             restaurant ? 'Inactive' : 'Not Set'}
          </div>
          <p className="text-xs text-gray-500 mt-1">{restaurant?.name || 'Complete setup to get started'}</p>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Status Overview</h2>
        <div className="space-y-3">
          {orderStatusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{item.name}</span>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 rounded"
                  style={{
                    width: `${Math.max(15, (item.value / Math.max(...orderStatusData.map(d => d.value), 1)) * 150)}px`,
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
      <div className="grid gap-3 lg:grid-cols-1">
        {/* Order Type Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Type (Last 7 Days)</h2>
          <div className="space-y-2">
            {orderTypeData.map((day, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">{day.month}</span>
                <div className="flex-1 flex gap-1">
                  <div
                    className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                    style={{ width: `${(day['Dine-In'] / Math.max(...orderTypeData.map(d => Math.max(d['Dine-In'], d['Delivery'])), 1)) * 100}%` }}
                  >
                    {day['Dine-In'] > 0 && day['Dine-In']}
                  </div>
                  <div
                    className="bg-purple-500 text-white text-xs px-2 py-1 rounded"
                    style={{ width: `${(day['Delivery'] / Math.max(...orderTypeData.map(d => Math.max(d['Dine-In'], d['Delivery'])), 1)) * 100}%` }}
                  >
                    {day['Delivery'] > 0 && day['Delivery']}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Dine-In</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

