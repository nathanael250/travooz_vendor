const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all images for an entity (restaurant or menu_item)
router.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    if (!['restaurant', 'menu_item'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type. Must be restaurant or menu_item' });
    }

    // Verify entity belongs to user
    if (entityType === 'restaurant') {
      const [restaurantCheck] = await pool.execute(
        'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
        [entityId, userId]
      );
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (entityType === 'menu_item') {
      const [menuItemCheck] = await pool.execute(
        `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND r.user_id = ?`,
        [entityId, userId]
      );
      if (menuItemCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const [rows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC, created_at ASC',
      [entityType, entityId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Add images to an entity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, images } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    if (!entityType || !entityId || !images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'entityType, entityId, and images array are required' });
    }

    if (!['restaurant', 'menu_item'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type. Must be restaurant or menu_item' });
    }

    // Define max images per entity type
    const maxImages = entityType === 'restaurant' ? 2 : 3;
    
    if (images.length > maxImages) {
      return res.status(400).json({ 
        error: `Maximum ${maxImages} images allowed for ${entityType === 'restaurant' ? 'restaurants' : 'menu items'}. Trying to add ${images.length}` 
      });
    }

    // Verify entity belongs to user
    if (entityType === 'restaurant') {
      const [restaurantCheck] = await pool.execute(
        'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
        [entityId, userId]
      );
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied. Restaurant not found or does not belong to you' });
      }
    } else if (entityType === 'menu_item') {
      const [menuItemCheck] = await pool.execute(
        `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND r.user_id = ?`,
        [entityId, userId]
      );
      if (menuItemCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied. Menu item not found or does not belong to you' });
      }
    }

    // Check existing images count
    const [existingImages] = await pool.execute(
      'SELECT COUNT(*) as count FROM images WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );
    const existingCount = existingImages[0]?.count || 0;
    
    if (existingCount + images.length > maxImages) {
      return res.status(400).json({ 
        error: `Maximum ${maxImages} images allowed for ${entityType === 'restaurant' ? 'restaurants' : 'menu items'}. Currently have ${existingCount}, trying to add ${images.length}` 
      });
    }

    const imageIds = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      const imageId = uuidv4();
      
      await pool.execute(
        `INSERT INTO images (id, entity_type, entity_id, image_url, display_order, is_primary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          imageId,
          entityType,
          entityId,
          imageData.image_url,
          imageData.display_order !== undefined ? imageData.display_order : i,
          imageData.is_primary ? 1 : (i === 0 ? 1 : 0)
        ]
      );
      
      imageIds.push(imageId);
    }

    // Fetch and return all images for this entity
    const [rows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
      [entityType, entityId]
    );

    res.status(201).json(rows);
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// Delete an image
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    
    const [rows] = await pool.execute(
      'SELECT * FROM images WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = rows[0];
    
    // Verify entity belongs to user
    if (image.entity_type === 'restaurant') {
      const [restaurantCheck] = await pool.execute(
        'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
        [image.entity_id, userId]
      );
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (image.entity_type === 'menu_item') {
      const [menuItemCheck] = await pool.execute(
        `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND r.user_id = ?`,
        [image.entity_id, userId]
      );
      if (menuItemCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await pool.execute('DELETE FROM images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Update image (for reordering or setting primary)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { display_order, is_primary } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token

    // First get the image to verify ownership
    const [imageRows] = await pool.execute('SELECT * FROM images WHERE id = ?', [req.params.id]);
    if (imageRows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageRows[0];
    
    // Verify entity belongs to user
    if (image.entity_type === 'restaurant') {
      const [restaurantCheck] = await pool.execute(
        'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
        [image.entity_id, userId]
      );
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (image.entity_type === 'menu_item') {
      const [menuItemCheck] = await pool.execute(
        `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND r.user_id = ?`,
        [image.entity_id, userId]
      );
      if (menuItemCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updateFields = [];
    const params = [];

    if (display_order !== undefined) {
      updateFields.push('display_order = ?');
      params.push(display_order);
    }

    if (is_primary !== undefined) {
      // If setting this as primary, unset all other primary images for the same entity
      if (is_primary) {
        await pool.execute(
          'UPDATE images SET is_primary = 0 WHERE entity_type = ? AND entity_id = ? AND id != ?',
          [image.entity_type, image.entity_id, req.params.id]
        );
      }
      updateFields.push('is_primary = ?');
      params.push(is_primary ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await pool.execute(
      `UPDATE images SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.execute('SELECT * FROM images WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router;

