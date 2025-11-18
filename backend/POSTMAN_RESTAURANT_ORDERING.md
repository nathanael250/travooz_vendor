# Restaurant Ordering API - Postman Testing Guide

## Base URL
```
http://localhost:5000/api/v1
```
For production:
```
https://vendor.travoozapp.com/api/v1
```

---

## 1. Get Restaurant Details

**Request:**
```
GET /client/restaurants/{restaurantId}
```

**Example:**
```
GET http://localhost:5000/api/v1/client/restaurants/restaurant-uuid-here
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "restaurant-uuid-here",
    "name": "Kigali Restaurant",
    "description": "Best restaurant in Kigali",
    "capacity": 50,
    "available_seats": 45,
    "address": "KG 123 St, Kigali",
    "phone": "+250788123456",
    "status": "active",
    "images": [
      "/uploads/restaurants/logo-123.jpg"
    ]
  }
}
```

---

## 2. Get Menu Items

**Request:**
```
GET /menu-items?restaurant_id={restaurantId}&available=true
```

**Example:**
```
GET http://localhost:5000/api/v1/menu-items?restaurant_id=restaurant-uuid-here&available=true
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "menu-item-uuid-1",
      "restaurant_id": "restaurant-uuid-here",
      "name": "Grilled Chicken",
      "description": "Tender grilled chicken with spices",
      "price": "15000.00",
      "category_id": "category-uuid-1",
      "category": "Main Course",
      "available": 1,
      "images": [
        {
          "id": "image-uuid",
          "image_url": "/uploads/restaurants/menu-item-123.jpg",
          "is_primary": 1
        }
      ],
      "addOns": [
        {
          "id": "addon-uuid",
          "name": "Extra Cheese",
          "price": "2000.00"
        }
      ],
      "customizations": [
        {
          "name": "Spice Level",
          "options": ["Mild", "Medium", "Hot"]
        }
      ]
    }
  ]
}
```

---

## 3. Get Menu Categories

**Request:**
```
GET /menu-items/categories?restaurant_id={restaurantId}
```

**Example:**
```
GET http://localhost:5000/api/v1/menu-items/categories?restaurant_id=restaurant-uuid-here
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "category-uuid-1",
      "restaurant_id": "restaurant-uuid-here",
      "name": "Main Course",
      "display_order": 1
    },
    {
      "id": "category-uuid-2",
      "restaurant_id": "restaurant-uuid-here",
      "name": "Appetizers",
      "display_order": 2
    },
    {
      "id": "category-uuid-3",
      "restaurant_id": "restaurant-uuid-here",
      "name": "Desserts",
      "display_order": 3
    }
  ]
}
```

---

## 4. Check Table Availability (for Dine-In)

**Request:**
```
GET /client/restaurants/{restaurantId}/table-availability?booking_date=2025-01-20&booking_time=19:00&number_of_guests=4
```

**Example:**
```
GET http://localhost:5000/api/v1/client/restaurants/restaurant-uuid-here/table-availability?booking_date=2025-01-20&booking_time=19:00&number_of_guests=4
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "total_capacity": 50,
    "booked_guests": 20,
    "available_capacity": 30,
    "available_seats": 30,
    "requested_guests": 4
  }
}
```

**Response (Not Available):**
```json
{
  "success": true,
  "data": {
    "available": false,
    "total_capacity": 50,
    "booked_guests": 48,
    "available_capacity": 2,
    "available_seats": 2,
    "requested_guests": 4,
    "message": "Not enough capacity available"
  }
}
```

---

## 5. Create Order - DELIVERY

**Request:**
```
POST /client/orders/restaurants
```

