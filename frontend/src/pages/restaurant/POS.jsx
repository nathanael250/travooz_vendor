import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { restaurantsAPI, menuItemsAPI, ordersAPI, publicAPI } from "@/lib/api";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Restaurant {
  id;
  name;
  available_seats;
}

interface MenuItem {
  id;
  name;
  description | null;
  price;
  category;
  available;
}

interface CartItem extends MenuItem {
  quantity;
}

const POS = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"dine-in" | "delivery">("dine-in");
  const [customerCount, setCustomerCount] = useState(1);
  const [customerLocation, setCustomerLocation] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [deliveryPersons, setDeliveryPersons] = useState<Array<{ id; name; phone? }>>([]);
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
      const data = await publicAPI.getDeliveryPersons('active');
      setDeliveryPersons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch delivery persons:', error);
      // Set empty array on error to prevent crashes
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

  const addToCart = (item: MenuItem) => {
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
      setOrderType(order.order_type as "dine-in" | "delivery");
      setCustomerCount(order.customer_count);
      setCustomerLocation(order.customer_location || "");
      setDeliveryPerson(order.delivery_person || "");

      await fetchMenuItems(order.restaurant_id);

      setTimeout(() => {
        const cartItems: CartItem[] = (order.order_items || []).map((item) => ({
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
    <div className="p-2 space-y-2 bg-background min-h-screen">
      {/* Header */}
      {cart.length > 0 && (
        <div className="flex items-center justify-end">
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-2 min-w-0">
        {/* Left Section - Menu */}
        <div className="lg:col-span-2 space-y-2 min-w-0">
          {/* Restaurant Selection */}
          {restaurants.length > 1 && (
            <Card className="rounded-none">
              <CardHeader className="pb-1.5 pt-2 px-2">
                <CardTitle className="text-xs">
                  Restaurant
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Choose a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map(restaurant => (
                      <SelectItem key={restaurant.id} value={restaurant.id} className="text-xs">
                        <div className="flex items-center justify-between w-full">
                          <span>{restaurant.name}</span>
                          <Badge variant="outline" className="ml-2 text-[10px] h-4">
                            {restaurant.available_seats} seats
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
          
          {/* Show selected restaurant info when only one restaurant */}
          {restaurants.length === 1 && selectedRestaurant && (
            <Card className="rounded-none">
              <CardHeader className="pb-1.5 pt-2 px-2">
                <CardTitle className="text-xs">
                  Restaurant
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="flex items-center justify-between p-1.5 bg-muted rounded-none">
                  <span className="font-medium text-xs">{restaurants[0].name}</span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {restaurants[0].available_seats} seats
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Items */}
          {selectedRestaurant && (
            <Card className="rounded-none">
              <CardHeader className="pb-1.5 pt-2 px-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Menu Items</CardTitle>
                  {selectedRestaurantData && (
                    <Badge variant="outline" className="text-[10px]">
                      {menuItems.length} items
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-2 pb-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </div>

                {categories.length > 0 ? (
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="inline-flex w-auto mb-2 h-7">
                      <TabsTrigger value="all" className="text-[10px] px-2 py-1">
                        All
                      </TabsTrigger>
                      {categories.map(category => (
                        <TabsTrigger key={category} value={category} className="text-[10px] px-2 py-1">
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="all">
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.id, -1);
                                      }}
                                      className="h-5 w-5 p-0"
                                    >
                                      <Minus className="w-2 h-2" />
                                    </Button>
                                    <span className="text-[9px] font-medium w-4 text-center">{quantity}</span>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item);
                                      }}
                                      className="h-5 w-5 p-0 bg-primary hover:bg-primary/90"
                                    >
                                      <Plus className="w-2 h-2" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(item);
                                    }}
                                    className="ml-1 h-5 w-5 p-0 bg-primary hover:bg-primary/90"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </Button>
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
                    </TabsContent>

                    {categories.map(category => {
                      const categoryItems = filteredMenuItems.filter(item => item.category === category);
                      return (
                        <TabsContent key={category} value={category}>
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
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateQuantity(item.id, -1);
                                          }}
                                          className="h-5 w-5 p-0"
                                        >
                                          <Minus className="w-2 h-2" />
                                        </Button>
                                        <span className="text-[9px] font-medium w-4 text-center">{quantity}</span>
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                          }}
                                          className="h-5 w-5 p-0 bg-primary hover:bg-primary/90"
                                        >
                                          <Plus className="w-2 h-2" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToCart(item);
                                        }}
                                        className="ml-1 h-5 w-5 p-0 bg-primary hover:bg-primary/90"
                                      >
                                        <Plus className="w-2 h-2" />
                                      </Button>
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
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? "No items found" : "No menu items available"}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedRestaurant && (
            <Card className="rounded-none">
              <CardContent className="py-8 text-center">
                <p className="text-xs text-muted-foreground">Please select a restaurant to view menu items</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Section - Cart & Order Details */}
        <div className="space-y-2 min-w-0">
          <Card className="sticky top-2 overflow-hidden rounded-none">
            <CardHeader className="pb-1.5 pt-2 px-2">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <CardTitle className="text-xs flex items-center gap-1 min-w-0">
                  <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Order Cart</span>
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-5 text-[9px] text-destructive hover:text-destructive flex-shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 min-w-0 px-2 pb-2">
              {/* Cart Items */}
              <div className="space-y-1">
                <Label className="text-[10px] font-semibold">Items ({getCartItemCount()})</Label>
                <ScrollArea className="h-[150px] pr-1">
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
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-5 w-5"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-2 h-2" />
                            </Button>
                            <span className="w-4 text-center text-[9px] font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-5 w-5"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-2 h-2" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-2 h-2" />
                            </Button>
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
                </ScrollArea>
              </div>

              {/* Order Type */}
              <Separator />
              <div className="space-y-1 min-w-0">
                <Label className="text-[10px]">Order Type</Label>
                <Select value={orderType} onValueChange={(value) => {
                  setOrderType(value);
                  // Reset delivery person and location when switching to dine-in
                  if (value === "dine-in") {
                    setDeliveryPerson("");
                    setCustomerLocation("");
                  }
                }}>
                  <SelectTrigger className="h-7 w-full min-w-0 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in" className="text-xs">Dine-In</SelectItem>
                    <SelectItem value="delivery" className="text-xs">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Count for Dine-In */}
              {orderType === "dine-in" && (
                <div className="space-y-1 min-w-0">
                  <Label className="text-[10px] flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" />
                    Number of Customers
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-7 w-full min-w-0 text-xs"
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
                  <Label className="text-[10px]">Delivery Person</Label>
                  <Select 
                    value={deliveryPerson || undefined} 
                    onValueChange={(value) => setDeliveryPerson(value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="h-7 w-full min-w-0 text-xs">
                      <SelectValue placeholder="Select delivery person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">None</SelectItem>
                      {deliveryPersons.length > 0 ? (
                        deliveryPersons.map((person) => (
                          <SelectItem key={person.id} value={person.name} className="text-xs">
                            {person.name} {person.phone ? `(${person.phone})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled className="text-xs text-muted-foreground">
                          No delivery persons available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Order Summary */}
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-2 text-[10px] min-w-0">
                      <span className="text-muted-foreground flex-shrink-0">Subtotal:</span>
                      <span className="font-medium truncate">frw {calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center gap-2 text-xs font-bold min-w-0">
                      <span className="flex-shrink-0">Total:</span>
                      <span className="text-secondary truncate">frw {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-1.5 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 min-w-0 h-7 text-xs rounded-none"
                  onClick={handleHoldOrderClick}
                  disabled={loading || cart.length === 0}
                  size="sm"
                >
                  Hold Order
                </Button>
                <Button
                  className="flex-1 min-w-0 bg-primary hover:bg-primary/90 h-7 text-xs rounded-none"
                  onClick={handlePlaceOrderClick}
                  disabled={loading || cart.length === 0}
                  size="sm"
                >
                  <CreditCard className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {loading ? "Saving..." : (
                      <>
                        <span className="hidden sm:inline">Place - </span>
                        <span>frw {calculateTotal().toLocaleString()}</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Place Order Confirmation Dialog */}
      <AlertDialog open={showPlaceOrderDialog} onOpenChange={setShowPlaceOrderDialog}>
        <AlertDialogContent className="!rounded-none max-w-sm p-4 sm:!rounded-none">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="text-sm">Confirm Place Order</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to place this order? This will complete the order and charge the customer.
              <div className="mt-1.5 font-semibold text-foreground">
                Total: frw {calculateTotal().toLocaleString()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-1.5 pt-2">
            <AlertDialogCancel className="rounded-none h-7 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePlaceOrder}
              className="bg-primary hover:bg-primary/90 rounded-none h-7 text-xs"
            >
              Place Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hold Order Confirmation Dialog */}
      <AlertDialog open={showHoldOrderDialog} onOpenChange={setShowHoldOrderDialog}>
        <AlertDialogContent className="!rounded-none max-w-sm p-4 sm:!rounded-none">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="text-sm">Confirm Hold Order</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to hold this order? The order will be saved as pending and can be resumed later.
              <div className="mt-1.5 font-semibold text-foreground">
                Total: frw {calculateTotal().toLocaleString()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-1.5 pt-2">
            <AlertDialogCancel className="rounded-none h-7 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleHoldOrder}
              className="bg-primary hover:bg-primary/90 rounded-none h-7 text-xs"
            >
              Hold Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default POS;
