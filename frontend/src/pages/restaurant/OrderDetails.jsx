import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI, deliveryBoysAPI } from "../../services/restaurantDashboardService";
import toast from "react-hot-toast";
import { ArrowLeft, User, Check, X, Calendar, Users, Clock } from "lucide-react";

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
    // Always fetch delivery boys on mount - we'll use them if needed
    fetchDeliveryBoys();
  }, [id]);

  useEffect(() => {
    // Re-fetch delivery boys when order is loaded and it's a delivery order
    if (order && order.order_type === 'delivery' && deliveryBoys.length === 0) {
      fetchDeliveryBoys();
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch order details (includes items)
      const orderData = await ordersAPI.getById(id);
      
      // Map backend response to frontend format
      const mappedOrder = {
        ...orderData,
        status: orderData.order_status || orderData.status,
        restaurant_name: orderData.restaurant_name || 'Restaurant',
        items: orderData.items || []
      };
      
      setOrder(mappedOrder);
      setOrderItems(mappedOrder.items || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await deliveryBoysAPI.getAll({ limit: 100 });
      console.log('Delivery boys API response:', response);
      
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
      } else if (response?.data && typeof response.data === 'object') {
        // Sometimes the data might be an object with a list property
        const dataKeys = Object.keys(response.data);
        if (dataKeys.length > 0 && Array.isArray(response.data[dataKeys[0]])) {
          boys = response.data[dataKeys[0]];
        }
      }
      
      console.log('Parsed delivery boys:', boys);
      console.log('Delivery boys count:', boys.length);
      if (boys.length > 0) {
        console.log('First delivery boy sample:', boys[0]);
      }
      
      setDeliveryBoys(boys);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      toast.error('Failed to fetch delivery boys');
      setDeliveryBoys([]);
    }
  };

  const handleAssignDeliveryBoy = async () => {
    if (!selectedDeliveryBoy || !order) return;

    setAssigning(true);
    try {
      // Update order status with delivery boy assignment
      await ordersAPI.updateStatus(order.id, 'out_for_delivery', selectedDeliveryBoy.id);
      toast.success('Delivery boy assigned successfully');
      setShowAssignModal(false);
      setSelectedDeliveryBoy(null);
      // Refresh delivery boys and order details
      await Promise.all([fetchDeliveryBoys(), fetchOrderDetails()]);
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
      toast.error('Failed to assign delivery boy');
    } finally {
      setAssigning(false);
    }
  };

  // Memoize delivery boy name lookup to ensure it updates when deliveryBoys changes
  const deliveryBoyName = useMemo(() => {
    if (!order?.delivery_boy_id || !deliveryBoys.length) {
      return null;
    }
    
    const deliveryBoyId = order.delivery_boy_id;
    
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
      // Try multiple field names for the name
      const name = (boy.name && boy.name.trim()) || 
                   (boy.delivery_boy_name && boy.delivery_boy_name.trim()) || 
                   (boy.username && boy.username.trim()) || 
                   (boy.full_name && boy.full_name.trim()) ||
                   (boy.delivery_name && boy.delivery_name.trim()) ||
                   (boy.first_name && boy.last_name ? `${boy.first_name} ${boy.last_name}`.trim() : null) ||
                   (boy.email && boy.email.includes('@') ? boy.email.split('@')[0] : null) || // Use email username as fallback
                   `Delivery Boy ${boy.id}`; // Final fallback
      
      console.log('Resolved delivery boy name:', { 
        id: boy.id, 
        originalName: boy.name,
        resolvedName: name,
        searchedId: deliveryBoyId,
        email: boy.email,
        mobile: boy.mobile
      });
      
      return name;
    }
    
    console.log('Delivery boy not found', { 
      searchedId: deliveryBoyId, 
      searchedIdType: typeof deliveryBoyId,
      availableIds: deliveryBoys.map(b => b.id)
    });
    return null;
  }, [order?.delivery_boy_id, deliveryBoys]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "confirmed":
      case "preparing":
      case "ready":
      case "out_for_delivery":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const generateOrderCode = (id, createdAt) => {
    const timestamp = new Date(createdAt).getTime().toString().slice(-6);
    return id.slice(-6) + timestamp.slice(-3);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 space-y-4">
        <button
          onClick={() => navigate("/restaurant/orders")}
          className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-gray-900">Order not found</p>
            <p className="text-gray-600">The order you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = orderItems.reduce((sum, item) => {
    const price = parseFloat(item.unit_price || item.price || 0);
    const qty = parseInt(item.quantity || 0);
    return sum + (price * qty);
  }, 0);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/restaurant/orders")}
            className="mb-2 px-3 py-1 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <span>Dashboard</span>
              <span>/</span>
              <span>Orders</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Details</span>
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs border rounded-md ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
        </span>
      </div>

      {/* Order Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-l-4 border-l-blue-500 border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Order Code</p>
          <p className="text-sm font-bold text-gray-900">{generateOrderCode(order.id, order.created_at)}</p>
        </div>

        <div className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Restaurant</p>
          <p className="text-sm font-bold text-gray-900 truncate">{order.restaurant_name}</p>
        </div>

        <div className="bg-white rounded-lg border-l-4 border-l-purple-500 border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Order Date</p>
          <p className="text-xs font-bold text-gray-900">{formatDate(order.created_at)}</p>
        </div>

        <div className="bg-white rounded-lg border-l-4 border-l-orange-500 border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Amount</p>
          <p className="text-sm font-bold text-green-600">RWF {parseFloat(order.total_amount || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            {orderItems.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Item</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => {
                    const unitPrice = parseFloat(item.unit_price || item.price || 0);
                    const quantity = parseInt(item.quantity || 0);
                    const itemTotal = unitPrice * quantity;
                    return (
                      <tr key={item.id || index} className={index !== orderItems.length - 1 ? "border-b border-gray-100" : ""}>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{item.item_name || 'Menu Item'}</p>
                            {item.addons && Array.isArray(item.addons) && item.addons.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">Addons: {item.addons.length}</p>
                            )}
                            {item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0 && (
                              <p className="text-xs text-gray-500">Customizations: {item.customizations.length}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-sm">{quantity}</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="text-gray-600 text-sm">RWF {unitPrice.toLocaleString()}</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="font-semibold text-sm text-gray-900">RWF {itemTotal.toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold">RWF {subtotal.toLocaleString()}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">Delivery Fee</span>
                  <span className="text-sm font-semibold">RWF {parseFloat(order.delivery_fee || 0).toLocaleString()}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">Tax</span>
                  <span className="text-sm font-semibold">RWF {parseFloat(order.tax_amount || 0).toLocaleString()}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">Discount</span>
                  <span className="text-sm font-semibold text-red-600">-RWF {parseFloat(order.discount_amount || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-green-600">RWF {parseFloat(order.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Order Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600">Order Type</p>
                <p className="text-sm font-semibold mt-1 capitalize">
                  {order.order_type?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>

                {order.customer_name && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Customer Name</p>
                  <p className="text-sm font-semibold mt-1">{order.customer_name}</p>
                  </div>
                )}

                {order.customer_phone && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Phone Number</p>
                  <p className="text-sm font-semibold mt-1">{order.customer_phone}</p>
                </div>
              )}

              {order.customer_email && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Email</p>
                  <p className="text-sm font-semibold mt-1">{order.customer_email}</p>
                </div>
              )}

              {(order.order_type === "dine_in" || order.order_type === "dine-in") && (
                <>
                  {order.table_booking && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-900">Table Reservation</p>
                      </div>
                      
                      {order.table_booking.booking_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-700">Booking Date</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {new Date(order.table_booking.booking_date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {order.table_booking.booking_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-700">Booking Time</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {order.table_booking.booking_time}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {order.table_booking.number_of_guests && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-700">Number of Guests</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {order.table_booking.number_of_guests} {order.table_booking.number_of_guests === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {order.restaurant_capacity && (
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-xs text-blue-700">
                            Restaurant Capacity: <span className="font-semibold">{order.restaurant_capacity} seats</span>
                          </p>
                        </div>
                      )}
                      
                      {order.table_booking.special_requests && (
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Special Requests</p>
                          <p className="text-sm text-blue-900 italic">{order.table_booking.special_requests}</p>
                        </div>
                      )}
                      
                      {order.table_booking.status && (
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Booking Status</p>
                          <span className={`px-2 py-1 text-xs rounded-md ${
                            order.table_booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-300' :
                            order.table_booking.status === 'seated' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                            order.table_booking.status === 'completed' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                            'bg-orange-100 text-orange-700 border border-orange-300'
                          }`}>
                            {order.table_booking.status.charAt(0).toUpperCase() + order.table_booking.status.slice(1)}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                  {!order.table_booking && order.number_of_guests && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Number of Guests</p>
                      <p className="text-sm font-semibold mt-1">{order.number_of_guests} {order.number_of_guests === 1 ? 'person' : 'people'}</p>
                    </div>
                  )}
                </>
              )}

              {order.delivery_address && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Delivery Address</p>
                  <p className="text-sm font-semibold mt-1">{order.delivery_address}</p>
                </div>
              )}

              {order.order_type === 'delivery' && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 mb-1">Delivery Boy</p>
                      {order.delivery_boy_id ? (
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {deliveryBoyName || `ID: ${order.delivery_boy_id}`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic mt-1">Not assigned</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="ml-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md flex items-center gap-1"
                    >
                      <User className="w-3 h-3" />
                      {order.delivery_boy_id ? 'Change' : 'Assign'}
                    </button>
                  </div>
                  </div>
                )}

              {order.special_instructions && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Special Instructions</p>
                  <p className="text-sm font-semibold mt-1">{order.special_instructions}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-600">Order Date & Time</p>
                <p className="text-sm font-semibold mt-1">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Delivery Boy Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Delivery Boy</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDeliveryBoy(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Boy
              </label>
              <select
                value={selectedDeliveryBoy?.id || ''}
                onChange={(e) => {
                  const boy = deliveryBoys.find(b => b.id === parseInt(e.target.value) || b.id === e.target.value);
                  setSelectedDeliveryBoy(boy || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a delivery boy...</option>
                {deliveryBoys.map((boy) => (
                  <option key={boy.id} value={boy.id}>
                    {boy.name} {boy.mobile ? `(${boy.mobile})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDeliveryBoy(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDeliveryBoy}
                disabled={!selectedDeliveryBoy || assigning}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
