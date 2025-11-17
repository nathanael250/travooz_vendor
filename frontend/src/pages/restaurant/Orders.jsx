import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, restaurantsAPI, deliveryBoysAPI } from '../../services/restaurantDashboardService';
import { Search, Download, X, Eye, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrderType, setFilterOrderType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
      // Refresh delivery boys periodically in case new ones are added
      fetchDeliveryBoys();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedStatus, startDate, endDate]);

  // Re-map orders when delivery boys are loaded/updated
  useEffect(() => {
    if (orders.length > 0 && deliveryBoys.length > 0) {
      // Re-map orders to update delivery boy names
      const updatedOrders = orders.map(order => {
        const deliveryBoyName = order.delivery_boy_id 
          ? getDeliveryBoyName(order.delivery_boy_id) 
          : null;
        
        return {
          ...order,
          delivery_person: deliveryBoyName || null
        };
      });
      
      // Only update if something changed
      const hasChanges = updatedOrders.some((updatedOrder, index) => 
        updatedOrder.delivery_person !== orders[index].delivery_person
      );
      
      if (hasChanges) {
        setOrders(updatedOrders);
      }
    }
  }, [deliveryBoys]);

  const fetchDeliveryBoys = async () => {
    try {
      const response = await deliveryBoysAPI.getAll({ limit: 100 });
      // Handle different response formats from external API
      let boys = [];
      if (Array.isArray(response)) {
        boys = response;
      } else if (response?.data && Array.isArray(response.data)) {
        boys = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        boys = response.data.data;
      } else if (response?.success && Array.isArray(response.data)) {
        boys = response.data;
      }
      setDeliveryBoys(boys);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      // Don't show error toast, just log it - delivery boys are optional
    }
  };

  const getDeliveryBoyName = (deliveryBoyId) => {
    if (!deliveryBoyId || !deliveryBoys.length) return null;
    
    // Try multiple matching strategies
    const boy = deliveryBoys.find(b => {
      // Direct match
      if (b.id === deliveryBoyId) return true;
      // String comparison
      if (String(b.id) === String(deliveryBoyId)) return true;
      // Number comparison
      if (Number(b.id) === Number(deliveryBoyId)) return true;
      // Try parsing both as numbers
      const bIdNum = parseInt(b.id);
      const deliveryIdNum = parseInt(deliveryBoyId);
      if (!isNaN(bIdNum) && !isNaN(deliveryIdNum) && bIdNum === deliveryIdNum) return true;
      return false;
    });
    
    if (boy) {
      // Try multiple field names for the name, with proper empty string handling
      const name = (boy.name && boy.name.trim()) || 
                   (boy.delivery_boy_name && boy.delivery_boy_name.trim()) || 
                   (boy.username && boy.username.trim()) || 
                   (boy.full_name && boy.full_name.trim()) ||
                   (boy.delivery_name && boy.delivery_name.trim()) ||
                   (boy.first_name && boy.last_name ? `${boy.first_name} ${boy.last_name}`.trim() : null) ||
                   (boy.email && boy.email.includes('@') ? boy.email.split('@')[0] : null) || // Use email username as fallback
                   `Delivery Boy ${boy.id}`; // Final fallback
      
      return name;
    }
    
    return null;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Get vendor's restaurant (single restaurant per vendor)
      const myRestaurant = await restaurantsAPI.getMyRestaurant();
      
      if (!myRestaurant) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const restaurantId = myRestaurant.id;

      // Map status for backend: 'ongoing' means pending or confirmed, 'completed' means completed
      let statusFilter = null;
      if (selectedStatus === 'ongoing') {
        // For ongoing, we'll filter in frontend since backend doesn't support OR conditions
        statusFilter = null; // Get all and filter client-side
      } else if (selectedStatus === 'completed') {
        statusFilter = 'completed';
      }

      const ordersData = await ordersAPI.getAll(restaurantId, {
        status: statusFilter,
        startDate,
        endDate
      });

      // Map backend response fields to frontend format
      const mappedOrders = ordersData.map(order => {
        // Get delivery boy name if delivery_boy_id exists
        const deliveryBoyName = order.delivery_boy_id 
          ? getDeliveryBoyName(order.delivery_boy_id) 
          : null;

        return {
          ...order,
          status: order.order_status || order.status, // Map order_status to status
          order_type: order.order_type || 'dine_in', // Ensure order_type exists
          items_count: order.items?.length || 0,
          delivery_person: deliveryBoyName || null, // Map delivery_boy_id to delivery_person name
          delivery_boy_id: order.delivery_boy_id || null // Keep the ID for reference
        };
      });

      const sorted = mappedOrders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderCode = (id, createdAt) => {
    const timestamp = new Date(createdAt).getTime().toString().slice(-6);
    return id.slice(-6) + timestamp.slice(-3);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = 
      (selectedStatus === 'ongoing' && (order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'out_for_delivery')) ||
      (selectedStatus === 'completed' && (order.status === 'completed' || order.status === 'delivered'));
    
    const matchesSearch = searchQuery === '' || 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      generateOrderCode(order.id, order.created_at).toLowerCase().includes(searchQuery.toLowerCase());

    // Map order_type: backend uses 'dine_in', frontend filter uses 'dine-in'
    const normalizedOrderType = order.order_type?.replace('_', '-') || order.order_type;
    const matchesOrderType = filterOrderType === 'all' || normalizedOrderType === filterOrderType;

    const matchesDateRange = (!startDate && !endDate) || (() => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        return orderDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      }
      return true;
    })();

    return matchesStatus && matchesSearch && matchesOrderType && matchesDateRange;
  });

  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? filteredOrders.length : startIndex + itemsPerPage;
  const paginatedOrders = itemsPerPage === 'all' ? filteredOrders : filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery, filterOrderType, startDate, endDate]);

  const handleExport = () => {
    const csvContent = [
      ['Code', 'Order Type', 'Total', 'Total Paid', 'Status', 'Items'].join(','),
      ...filteredOrders.map(order => [
        generateOrderCode(order.id, order.created_at),
        order.order_type === 'dine-in' ? 'Dine-In' : order.order_type === 'delivery' ? 'Delivery' : order.order_type || 'N/A',
        order.total_amount,
        order.total_amount,
        order.status,
        order.items_count || 0,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    link.setAttribute('download', `orders_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported successfully');
  };

  const handleViewDetails = (order) => {
    navigate(`/restaurant/orders/${order.id}`);
  };

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Orders Placed</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">Dashboard &gt; All Orders</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setSelectedStatus('ongoing')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedStatus === 'ongoing'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            On Going Orders
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedStatus === 'completed'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed Orders
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-600 whitespace-nowrap">Order Type:</label>
            <select
              value={filterOrderType}
              onChange={(e) => setFilterOrderType(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="dine-in">Dine-In</option>
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-600 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {startDate && (
              <button
                onClick={() => setStartDate('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-600 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {endDate && (
              <button
                onClick={() => setEndDate('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {(filterOrderType !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setFilterOrderType('all');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full md:w-auto px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="h-3 w-3 inline mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
        </div>
        
        {paginatedOrders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Order Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Delivery Person</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Total Paid</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-green-600 hover:text-green-700 hover:underline font-medium"
                        >
                          {generateOrderCode(order.id, order.created_at)}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs border border-gray-300 rounded-md">
                          {order.order_type === 'dine_in' || order.order_type === 'dine-in' ? 'Dine-In' : 
                           order.order_type === 'delivery' ? 'Delivery' : 
                           order.order_type === 'pickup' ? 'Pickup' :
                           order.order_type?.charAt(0).toUpperCase() + order.order_type?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {order.order_type === 'delivery' ? (
                          order.delivery_person ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-md font-medium">
                              {order.delivery_person}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded-md italic">
                              Not assigned
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">---------</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {order.total_amount?.toLocaleString()} RWF
                      </td>
                      <td className="py-3 px-4 text-sm text-green-700 font-medium">
                        {order.total_amount?.toLocaleString()} RWF
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs border rounded-md ${getStatusColor(order.status)}`}>
                          {order.status === 'completed' && '✓ '}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {order.items_count || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {/* Resume button removed - POS is disabled for online-only orders */}
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="px-2 py-1 text-gray-600 hover:text-gray-900 text-xs rounded-md hover:bg-gray-100 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      {generateOrderCode(order.id, order.created_at)}
                    </button>
                    <span className={`px-2 py-1 text-xs border rounded-md ${getStatusColor(order.status)}`}>
                      {order.status === 'completed' && '✓ '}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Order Type and Delivery Person */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50">
                      {order.order_type === 'dine_in' || order.order_type === 'dine-in' ? 'Dine-In' : 
                       order.order_type === 'delivery' ? 'Delivery' : 
                       order.order_type === 'pickup' ? 'Pickup' :
                       order.order_type?.charAt(0).toUpperCase() + order.order_type?.slice(1) || 'N/A'}
                    </span>
                    {order.order_type === 'delivery' && (
                      order.delivery_person ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-md font-medium text-xs">
                          {order.delivery_person}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded-md italic text-xs">
                          Not assigned
                        </span>
                      )
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Items</p>
                      <p className="font-medium text-gray-900">{order.items_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Total</p>
                      <p className="font-medium text-gray-900">{order.total_amount?.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Paid</p>
                      <p className="font-medium text-green-700">{order.total_amount?.toLocaleString()} RWF</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {/* Resume button removed - POS is disabled for online-only orders */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? 'No orders found matching your filters'
                : 'No orders yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 md:p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <label className="text-xs text-gray-600 whitespace-nowrap">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setItemsPerPage('all');
                  } else {
                    setItemsPerPage(Number(e.target.value));
                  }
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
            </div>
            {itemsPerPage !== 'all' && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs md:text-sm text-gray-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

