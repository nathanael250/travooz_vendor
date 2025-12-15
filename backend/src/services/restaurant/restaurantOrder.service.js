const { pool } = require('../../../config/database');
const EmailService = require('../../utils/email.service');
const { v4: uuidv4 } = require('uuid');

class RestaurantOrderService {
  /**
   * Ensure restaurant_orders table exists
   */
  async ensureRestaurantOrdersTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS restaurant_orders (
          id varchar(36) NOT NULL PRIMARY KEY,
          booking_id int DEFAULT NULL,
          restaurant_id varchar(36) NOT NULL,
          user_id int DEFAULT NULL,
          order_type enum('delivery','dine_in','pickup') NOT NULL DEFAULT 'delivery',
          customer_name varchar(255) NOT NULL,
          customer_email varchar(255) DEFAULT NULL,
          customer_phone varchar(50) NOT NULL,
          delivery_address text DEFAULT NULL,
          delivery_latitude decimal(10,8) DEFAULT NULL,
          delivery_longitude decimal(11,8) DEFAULT NULL,
          table_booking_id int DEFAULT NULL,
          subtotal decimal(10,2) NOT NULL DEFAULT 0.00,
          delivery_fee decimal(10,2) DEFAULT 0.00,
          tax_amount decimal(10,2) DEFAULT 0.00,
          discount_amount decimal(10,2) DEFAULT 0.00,
          total_amount decimal(10,2) NOT NULL DEFAULT 0.00,
          payment_method enum('card','cash','mobile_money','bank_transfer') DEFAULT 'card',
          payment_status enum('pending','paid','refunded') DEFAULT 'pending',
          order_status enum('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
          delivery_boy_id int DEFAULT NULL,
          special_instructions text DEFAULT NULL,
          estimated_delivery_time timestamp NULL DEFAULT NULL,
          delivered_at timestamp NULL DEFAULT NULL,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_restaurant_id (restaurant_id),
          KEY idx_user_id (user_id),
          KEY idx_booking_id (booking_id),
          KEY idx_order_status (order_status),
          KEY idx_payment_status (payment_status),
          KEY idx_delivery_boy_id (delivery_boy_id),
          KEY idx_table_booking_id (table_booking_id),
          KEY idx_created_at (created_at),
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error) {
      console.error('Error ensuring restaurant_orders table:', error);
    }
  }

  /**
   * Ensure restaurant_order_items table exists
   */
  async ensureRestaurantOrderItemsTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS restaurant_order_items (
          id varchar(36) NOT NULL PRIMARY KEY,
          order_id varchar(36) NOT NULL,
          menu_item_id varchar(36) NOT NULL,
          item_name varchar(255) NOT NULL,
          quantity int NOT NULL DEFAULT 1,
          unit_price decimal(10,2) NOT NULL,
          subtotal decimal(10,2) NOT NULL,
          addons text DEFAULT NULL,
          customizations text DEFAULT NULL,
          special_instructions text DEFAULT NULL,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_order_id (order_id),
          KEY idx_menu_item_id (menu_item_id),
          FOREIGN KEY (order_id) REFERENCES restaurant_orders(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error) {
      console.error('Error ensuring restaurant_order_items table:', error);
    }
  }

  /**
   * Create a new restaurant order
   */
  async createOrder(orderData) {
    await this.ensureRestaurantOrdersTable();
    await this.ensureRestaurantOrderItemsTable();

    const {
      restaurant_id,
      user_id = null,
      order_type = 'delivery',
      customer_name,
      customer_email = null,
      customer_phone,
      delivery_address = null,
      delivery_latitude = null,
      delivery_longitude = null,
      table_booking_id = null,
      items = [],
      delivery_fee = 0,
      tax_amount = 0,
      discount_amount = 0,
      payment_method = 'card',
      special_instructions = null
    } = orderData;

    // Validate required fields
    if (!restaurant_id || !customer_name || !customer_phone || !items || items.length === 0) {
      throw new Error('Restaurant ID, customer name, customer phone, and items are required');
    }

    // Validate order type specific requirements
    if (order_type === 'delivery' && !delivery_address) {
      throw new Error('Delivery address is required for delivery orders');
    }

    // Verify restaurant exists and is approved (check for both 'approved' and 'active' for backward compatibility)
    const [restaurants] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND (status = ? OR status = ?)',
      [restaurant_id, 'approved', 'active']
    );

    if (restaurants.length === 0) {
      throw new Error('Restaurant not found or not active');
    }

    // Calculate subtotal from items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { menu_item_id, quantity = 1, addons = [], customizations = [] } = item;

