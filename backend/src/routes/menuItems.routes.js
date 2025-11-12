const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all menu items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { restaurant_id, available } = req.query;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    // Get user's restaurant IDs first
    const [userRestaurants] = await pool.execute(
      'SELECT id FROM restaurants WHERE user_id = ?',
      [userId]
    );
    const userRestaurantIds = userRestaurants.map(r => r.id);
    
    if (userRestaurantIds.length === 0) {
      return res.json([]); // User has no restaurants
    }

    let query = `
      SELECT mi.* 
      FROM menu_items mi
      INNER JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (restaurant_id) {
      // Verify restaurant belongs to user
      if (userRestaurantIds.includes(restaurant_id)) {
        query += ' AND mi.restaurant_id = ?';
        params.push(restaurant_id);
      } else {
        return res.status(403).json({ error: 'Access denied to this restaurant' });
      }
    }
    
    if (available !== undefined) {
      query += ' AND mi.available = ?';
      params.push(available === 'true' || available === true || available === 1);
    }

    query += ' ORDER BY mi.created_at DESC';

    const [rows] = await pool.execute(query, params);
    
    // Fetch images for each menu item
    const menuItemsWithImages = await Promise.all(
      rows.map(async (item) => {
        try {
          const [imageRows] = await pool.execute(
            'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
            ['menu_item', item.id]
          );
          return {
            ...item,
            images: imageRows
          };
        } catch (error) {
          return {
            ...item,
            images: []
          };
        }
      })
    );
    
    res.json(menuItemsWithImages);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    const [rows] = await pool.execute(
      `SELECT mi.* 
       FROM menu_items mi
       INNER JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const menuItem = rows[0];
    
    // Fetch images for this menu item
    try {
      const [imageRows] = await pool.execute(
        'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
        ['menu_item', menuItem.id]
      );
      
      res.json({
        ...menuItem,
        images: imageRows
      });
    } catch (error) {
      res.json({
        ...menuItem,
        images: []
      });
    }
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      restaurant_id,
      name,
      description,
      price,
      category,
      image_url,
      available = true
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!restaurant_id || !name || !price || !category) {
      return res.status(400).json({ error: 'Restaurant ID, name, price, and category are required' });
    }

    // Verify restaurant belongs to user
    const [restaurantCheck] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurant_id, userId]
    );

    if (restaurantCheck.length === 0) {
      return res.status(403).json({ error: 'Access denied. Restaurant not found or does not belong to you' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO menu_items 
       (id, restaurant_id, name, description, price, category, image_url, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, restaurant_id, name, description || null, price, category, image_url || null, available ? 1 : 0]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM menu_items WHERE id = ?',
      [id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image_url,
      available
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    // First check if menu item belongs to user's restaurant
    const [checkRows] = await pool.execute(
      `SELECT mi.* 
       FROM menu_items mi
       INNER JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found or access denied' });
    }

    const updateFields = [];
    const params = [];

    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (price !== undefined) { updateFields.push('price = ?'); params.push(price); }
    if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
    if (image_url !== undefined) { updateFields.push('image_url = ?'); params.push(image_url); }
    if (available !== undefined) { updateFields.push('available = ?'); params.push(available ? 1 : 0); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await pool.execute(
      `UPDATE menu_items SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.execute(
      'SELECT * FROM menu_items WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    // First check if menu item belongs to user's restaurant
    const [checkRows] = await pool.execute(
      `SELECT mi.* 
       FROM menu_items mi
       INNER JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.id = ? AND r.user_id = ?`,
      [req.params.id, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found or access denied' });
    }
    
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Bulk import menu items
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    // Get user's restaurant IDs
    const [userRestaurants] = await pool.execute(
      'SELECT id FROM restaurants WHERE user_id = ?',
      [userId]
    );
    const userRestaurantIds = userRestaurants.map(r => r.id);

    const results = [];

    for (const item of items) {
      const restaurantId = item.restaurant_id || item.restaurant;
      
      // Verify restaurant belongs to user
      if (!userRestaurantIds.includes(restaurantId)) {
        continue; // Skip items for restaurants not owned by user
      }
      
      const id = uuidv4();
      await pool.execute(
        `INSERT INTO menu_items 
         (id, restaurant_id, name, description, price, category, image_url, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          restaurantId,
          item.name,
          item.description || null,
          item.price,
          item.category,
          item.image_url || null,
          item.available !== undefined ? (item.available ? 1 : 0) : 1
        ]
      );
      results.push(id);
    }

    res.json({ message: `${results.length} menu items imported successfully`, ids: results });
  } catch (error) {
    console.error('Error importing menu items:', error);
    res.status(500).json({ error: 'Failed to import menu items' });
  }
});

module.exports = router;

