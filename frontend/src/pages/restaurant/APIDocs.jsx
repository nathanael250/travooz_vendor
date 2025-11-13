const APIDocs = () => {
  const apiEndpoints = [
    {
      category: "Public API",
      endpoints: [
        {
          method: "GET",
          path: "/api/public/restaurants",
          description: "Retrieve all active restaurants",
          request: {
            query: {
              status: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                name: "string",
                description: "string",
                address: "string",
                phone: "string",
                images: []
              }
            ]
          }
        },
        {
          method: "GET",
          path: "/api/public/restaurants/:id",
          description: "Retrieve a specific restaurant by ID",
          request: {
            params: {
              id: "string (required)"
            }
          },
          response: {
            status: 200,
            body: {
              id: "string",
              name: "string",
              description: "string",
              address: "string",
              phone: "string",
              images: []
            }
          }
        },
        {
          method: "GET",
          path: "/api/public/menu-items",
          description: "Retrieve all menu items",
          request: {
            query: {
              restaurant_id: "string (optional)",
              available: "boolean (optional)",
              category: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                name: "string",
                description: "string",
                price: "number",
                category: "string",
                available: "boolean",
                images: []
              }
            ]
          }
        },
        {
          method: "GET",
          path: "/api/public/menu-items/:id",
          description: "Retrieve a specific menu item by ID",
          request: {
            params: {
              id: "string (required)"
            }
          },
          response: {
            status: 200,
            body: {
              id: "string",
              name: "string",
              description: "string",
              price: "number",
              category: "string",
              available: "boolean",
              images : []
            }
          }
        },
        {
          method: "GET",
          path: "/api/public/orders",
          description: "Retrieve all orders",
          request: {
            query: {
              status: "string (optional)",
              order_type: "string (optional)",
              start_date: "string (optional)",
              end_date: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                restaurant_id: "string",
                order_type: "string",
                customer_count: "number",
                customer_name: "string",
                customer_phone: "string",
                customer_location: "string",
                delivery_person: "string",
                total_amount: "number",
                status: "string",
                created_at: "timestamp"
              }
            ]
          }
        },
        {
          method: "GET",
          path: "/api/public/orders/:id",
          description: "Retrieve a specific order by ID with items",
          request: {
            params: {
              id: "string (required)"
            }
          },
          response: {
            status: 200,
            body: {
              id: "string",
              restaurant_id: "string",
              order_type: "string",
              customer_count: "number",
              customer_name: "string",
              customer_phone: "string",
              customer_location: "string",
              delivery_person: "string",
              total_amount: "number",
              status: "string",
              order_items : []
            }
          }
        },
        {
          method: "GET",
          path: "/api/public/delivery-persons",
          description: "Retrieve all active delivery persons",
          request: {
            query: {
              status: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                name: "string",
                phone: "string",
                email: "string",
                status: "string"
              }
            ]
          }
        }
      ]
    },
    {
      category: "Authenticated API",
      endpoints: [
        {
          method: "GET",
          path: "/api/orders",
          description: "Retrieve all orders for authenticated user's restaurants",
          request: {
            query: {}
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                restaurant_id: "string",
                order_type: "string",
                customer_count: "number",
                customer_name: "string",
                customer_phone: "string",
                customer_location: "string",
                delivery_person: "string",
                total_amount: "number",
                status: "string",
                created_at: "timestamp"
              }
            ]
          }
        },
        {
          method: "POST",
          path: "/api/orders",
          description: "Create a new order",
          request: {
            body: {
              restaurant_id: "string (required)",
              order_type: "string (required)",
              customer_count: "number (optional)",
              customer_name: "string (optional)",
              customer_phone: "string (optional)",
              customer_location: "string (optional)",
              delivery_person: "string (optional)",
              total_amount: "number (required)",
              status: "string (optional)",
              items: "array (required)"
            }
          },
          response: {
            status: 201,
            body: {
              id: "string",
              restaurant_id: "string",
              order_type: "string",
              total_amount: "number",
              status: "string"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/orders/:id",
          description: "Update an existing order",
          request: {
            params: {
              id: "string (required)"
            },
            body: {
              customer_name: "string (optional)",
              customer_phone: "string (optional)",
              customer_location: "string (optional)",
              customer_count: "number (optional)",
              delivery_person: "string (optional)",
              status: "string (optional)",
              total_amount: "number (optional)"
            }
          },
          response: {
            status: 200,
            body: {
              id: "string",
              status: "string",
              updated_at: "timestamp"
            }
          }
        },
        {
          method: "GET",
          path: "/api/menu-items",
          description: "Retrieve all menu items for authenticated user's restaurants",
          request: {
            query: {}
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                name: "string",
                description: "string",
                price: "number",
                category: "string",
                available: "boolean"
              }
            ]
          }
        },
        {
          method: "GET",
          path: "/api/delivery-persons",
          description: "Retrieve all delivery persons",
          request: {
            query: {
              status: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: [
              {
                id: "string",
                name: "string",
                phone: "string",
                email: "string",
                status: "string"
              }
            ]
          }
        },
        {
          method: "POST",
          path: "/api/delivery-persons",
          description: "Create a new delivery person",
          request: {
            body: {
              name: "string (required)",
              phone: "string (optional)",
              email: "string (optional)",
              status: "string (optional)"
            }
          },
          response: {
            status: 201,
            body: {
              id: "string",
              name: "string",
              phone: "string",
              email: "string",
              status: "string"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/delivery-persons/:id",
          description: "Update a delivery person",
          request: {
            params: {
              id: "string (required)"
            },
            body: {
              name: "string (optional)",
              phone: "string (optional)",
              email: "string (optional)",
              status: "string (optional)"
            }
          },
          response: {
            status: 200,
            body: {
              id: "string",
              name: "string",
              phone: "string",
              email: "string",
              status: "string"
            }
          }
        },
        {
          method: "DELETE",
          path: "/api/delivery-persons/:id",
          description: "Delete a delivery person",
          request: {
            params: {
              id: "string (required)"
            }
          },
          response: {
            status: 200,
            body: {
              message: "string"
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
