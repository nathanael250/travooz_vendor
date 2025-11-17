# Restaurant Order API Documentation

## Overview
This API allows restaurant vendors to create and manage orders for their restaurant. The vendor (restaurant owner) can create orders for customers, with support for dine-in (with table booking), delivery, and pickup orders.

## Authentication
All endpoints require authentication. The vendor must be logged in and the API will automatically use their restaurant.

## Endpoints

### 1. Create Order
**POST** `/api/v1/restaurant/orders`

Creates a new order. Supports three order types:
- `dine_in`: Creates a table booking and order
- `delivery`: Creates a delivery order with address
- `pickup`: Creates a pickup order

#### Request Body (Dine-In Order)
```json
{
  "order_type": "dine_in",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+250788123456",
  "booking_date": "2025-01-15",
  "booking_time": "19:00",
  "number_of_guests": 4,
  "table_booking_special_requests": "Window seat preferred",
  "items": [
    {
      "menu_item_id": "uuid-of-menu-item",
      "quantity": 2,
      "addons": [
        {"id": "addon-id-1"},
        {"id": "addon-id-2"}
      ],
      "customizations": [
        {"name": "Spice Level", "value": "Medium"}
      ]
    }
  ],
  "tax_amount": 0,
  "discount_amount": 0,
  "payment_method": "cash",
  "special_instructions": "No onions please"
}
```

#### Request Body (Delivery Order)
```json
{
  "order_type": "delivery",
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+250788654321",
  "delivery_address": "123 Main Street, Kigali",
  "delivery_latitude": -1.9441,
  "delivery_longitude": 30.0619,
  "items": [
    {
      "menu_item_id": "uuid-of-menu-item",
      "quantity": 1,
      "addons": []
    }
  ],
  "delivery_fee": 2000,
  "tax_amount": 0,
  "discount_amount": 0,
  "payment_method": "mobile_money",
  "special_instructions": "Ring doorbell twice"
}
```

#### Request Body (Pickup Order)
```json
{
  "order_type": "pickup",
  "customer_name": "Bob Johnson",
  "customer_phone": "+250788999888",
  "items": [
    {
      "menu_item_id": "uuid-of-menu-item",
      "quantity": 3
    }
  ],
  "payment_method": "card"
}
```

#### Response
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "restaurant_id": "restaurant-uuid",
    "order_type": "dine_in",
    "customer_name": "John Doe",
    "order_status": "pending",
    "payment_status": "pending",
    "subtotal": 15000,
    "total_amount": 15000,
    "table_booking_id": 123,
    "items": [
      {
        "id": "item-uuid",
        "menu_item_id": "menu-item-uuid",
        "item_name": "Pizza Margherita",
        "quantity": 2,
        "unit_price": 7500,
        "subtotal": 15000,
        "addons": [...],
        "customizations": [...]
      }
    ],
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```

### 2. Get All Orders
**GET** `/api/v1/restaurant/orders`

Gets all orders for the vendor's restaurant.

#### Query Parameters
- `status` (optional): Filter by order status (`pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`)
- `payment_status` (optional): Filter by payment status (`pending`, `paid`, `refunded`)
- `order_type` (optional): Filter by order type (`dine_in`, `delivery`, `pickup`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "order_type": "dine_in",
      "customer_name": "John Doe",
      "order_status": "pending",
      "total_amount": 15000,
      "items": [...]
    }
  ],
  "count": 1
}
```

### 3. Get Order by ID
**GET** `/api/v1/restaurant/orders/:id`

Gets a specific order by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_type": "dine_in",
    "customer_name": "John Doe",
    "order_status": "pending",
    "items": [...]
  }
}
```

### 4. Update Order Status
**PATCH** `/api/v1/restaurant/orders/:id/status`

Updates the status of an order.

#### Request Body
```json
{
  "status": "confirmed",
  "delivery_boy_id": 123  // Optional, for delivery orders
}
```

#### Valid Statuses
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `out_for_delivery` (delivery orders only)
- `delivered`
- `cancelled`

#### Response
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "order-uuid",
    "order_status": "confirmed",
    ...
  }
}
```

### 5. Check Table Availability
**GET** `/api/v1/restaurant/orders/check-availability`

Checks if tables are available for a specific date and time.

#### Query Parameters
- `booking_date` (required): Date in YYYY-MM-DD format
- `booking_time` (required): Time in HH:MM format
- `number_of_guests` (required): Number of guests
- `restaurant_id` (optional): Restaurant ID (auto-detected if not provided)

#### Response
```json
{
  "success": true,
  "data": {
    "available": true,
    "total_capacity": 100,
    "available_seats": 50,
    "booked_guests": 50,
    "requested_guests": 4,
    "available_capacity": 50
  }
}
```

## Features

### Automatic Restaurant Detection
The API automatically detects the vendor's restaurant from their JWT token. You don't need to pass `restaurant_id` unless you want to override it.

### Table Booking for Dine-In
When creating a `dine_in` order:
1. The API checks table availability
2. Creates a table booking automatically
3. Links the booking to the order
4. Returns both the order and booking information

### Menu Item Validation
- Validates that menu items exist and are available
- Calculates prices from current menu item prices
- Supports addons and customizations
- Calculates totals automatically

### Order Items Format
Each item in the `items` array should have:
```json
{
  "menu_item_id": "uuid-of-menu-item",
  "quantity": 2,
  "addons": [
    {"id": "addon-id-1"}  // or just "addon-id-1" as string
  ],
  "customizations": [
    {"name": "Spice Level", "value": "Medium"}
  ]
}
```

### Payment Methods
- `card`: Credit/debit card
- `cash`: Cash payment
- `mobile_money`: Mobile money payment
- `bank_transfer`: Bank transfer

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

Common error codes:
- `400`: Bad Request (missing required fields, validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (order doesn't belong to your restaurant)
- `404`: Not Found (restaurant or order not found)
- `500`: Internal Server Error

## Example Flow

### Creating a Dine-In Order
1. Vendor logs in and gets JWT token
2. Vendor calls `POST /api/v1/restaurant/orders` with dine_in order data
3. API checks table availability
4. API creates table booking
5. API creates order with items
6. API calculates totals
7. Returns order with booking information

### Updating Order Status
1. Vendor calls `PATCH /api/v1/restaurant/orders/:id/status`
2. API validates order belongs to vendor
3. API updates order status
4. If delivery order, can assign delivery boy
5. Returns updated order

