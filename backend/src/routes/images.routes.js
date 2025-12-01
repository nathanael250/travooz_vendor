const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Base64 image regex
const BASE64_IMAGE_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/;

// Restaurant images upload directory
const { RESTAURANTS, MENU_ITEMS } = require('../config/uploads.config');
const RESTAURANT_UPLOAD_DIR = RESTAURANTS;

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Save base64 image to disk
const saveBase64Image = async (dataUrl, targetDir) => {
  if (!dataUrl || !BASE64_IMAGE_REGEX.test(dataUrl)) {
    return null;
  }

  try {
    ensureDirectoryExists(targetDir);
    const [, mimeType] = dataUrl.match(BASE64_IMAGE_REGEX);
    const base64Data = dataUrl.replace(BASE64_IMAGE_REGEX, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const extension = mimeType.split('/')[1] || 'png';
    const fileName = `restaurant-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const absolutePath = path.join(targetDir, fileName);
    await fs.promises.writeFile(absolutePath, buffer);
    return {
      url: `/uploads/restaurants/${fileName}`,
      size: buffer.length,
      type: mimeType,
      name: fileName
    };
  } catch (error) {
    console.error('❌ Failed to save base64 image:', error);
    return null;
  }
};

// Get all images for an entity (restaurant or menu_item)
router.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    if (!['restaurant', 'menu_item'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type. Must be restaurant or menu_item' });
    }

    // Verify entity belongs to user (handle both INT and VARCHAR user_id)
    if (entityType === 'restaurant') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
        checkParams = [entityId, userId];
      } else {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
        checkParams = [entityId, String(userId), userId];
      }

      const [restaurantCheck] = await pool.execute(checkQuery, checkParams);
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (entityType === 'menu_item') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
        checkParams = [entityId, userId];
      } else {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
        checkParams = [entityId, String(userId), userId];
      }

      const [menuItemCheck] = await pool.execute(checkQuery, checkParams);
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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    if (!entityType || !entityId || !images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'entityType, entityId, and images array are required' });
    }

    if (!['restaurant', 'menu_item'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type. Must be restaurant or menu_item' });
    }

    // Define max images per entity type
    // Restaurants: 1 logo + 10 gallery images = 11 total
    const maxImages = entityType === 'restaurant' ? 11 : 3;
    
    if (images.length > maxImages) {
      return res.status(400).json({ 
        error: `Maximum ${maxImages} images allowed for ${entityType === 'restaurant' ? 'restaurants' : 'menu items'}. Trying to add ${images.length}` 
      });
    }

    // Verify entity belongs to user (handle both INT and VARCHAR user_id)
    if (entityType === 'restaurant') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
        checkParams = [entityId, userId];
      } else {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
        checkParams = [entityId, String(userId), userId];
      }

      const [restaurantCheck] = await pool.execute(checkQuery, checkParams);
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied. Restaurant not found or does not belong to you' });
      }
    } else if (entityType === 'menu_item') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
        checkParams = [entityId, userId];
      } else {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
        checkParams = [entityId, String(userId), userId];
      }

      const [menuItemCheck] = await pool.execute(checkQuery, checkParams);
      if (menuItemCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied. Menu item not found or does not belong to you' });
      }
    }

    // Get existing images to check for duplicates
    const [existingImagesRows] = await pool.execute(
      'SELECT id, image_url, image_type FROM images WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );
    const existingUrls = new Set(existingImagesRows.map(row => row.image_url));
    let existingCount = existingImagesRows.length;
    
    // Check if any new images are logos - if so, delete existing logo first
    const hasNewLogo = images.some(img => img.image_type === 'logo');
    if (hasNewLogo && entityType === 'restaurant') {
      const existingLogo = existingImagesRows.find(row => row.image_type === 'logo');
      if (existingLogo) {
        // Delete existing logo
        await pool.execute('DELETE FROM images WHERE id = ?', [existingLogo.id]);
        // Remove from existing count and URLs set
        existingUrls.delete(existingLogo.image_url);
        existingCount = existingCount - 1;
      }
    }
    
    // Filter out images that already exist and count new ones
    const newImages = images.filter(img => {
      const url = img.image_url;
      // If it's base64, it's definitely new
      if (url && BASE64_IMAGE_REGEX.test(url)) {
        return true;
      }
      // If it's a file URL, check if it already exists
      return !existingUrls.has(url);
    });
    
    if (newImages.length === 0) {
      // All images already exist - just return existing images
      const [allImages] = await pool.execute(
        'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
        [entityType, entityId]
      );
      return res.status(200).json(allImages);
    }
    
    // Check if adding new images would exceed the limit
    if (existingCount + newImages.length > maxImages) {
      return res.status(400).json({ 
        error: `Maximum ${maxImages} images allowed for ${entityType === 'restaurant' ? 'restaurants' : 'menu items'}. Currently have ${existingCount}, trying to add ${newImages.length} new images` 
      });
    }

    const imageIds = [];
    const uploadDir = entityType === 'restaurant' ? RESTAURANT_UPLOAD_DIR : MENU_ITEMS;
    
    // Process only new images (base64 or URLs that don't exist yet)
    for (let i = 0; i < newImages.length; i++) {
      const imageData = newImages[i];
      const imageId = uuidv4();
      
      let imageUrl = imageData.image_url;
      
      // If image_url is a base64 data URL, save it to disk first
      if (imageUrl && BASE64_IMAGE_REGEX.test(imageUrl)) {
        const savedImage = await saveBase64Image(imageUrl, uploadDir);
        if (!savedImage) {
          console.error(`Failed to save base64 image at index ${i}`);
          continue; // Skip this image if save failed
        }
        imageUrl = savedImage.url;
      }
      
      // Skip if image_url is still invalid
      if (!imageUrl) {
        console.error(`Invalid image_url at index ${i}`);
        continue;
      }
      
      // Double-check it doesn't already exist (race condition protection)
      if (existingUrls.has(imageUrl)) {
        console.log(`Skipping duplicate image URL: ${imageUrl}`);
        continue;
      }
      
      await pool.execute(
        `INSERT INTO images (id, entity_type, entity_id, image_url, image_type, display_order, is_primary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          imageId,
          entityType,
          entityId,
          imageUrl,
          imageData.image_type || null,
          imageData.display_order !== undefined ? imageData.display_order : (existingCount + i),
          imageData.is_primary ? 1 : (existingCount === 0 && i === 0 ? 1 : 0)
        ]
      );
      
      imageIds.push(imageId);
      existingUrls.add(imageUrl); // Add to set to prevent duplicates in same request
    }

    if (imageIds.length === 0) {
      // No new images were added, return existing ones
      const [allImages] = await pool.execute(
        'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
        [entityType, entityId]
      );
      return res.status(200).json(allImages);
    }

    // Fetch and return all images for this entity
    const [rows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? ORDER BY is_primary DESC, display_order ASC',
      [entityType, entityId]
    );

    res.status(201).json(rows);
  } catch (error) {
    console.error('Error adding images:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Failed to add images',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});