      // Get menu item details
      const [menuItems] = await pool.execute(
        'SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ? AND available = 1',
        [menu_item_id, restaurant_id]
      );

      if (menuItems.length === 0) {
        throw new Error(`Menu item ${menu_item_id} not found or not available`);
      }

      const menuItem = menuItems[0];
      const unitPrice = parseFloat(menuItem.price) || 0;
      const itemSubtotal = unitPrice * quantity;

      // Calculate addons price
      let addonsPrice = 0;
      if (addons && addons.length > 0) {
        // Extract addon IDs (handle both object format {id: '...'} and string format)
        const addonIds = addons.map(a => (typeof a === 'string' ? a : (a.id || a))).filter(Boolean);
        
        if (addonIds.length > 0) {
          // Create placeholders for IN clause
          const placeholders = addonIds.map(() => '?').join(',');
          const [addonRecords] = await pool.execute(
            `SELECT * FROM menu_item_addons WHERE menu_item_id = ? AND id IN (${placeholders})`,
            [menu_item_id, ...addonIds]
          );
          addonsPrice = addonRecords.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0) * quantity;
        }
      }

      subtotal += itemSubtotal + addonsPrice;

      orderItems.push({
        menu_item_id,
        item_name: menuItem.name,
        quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal + addonsPrice,
        addons: JSON.stringify(addons),
        customizations: JSON.stringify(customizations)
      });
    }

    const totalAmount = subtotal + parseFloat(delivery_fee || 0) + parseFloat(tax_amount || 0) - parseFloat(discount_amount || 0);

    // Create booking record in main bookings table
    let bookingId = null;
    try {
      const bookingReference = `FOOD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const [bookingResult] = await pool.execute(
        `INSERT INTO bookings 
         (service_type, user_id, total_amount, status, payment_status, order_status, booking_reference, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['food_order', user_id, totalAmount, 'pending', 'pending', 'received', bookingReference, special_instructions]
      );
      bookingId = bookingResult.insertId;
    } catch (bookingError) {
      console.error('Error creating booking record:', bookingError);
      // Continue without booking_id if table doesn't exist or error occurs
    }

    // Create order
    const orderId = uuidv4();
    await pool.execute(
      `INSERT INTO restaurant_orders 
       (id, booking_id, restaurant_id, user_id, order_type, customer_name, customer_email, customer_phone,
        delivery_address, delivery_latitude, delivery_longitude, table_booking_id,
        subtotal, delivery_fee, tax_amount, discount_amount, total_amount,
        payment_method, payment_status, order_status, special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, bookingId, restaurant_id, user_id, order_type, customer_name, customer_email, customer_phone,
        delivery_address, delivery_latitude, delivery_longitude, table_booking_id,
        subtotal, delivery_fee, tax_amount, discount_amount, totalAmount,
        payment_method, 'pending', 'pending', special_instructions
      ]
    );

    // Create order items
    for (const item of orderItems) {
      const itemId = uuidv4();
      await pool.execute(
        `INSERT INTO restaurant_order_items 
         (id, order_id, menu_item_id, item_name, quantity, unit_price, subtotal, addons, customizations)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId, orderId, item.menu_item_id, item.item_name, item.quantity,
          item.unit_price, item.subtotal, item.addons, item.customizations
        ]
      );
    }

    // Get created order with items
    const createdOrder = await this.getOrderById(orderId);

    // Send confirmation email to customer (non-blocking)
    try {
      if (customer_email) {
        const customerHtml = `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
            <h2>Thank you for your order from ${createdOrder.restaurant_name || 'our restaurant'}</h2>
            <p>Hi ${customer_name || 'there'},</p>
            <p>We have received your order <strong>${createdOrder.id}</strong>. Here are the details:</p>
            <p><strong>Total:</strong> ${Number(createdOrder.total_amount || 0).toLocaleString()} RWF</p>
            <p>We will notify you when your order status changes.</p>
            <p>Regards,<br/>Travooz Team</p>
          </div>
        `;

        const customerText = `Thank you for your order ${createdOrder.id}. Total: ${Number(createdOrder.total_amount || 0)} RWF`;

        await EmailService.sendEmail({
          to: customer_email,
          subject: `Order received (${createdOrder.id}) - ${createdOrder.restaurant_name || 'Travooz'}`,
          html: customerHtml,
          text: customerText
        });
      }
    } catch (err) {
      console.error('⚠️ Failed to send customer order confirmation email:', err.message || err);
    }

    // Send notification email to vendor (non-blocking)
    try {
      // Try to resolve vendor email from restaurants -> restaurant_users
      const [restaurants] = await pool.execute('SELECT user_id, name FROM restaurants WHERE id = ? LIMIT 1', [restaurant_id]);
      let vendorEmail = null;
      let vendorName = null;
      if (restaurants && restaurants.length > 0) {
        const r = restaurants[0];
        vendorName = r.name || null;
        if (r.user_id) {
          // Attempt to get email from restaurant_users (user_id may be int)
          try {
            const [users] = await pool.execute('SELECT email, name FROM restaurant_users WHERE user_id = ? LIMIT 1', [r.user_id]);
            if (users && users.length > 0) {
              vendorEmail = users[0].email;
              vendorName = users[0].name || vendorName;
            }
          } catch (userErr) {
            // Fallback: try as string id
            try {
              // Get vendor email and notification preferences from restaurants table
              const [restaurantInfo] = await pool.execute(
                `SELECT 
                   ru.email as vendor_email, 
                   ru.name as vendor_name,
                   r.wants_notifications,
                   r.notification_receiver
                 FROM restaurants r
                 LEFT JOIN restaurant_users ru ON CAST(r.user_id AS CHAR) = CAST(ru.user_id AS CHAR)
                 WHERE r.restaurant_id = ? LIMIT 1`,
                [r.restaurant_id]
              );
              
              if (restaurantInfo && restaurantInfo.length > 0) {
                // Use notification_receiver if wants_notifications is 'yes', otherwise use vendor email
                const wantsNotifications = restaurantInfo[0].wants_notifications === 'yes';
                vendorEmail = wantsNotifications && restaurantInfo[0].notification_receiver 
                  ? restaurantInfo[0].notification_receiver 
                  : restaurantInfo[0].vendor_email;
                vendorName = restaurantInfo[0].vendor_name || vendorName;
              }
            } catch (err2) {
              console.error('Error querying restaurant_users for vendor email:', err2.message || err2);
            }
          }
        }
      }

      if (vendorEmail) {
        const vendorHtml = `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
            <h2>New order received</h2>
            <p>Hi ${vendorName || 'there'},</p>
            <p>A new order <strong>${createdOrder.id}</strong> has been placed for your restaurant ${createdOrder.restaurant_name || ''}.</p>
            <p><strong>Total:</strong> ${Number(createdOrder.total_amount || 0).toLocaleString()} RWF</p>
            <p>Please check your vendor dashboard to accept and prepare the order.</p>
            <p>Regards,<br/>Travooz Team</p>
          </div>
        `;

        const vendorText = `New order ${createdOrder.id} received. Total: ${Number(createdOrder.total_amount || 0)} RWF`;

        await EmailService.sendEmail({
          to: vendorEmail,
          subject: `New order received (${createdOrder.id})`,
          html: vendorHtml,
          text: vendorText
        });
      }
    } catch (err) {
      console.error('⚠️ Failed to send vendor order notification email:', err.message || err);
    }

    return createdOrder;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    await this.ensureRestaurantOrdersTable();
    await this.ensureRestaurantOrderItemsTable();

    const [orders] = await pool.execute(
      `SELECT ro.*, r.name as restaurant_name, r.address as restaurant_address, r.capacity as restaurant_capacity
       FROM restaurant_orders ro
       LEFT JOIN restaurants r ON ro.restaurant_id = r.id
       WHERE ro.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    // Get table booking details if this is a dine-in order
    if (order.table_booking_id) {
      try {
        const [tableBookings] = await pool.execute(
          `SELECT * FROM restaurant_table_bookings WHERE id = ?`,
          [order.table_booking_id]
        );
        
        if (tableBookings.length > 0) {
          order.table_booking = tableBookings[0];
        }
      } catch (error) {
        console.error('Error fetching table booking:', error);
        // Continue without table booking info if table doesn't exist
      }
    }

    // Get order items
    const [items] = await pool.execute(
      `SELECT roi.*, mi.image_url as item_image, mi.category_id, mc.name as category_name
       FROM restaurant_order_items roi
       LEFT JOIN menu_items mi ON roi.menu_item_id = mi.id
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE roi.order_id = ?
       ORDER BY roi.created_at ASC`,
      [orderId]
    );

    order.items = items.map(item => ({
      ...item,
      category: item.category_name || 'Unknown',
      addons: item.addons ? JSON.parse(item.addons) : [],
      customizations: item.customizations ? JSON.parse(item.customizations) : []
    }));

    return order;
  }

  /**
   * Get orders for a restaurant
   */
  async getRestaurantOrders(restaurantId, filters = {}) {
    await this.ensureRestaurantOrdersTable();
    await this.ensureRestaurantOrderItemsTable();

    const {
      status = null,
      payment_status = null,
      order_type = null,
      limit = 50,
      offset = 0
    } = filters;

    let query = `
      SELECT ro.*, r.name as restaurant_name
      FROM restaurant_orders ro
      LEFT JOIN restaurants r ON ro.restaurant_id = r.id
      WHERE ro.restaurant_id = ?
    `;
    const params = [restaurantId];

    if (status) {
      query += ' AND ro.order_status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND ro.payment_status = ?';
      params.push(payment_status);
    }

    if (order_type) {
      query += ' AND ro.order_type = ?';
      params.push(order_type);
    }

    // Ensure limit and offset are valid integers
    const limitValue = limit ? parseInt(limit, 10) : 50;
    const offsetValue = offset ? parseInt(offset, 10) : 0;
    
    // Validate that they're not NaN
    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue < 0 || offsetValue < 0) {
      throw new Error('Invalid limit or offset values');
    }

    // MySQL requires LIMIT and OFFSET to be literal values, not parameters
    // Use string interpolation for LIMIT and OFFSET to avoid parameter binding issues
    query += ` ORDER BY ro.created_at DESC LIMIT ${limitValue} OFFSET ${offsetValue}`;

    const [orders] = await pool.execute(query, params);

    // Get items and table bookings for each order
    for (const order of orders) {
      // Get table booking details if this is a dine-in order
      if (order.table_booking_id) {
        try {
          const [tableBookings] = await pool.execute(
            `SELECT * FROM restaurant_table_bookings WHERE id = ?`,
            [order.table_booking_id]
          );
          
          if (tableBookings.length > 0) {
            order.table_booking = tableBookings[0];
          }
        } catch (error) {
          console.error('Error fetching table booking:', error);
          // Continue without table booking info if table doesn't exist
        }
      }

      const [items] = await pool.execute(
        `SELECT roi.*, mi.image_url as item_image, mi.category_id, mc.name as category_name
         FROM restaurant_order_items roi
         LEFT JOIN menu_items mi ON roi.menu_item_id = mi.id
         LEFT JOIN menu_categories mc ON mi.category_id = mc.id
         WHERE roi.order_id = ?
         ORDER BY roi.created_at ASC`,
        [order.id]
      );

      order.items = items.map(item => ({
        ...item,
        category: item.category_name || 'Unknown',
        addons: item.addons ? JSON.parse(item.addons) : [],
        customizations: item.customizations ? JSON.parse(item.customizations) : []
      }));
    }

    return orders;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, deliveryBoyId = null) {
    await this.ensureRestaurantOrdersTable();

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid order status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData = { order_status: status };
    if (deliveryBoyId) {
      updateData.delivery_boy_id = deliveryBoyId;
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(orderId);

    await pool.execute(
      `UPDATE restaurant_orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Also update bookings table if booking_id exists
    const [order] = await pool.execute('SELECT booking_id, order_status FROM restaurant_orders WHERE id = ?', [orderId]);
    if (order.length > 0 && order[0].booking_id) {
      try {
        const bookingOrderStatus = status === 'delivered' ? 'delivered' : 
                                   status === 'out_for_delivery' ? 'out_for_delivery' :
                                   status === 'ready' ? 'ready_for_pickup' :
                                   status === 'preparing' ? 'preparing' : 'received';
        await pool.execute(
          'UPDATE bookings SET order_status = ? WHERE booking_id = ?',
          [bookingOrderStatus, order[0].booking_id]
        );
      } catch (error) {
        console.error('Error updating bookings table:', error);
      }
    }

    return await this.getOrderById(orderId);
  }

  /**
   * Assign delivery boy to order
   * Note: Delivery boy ID comes from external API, we just store it
   */
  async assignDeliveryBoy(orderId, deliveryBoyId) {
    await this.ensureRestaurantOrdersTable();

    // Verify order exists and is for delivery
    const [orders] = await pool.execute(
      'SELECT * FROM restaurant_orders WHERE id = ? AND order_type = ?',
      [orderId, 'delivery']
    );

    if (orders.length === 0) {
      throw new Error('Order not found or not a delivery order');
    }

    // Note: We don't validate delivery_boy_id against local table since it comes from external API
    // Just store the ID and update order status
    await pool.execute(
      'UPDATE restaurant_orders SET delivery_boy_id = ?, order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [deliveryBoyId, 'out_for_delivery', orderId]
    );

    return await this.getOrderById(orderId);
  }
}

module.exports = new RestaurantOrderService();

