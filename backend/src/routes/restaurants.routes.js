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
    
    let query = 'SELECT * FROM restaurants WHERE user_id = ?';
    let params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    
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
    
    const [rows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurant = rows[0];
    
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
      image_url,
      status
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    // First check if restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found or access denied' });
    }

    const updateFields = [];
    const params = [];

    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (capacity !== undefined) { updateFields.push('capacity = ?'); params.push(capacity); }
    if (available_seats !== undefined) { updateFields.push('available_seats = ?'); params.push(available_seats); }
    if (address !== undefined) { updateFields.push('address = ?'); params.push(address); }
    if (phone !== undefined) { updateFields.push('phone = ?'); params.push(phone); }
    if (image_url !== undefined) { updateFields.push('image_url = ?'); params.push(image_url); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id, userId);

    await pool.execute(
      `UPDATE restaurants SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    const [rows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
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

