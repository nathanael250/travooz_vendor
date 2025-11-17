const APIDocs = () => {
  const apiEndpoints = [
    {
      category: "Restaurant Orders API",
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/restaurant/orders",
          description: "Create a new food order. Supports dine-in (with automatic table reservation), delivery, and pickup orders. Restaurant is auto-detected from vendor's JWT token.",
          request: {
            body: {
              order_type: "string (required) - 'dine_in', 'delivery', or 'pickup'",
              customer_name: "string (required)",
              customer_email: "string (optional)",
              customer_phone: "string (required)",
              "For dine_in orders": {
                booking_date: "string (required) - YYYY-MM-DD",
                booking_time: "string (required) - HH:MM",
                number_of_guests: "number (optional, default: 1)",
                table_booking_special_requests: "string (optional)"
              },
              "For delivery orders": {
                delivery_address: "string (required)",
                delivery_latitude: "number (optional)",
                delivery_longitude: "number (optional)",
                delivery_fee: "number (optional, default: 0)"
              },
              items: [
                {
                  menu_item_id: "string (required)",
                  quantity: "number (required)",
                  addons: ["array of addon IDs (optional)"],
                  customizations: ["array of {name, value} objects (optional)"]
                }
              ],
              tax_amount: "number (optional, default: 0)",
              discount_amount: "number (optional, default: 0)",
              payment_method: "string (optional) - 'card', 'cash', 'mobile_money', 'bank_transfer' (default: 'cash')",
              special_instructions: "string (optional)"
            }
          },
          response: {
            status: 201,
            body: {
              success: true,
              message: "Order created successfully",
              data: {
                id: "string",
                restaurant_id: "string",
                order_type: "string",
                customer_name: "string",
                order_status: "string",
                payment_status: "string",
                subtotal: "number",
                total_amount: "number",
                table_booking_id: "number (for dine_in orders)",
                items: ["array of order items"],
                created_at: "timestamp"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/restaurant/orders",
          description: "Get all orders for the vendor's restaurant. Restaurant is auto-detected from vendor's JWT token.",
          request: {
            query: {
              status: "string (optional) - Filter by order status: 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'",
              payment_status: "string (optional) - Filter by payment status: 'pending', 'paid', 'refunded'",
              order_type: "string (optional) - Filter by order type: 'dine_in', 'delivery', 'pickup'",
              limit: "number (optional, default: 50)",
              offset: "number (optional, default: 0)"
            }
          },
          response: {
            status: 200,
            body: {
              success: true,
              data: [
                {
                  id: "string",
                  order_type: "string",
                  customer_name: "string",
                  order_status: "string",
                  total_amount: "number",
                  items: ["array of order items"]
                }
              ],
              count: "number"
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/restaurant/orders/:id",
          description: "Get a specific order by ID with all details and items.",
          request: {
            params: {
              id: "string (required) - Order ID"
            }
          },
          response: {
            status: 200,
            body: {
              success: true,
              data: {
                id: "string",
                order_type: "string",
                customer_name: "string",
                order_status: "string",
                items: ["array of order items with details"],
                total_amount: "number"
              }
            }
          }
        },
        {
          method: "PATCH",
          path: "/api/v1/restaurant/orders/:id/status",
          description: "Update the status of an order. Valid statuses: 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery' (delivery only), 'delivered', 'cancelled'.",
          request: {
            params: {
              id: "string (required) - Order ID"
            },
            body: {
              status: "string (required) - New order status",
              delivery_boy_id: "number (optional) - For delivery orders"
            }
          },
          response: {
            status: 200,
            body: {
              success: true,
              message: "Order status updated successfully",
              data: {
                id: "string",
                order_status: "string",
                updated_at: "timestamp"
              }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/restaurant/orders/check-availability",
          description: "Check table availability for a specific date, time, and number of guests. Restaurant is auto-detected from vendor's JWT token.",
          request: {
            query: {
              booking_date: "string (required) - YYYY-MM-DD format",
              booking_time: "string (required) - HH:MM format",
              number_of_guests: "number (required)",
              restaurant_id: "string (optional) - Auto-detected if not provided"
            }
          },
          response: {
            status: 200,
            body: {
              success: true,
              data: {
                available: "boolean",
                total_capacity: "number",
                available_seats: "number",
                booked_guests: "number",
                requested_guests: "number",
                available_capacity: "number"
              }
            }
          }
        }
      ]
    }
  ];

  return (
    <div className="p-6 font-sans text-sm">
      <div className="mb-5">
        <h1 className="text-lg font-bold mb-1">API Documentation</h1>
        <p className="text-sm mb-4">Complete API reference for developers</p>
      </div>

      {apiEndpoints.map((category, categoryIndex) => (
        <div key={categoryIndex} style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
            {category.category}
          </h2>
          
          {category.endpoints.map((endpoint, index) => (
            <div key={index} style={{ marginBottom: '25px' }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>{endpoint.method}</strong> {endpoint.path}
              </div>
              
              <p style={{ fontSize: '12px', marginBottom: '10px' }}>{endpoint.description}</p>

              {Object.keys(endpoint.request).length > 0 && (
                <div style={{ marginBottom: '10px', marginLeft: '15px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Request:</p>
                  {endpoint.request.params && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '11px', marginBottom: '3px' }}>Path Parameters:</p>
                      <pre style={{ fontSize: '11px', margin: 0, fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(endpoint.request.params, null, 2)}
                      </pre>
                    </div>
                  )}
                  {endpoint.request.query && Object.keys(endpoint.request.query).length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '11px', marginBottom: '3px' }}>Query Parameters:</p>
                      <pre style={{ fontSize: '11px', margin: 0, fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(endpoint.request.query, null, 2)}
                      </pre>
                    </div>
                  )}
                  {endpoint.request.body && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '11px', marginBottom: '3px' }}>Request Body:</p>
                      <pre style={{ fontSize: '11px', margin: 0, fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(endpoint.request.body, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginLeft: '15px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Response ({endpoint.response.status}):</p>
                <pre style={{ fontSize: '11px', margin: 0, fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(endpoint.response.body, null, 2)}
                </pre>
              </div>

              {index < category.endpoints.length - 1 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default APIDocs;
