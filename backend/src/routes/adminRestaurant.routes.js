const express = require('express');
const { pool } = require('../../config/database');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0 || (users[0].role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking admin access',
      error: error.message 
    });
  }
};

/**
 * Get all restaurants for admin review
 * GET /api/v1/admin/restaurants
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        r.*,
        p.email as owner_email,
        u.name as owner_name,
        (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.id) as menu_items_count,
        (SELECT COUNT(*) FROM images WHERE entity_type = 'restaurant' AND entity_id = r.id) as images_count
      FROM restaurants r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (r.name LIKE ? OR r.description LIKE ? OR p.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [restaurants] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM restaurants r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND r.status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (r.name LIKE ? OR r.description LIKE ? OR p.email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    // Fetch images for each restaurant
    const restaurantsWithImages = await Promise.all(
      restaurants.map(async (restaurant) => {
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
    
    res.json({
      success: true,
      data: restaurantsWithImages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants for admin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch restaurants',
      error: error.message 
    });
  }
});

/**
 * Get restaurant statistics for admin dashboard
 * GET /api/v1/admin/restaurants/stats
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN setup_completed = 1 THEN 1 ELSE 0 END) as setup_completed
      FROM restaurants
    `);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
});

/**
 * Get restaurant details by ID for admin review
 * GET /api/v1/admin/restaurants/:id
 */
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get restaurant with owner info
    const [restaurants] = await pool.execute(`
      SELECT 
        r.*,
        p.email as owner_email,
        u.name as owner_name,
        p.phone as owner_phone
      FROM restaurants r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.id = ?
    `, [id]);
    
    if (restaurants.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }
    
    const restaurant = restaurants[0];
    
    // Get images
    const [images] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
      ['restaurant', id]
    );
    restaurant.images = images;
    
    // Get tax & legal info
    const [taxLegal] = await pool.execute(
      'SELECT * FROM restaurant_tax_legal WHERE restaurant_id = ?',
      [id]
    );
    restaurant.taxLegal = taxLegal[0] || null;
    
    // Get documents
    const [documents] = await pool.execute(
      'SELECT * FROM restaurant_documents WHERE restaurant_id = ?',
      [id]
    );
    restaurant.documents = documents;
    
    // Get menu categories
    const [categories] = await pool.execute(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order ASC',
      [id]
    );
    restaurant.menuCategories = categories;
    
    // Get menu items
    const [menuItems] = await pool.execute(
      `SELECT 
        mi.*,
        mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.restaurant_id = ?
      ORDER BY mc.display_order ASC, mi.name ASC`,
      [id]
    );
    restaurant.menuItems = menuItems;
    
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch restaurant details',
      error: error.message 
    });
  }
});

/**
 * Approve or reject restaurant
 * PATCH /api/v1/admin/restaurants/:id/status
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;
    
    // Validate status
    const validStatuses = ['pending', 'active', 'inactive', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Check if restaurant exists
    const [restaurants] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }
    
    // Update restaurant status
    // Note: admin_notes, approved_at, approved_by columns may not exist in all schemas
    // This will work with or without those columns
    try {
      await pool.execute(
        `UPDATE restaurants SET
         status = ?,
         admin_notes = ?,
         approved_at = ?,
         approved_by = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [status, notes || null, status !== 'pending' ? new Date() : null, status !== 'pending' ? adminId : null, id]
      );
    } catch (schemaError) {
      // Fallback if admin_notes, approved_at, approved_by columns don't exist
      if (schemaError.code === 'ER_BAD_FIELD_ERROR') {
        await pool.execute(
          `UPDATE restaurants SET
           status = ?,
           updated_at = NOW()
           WHERE id = ?`,
          [status, id]
        );
      } else {
        throw schemaError;
      }
    }
    
    // If approved, we could add additional logic here like:
    // - Send approval email to vendor
    // - Log the approval action
    // - Create notification
    
    res.json({
      success: true,
      message: `Restaurant ${status === 'active' ? 'approved' : status} successfully`,
      data: { restaurantId: id, status }
    });
  } catch (error) {
    console.error('Error updating restaurant status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update restaurant status',
      error: error.message 
    });
  }
});

module.exports = router;

