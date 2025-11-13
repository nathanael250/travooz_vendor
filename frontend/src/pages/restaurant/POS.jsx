import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { restaurantsAPI, menuItemsAPI, ordersAPI } from '../../services/restaurantDashboardService';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Search,
  Store,
  Users,
  CreditCard,
  X
} from "lucide-react";
const POS = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [customerCount, setCustomerCount] = useState(1);
  const [customerLocation, setCustomerLocation] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);
  const [showHoldOrderDialog, setShowHoldOrderDialog] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchDeliveryPersons();
  }, []);

  const fetchDeliveryPersons = async () => {
    try {
      // TODO: Implement delivery persons API
      setDeliveryPersons([]);
    } catch (error) {
      console.error('Failed to fetch delivery persons:', error);
      setDeliveryPersons([]);
    }
  };

  useEffect(() => {
    const resumeOrderId = searchParams.get("resume");
    if (resumeOrderId) {
      loadOrderForResume(resumeOrderId);
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems(menuItems);
    }
  }, [searchQuery, menuItems]);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantsAPI.getAll("active");
      const restaurantsData = data.map(r => ({
        id: r.id,
        name: r.name,
        available_seats: r.available_seats
      }));
    setRestaurants(restaurantsData);
    
    if (restaurantsData.length === 1) {
      setSelectedRestaurant(restaurantsData[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch restaurants");
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const data = await menuItemsAPI.getAll(restaurantId, true);
    setMenuItems(data || []);
    setFilteredMenuItems(data || []);
    } catch (error) {
      toast.error("Failed to fetch menu items");
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const loadOrderForResume = async (orderId) => {
    setLoading(true);
    try {
      const order = await ordersAPI.getById(orderId);

      if (order.status !== "pending") {
        throw new Error("Order is not pending");
      }

      setSelectedRestaurant(order.restaurant_id);
      setOrderType(order.order_type || "dine-in");
      setCustomerCount(order.customer_count);
      setCustomerLocation(order.customer_location || "");
      setDeliveryPerson(order.delivery_person || "");

      await fetchMenuItems(order.restaurant_id);

      setTimeout(() => {
        const cartItems = (order.order_items || []).map((item) => ({
          ...item.menu_items,
          id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price,
        }));

        setCart(cartItems);
        setLoading(false);
        
        toast.success("Order loaded successfully.");
      }, 500);
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Failed to load order");
    }
  };

  const handlePlaceOrderClick = () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setShowPlaceOrderDialog(true);
  };

  const handlePlaceOrder = async () => {
    setShowPlaceOrderDialog(false);

    if (orderType === "dine-in") {
      const restaurant = restaurants.find(r => r.id === selectedRestaurant);
      if (restaurant) {
        if (restaurant.available_seats === 0) {
          toast.error("No available seats. Please select delivery or wait for seats to become available.");
          return;
        }
        if (restaurant.available_seats < customerCount) {
          toast.error("Not enough available seats");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Create order with completed status
      const order = await ordersAPI.create({
          restaurant_id: selectedRestaurant,
          order_type: orderType,
          order_type_order: orderType || null,
          customer_count: customerCount,
          customer_name: null,
          customer_phone: null,
          customer_location: orderType === "delivery" ? customerLocation : null,
          delivery_person: orderType === "delivery" ? deliveryPerson : null,
          total_amount: calculateTotal(),
          status: "completed",
        items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        })),
      });

      toast.success(`Order placed successfully! Order ID: ${order?.id || 'N/A'}`);
      
      setCart([]);
      setCustomerCount(1);
      setDeliveryPerson("");
      setCustomerLocation("");
      setSearchQuery("");
      fetchRestaurants();
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleHoldOrderClick = () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setShowHoldOrderDialog(true);
  };

  const handleHoldOrder = async () => {
    setShowHoldOrderDialog(false);

    if (orderType === "dine-in") {
      const restaurant = restaurants.find(r => r.id === selectedRestaurant);
      if (restaurant) {
        if (restaurant.available_seats === 0) {
          toast.error("No available seats. Please select delivery or wait for seats to become available.");
          return;
        }
        if (restaurant.available_seats < customerCount) {
          toast.error("Not enough available seats");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Save order with pending status (held)
      await ordersAPI.create({
          restaurant_id: selectedRestaurant,
          order_type: orderType,
          order_type_order: orderType || null,
          customer_count: customerCount,
          customer_name: null,
          customer_phone: null,
          customer_location: orderType === "delivery" ? customerLocation : null,
          delivery_person: orderType === "delivery" ? deliveryPerson : null,
          total_amount: calculateTotal(),
          status: "pending",
        items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        })),
      });

      toast.success("Order held successfully! You can resume it later.");
      
      setCart([]);
      setCustomerCount(1);
      setDeliveryPerson("");
      setCustomerLocation("");
      setSearchQuery("");
      fetchRestaurants();
    } catch (error) {
      toast.error(error.message || "Failed to hold order");
    } finally {
      setLoading(false);
    }
  };


  const categories = [...new Set(filteredMenuItems.map(item => item.category))].sort();

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      {cart.length > 0 && (
        <div className="flex items-center justify-end">
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-2 min-w-0">
        {/* Left Section - Menu */}
        <div className="lg:col-span-2 space-y-2 min-w-0">
          {/* Restaurant Selection */}
          {restaurants.length > 1 && (
            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1.5 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">
                  Restaurant
                </h3>
              </div>
              <div className="px-2 pb-2">
                <select 
                  value={selectedRestaurant} 
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a restaurant</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} ({restaurant.available_seats} seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Show selected restaurant info when only one restaurant */}
          {restaurants.length === 1 && selectedRestaurant && (
            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1.5 pt-2 px-2 border-b border-gray-200">
                <h3 className="text-xs font-medium">
                  Restaurant
                </h3>
              </div>
              <div className="px-2 pb-2">
                <div className="flex items-center justify-between p-1.5 bg-gray-100 rounded">
                  <span className="font-medium text-xs">{restaurants[0].name}</span>
                  <span className="text-[10px] h-4 px-1.5 py-0.5 border border-gray-300 rounded bg-white">
                    {restaurants[0].available_seats} seats
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          {selectedRestaurant && (
            <div className="bg-white border border-gray-200 rounded">
              <div className="pb-1.5 pt-2 px-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium">Menu Items</h3>
                  {selectedRestaurantData && (
                    <span className="text-[10px] px-1.5 py-0.5 border border-gray-300 rounded bg-white">
                      {menuItems.length} items
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 px-2 pb-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 h-8 text-xs w-full border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center hover:bg-gray-100 rounded"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>

                {categories.length > 0 ? (
                  <div className="w-full">
                    <div className="inline-flex w-auto mb-2 h-7 gap-1 border border-gray-200 rounded p-0.5 bg-gray-50">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`text-[10px] px-2 py-1 rounded ${selectedCategory === "all" ? "bg-white shadow-sm" : ""}`}
                      >
                        All
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`text-[10px] px-2 py-1 rounded ${selectedCategory === category ? "bg-white shadow-sm" : ""}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {selectedCategory === "all" && (
                      <div className="grid gap-1 sm:grid-cols-3">
                        {filteredMenuItems.length > 0 ? (
                          filteredMenuItems.map(item => {
                            const cartItem = cart.find(c => c.id === item.id);
                            const quantity = cartItem?.quantity || 0;
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-1 border rounded-none hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-[10px] text-foreground truncate">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="mt-0.5">
                                    <span className="font-bold text-[10px] text-secondary">
                                      frw {item.price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-0.5 ml-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.id, -1);
                                      }}
                                      className="h-5 w-5 p-0 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                    >
                                      <Minus className="w-2 h-2" />
                                    </button>
                                    <span className="text-[9px] font-medium w-4 text-center">{quantity}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item);
                                      }}
                                      className="h-5 w-5 p-0 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                                    >
                                      <Plus className="w-2 h-2" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(item);
                                    }}
                                    className="ml-1 h-5 w-5 p-0 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-3 text-center py-8 text-sm text-muted-foreground">
                            No items found
                          </div>
                        )}
                      </div>
                    )}

                    {categories.map(category => {
                      const categoryItems = filteredMenuItems.filter(item => item.category === category);
                      return (
                        selectedCategory === category && (
                          <div className="grid gap-1 sm:grid-cols-3">
                            {categoryItems.length > 0 ? (
                              categoryItems.map(item => {
                                const cartItem = cart.find(c => c.id === item.id);
                                const quantity = cartItem?.quantity || 0;
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-1 border rounded hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-[10px] text-foreground truncate">{item.name}</h4>
                                      {item.description && (
                                        <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                                          {item.description}
                                        </p>
                                      )}
                                      <div className="mt-0.5">
                                        <span className="font-bold text-[10px] text-secondary">
                                          frw {item.price.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    {quantity > 0 ? (
                                      <div className="flex items-center gap-0.5 ml-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateQuantity(item.id, -1);
                                          }}
                                          className="h-5 w-5 p-0 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                        >
                                          <Minus className="w-2 h-2" />
                                        </button>
                                        <span className="text-[9px] font-medium w-4 text-center">{quantity}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                          }}
                                          className="h-5 w-5 p-0 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                                        >
                                          <Plus className="w-2 h-2" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToCart(item);
                                        }}
                                        className="ml-1 h-5 w-5 p-0 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                                      >
                                        <Plus className="w-2 h-2" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="col-span-3 text-center py-8 text-sm text-muted-foreground">
                                No items found in this category
                              </div>
                            )}
                          </div>
                        )
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    {searchQuery ? "No items found" : "No menu items available"}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedRestaurant && (
            <div className="bg-white border border-gray-200 rounded">
              <div className="py-8 text-center">
                <p className="text-xs text-gray-500">Please select a restaurant to view menu items</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Cart & Order Details */}
        <div className="space-y-2 min-w-0">
          <div className="sticky top-2 overflow-hidden bg-white border border-gray-200 rounded">
            <div className="pb-1.5 pt-2 px-2 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h3 className="text-xs font-medium flex items-center gap-1 min-w-0">
                  <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Order Cart</span>
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="h-5 text-[9px] text-red-600 hover:text-red-700 flex-shrink-0 px-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2 min-w-0 px-2 pb-2">
              {/* Cart Items */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold block">Items ({getCartItemCount()})</label>
                <div className="h-[150px] pr-1 overflow-y-auto">
                  <div className="space-y-1">
                    {cart.length > 0 ? (
                      cart.map(item => (
                        <div key={item.id} className="flex items-start gap-1 p-1 bg-muted rounded-none">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium truncate">{item.name}</p>
                            <p className="text-[9px] text-muted-foreground">
                              frw {item.price.toLocaleString()} × {item.quantity}
                            </p>
                            <p className="text-[10px] font-semibold text-secondary mt-0.5">
                              frw {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              className="h-5 w-5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-2 h-2" />
                            </button>
                            <span className="w-4 text-center text-[9px] font-medium">{item.quantity}</span>
                            <button
                              className="h-5 w-5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-2 h-2" />
                            </button>
                            <button
                              className="h-5 w-5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-2 h-2" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[10px] text-muted-foreground">
                        <ShoppingCart className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p>Cart is empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Type */}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] block">Order Type</label>
                <select 
                  value={orderType} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setOrderType(value);
                    // Reset delivery person and location when switching to dine-in
                    if (value === "dine-in") {
                      setDeliveryPerson("");
                      setCustomerLocation("");
                    }
                  }}
                  className="h-7 w-full min-w-0 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="dine-in">Dine-In</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* Customer Count for Dine-In */}
              {orderType === "dine-in" && (
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] flex items-center gap-1 block">
                    <Users className="h-2.5 w-2.5" />
                    Number of Customers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-7 w-full min-w-0 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {selectedRestaurantData && (
                    <p className="text-[9px] text-muted-foreground">
                      {selectedRestaurantData.available_seats} seats available
                    </p>
                  )}
                </div>
              )}

              {/* Delivery Person for Delivery */}
              {orderType === "delivery" && (
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] block">Delivery Person</label>
                  <select 
                    value={deliveryPerson || ""} 
                    onChange={(e) => setDeliveryPerson(e.target.value === "none" ? "" : e.target.value)}
                    className="h-7 w-full min-w-0 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="none">None</option>
                    {deliveryPersons.length > 0 ? (
                      deliveryPersons.map((person) => (
                        <option key={person.id} value={person.name}>
                          {person.name} {person.phone ? `(${person.phone})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No delivery persons available</option>
                    )}
                  </select>
                </div>
              )}

              {/* Order Summary */}
              {cart.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-2 text-[10px] min-w-0">
                      <span className="text-gray-500 flex-shrink-0">Subtotal:</span>
                      <span className="font-medium truncate">frw {calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="flex justify-between items-center gap-2 text-xs font-bold min-w-0">
                      <span className="flex-shrink-0">Total:</span>
                      <span className="text-green-600 truncate">frw {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-1.5 mt-2">
                <button
                  className="flex-1 min-w-0 h-7 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleHoldOrderClick}
                  disabled={loading || cart.length === 0}
                >
                  Hold Order
                </button>
                <button
                  className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white h-7 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  onClick={handlePlaceOrderClick}
                  disabled={loading || cart.length === 0}
                >
                  <CreditCard className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">
                    {loading ? "Saving..." : (
                      <>
                        <span className="hidden sm:inline">Place - </span>
                        <span>frw {calculateTotal().toLocaleString()}</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Confirmation Dialog */}
      {showPlaceOrderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded max-w-sm p-4 w-full mx-4">
            <div className="pb-2">
              <h3 className="text-sm font-semibold mb-2">Confirm Place Order</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to place this order? This will complete the order and charge the customer.
                <div className="mt-1.5 font-semibold text-gray-900">
                  Total: frw {calculateTotal().toLocaleString()}
                </div>
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => setShowPlaceOrderDialog(false)}
                className="flex-1 h-7 text-xs border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Order Confirmation Dialog */}
      {showHoldOrderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded max-w-sm p-4 w-full mx-4">
            <div className="pb-2">
              <h3 className="text-sm font-semibold mb-2">Confirm Hold Order</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to hold this order? The order will be saved as pending and can be resumed later.
                <div className="mt-1.5 font-semibold text-gray-900">
                  Total: frw {calculateTotal().toLocaleString()}
                </div>
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => setShowHoldOrderDialog(false)}
                className="flex-1 h-7 text-xs border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleHoldOrder}
                className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Hold Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
