const restaurantOrderService = require('../../services/restaurant/restaurantOrder.service');
const tableBookingService = require('../../services/restaurant/tableBooking.service');
const { pool } = require('../../../config/database');

/**
 * Adjust restaurant available seats (bounded between 0 and capacity)
 */
async function adjustRestaurantAvailableSeats(restaurantId, adjustment) {
  try {
    await pool.execute(
      `UPDATE restaurants 
       SET available_seats = GREATEST(0, LEAST(capacity, COALESCE(available_seats, capacity) + ?))
       WHERE id = ?`,
      [adjustment, restaurantId]
    );

    const [restaurants] = await pool.execute(
      'SELECT available_seats FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    return restaurants.length > 0 ? restaurants[0].available_seats : null;
  } catch (error) {
    console.error('Error adjusting restaurant available seats:', error);
    return null;
  }
}

/**
 * Create a new restaurant order
 * POST /api/v1/restaurant/orders
 * 
 * Supports:
 * - dine_in: Creates table booking and order
 * - delivery: Creates delivery order
 * - pickup: Creates pickup order
 */
async function createOrder(req, res) {
  try {
    const {
      order_type = 'dine_in', // 'dine_in', 'delivery', 'pickup'
      customer_name,
      customer_email,
      customer_phone,
      // For dine_in orders
      booking_date,
      booking_time,
      number_of_guests = 1,
      table_booking_special_requests,
      // For delivery orders
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      // Order items
      items = [],
      // Pricing (optional - will be calculated if not provided)
      delivery_fee = 0,
      tax_amount = 0,
      discount_amount = 0,
      // Payment
      payment_method = 'cash', // 'card', 'cash', 'mobile_money', 'bank_transfer'
      // Special instructions
      special_instructions
    } = req.body;

    // Get restaurant_id from request body
    let restaurantId = req.body.restaurant_id;

    // Check if this is an authenticated vendor order or a public client order
    const isVendorOrder = req.user && (req.user.id || req.user.user_id);

    if (!restaurantId && isVendorOrder) {
      // Auto-detect restaurant from vendor's user_id (for authenticated vendor orders)
      const vendorUserId = req.user.id || req.user.user_id;
      const userType = req.user.userType || 'restaurant_user';

      if (userType === 'restaurant_user') {
        // For restaurant_users, user_id is INT
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      } else {
        // For profiles, user_id is VARCHAR UUID
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      }
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    // Verify restaurant exists and is active
    const [restaurantCheck] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND status = ?',
      [restaurantId, 'active']
    );

    if (restaurantCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or not active'
      });
    }

    // For vendor orders, verify restaurant belongs to vendor
    if (isVendorOrder) {
      const vendorUserId = req.user.id || req.user.user_id;
      const userType = req.user.userType || 'restaurant_user';
      const restaurant = restaurantCheck[0];
      
      let belongsToVendor = false;
      if (userType === 'restaurant_user') {
        belongsToVendor = String(restaurant.user_id) === String(vendorUserId);
      } else {
        belongsToVendor = restaurant.user_id === String(vendorUserId);
      }

      if (!belongsToVendor) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Restaurant does not belong to you.'
        });
      }
    }

    // Validate required fields
    if (!customer_name || !customer_phone || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, and at least one item are required'
      });
    }

    // Validate order type specific requirements
    if (order_type === 'dine_in') {
      if (!booking_date || !booking_time) {
        return res.status(400).json({
          success: false,
          message: 'Booking date and time are required for dine-in orders'
        });
      }
    } else if (order_type === 'delivery') {
      if (!delivery_address) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required for delivery orders'
        });
      }
    }

    let tableBookingId = null;

    // Handle dine_in: Create table booking first
    if (order_type === 'dine_in') {
      try {
        // Check table availability
        const availability = await tableBookingService.checkAvailability(
          restaurantId,
          booking_date,
          booking_time,
          number_of_guests
        );

        if (!availability.available) {
          return res.status(400).json({
            success: false,
            message: `Not enough capacity available. Available: ${availability.available_capacity}, Requested: ${number_of_guests}`,
            availability
          });
        }

        // Create table booking
        const tableBooking = await tableBookingService.createTableBooking({
          restaurant_id: restaurantId,
          user_id: null, // Customer user_id (can be null for walk-in orders)
          customer_name,
          customer_email,
          customer_phone,
          booking_date,
          booking_time,
          number_of_guests: parseInt(number_of_guests) || 1,
          special_requests: table_booking_special_requests
        });

        tableBookingId = tableBooking.id;
      } catch (bookingError) {
        console.error('Error creating table booking:', bookingError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create table booking',
          error: bookingError.message
        });
      }
    }

    // Create order using the service
    try {
      const order = await restaurantOrderService.createOrder({
        restaurant_id: restaurantId,
        user_id: null, // Customer user_id (can be null for walk-in orders)
        order_type,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address: order_type === 'delivery' ? delivery_address : null,
        delivery_latitude: order_type === 'delivery' ? delivery_latitude : null,
        delivery_longitude: order_type === 'delivery' ? delivery_longitude : null,
        table_booking_id: order_type === 'dine_in' ? tableBookingId : null,
        items,
        delivery_fee: parseFloat(delivery_fee) || 0,
        tax_amount: parseFloat(tax_amount) || 0,
        discount_amount: parseFloat(discount_amount) || 0,
        payment_method,
        special_instructions
      });

      let updatedSeats = null;
      if (order_type === 'dine_in') {
        updatedSeats = await adjustRestaurantAvailableSeats(
          restaurantId,
          -1 * (parseInt(number_of_guests, 10) || 1)
        );
      }

      const responseData = { ...order };
      if (order_type === 'dine_in' && updatedSeats !== null) {
        responseData.updated_available_seats = updatedSeats;
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: responseData
      });
    } catch (orderError) {
      console.error('Error creating order:', orderError);
      
      // If order creation fails and we created a table booking, we should handle cleanup
      // (In production, you might want to cancel the booking or mark it as failed)
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: orderError.message
      });
    }
  } catch (error) {
    console.error('Error in createOrder controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Get all orders for vendor's restaurant
 * GET /api/v1/restaurant/orders
 */
async function getOrders(req, res) {
  try {
    const vendorUserId = req.user.id || req.user.user_id;
    const userType = req.user.userType || 'restaurant_user';

    // Get vendor's restaurant
    let restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      if (userType === 'restaurant_user') {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      } else {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      }
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const filters = {
      status: req.query.status || null,
      payment_status: req.query.payment_status || null,
      order_type: req.query.order_type || null,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const orders = await restaurantOrderService.getRestaurantOrders(restaurantId, filters);

    return res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
}

/**
 * Get order by ID
 * GET /api/v1/restaurant/orders/:id
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const vendorUserId = req.user.id || req.user.user_id;

    const order = await restaurantOrderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to vendor's restaurant
    let restaurantId = null;
    const userType = req.user.userType || 'restaurant_user';
    
    if (userType === 'restaurant_user') {
      const [restaurants] = await pool.execute(
        'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
        [vendorUserId, 'active']
      );
      if (restaurants.length > 0) {
        restaurantId = restaurants[0].id;
      }
    } else {
      const [restaurants] = await pool.execute(
        'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
        [vendorUserId, 'active']
      );
      if (restaurants.length > 0) {
        restaurantId = restaurants[0].id;
      }
    }

    if (order.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Order does not belong to your restaurant'
      });
    }

    return res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
}

/**
 * Update order status
 * PATCH /api/v1/restaurant/orders/:id/status
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, delivery_boy_id } = req.body;
    const vendorUserId = req.user.id || req.user.user_id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Verify order belongs to vendor's restaurant
    const order = await restaurantOrderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let restaurantId = null;
    const userType = req.user.userType || 'restaurant_user';
    
    if (userType === 'restaurant_user') {
      const [restaurants] = await pool.execute(
        'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
        [vendorUserId, 'active']
      );
      if (restaurants.length > 0) {
        restaurantId = restaurants[0].id;
      }
    } else {
      const [restaurants] = await pool.execute(
        'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
        [vendorUserId, 'active']
      );
      if (restaurants.length > 0) {
        restaurantId = restaurants[0].id;
      }
    }

    if (order.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Order does not belong to your restaurant'
      });
    }

    const updatedOrder = await restaurantOrderService.updateOrderStatus(
      id,
      status,
      delivery_boy_id || null
    );

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
}

/**
 * Check table availability
 * GET /api/v1/restaurant/orders/check-availability
 */
async function checkTableAvailability(req, res) {
  try {
    const { booking_date, booking_time, number_of_guests = 1 } = req.query;
    const vendorUserId = req.user.id || req.user.user_id;

    if (!booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        message: 'Booking date and time are required'
      });
    }

    // Get vendor's restaurant
    let restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      const userType = req.user.userType || 'restaurant_user';
      if (userType === 'restaurant_user') {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      } else {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      }
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const availability = await tableBookingService.checkAvailability(
      restaurantId,
      booking_date,
      booking_time,
      parseInt(number_of_guests) || 1
    );

    return res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  checkTableAvailability
};
