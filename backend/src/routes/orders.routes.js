const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, order_type, start_date, end_date } = req.query;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    let query = `
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      INNER JOIN restaurants r ON o.restaurant_id = r.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (order_type) {
      query += ' AND o.order_type = ?';
      params.push(order_type);
    }

    if (start_date) {
      query += ' AND o.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND o.created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.execute(query, params);

    // Get items count for each order
    const ordersWithCounts = await Promise.all(
      rows.map(async (order) => {
        try {
          const [countRows] = await pool.execute(
            'SELECT COUNT(*) as count FROM order_items WHERE order_id = ?',
            [order.id]
          );
          return {
            ...order,
            items_count: countRows[0]?.count || 0,
            restaurants: { name: order.restaurant_name }
          };
        } catch (error) {
          return {
            ...order,
            items_count: 0,
            restaurants: { name: order.restaurant_name }
          };
        }
      })
    );

    res.json(ordersWithCounts);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    const [orderRows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRows[0];

    // Get order items with menu item details
    try {
      const [itemRows] = await pool.execute(
        `SELECT oi.*, mi.name, mi.description, mi.category
         FROM order_items oi
         LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = ?`,
        [req.params.id]
      );

      const orderItems = itemRows.map(item => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        menu_items: {
          name: item.name,
          description: item.description,
          category: item.category
        }
      }));

      res.json({
        ...order,
        restaurants: { name: order.restaurant_name },
        order_items: orderItems
      });
    } catch (error) {
      res.json({
        ...order,
        restaurants: { name: order.restaurant_name },
        order_items: []
      });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      restaurant_id,
      order_type,
      order_type_order,
      customer_count = 1,
      customer_name,
      customer_phone,
      customer_location,
      delivery_person,
      total_amount,
      status = 'pending',
      items
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!restaurant_id || !order_type || !total_amount || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify restaurant belongs to user
    const [restaurantCheck] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurant_id, userId]
    );

    if (restaurantCheck.length === 0) {
      return res.status(403).json({ error: 'Access denied. Restaurant not found or does not belong to you' });
    }

    const orderId = uuidv4();

    // Create order
    await pool.execute(
      `INSERT INTO orders 
       (id, restaurant_id, order_type, order_type_order, customer_count, customer_name, customer_phone, customer_location, delivery_person, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, restaurant_id, order_type, order_type_order || null, customer_count, customer_name || null, customer_phone || null, customer_location || null, delivery_person || null, total_amount, status]
    );

    // Create order items
    if (items.length > 0) {
      for (const item of items) {
        const itemId = uuidv4();
        await pool.execute(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [itemId, orderId, item.menu_item_id || item.id, item.quantity, item.price]
        );
      }
    }

    // Update restaurant seats if dine-in
    if (order_type === 'dine-in') {
      await pool.execute(
        'UPDATE restaurants SET available_seats = available_seats - ? WHERE id = ?',
        [customer_count, restaurant_id]
      );
    }

    const [orderRows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ?`,
      [orderId]
    );

    res.status(201).json({
      ...orderRows[0],
      restaurants: { name: orderRows[0].restaurant_name }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // First check if order belongs to user's restaurant
    const [checkRows] = await pool.execute(
      `SELECT o.* 
       FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    const [rows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    res.json({
      ...rows[0],
      restaurants: { name: rows[0].restaurant_name }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_location,
      customer_count,
      order_type_order,
      delivery_person,
      status,
      total_amount
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    // First check if order belongs to user's restaurant
    const [checkRows] = await pool.execute(
      `SELECT o.* 
       FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    const updateFields = [];
    const params = [];

    if (customer_name !== undefined) { updateFields.push('customer_name = ?'); params.push(customer_name); }
    if (customer_phone !== undefined) { updateFields.push('customer_phone = ?'); params.push(customer_phone); }
    if (customer_location !== undefined) { updateFields.push('customer_location = ?'); params.push(customer_location); }
    if (customer_count !== undefined) { updateFields.push('customer_count = ?'); params.push(customer_count); }
    if (order_type_order !== undefined) { updateFields.push('order_type_order = ?'); params.push(order_type_order); }
    if (delivery_person !== undefined) { updateFields.push('delivery_person = ?'); params.push(delivery_person); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (total_amount !== undefined) { updateFields.push('total_amount = ?'); params.push(total_amount); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await pool.execute(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    res.json({
      ...rows[0],
      restaurants: { name: rows[0].restaurant_name }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get order items
router.get('/:id/items', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT oi.*, mi.name, mi.description, mi.category
       FROM order_items oi
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?
       ORDER BY oi.created_at`,
      [req.params.id]
    );

    const items = rows.map(item => ({
      id: item.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: item.price,
      menu_items: {
        name: item.name,
        description: item.description,
        category: item.category
      }
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

module.exports = router;

