const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload Configuration Utility
 * 
 * This utility manages file uploads to external storage location
 * Base path: /var/www/uploads/{PROJECT_NAME}
 * 
 * Environment Variables:
 * - UPLOAD_BASE_PATH: Base directory for uploads (default: /var/www/uploads)
 * - PROJECT_NAME: Project name used in upload path (default: travooz)
 */
class UploadConfig {
  constructor() {
    // Get configuration from environment variables
    this.basePath = process.env.UPLOAD_BASE_PATH || '/var/www/uploads';
    this.projectName = process.env.PROJECT_NAME || 'travooz';
    
    // Full upload path: /var/www/uploads/travooz
    this.uploadRoot = path.join(this.basePath, this.projectName);
    
    // Ensure root upload directory exists
    this.ensureDirectoryExists(this.uploadRoot);
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
        console.log(`✅ Created upload directory: ${dirPath}`);
      } catch (error) {
        console.error(`❌ Failed to create upload directory: ${dirPath}`, error);
        throw error;
      }
    }
    return dirPath;
  }

  /**
   * Get full path for a subdirectory
   * @param {string} subfolder - Subfolder path (e.g., 'homestays', 'rooms/thumbnails')
   * @returns {string} Full path to the subdirectory
   */
  getUploadPath(subfolder = '') {
    const fullPath = subfolder 
      ? path.join(this.uploadRoot, subfolder)
      : this.uploadRoot;
    
    // Ensure subdirectory exists
    this.ensureDirectoryExists(fullPath);
    
    return fullPath;
  }

  /**
   * Create multer disk storage configuration
   * @param {string} subfolder - Subfolder within project uploads (e.g., 'homestays')
   * @param {Function} filenameGenerator - Optional custom filename generator function
   * @returns {multer.StorageEngine} Multer storage engine
   */
  createStorage(subfolder = '', filenameGenerator = null) {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = this.getUploadPath(subfolder);
        cb(null, uploadDir);
      },
      filename: filenameGenerator || ((req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      })
    });
  }

  /**
   * Create multer instance with storage configuration
   * @param {string} subfolder - Subfolder within project uploads
   * @param {Object} options - Additional multer options (limits, fileFilter, etc.)
   * @returns {multer.Multer} Configured multer instance
   */
  createMulter(subfolder = '', options = {}) {
    const storage = this.createStorage(subfolder, options.filenameGenerator);
    
    return multer({
      storage,
      fileFilter: options.fileFilter || ((req, file, cb) => {
        // Default: accept all files
        cb(null, true);
      }),
      limits: options.limits || {
        fileSize: 10 * 1024 * 1024, // 10MB default
      },
      ...options
    });
  }

  /**
   * Get the relative path from upload root (for database storage)
   * @param {string} fullPath - Full file path
   * @returns {string} Relative path from upload root
   */
  getRelativePath(fullPath) {
    const normalizedFullPath = path.normalize(fullPath);
    const normalizedRoot = path.normalize(this.uploadRoot);
    
    if (normalizedFullPath.startsWith(normalizedRoot)) {
      let relative = path.relative(normalizedRoot, normalizedFullPath);
      // Convert to forward slashes for consistency
      return relative.replace(/\\/g, '/');
    }
    
    // If path doesn't start with root, return as is
    return fullPath;
  }

  /**
   * Get full path from relative path
   * @param {string} relativePath - Relative path from upload root
   * @returns {string} Full absolute path
   */
  getFullPath(relativePath) {
    return path.join(this.uploadRoot, relativePath);
  }

  /**
   * Get upload root path
   * @returns {string} Upload root path
   */
  getRootPath() {
    return this.uploadRoot;
  }

  /**
   * Get base path
   * @returns {string} Base path (/var/www/uploads)
   */
  getBasePath() {
    return this.basePath;
  }

  /**
   * Get project name
   * @returns {string} Project name
   */
  getProjectName() {
    return this.projectName;
  }
}

// Export singleton instance
const uploadConfig = new UploadConfig();

module.exports = uploadConfig;