**Example:**
```
POST http://localhost:5000/api/v1/client/orders/restaurants
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "restaurant_id": "restaurant-uuid-here",
  "order_type": "delivery",
  "customer_name": "John Doe",
  "customer_email": "john.doe@example.com",
  "customer_phone": "+250788123456",
  "delivery_address": "KG 456 St, Kigali, Rwanda",
  "delivery_latitude": -1.9441,
  "delivery_longitude": 30.0619,
  "items": [
    {
      "menu_item_id": "menu-item-uuid-1",
      "quantity": 2,
      "addons": [
        {
          "id": "addon-uuid-1"
        }
      ],
      "customizations": [
        {
          "name": "Spice Level",
          "value": "Medium"
        }
      ]
    },
    {
      "menu_item_id": "menu-item-uuid-2",
      "quantity": 1,
      "addons": [],
      "customizations": []
    }
  ],
  "delivery_fee": 2000,
  "tax_amount": 0,
  "discount_amount": 0,
  "payment_method": "cash",
  "special_instructions": "Please ring the doorbell twice"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid-here",
    "booking_id": 123,
    "restaurant_id": "restaurant-uuid-here",
    "order_type": "delivery",
    "customer_name": "John Doe",
    "customer_email": "john.doe@example.com",
    "customer_phone": "+250788123456",
    "delivery_address": "KG 456 St, Kigali, Rwanda",
    "subtotal": 32000.00,
    "delivery_fee": 2000.00,
    "tax_amount": 0.00,
    "discount_amount": 0.00,
    "total_amount": 34000.00,
    "payment_method": "cash",
    "payment_status": "pending",
    "order_status": "pending",
    "items": [
      {
        "id": "order-item-uuid-1",
        "menu_item_id": "menu-item-uuid-1",
        "item_name": "Grilled Chicken",
        "quantity": 2,
        "unit_price": 15000.00,
        "subtotal": 30000.00
      },
      {
        "id": "order-item-uuid-2",
        "menu_item_id": "menu-item-uuid-2",
        "item_name": "French Fries",
        "quantity": 1,
        "unit_price": 2000.00,
        "subtotal": 2000.00
      }
    ],
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 6. Create Order - DINE-IN (with Table Booking)

**Request:**
```
POST /client/orders/restaurants
```

**Example:**
```
POST http://localhost:5000/api/v1/client/orders/restaurants
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "restaurant_id": "restaurant-uuid-here",
  "order_type": "dine_in",
  "customer_name": "Jane Smith",
  "customer_email": "jane.smith@example.com",
  "customer_phone": "+250788654321",
  "booking_date": "2025-01-20",
  "booking_time": "19:00",
  "number_of_guests": 4,
  "table_booking_special_requests": "Window seat preferred",
  "items": [
    {
      "menu_item_id": "menu-item-uuid-1",
      "quantity": 2,
      "addons": [
        {
          "id": "addon-uuid-1"
        }
      ],
      "customizations": []
    },
    {
      "menu_item_id": "menu-item-uuid-3",
      "quantity": 1,
      "addons": [],
      "customizations": [
        {
          "name": "Spice Level",
          "value": "Mild"
        }
      ]
    }
  ],
  "tax_amount": 0,
  "discount_amount": 0,
  "payment_method": "card",
  "special_instructions": "No onions please"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid-here",
    "booking_id": 124,
    "restaurant_id": "restaurant-uuid-here",
    "order_type": "dine_in",
    "customer_name": "Jane Smith",
    "customer_email": "jane.smith@example.com",
    "customer_phone": "+250788654321",
    "table_booking_id": 45,
    "subtotal": 32000.00,
    "delivery_fee": 0.00,
    "tax_amount": 0.00,
    "discount_amount": 0.00,
    "total_amount": 32000.00,
    "payment_method": "card",
    "payment_status": "pending",
    "order_status": "pending",
    "table_booking": {
      "id": 45,
      "restaurant_id": "restaurant-uuid-here",
      "customer_name": "Jane Smith",
      "booking_date": "2025-01-20",
      "booking_time": "19:00",
      "number_of_guests": 4,
      "status": "pending",
      "special_requests": "Window seat preferred"
    },
    "items": [
      {
        "id": "order-item-uuid-1",
        "menu_item_id": "menu-item-uuid-1",
        "item_name": "Grilled Chicken",
        "quantity": 2,
        "unit_price": 15000.00,
        "subtotal": 30000.00
      },
      {
        "id": "order-item-uuid-2",
        "menu_item_id": "menu-item-uuid-3",
        "item_name": "Caesar Salad",
        "quantity": 1,
        "unit_price": 2000.00,
        "subtotal": 2000.00
      }
    ],
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request - No Capacity):**
```json
{
  "success": false,
  "message": "Not enough capacity available. Available: 2, Requested: 4",
  "availability": {
    "available": false,
    "total_capacity": 50,
    "booked_guests": 48,
    "available_capacity": 2,
    "available_seats": 2
  }
}
```

**Error Response (400 Bad Request - Missing Fields):**
```json
{
  "success": false,
  "message": "Customer name, phone, and at least one item are required"
}
```

**Error Response (400 Bad Request - Missing Delivery Address):**
```json
{
  "success": false,
  "message": "Delivery address is required for delivery orders"
}
```

**Error Response (400 Bad Request - Missing Booking Info):**
```json
{
  "success": false,
  "message": "Booking date and time are required for dine-in orders"
}
```

---

## Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "Restaurant Ordering API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Restaurant Details",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/client/restaurants/{{restaurantId}}",
          "host": ["{{baseUrl}}"],
          "path": ["client", "restaurants", "{{restaurantId}}"]
        }
      }
    },
    {
      "name": "Get Menu Items",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/menu-items?restaurant_id={{restaurantId}}&available=true",
          "host": ["{{baseUrl}}"],
          "path": ["menu-items"],
          "query": [
            {
              "key": "restaurant_id",
              "value": "{{restaurantId}}"
            },
            {
              "key": "available",
              "value": "true"
            }
          ]
        }
      }
    },
    {
      "name": "Get Menu Categories",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/menu-items/categories?restaurant_id={{restaurantId}}",
          "host": ["{{baseUrl}}"],
          "path": ["menu-items", "categories"],
          "query": [
            {
              "key": "restaurant_id",
              "value": "{{restaurantId}}"
            }
          ]
        }
      }
    },
    {
      "name": "Check Table Availability",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/client/restaurants/{{restaurantId}}/table-availability?booking_date=2025-01-20&booking_time=19:00&number_of_guests=4",
          "host": ["{{baseUrl}}"],
          "path": ["client", "restaurants", "{{restaurantId}}", "table-availability"],
          "query": [
            {
              "key": "booking_date",
              "value": "2025-01-20"
            },
            {
              "key": "booking_time",
              "value": "19:00"
            },
            {
              "key": "number_of_guests",
              "value": "4"
            }
          ]
        }
      }
    },
    {
      "name": "Create Order - Delivery",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"restaurant_id\": \"{{restaurantId}}\",\n  \"order_type\": \"delivery\",\n  \"customer_name\": \"John Doe\",\n  \"customer_email\": \"john.doe@example.com\",\n  \"customer_phone\": \"+250788123456\",\n  \"delivery_address\": \"KG 456 St, Kigali, Rwanda\",\n  \"delivery_latitude\": -1.9441,\n  \"delivery_longitude\": 30.0619,\n  \"items\": [\n    {\n      \"menu_item_id\": \"{{menuItemId1}}\",\n      \"quantity\": 2,\n      \"addons\": [],\n      \"customizations\": []\n    }\n  ],\n  \"delivery_fee\": 2000,\n  \"tax_amount\": 0,\n  \"discount_amount\": 0,\n  \"payment_method\": \"cash\",\n  \"special_instructions\": \"Please ring the doorbell twice\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/client/orders/restaurants",
          "host": ["{{baseUrl}}"],
          "path": ["client", "orders", "restaurants"]
        }
      }
    },
    {
      "name": "Create Order - Dine-In",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"restaurant_id\": \"{{restaurantId}}\",\n  \"order_type\": \"dine_in\",\n  \"customer_name\": \"Jane Smith\",\n  \"customer_email\": \"jane.smith@example.com\",\n  \"customer_phone\": \"+250788654321\",\n  \"booking_date\": \"2025-01-20\",\n  \"booking_time\": \"19:00\",\n  \"number_of_guests\": 4,\n  \"table_booking_special_requests\": \"Window seat preferred\",\n  \"items\": [\n    {\n      \"menu_item_id\": \"{{menuItemId1}}\",\n      \"quantity\": 2,\n      \"addons\": [],\n      \"customizations\": []\n    }\n  ],\n  \"tax_amount\": 0,\n  \"discount_amount\": 0,\n  \"payment_method\": \"card\",\n  \"special_instructions\": \"No onions please\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/client/orders/restaurants",
          "host": ["{{baseUrl}}"],
          "path": ["client", "orders", "restaurants"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/v1",
      "type": "string"
    },
    {
      "key": "restaurantId",
      "value": "your-restaurant-uuid-here",
      "type": "string"
    },
    {
      "key": "menuItemId1",
      "value": "your-menu-item-uuid-here",
      "type": "string"
    }
  ]
}
```

---

## Testing Steps

1. **Set up variables in Postman:**
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `restaurantId`: Your actual restaurant UUID
   - `menuItemId1`: A menu item UUID from your restaurant

2. **Test flow:**
   - First, get restaurant details to verify the restaurant exists
   - Get menu items to see available items
   - Get menu categories to organize items
   - For dine-in orders, check table availability first
   - Create an order (delivery or dine-in)

3. **Common Issues:**
   - Make sure restaurant ID is a valid UUID
   - Ensure menu items exist and are available
   - For dine-in, check that booking date is in the future
   - Verify restaurant capacity allows the requested number of guests

---

## Notes

- All endpoints are **public** (no authentication required)
- Dates should be in `YYYY-MM-DD` format
- Times should be in `HH:MM` format (24-hour)
- Phone numbers should include country code (e.g., `+250788123456`)
- Prices are in RWF (Rwandan Francs)
- Menu item IDs, restaurant IDs, and category IDs are UUIDs

