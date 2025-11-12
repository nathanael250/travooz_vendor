import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ordersAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Order {
  id;
  restaurant_id;
  order_type;
  customer_count;
  customer_name | null;
  customer_phone | null;
  total_amount;
  status;
  created_at;
  restaurants: {
    name;
  };
}

interface OrderItem {
  id;
  menu_item_id;
  quantity;
  price;
  menu_items: {
    name;
    description | null;
    category;
  };
}

const OrderDetails = () => {
  const { id } = useParams<{ id }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch order details (includes order_items)
      const orderData = await ordersAPI.getById(id);
      setOrder(orderData);
      setOrderItems(orderData.order_items || []);
    } catch (error) {
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-muted";
    }
  };


  const generateOrderCode = (id, createdAt) => {
    const timestamp = new Date(createdAt).getTime().toString().slice(-6);
    return id.slice(-6) + timestamp.slice(-3);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 space-y-4 bg-background">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Order not found</p>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="p-3 space-y-3 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="h-7 px-2 mb-1 hover:bg-muted text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Order Details</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Dashboard</span>
              <span>/</span>
              <span>Orders</span>
              <span>/</span>
              <span className="text-foreground font-medium">Details</span>
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 border`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Order Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="border-l-2 border-l-blue-500">
          <CardHeader className="pb-1 pt-2 px-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Order Code
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <p className="text-sm font-bold text-foreground">{generateOrderCode(order.id, order.created_at)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-green-500">
          <CardHeader className="pb-1 pt-2 px-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <p className="text-sm font-bold text-foreground truncate">{order.restaurants.name}</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-purple-500">
          <CardHeader className="pb-1 pt-2 px-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Order Date
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <p className="text-xs font-bold text-foreground">{format(new Date(order.created_at), "MMM dd, yyyy")}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "hh:mm a")}</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-orange-500">
          <CardHeader className="pb-1 pt-2 px-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <p className="text-sm font-bold text-primary">frw {order.total_amount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Order Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-2 px-3 border-b">
            <CardTitle className="text-sm font-semibold">
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orderItems.length > 0 ? (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 h-8">
                      <TableHead className="font-semibold text-xs px-2 py-1">Item</TableHead>
                      <TableHead className="font-semibold text-xs px-2 py-1">Category</TableHead>
                      <TableHead className="text-center font-semibold text-xs px-2 py-1">Qty</TableHead>
                      <TableHead className="text-right font-semibold text-xs px-2 py-1">Unit Price</TableHead>
                      <TableHead className="text-right font-semibold text-xs px-2 py-1">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={item.id} className={index !== orderItems.length - 1 ? "border-b" : ""}>
                        <TableCell className="px-2 py-1.5">
                          <div>
                            <p className="font-medium text-sm text-foreground">{item.menu_items.name}</p>
                            {item.menu_items.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{item.menu_items.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-1.5">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {item.menu_items.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center px-2 py-1.5">
                          <span className="font-semibold text-sm">{item.quantity}</span>
                        </TableCell>
                        <TableCell className="text-right px-2 py-1.5">
                          <span className="text-muted-foreground text-xs">frw {item.price.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right px-2 py-1.5">
                          <span className="font-semibold text-sm text-foreground">frw {(item.price * item.quantity).toLocaleString()}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">No items found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary & Details */}
        <div className="space-y-3">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-2 pt-2 px-3 border-b">
              <CardTitle className="text-sm font-semibold">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold">frw {subtotal.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">frw {order.total_amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader className="pb-2 pt-2 px-3 border-b">
              <CardTitle className="text-sm font-semibold">
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3 space-y-2">
              <div className="space-y-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Order Type</p>
                  <p className="text-sm font-semibold mt-0.5 capitalize truncate">
                    {order.order_type.replace('-', ' ')}
                  </p>
                </div>

                {order.customer_name && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Customer Name</p>
                    <p className="text-sm font-semibold mt-0.5 truncate">{order.customer_name}</p>
                  </div>
                )}

                {order.customer_phone && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-semibold mt-0.5 truncate">{order.customer_phone}</p>
                  </div>
                )}

                {order.order_type === "dine-in" && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Customer Count</p>
                    <p className="text-sm font-semibold mt-0.5">{order.customer_count} {order.customer_count === 1 ? 'person' : 'people'}</p>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Order Date & Time</p>
                  <p className="text-sm font-semibold mt-0.5">{format(new Date(order.created_at), "PPpp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

