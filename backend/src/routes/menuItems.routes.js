const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get menu categories for a restaurant (PUBLIC - no authentication required)
// This endpoint can be called with restaurant_id query parameter for public access
// Or without authentication for vendor's own restaurant
router.get('/categories', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    
    // If restaurant_id is provided, fetch categories for that restaurant (public access)
    if (restaurant_id) {
      const [categoryRows] = await pool.execute(
        'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order ASC, name ASC',
        [restaurant_id]
      );
      return res.json({ data: categoryRows });
    }
    
    // If no restaurant_id and user is authenticated, fetch for vendor's restaurant
    // Check if token exists (optional auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { authenticateToken } = require('../middlewares/auth.middleware');
        // Use optional auth - if token is valid, get vendor's restaurant
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const staysSecret = process.env.JWT_SECRET || 'stays-secret-key-change-in-production';
        const mainBackendSecret = process.env.MAIN_BACKEND_JWT_SECRET || staysSecret;
        
        let decoded = null;
        try {
          decoded = jwt.verify(token, staysSecret);
        } catch (staysError) {
          if (mainBackendSecret !== staysSecret) {
            try {
              decoded = jwt.verify(token, mainBackendSecret);
            } catch (mainError) {
              // Token invalid, continue as public request
            }
          }
        }
        
        if (decoded) {
          const userId = decoded.id || decoded.userId || decoded.user_id;
          const userType = decoded.userType || 'profile';
          
          // Get user's restaurant IDs
          let restaurantQuery = '';
          let restaurantParams = [];
          
          if (userType === 'restaurant_user') {
            restaurantQuery = 'SELECT id FROM restaurants WHERE CAST(user_id AS UNSIGNED) = ?';
            restaurantParams = [userId];
          } else {
            restaurantQuery = 'SELECT id FROM restaurants WHERE user_id = ? OR CAST(user_id AS UNSIGNED) = ?';
            restaurantParams = [String(userId), userId];
          }
          
          const [userRestaurants] = await pool.execute(restaurantQuery, restaurantParams);
          
          if (userRestaurants.length > 0) {
            const restaurantId = userRestaurants[0].id;
            const [categoryRows] = await pool.execute(
              'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order ASC, name ASC',
              [restaurantId]
            );
            return res.json({ data: categoryRows });
          }
        }
      } catch (error) {
        // If auth fails, continue as public request (no restaurant_id provided)
      }
    }
    
    // No restaurant_id and no valid auth - return empty array
    return res.json({ data: [] });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    res.status(500).json({ error: 'Failed to fetch menu categories' });
  }
});

