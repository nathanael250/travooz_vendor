const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all restaurants
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    // For restaurant_users, user_id is INT. For profiles, it might be varchar
    // Handle both cases by checking if userId matches either as string or int
    let query = '';
    let params = [];

    if (userType === 'restaurant_user') {
      // Restaurant user: user_id is INT, restaurants.user_id might be varchar or int
      query = 'SELECT * FROM restaurants WHERE CAST(user_id AS UNSIGNED) = ?';
      params = [userId];
    } else {
      // Profile user: user_id might be varchar or int
      query = 'SELECT * FROM restaurants WHERE user_id = ? OR CAST(user_id AS UNSIGNED) = ?';
      params = [String(userId), userId];
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    
    // Log query results for debugging
    console.log('🔍 GET /restaurants - Query results:', {
      userId,
      userType,
      rowsFound: rows.length,
      restaurants: rows.map(r => ({ id: r.id, name: r.name, status: r.status }))
    });
    
    // Fetch images for each restaurant
    const restaurantsWithImages = await Promise.all(
      rows.map(async (restaurant) => {
        const [imageRows] = await pool.execute(
          'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
          ['restaurant', restaurant.id]
        );
        return {
          ...restaurant,
          images: imageRows
        };
      })
    );
    
    res.json(restaurantsWithImages);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    // For restaurant_users, user_id is INT. For profiles, it might be varchar
    // Handle both cases
    let query = '';
    let params = [];

    if (userType === 'restaurant_user') {
      // Restaurant user: user_id is INT, restaurants.user_id might be varchar or int
      query = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
      params = [req.params.id, userId];
    } else {
      // Profile user: user_id might be varchar or int
      query = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
      params = [req.params.id, String(userId), userId];
    }

    const [rows] = await pool.execute(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurant = rows[0];
    
    // Log restaurant data for debugging
    console.log('🔍 GET /restaurants/:id - Restaurant data:', {
      id: restaurant.id,
      name: restaurant.name,
      status: restaurant.status,
      statusType: typeof restaurant.status,
      userId: restaurant.user_id
    });
    
    // Fetch images for this restaurant
    const [imageRows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
      ['restaurant', restaurant.id]
    );
    
    res.json({
      ...restaurant,
      images: imageRows
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Create restaurant
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      available_seats,
      address,
      phone,
      image_url,
      status = 'active'
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO restaurants 
       (id, user_id, name, description, capacity, available_seats, address, phone, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, name, description || null, capacity || 0, available_seats || capacity || 0, address || null, phone || null, image_url || null, status]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      available_seats,
      address,
      phone,
      image_url, // Ignored - images are stored in separate images table
      status
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    // First check if restaurant belongs to user (handle both INT and VARCHAR user_id)
    let checkQuery = '';
    let checkParams = [];

    if (userType === 'restaurant_user') {
      // Restaurant user: user_id is INT, restaurants.user_id might be varchar or int
      checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
      checkParams = [req.params.id, userId];
    } else {
      // Profile user: user_id might be varchar or int
      checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
      checkParams = [req.params.id, String(userId), userId];
    }

    const [checkRows] = await pool.execute(checkQuery, checkParams);

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found or access denied' });
    }

    const updateFields = [];
    const params = [];

    // Only update fields that exist in the restaurants table
    // Note: image_url is NOT in the restaurants table - images are stored in separate images table
    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (capacity !== undefined) { updateFields.push('capacity = ?'); params.push(capacity); }
    if (available_seats !== undefined) { updateFields.push('available_seats = ?'); params.push(available_seats); }
    if (address !== undefined) { updateFields.push('address = ?'); params.push(address); }
    if (phone !== undefined) { updateFields.push('phone = ?'); params.push(phone); }
    // image_url is ignored - images are managed via separate images API
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Build WHERE clause with proper user_id handling
    let whereClause = '';
    let whereParams = [];

    if (userType === 'restaurant_user') {
      whereClause = 'id = ? AND CAST(user_id AS UNSIGNED) = ?';
      whereParams = [req.params.id, userId];
    } else {
      whereClause = 'id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
      whereParams = [req.params.id, String(userId), userId];
    }

    params.push(...whereParams);

    await pool.execute(
      `UPDATE restaurants SET ${updateFields.join(', ')} WHERE ${whereClause}`,
      params
    );

    const [rows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.params.id]
    );

    // Fetch images for this restaurant
    const [imageRows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
      ['restaurant', req.params.id]
    );

    res.json({
      ...rows[0],
      images: imageRows
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({ 
      error: 'Failed to update restaurant',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});

// Delete restaurant
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    
    // First check if restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found or access denied' });
    }
    
    await pool.execute('DELETE FROM restaurants WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

module.exports = router;

