import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  MapPin, 
  Clock, 
  Users,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Home,
  UtensilsCrossed
} from 'lucide-react';
import clientRestaurantService from '../../services/clientRestaurantService';
import toast from 'react-hot-toast';

const OrderFood = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'dine_in'
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Delivery information
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    latitude: null,
    longitude: null
  });
  
  // Dine-in / Table booking information
  const [tableBookingInfo, setTableBookingInfo] = useState({
    booking_date: '',
    booking_time: '',
    number_of_guests: 1,
    special_requests: ''
  });
  const [tableAvailability, setTableAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Order submission
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
    // Check table availability when dine-in info changes
    if (orderType === 'dine_in' && tableBookingInfo.booking_date && tableBookingInfo.booking_time && tableBookingInfo.number_of_guests) {
      checkAvailability();
    }
  }, [orderType, tableBookingInfo.booking_date, tableBookingInfo.booking_time, tableBookingInfo.number_of_guests]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [restaurantData, menuData, categoriesData] = await Promise.all([
        clientRestaurantService.getRestaurantById(restaurantId),
        clientRestaurantService.getMenuItems(restaurantId),
        clientRestaurantService.getMenuCategories(restaurantId)
      ]);
      
      setRestaurant(restaurantData.data || restaurantData);
      setMenuItems(menuData.data || menuData);
      setCategories(categoriesData.data || categoriesData);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!tableBookingInfo.booking_date || !tableBookingInfo.booking_time) return;
    
    try {
      setCheckingAvailability(true);
      const response = await clientRestaurantService.checkTableAvailability(
        restaurantId,
        tableBookingInfo.booking_date,
        tableBookingInfo.booking_time,
        tableBookingInfo.number_of_guests
      );
      setTableAvailability(response.data || response);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check table availability');
      setTableAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menu_item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        item_name: item.name,
        quantity: 1,
        unit_price: parseFloat(item.price) || 0,
        addons: [],
        customizations: []
      }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateCartQuantity = (menuItemId, delta) => {
    setCart(cart.map(item => {
      if (item.menu_item_id === menuItemId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter(item => item.menu_item_id !== menuItemId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === selectedCategory || item.category === selectedCategory);

  const handleSubmitOrder = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please provide your name and phone number');
      return;
    }

    // Validate order type specific requirements
    if (orderType === 'delivery' && !deliveryInfo.address) {
      toast.error('Please provide delivery address');
      return;
    }

    if (orderType === 'dine_in') {
      if (!tableBookingInfo.booking_date || !tableBookingInfo.booking_time) {
        toast.error('Please select booking date and time');
        return;
      }
      if (!tableAvailability || !tableAvailability.available) {
        toast.error('Selected time is not available. Please choose another time.');
        return;
      }
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setSubmittingOrder(true);
      
      const orderData = {
        restaurant_id: restaurantId,
        order_type: orderType,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          addons: item.addons || [],
          customizations: item.customizations || []
        })),
        ...(orderType === 'delivery' && {
          delivery_address: deliveryInfo.address,
          delivery_latitude: deliveryInfo.latitude,
          delivery_longitude: deliveryInfo.longitude,
          delivery_fee: 0 // Can be calculated based on distance
        }),
        ...(orderType === 'dine_in' && {
          booking_date: tableBookingInfo.booking_date,
          booking_time: tableBookingInfo.booking_time,
          number_of_guests: tableBookingInfo.number_of_guests,
          table_booking_special_requests: tableBookingInfo.special_requests || null
        }),
        tax_amount: 0,
        discount_amount: 0,
        payment_method: 'cash', // Default, can be made configurable
        special_instructions: ''
      };

      const response = await clientRestaurantService.createOrder(orderData);
      
      toast.success('Order placed successfully!');
      
      // Reset cart and navigate
      setCart([]);
      setShowCheckout(false);
      
      // Optionally navigate to order confirmation page
      // navigate(`/orders/${response.data.id}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Restaurant not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{restaurant.name || 'Restaurant'}</h1>
              {typeof restaurant.is_open !== 'undefined' && (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${restaurant.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {restaurant.is_open ? 'Open now' : 'Closed'}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="relative flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No menu items available</p>
                </div>
              ) : (
                filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0].image_url || item.images[0].url}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green-600">
                          {parseFloat(item.price || 0).toLocaleString()} RWF
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          {cart.length > 0 && !showCheckout && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Your Order</h2>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.menu_item_id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.item_name}</p>
                        <p className="text-xs text-gray-500">
                          {parseFloat(item.unit_price || 0).toLocaleString()} RWF × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.menu_item_id, -1)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.menu_item_id, 1)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.menu_item_id)}
                          className="p-1 text-red-600 hover:text-red-800 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Total:</span>
                    <span className="text-green-600">{getCartTotal().toLocaleString()} RWF</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Order Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                      orderType === 'delivery'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Delivery</p>
                      <p className="text-xs text-gray-500">Get it delivered</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setOrderType('dine_in')}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                      orderType === 'dine_in'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <UtensilsCrossed className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Dine-In</p>
                      <p className="text-xs text-gray-500">Book a table</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Your Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+250 788 123 456"
                  />
                </div>
              </div>

              {/* Delivery Information */}
              {orderType === 'delivery' && (
                <div className="mb-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      placeholder="Enter your delivery address"
                    />
                  </div>
                </div>
              )}

              {/* Dine-In / Table Booking Information */}
              {orderType === 'dine_in' && (
                <div className="mb-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Table Booking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={tableBookingInfo.booking_date}
                        onChange={(e) => setTableBookingInfo({ ...tableBookingInfo, booking_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                      <input
                        type="time"
                        value={tableBookingInfo.booking_time}
                        onChange={(e) => setTableBookingInfo({ ...tableBookingInfo, booking_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
                    <input
                      type="number"
                      min="1"
                      max={restaurant.capacity || 50}
                      value={tableBookingInfo.number_of_guests}
                      onChange={(e) => setTableBookingInfo({ ...tableBookingInfo, number_of_guests: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {restaurant.capacity && (
                      <p className="text-xs text-gray-500 mt-1">
                        Restaurant capacity: {restaurant.capacity} seats
                      </p>
                    )}
                  </div>
                  
                  {/* Availability Status */}
                  {checkingAvailability && (
                    <div className="text-sm text-gray-600">Checking availability...</div>
                  )}
                  {tableAvailability && !checkingAvailability && (
                    <div className={`p-3 rounded-lg ${
                      tableAvailability.available
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {tableAvailability.available ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Table available! {tableAvailability.available_capacity} seats available.</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">Not available</p>
                          <p className="text-sm">Please choose another date or time.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                    <textarea
                      value={tableBookingInfo.special_requests}
                      onChange={(e) => setTableBookingInfo({ ...tableBookingInfo, special_requests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows="2"
                      placeholder="Any special requests or preferences?"
                    />
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="mb-6 border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {cart.map(item => (
                    <div key={item.menu_item_id} className="flex justify-between text-sm">
                      <span>{item.item_name} × {item.quantity}</span>
                      <span>{(item.unit_price * item.quantity).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{getCartTotal().toLocaleString()} RWF</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submittingOrder || (orderType === 'dine_in' && (!tableAvailability || !tableAvailability.available))}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submittingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFood;

