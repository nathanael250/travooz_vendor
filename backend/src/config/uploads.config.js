const path = require('path');
const fs = require('fs');

/**
 * Uploads Configuration
 * 
 * This configuration centralizes all upload directory paths.
 * Uploads are stored outside the project directory to avoid issues
 * when deploying new versions.
 * 
 * Environment Variables:
 * - UPLOAD_BASE_PATH: Base directory for uploads (default: /var/www/uploads)
 * - PROJECT_NAME: Project name used in upload path (default: travooz)
 * 
 * Final path structure: /var/www/uploads/travooz/
 * This allows multiple projects: /var/www/uploads/project_name/
 */

// Get configuration from environment variables
const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH || '/var/www/uploads';
const PROJECT_NAME = process.env.PROJECT_NAME || 'travooz';

// Full upload path: /var/www/uploads/travooz
const UPLOADS_BASE_PATH = path.join(UPLOAD_BASE_PATH, PROJECT_NAME);

// Ensure the base uploads directory exists (with proper error handling)
const ensureBaseDirectory = () => {
  // First ensure the base directory exists
  if (!fs.existsSync(UPLOAD_BASE_PATH)) {
    try {
      fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true, mode: 0o755 });
      console.log(`✅ Created base uploads directory: ${UPLOAD_BASE_PATH}`);
    } catch (error) {
      console.error(`❌ Failed to create base uploads directory: ${UPLOAD_BASE_PATH}`, error.message);
      console.warn('⚠️  Please create the directory manually with: sudo mkdir -p /var/www/uploads && sudo chown -R $USER:$USER /var/www/uploads');
    }
  }
  
  // Then ensure the project-specific directory exists
  if (!fs.existsSync(UPLOADS_BASE_PATH)) {
    try {
      fs.mkdirSync(UPLOADS_BASE_PATH, { recursive: true, mode: 0o755 });
      console.log(`✅ Created uploads directory: ${UPLOADS_BASE_PATH}`);
    } catch (error) {
      console.error(`❌ Failed to create uploads directory: ${UPLOADS_BASE_PATH}`, error.message);
      console.warn('⚠️  Please create the directory manually with: sudo mkdir -p /var/www/uploads/travooz && sudo chown -R $USER:$USER /var/www/uploads/travooz');
    }
  }
};

// Initialize directory structure
ensureBaseDirectory();

/**
 * Get the full path for a specific upload subdirectory
 * @param {string} subPath - Subdirectory path (e.g., 'stays/property-images')
 * @returns {string} Full path to the upload directory
 */
const getUploadPath = (subPath) => {
  const fullPath = path.join(UPLOADS_BASE_PATH, subPath);
  
  // Ensure directory exists
  if (!fs.existsSync(fullPath)) {
    try {
      fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
    } catch (error) {
      console.error(`❌ Failed to create upload directory: ${fullPath}`, error.message);
      console.error(`⚠️  Please run: sudo chown -R $USER:$USER ${UPLOADS_BASE_PATH} && sudo chmod -R 755 ${UPLOADS_BASE_PATH}`);
      // Don't throw - let the application continue, but warn
    }
  }
  
  return fullPath;
};

/**
 * Get the URL path for serving uploaded files
 * @param {string} subPath - Subdirectory path (e.g., 'stays/property-images')
 * @param {string} filename - Filename
 * @returns {string} URL path (e.g., '/uploads/stays/property-images/image.jpg')
 */
const getUploadUrl = (subPath, filename) => {
  return `/uploads/${subPath}/${filename}`;
};

module.exports = {
  UPLOADS_BASE_PATH,
  getUploadPath,
  getUploadUrl,
  
  // Convenience paths for common upload directories (created lazily on first use)
  get STAYS_PROPERTY_IMAGES() { return getUploadPath('stays/property-images'); },
  get STAYS_ROOM_IMAGES() { return getUploadPath('stays/room-images'); },
  get TOURS_PACKAGES() { return getUploadPath('tours/packages'); },
  get TOURS() { return getUploadPath('tours'); },
  get RESTAURANTS() { return getUploadPath('restaurants'); },
  get MENU_ITEMS() { return getUploadPath('menu-items'); },
  get CARS() { return getUploadPath('cars'); },
};