// Delete an image
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id; // Get user ID from JWT token
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'
    
    const [rows] = await pool.execute(
      'SELECT * FROM images WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = rows[0];
    
    // Verify entity belongs to user (handle both INT and VARCHAR user_id)
    if (image.entity_type === 'restaurant') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
        checkParams = [image.entity_id, userId];
      } else {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
        checkParams = [image.entity_id, String(userId), userId];
      }

      const [restaurantCheck] = await pool.execute(checkQuery, checkParams);
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (image.entity_type === 'menu_item') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
        checkParams = [image.entity_id, userId];
      } else {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
        checkParams = [image.entity_id, String(userId), userId];
      }

      const [menuItemCheck] = await pool.execute(checkQuery, checkParams);
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
    const userType = req.user.userType || 'profile'; // 'restaurant_user' or 'profile'

    // First get the image to verify ownership
    const [imageRows] = await pool.execute('SELECT * FROM images WHERE id = ?', [req.params.id]);
    if (imageRows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageRows[0];
    
    // Verify entity belongs to user (handle both INT and VARCHAR user_id)
    if (image.entity_type === 'restaurant') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND CAST(user_id AS UNSIGNED) = ?';
        checkParams = [image.entity_id, userId];
      } else {
        checkQuery = 'SELECT * FROM restaurants WHERE id = ? AND (user_id = ? OR CAST(user_id AS UNSIGNED) = ?)';
        checkParams = [image.entity_id, String(userId), userId];
      }

      const [restaurantCheck] = await pool.execute(checkQuery, checkParams);
      if (restaurantCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (image.entity_type === 'menu_item') {
      let checkQuery = '';
      let checkParams = [];

      if (userType === 'restaurant_user') {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND CAST(r.user_id AS UNSIGNED) = ?`;
        checkParams = [image.entity_id, userId];
      } else {
        checkQuery = `SELECT mi.* 
         FROM menu_items mi
         INNER JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = ? AND (r.user_id = ? OR CAST(r.user_id AS UNSIGNED) = ?)`;
        checkParams = [image.entity_id, String(userId), userId];
      }

      const [menuItemCheck] = await pool.execute(checkQuery, checkParams);
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