// Get all menu items (PUBLIC - can be accessed by client web with restaurant_id)
// If authenticated, can access vendor's own restaurant without restaurant_id
router.get('/', async (req, res) => {
  try {
    const { restaurant_id, available } = req.query;
    
    let query = '';
    let params = [];
    
    // If restaurant_id is provided, use it (public access for client web)
    if (restaurant_id) {
      query = `SELECT mi.* FROM menu_items mi WHERE mi.restaurant_id = ?`;
      params = [restaurant_id];
    } else {
      // If no restaurant_id, try to get from authenticated user (for vendor dashboard)
      let userId = null;
      let userType = 'profile';
      
      // Try to authenticate if token is provided (optional)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken');
          const token = authHeader.split(' ')[1];
          const staysSecret = process.env.JWT_SECRET || 'stays-secret-key-change-in-production';
          const mainBackendSecret = process.env.MAIN_BACKEND_JWT_SECRET || staysSecret;
          
          let decoded = null;
          try {
            decoded = jwt.verify(token, staysSecret);
          } catch (staysError) {
            if (mainBackendSecret !== staysSecret) {
              try {
                decoded = jwt.verify(token, mainBackendSecret);
              } catch (mainError) {
                // Token invalid, continue without auth
              }
            }
          }
          
          if (decoded) {
            userId = decoded.id || decoded.userId || decoded.user_id;
            userType = decoded.userType || 'profile';
          }
        } catch (error) {
          // Continue without authentication
        }
      }
      
      // If authenticated, get vendor's restaurant
      if (userId) {
        let restaurantQuery = '';
        let restaurantParams = [];
        
        if (userType === 'restaurant_user') {
          restaurantQuery = 'SELECT id FROM restaurants WHERE CAST(user_id AS UNSIGNED) = ?';
          restaurantParams = [userId];
        } else {
          restaurantQuery = 'SELECT id FROM restaurants WHERE user_id = ? OR CAST(user_id AS UNSIGNED) = ?';
          restaurantParams = [String(userId), userId];
        }
        
        const [userRestaurants] = await pool.execute(restaurantQuery, restaurantParams);
        
        if (userRestaurants.length > 0) {
          query = `SELECT mi.* FROM menu_items mi WHERE mi.restaurant_id = ?`;
          params = [userRestaurants[0].id];
        } else {
          return res.json({ data: [] });
        }
      } else {
        // No restaurant_id and not authenticated - return empty
        return res.json({ data: [] });
      }
    }
    
    if (available !== undefined) {
      query += ' AND mi.available = ?';
      params.push(available === 'true' || available === true || available === 1);
    }

    query += ' ORDER BY mi.created_at DESC';

    console.log('Executing menu query:', query, params);
    const [rows] = await pool.execute(query, params);
    console.log('Menu items found:', rows.length);
    
    // Fetch images, category, add-ons, and customizations for each menu item
    const menuItemsWithDetails = await Promise.all(
      rows.map(async (item) => {
        try {
          // Fetch images
          const [imageRows] = await pool.execute(
            'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
            ['menu_item', item.id]
          );
          
          // Fetch category name
          let categoryName = null;
          if (item.category_id) {
            try {
              const [categoryRows] = await pool.execute(
                'SELECT name FROM menu_categories WHERE id = ?',
                [item.category_id]
              );
              if (categoryRows.length > 0) {
                categoryName = categoryRows[0].name;
              }
            } catch (error) {
              console.error('Error fetching category:', error);
            }
          }
          
          // Fetch add-ons
          const [addonRows] = await pool.execute(
            'SELECT * FROM menu_item_addons WHERE menu_item_id = ? ORDER BY display_order ASC',
            [item.id]
          );
          
          // Fetch customizations
          const [customizationRows] = await pool.execute(
            'SELECT * FROM menu_item_customizations WHERE menu_item_id = ? ORDER BY display_order ASC',
            [item.id]
          );
          
          // Parse customization options
          const customizations = customizationRows.map(row => ({
            name: row.name,
            options: row.options ? JSON.parse(row.options) : []
          }));
          
          return {
            ...item,
            category: categoryName || item.category_id, // Use category name if available, fallback to ID
            images: imageRows,
            addOns: addonRows.map(addon => ({
              name: addon.name,
              price: parseFloat(addon.price) || 0
            })),
            customizations: customizations
          };
        } catch (error) {
          console.error('Error fetching menu item details:', error);
          return {
            ...item,
            category: item.category_id,
            images: [],
            addOns: [],
            customizations: []
          };
        }
      })
    );
    
    res.json({ data: menuItemsWithDetails });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch menu items',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get menu item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    let query = '';
    let params = [];
    
    if (userType === 'restaurant_user') {
      query = `SELECT mi.* 
               FROM menu_items mi
               INNER JOIN restaurants r ON mi.restaurant_id = r.id
               WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
      params = [req.params.id, userId];
    } else {
      query = `SELECT mi.* 
               FROM menu_items mi
               INNER JOIN restaurants r ON mi.restaurant_id = r.id
               WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
      params = [req.params.id, String(userId), userId];
    }
    
    const [rows] = await pool.execute(query, params);

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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    if (!restaurant_id || !name || !price || !category) {
      return res.status(400).json({ error: 'Restaurant ID, name, price, and category are required' });
    }

    // Verify restaurant belongs to user - handle both INT and VARCHAR user_id
    let restaurantQuery = '';
    let restaurantParams = [];
    
    if (userType === 'restaurant_user') {
      restaurantQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
      restaurantParams = [restaurant_id, userId];
    } else {
      restaurantQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
      restaurantParams = [restaurant_id, String(userId), userId];
    }
    
    const [restaurantCheck] = await pool.execute(restaurantQuery, restaurantParams);

    if (restaurantCheck.length === 0) {
      return res.status(403).json({ error: 'Access denied. Restaurant not found or does not belong to you' });
    }

    const id = uuidv4();

    // Default to available (1) for new menu items unless explicitly set to false
    const isAvailable = available !== undefined ? (available ? 1 : 0) : 1;
    
    await pool.execute(
      `INSERT INTO menu_items 
       (id, restaurant_id, name, description, price, category, image_url, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, restaurant_id, name, description || null, price, category, image_url || null, isAvailable]
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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    // First check if menu item belongs to user's restaurant - handle both INT and VARCHAR user_id
    let checkQuery = '';
    let checkParams = [];
    
    if (userType === 'restaurant_user') {
      checkQuery = `SELECT mi.* 
                    FROM menu_items mi
                    INNER JOIN restaurants r ON mi.restaurant_id = r.id
                    WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
      checkParams = [req.params.id, userId];
    } else {
      checkQuery = `SELECT mi.* 
                    FROM menu_items mi
                    INNER JOIN restaurants r ON mi.restaurant_id = r.id
                    WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
      checkParams = [req.params.id, String(userId), userId];
    }
    
    const [checkRows] = await pool.execute(checkQuery, checkParams);

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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    // First check if menu item belongs to user's restaurant - handle both INT and VARCHAR user_id
    let checkQuery = '';
    let checkParams = [];
    
    if (userType === 'restaurant_user') {
      checkQuery = `SELECT mi.* 
                    FROM menu_items mi
                    INNER JOIN restaurants r ON mi.restaurant_id = r.id
                    WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
      checkParams = [req.params.id, userId];
    } else {
      checkQuery = `SELECT mi.* 
                    FROM menu_items mi
                    INNER JOIN restaurants r ON mi.restaurant_id = r.id
                    WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
      checkParams = [req.params.id, String(userId), userId];
    }
    
    const [checkRows] = await pool.execute(checkQuery, checkParams);

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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    // Get user's restaurant IDs - handle both INT and VARCHAR user_id
    let restaurantQuery = '';
    let restaurantParams = [];
    
    if (userType === 'restaurant_user') {
      restaurantQuery = 'SELECT id FROM restaurants WHERE CAST(user_id AS UNSIGNED) = ?';
      restaurantParams = [userId];
    } else {
      restaurantQuery = 'SELECT id FROM restaurants WHERE user_id = ? OR CAST(user_id AS UNSIGNED) = ?';
      restaurantParams = [String(userId), userId];
    }
    
    const [userRestaurants] = await pool.execute(restaurantQuery, restaurantParams);
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

