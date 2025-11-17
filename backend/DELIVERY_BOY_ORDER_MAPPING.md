# Delivery Boy Order Mapping

This document explains how restaurant orders are mapped to the delivery boy API provider's expected format.

## Overview

When assigning a delivery boy to a restaurant order, the order data needs to be transformed from the restaurant system's format to the delivery boy API provider's format. This mapping is handled automatically by the `mapRestaurantOrderToDeliveryBoyFormat` function.

## API Endpoint

**GET** `/api/v1/restaurant/delivery-boys/order/:orderId/map`

Maps a restaurant order to the delivery boy API provider format.

### Authentication
Requires authentication token (vendor must be logged in).

### Parameters
- `orderId` (path parameter): The ID of the restaurant order to map

### Response
```json
{
  "success": true,
  "message": "Order mapped successfully",
  "data": {
    "id": "order-uuid",
    "username": "John Doe",
    "mobile": "+250788123456",
    "delivery_charge": "2000.00",
    "wallet_balance": "0.00",
    "promocode": "",
    "promo_discount": "0.00",
    "payment_method": "card",
    "final_total": "10000.00",
    "total": "10000.00",
    "total_payable": "10000.00",
    "address": "123 Main Street, Kigali, Rwanda",
    "total_tax_amount": "500.00",
    "total_tax_percent": "5.00",
    "date_added": "2025-11-15 22:55:00",
    "is_cancellable": "1",
    "is_returnable": "0",
    "is_already_cancelled": "0",
    "is_already_returned": "0",
    "is_return_request_submitted": "0",
    "active_status": "confirmed",
    "otp": "1234",
    "latitude": "-1.9441",
    "longitude": "30.0619",
    "delivery_date": "2025-11-16",
    "delivery_time": "23:00-01:00",
    "delivery_boy_id": "",
    "name": "John Doe",
    "type": "delivery",
    "date_delivered": "",
    "amount": "10000.00",
    "cash_received": "0.00",
    "message": "Ring doorbell twice",
    "order_items": [
      {
        "id": "1",
        "product_id": "menu-item-uuid",
        "product_name": "Creamy Mushroom Soup",
        "quantity": "2",
        "price": "4000.00",
        "discounted_price": "4000.00",
        "tax_amount": "200.00",
        "tax_percent": "5.00",
        "subtotal": "8000.00",
        "image": "https://example.com/image.jpg",
        "variant_id": "menu-item-uuid",
        "variant_name": "Addons: 2 | Spice Level: Medium"
      }
    ],
    "status": [
      ["pending", "2025-11-15 22:55:00"],
      ["confirmed", "2025-11-15 22:56:00"]
    ]
  }
}
```

## Field Mappings

### Basic Order Information
| Restaurant Order Field | Delivery Boy API Field | Notes |
|------------------------|------------------------|-------|
| `id` | `id` | Order UUID |
| `customer_name` | `username`, `name` | Customer name |
| `customer_phone` | `mobile` | Customer phone number |
| `delivery_fee` | `delivery_charge` | Delivery fee amount |
| `payment_method` | `payment_method` | Payment method |
| `total_amount` | `final_total`, `total`, `total_payable` | Calculated total |
| `delivery_address` | `address` | Delivery address |
| `tax_amount` | `total_tax_amount` | Total tax amount |
| `created_at` | `date_added` | Order creation date |
| `order_status` | `active_status` | Mapped status |
| `delivery_latitude` | `latitude` | Delivery location latitude |
| `delivery_longitude` | `longitude` | Delivery location longitude |
| `delivery_boy_id` | `delivery_boy_id` | Assigned delivery boy ID |
| `special_instructions` | `message` | Special instructions |

### Calculated Fields
- `total_tax_percent`: Calculated from `tax_amount / subtotal * 100`
- `delivery_date`: Extracted from `estimated_delivery_time` or calculated as `created_at + 1 hour`
- `delivery_time`: Time window based on estimated delivery time
- `otp`: Generated 4-digit code for order verification
- `is_cancellable`: `'1'` if status is `pending` or `confirmed`, otherwise `'0'`
- `cash_received`: Set to `total_payable` if payment method is `cash`, otherwise `'0.00'`

### Order Items Mapping
Each order item is mapped with:
- `product_id`: Menu item ID
- `product_name`: Item name
- `quantity`: Item quantity
- `price`: Unit price
- `discounted_price`: Same as price (no item-level discounts)
- `tax_amount`: Item tax amount
- `tax_percent`: Calculated tax percentage
- `subtotal`: `discounted_price * quantity`
- `image`: Item image URL
- `variant_id`: Menu item ID
- `variant_name`: Built from addons and customizations (e.g., "Addons: 2 | Spice Level: Medium")

### Status History
Status history is built from:
- `pending`: When order is created (`created_at`)
- Current status: When order status is updated (`updated_at`)
- `delivered`: When order is delivered (`delivered_at`)

## Usage Example

### Using the API Endpoint

```javascript
// Fetch mapped order format
const response = await fetch('/api/v1/restaurant/delivery-boys/order/ORDER_ID/map', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
// data contains the order in delivery boy API format
```

### Using the Service Directly

```javascript
const deliveryBoyProxyService = require('./services/restaurant/deliveryBoyProxy.service');
const restaurantOrderService = require('./services/restaurant/restaurantOrder.service');

// Get restaurant order
const restaurantOrder = await restaurantOrderService.getOrderById(orderId);

// Map to delivery boy format
const mappedOrder = deliveryBoyProxyService.mapRestaurantOrderToDeliveryBoyFormat(restaurantOrder);
```

## Notes

1. **Only Delivery Orders**: The mapping function only works for orders with `order_type === 'delivery'`. Other order types will throw an error.

2. **Missing Fields**: Some fields in the delivery boy API format are not available in restaurant orders and are set to default values:
   - `wallet_balance`: Always `'0.00'`
   - `promocode`: Always empty string
   - `promo_discount`: Always `'0.00'`
   - `is_returnable`: Always `'0'` (restaurant orders are not returnable)

3. **OTP Generation**: The OTP is generated as a simple 4-digit random number. In production, you may want to use a more secure OTP generation method.

4. **Status Mapping**: Restaurant order statuses are mapped as follows:
   - `pending` → `pending`
   - `confirmed` → `confirmed`
   - `preparing` → `preparing`
   - `ready` → `preparing`
   - `out_for_delivery` → `out_for_delivery`
   - `delivered` → `delivered`
   - `cancelled` → `cancelled`

## Integration with Delivery Boy API

When you need to send an order to the delivery boy API provider, you can:

1. Get the mapped order format using the endpoint above
2. Send the mapped order data to the delivery boy API provider
3. The delivery boy API provider will handle the order assignment and tracking

