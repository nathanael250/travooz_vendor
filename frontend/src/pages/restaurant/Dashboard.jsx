import { useEffect, useState } from 'react';
import { restaurantsAPI, ordersAPI } from '../../services/restaurantDashboardService';
import { Store, DollarSign, TrendingUp, ShoppingBag, Calendar as CalendarIcon } from 'lucide-react';
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
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    totalOrders: 0,
    activeRestaurants: 0,
  });

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [restaurantStats, setRestaurantStats] = useState([]);
  const [orderTypeData, setOrderTypeData] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

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

      const restaurants = await restaurantsAPI.getAll('active');
      const restaurantsCount = restaurants.length;

      const allOrders = await ordersAPI.getAll();
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
        available: restaurantsCount || 0,
        occupied: orders?.filter((o) => o.status === 'confirmed' || o.status === 'pending').length || 0,
        unavailable: orders?.filter((o) => o.status === 'cancelled').length || 0,
      };
      setOrderStatusData([
        { name: 'Available Restaurants', value: statusCounts.available, color: '#10b981' },
        { name: 'Active Orders', value: statusCounts.occupied, color: '#f59e0b' },
        { name: 'Cancelled Orders', value: statusCounts.unavailable, color: '#ef4444' },
      ]);

      // Restaurant statistics
      const restaurantStatsData = [];
      for (const restaurant of restaurants) {
        const restaurantOrders = orders.filter(order => 
          order.restaurant_id === restaurant.id
        );
        
        const available = Math.max(0, restaurant.available_seats || 0);
        const sold = restaurantOrders?.filter((o) => o.status === 'completed').length || 0;
        const outOfService = restaurantOrders?.filter((o) => o.status === 'cancelled').length || 0;
        
        restaurantStatsData.push({
          type: restaurant.name,
          available,
          sold,
          outOfService,
          total: restaurant.capacity || 0,
        });
      }
      setRestaurantStats(restaurantStatsData);

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
        activeRestaurants: restaurantsCount || 0,
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
        activeRestaurants: 0,
      });
      setOrderStatusData([]);
      setRestaurantStats([]);
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

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
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
            <h3 className="text-xs font-medium text-gray-600">RESTAURANTS</h3>
            <Store className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-xl font-bold text-green-500">{stats.activeRestaurants}</div>
          <p className="text-xs text-gray-500 mt-1">Active Locations</p>
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
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Restaurant Statistics Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Restaurant Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Restaurant</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Available</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Sold</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Out of Service</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {restaurantStats.length > 0 ? (
                  restaurantStats.map((stat, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-2 text-xs font-medium text-gray-900">{stat.type}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">{stat.available}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">{stat.sold}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">{stat.outOfService}</td>
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

