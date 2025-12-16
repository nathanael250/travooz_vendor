const express = require('express');
const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth.middleware');
const restaurantSetupProgressService = require('../services/restaurant/restaurantSetupProgress.service');
const restaurantOnboardingProgressService = require('../services/restaurant/onboardingProgress.service');
const restaurantOnboardingProgressController = require('../controllers/restaurant/onboardingProgress.controller');
const restaurantAuthController = require('../controllers/restaurant/restaurantAuth.controller');
const restaurantEmailVerificationController = require('../controllers/restaurant/restaurantEmailVerification.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Auth routes (no authentication required)
router.post('/auth/login', restaurantAuthController.login);
router.get('/auth/profile', authenticateToken, restaurantAuthController.getProfile);
router.post('/auth/forgot-password', restaurantAuthController.requestPasswordReset);
router.post('/auth/reset-password', restaurantAuthController.resetPassword);

// Email verification routes (no authentication required)
router.post('/email-verification/send', restaurantEmailVerificationController.sendVerificationCode);
router.post('/email-verification/verify', restaurantEmailVerificationController.verifyCode);

// Onboarding Progress Tracking routes (require authentication)
// These routes are mounted at /api/v1/eating-out/onboarding, so they should be /progress, /complete-step, etc.
router.get('/progress', authenticateToken, restaurantOnboardingProgressController.getProgress);
router.post('/progress', authenticateToken, restaurantOnboardingProgressController.saveProgress);
router.post('/complete-step', authenticateToken, restaurantOnboardingProgressController.completeStep);
router.get('/next-step', authenticateToken, restaurantOnboardingProgressController.getNextStep);

const formatUserPhone = (phone, countryCode, defaultCode = '+250') => {
  const raw = (phone || '').toString().replace(/\s+/g, '');
  if (!raw) return null;
  if (raw.startsWith('+')) return raw;

  const codeSource = (countryCode || defaultCode || '').toString().replace(/\s+/g, '');
  if (!codeSource) {
    return raw.startsWith('+') ? raw : `+${raw.replace(/^\+/, '')}`;
  }

  const codeWithPlus = codeSource.startsWith('+') ? codeSource : `+${codeSource}`;
  const numberPart = raw.replace(/^\+/, '');
  return `${codeWithPlus}${numberPart}`;
};

const cleanBusinessPhone = (phone) => {
  const raw = (phone || '').toString().trim();
  if (!raw) return null;
  return raw.replace(/\s+/g, '');
};

/**
 * Check if user exists in restaurant_users table
 * POST /api/v1/restaurant/check-user
 */
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const [users] = await pool.execute(
      'SELECT user_id, email, name FROM restaurant_users WHERE email = ?',
      [email]
    );
    
    return res.json({
      success: true,
      exists: users.length > 0,
      user: users.length > 0 ? users[0] : null
    });
  } catch (error) {
    console.error('Error checking restaurant user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check user',
      error: error.message
    });
  }
});


// Configure multer for file uploads
const { RESTAURANTS } = require('../config/uploads.config');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESTAURANTS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    fieldSize: 10 * 1024 * 1024, // 10MB field value limit (for JSON fields like locationData, menuItems, etc.)
    fields: 50, // Maximum number of non-file fields
    fieldNameSize: 100 // Maximum field name size
  }
});

/**
 * Step 1: Create initial restaurant listing (with user account creation)
 * POST /api/v1/eating-out/setup/listing
 * This endpoint creates both the user account and restaurant listing in one call
 * No authentication required - creates new user
 */
router.post('/listing', async (req, res) => {
  try {
    const {
      // User account data
      firstName,
      lastName,
      email,
      phone: userPhone,
      countryCode,
      password,
      // Restaurant data
      restaurantName,
      restaurantType,
      restaurantTypeName,
      subcategoryId,
      description,
      phone: restaurantPhone,
      currency,
      location,
      locationData
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required to create a restaurant account' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required to create a restaurant account' 
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: 'First name and last name are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    const normalizedUserPhone = formatUserPhone(userPhone, countryCode);
    const normalizedRestaurantPhone = cleanBusinessPhone(restaurantPhone);

    // If user is already logged in, verify they're authenticated
    let userId = null;
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.id;
        
        // Verify user exists in restaurant_users
        const [userCheck] = await pool.execute(
          'SELECT user_id FROM restaurant_users WHERE user_id = ?',
          [userId]
        );
        if (userCheck.length === 0) {
          userId = null; // User not in restaurant_users, will create new account
        }
      }
    } catch (authError) {
      // Token invalid or missing - will create new user
      userId = null;
    }

    // Create user account if not already logged in
    let userCreated = false;
    if (!userId) {
      // First check if user exists in restaurant_users (new system)
      const [existingRestaurantUsers] = await pool.execute(
        'SELECT user_id, email, name FROM restaurant_users WHERE email = ?',
        [email]
      );

      if (existingRestaurantUsers.length > 0) {
        // User exists - they need to login instead
        return res.status(400).json({ 
          success: false,
          message: 'An account with this email already exists. Please login to continue.' 
        });
      }

      // Check profiles table for backward compatibility
      const [existingProfiles] = await pool.execute(
        'SELECT id FROM profiles WHERE email = ?',
        [email]
      );

      if (existingProfiles.length > 0) {
        // User exists in profiles - they need to login
        return res.status(400).json({ 
          success: false,
          message: 'An account with this email already exists. Please login to continue.' 
        });
      }

      // Create new user in restaurant_users table (new system)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash(password, 10);
      const fullName = [firstName || '', lastName || ''].filter(Boolean).join(' ').trim() || email.split('@')[0];

      // Insert into restaurant_users table (INT user_id, AUTO_INCREMENT)
      // Set email_verified to 0 (false) - requires verification
      const [result] = await pool.execute(
        `INSERT INTO restaurant_users (email, password_hash, name, phone, role, is_active, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, fullName, normalizedUserPhone, 'vendor', 1, 0]
      );
      
      // Get the AUTO_INCREMENT user_id
      userId = result.insertId.toString();
      userCreated = true;
    }

    if (!restaurantName) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant name is required' 
      });
    }

    const restaurantId = uuidv4();
    const latitude = locationData?.geometry?.location?.lat || null;
    const longitude = locationData?.geometry?.location?.lng || null;

    // Check if new columns exist, otherwise use basic schema
    try {
      // Try to insert with new schema first
      await pool.execute(
        `INSERT INTO restaurants 
         (id, user_id, name, description, contact_number, restaurant_type, subcategory_id, currency, address, latitude, longitude, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurantId, 
          userId, 
          restaurantName, 
          description || null,
          normalizedRestaurantPhone,
          restaurantTypeName || restaurantType || null,
          subcategoryId || null,
          currency || 'RWF',
          location || null,
          latitude,
          longitude,
          'pending'
        ]
      );
    } catch (schemaError) {
      // If new columns don't exist, use basic schema
      if (schemaError.code === 'ER_BAD_FIELD_ERROR') {
        await pool.execute(
          `INSERT INTO restaurants 
           (id, user_id, name, description, phone, address, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            restaurantId, 
            userId, 
            restaurantName, 
            description || null,
            normalizedRestaurantPhone,
            location || null,
            'pending'
          ]
        );
      } else {
        throw schemaError;
      }
    }

    // Generate JWT token if user was just created
    let token = null;
    if (userCreated && email) {
      const jwt = await import('jsonwebtoken');
      token = jwt.default.sign(
        { id: userId, email, role: 'vendor' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
    }

    // Initialize setup progress after Step 1-3 completion
    try {
      const stepData = {
        step_1: {
          location: location || null,
          locationData: locationData || null
        },
        step_2: {
          restaurantName,
          restaurantType,
          restaurantTypeName,
          subcategoryId,
          description,
          phone: restaurantPhone,
          currency
        },
        step_3: {
          firstName,
          lastName,
          email,
          phone: userPhone,
          countryCode
        }
      };
      
      await restaurantSetupProgressService.initializeProgress(restaurantId, userId, stepData);
      console.log('✅ Restaurant setup progress initialized');
      
      // Also initialize onboarding progress tracking (similar to stays)
      try {
        await restaurantOnboardingProgressService.saveProgress(userId, 'business-details', restaurantId, false);
        console.log('✅ Restaurant onboarding progress tracking initialized');
      } catch (onboardingProgressError) {
        console.error('⚠️ Failed to initialize onboarding progress tracking:', onboardingProgressError);
        // Don't fail the request if onboarding progress initialization fails
      }
    } catch (progressError) {
      console.error('⚠️ Failed to initialize setup progress:', progressError);
      // Don't fail the request if progress initialization fails
    }

    res.status(201).json({
      success: true,
      message: 'Restaurant listing created successfully',
      data: {
        restaurantId,
        restaurantName,
        userId,
        token, // Include token if user was created
        userCreated
      }
    });
  } catch (error) {
    console.error('Error creating restaurant listing:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create restaurant listing',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});

/**
 * Step 1 (Setup): Save Business Details
 * POST /api/eating-out/setup/business-details
 */
router.post('/business-details', authenticateToken, async (req, res) => {
  try {
    const {
      restaurantId,
      restaurantName,
      businessRegistrationNumber,
      contactNumber,
      emailAddress,
      website,
      socialMediaLinks,
      is24Hours,
      openingTime,
      closingTime,
      shortDescription,
      operatingSchedule
    } = req.body;
    let userId = req.user.id || req.user.userId || req.user.user_id;
    
    // Convert userId to string for consistency (JWT stores it as string from insertId.toString())
    userId = userId ? String(userId) : null;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User ID not found in token' 
      });
    }

    // Check step access (Step 4: Business Details)
    const accessCheck = await restaurantSetupProgressService.canAccessStep(restaurantId, userId, 4);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.reason || 'Cannot access this step. Please complete previous steps first.'
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    await pool.execute(
      `UPDATE restaurants SET
       name = ?,
       business_registration_number = ?,
       contact_number = ?,
       email_address = ?,
       website = ?,
       social_media_links = ?,
       is_24_hours = ?,
       opening_time = ?,
       closing_time = ?,
       description = ?
       WHERE id = ? AND user_id = ?`,
      [
        restaurantName,
        businessRegistrationNumber || null,
        contactNumber,
        emailAddress,
        website || null,
        socialMediaLinks || null,
        is24Hours ? 1 : 0,
        is24Hours ? null : (openingTime || null),
        is24Hours ? null : (closingTime || null),
        shortDescription,
        restaurantId,
        userId
      ]
    );

    // Save step progress
    const stepData = {
      restaurantName,
      businessRegistrationNumber,
      contactNumber,
      emailAddress,
      website,
      socialMediaLinks,
      is24Hours,
      openingTime,
      closingTime,
      shortDescription,
      operatingSchedule: operatingSchedule || null
    };
    await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 4, true, stepData);
    
    // Also save to onboarding progress tracking
    try {
      await restaurantOnboardingProgressService.completeStep(userId, 'business-details', restaurantId);
    } catch (onboardingError) {
      console.error('⚠️ Failed to save onboarding progress for business-details:', onboardingError);
    }

    res.json({
      success: true,
      message: 'Business details saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving business details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save business details',
      error: error.message 
    });
  }
});

/**
 * Save operating schedule (per-weekday) and exceptions
 * POST /api/eating-out/setup/operating-schedule
 */
// Mount at /operating-schedule because router is already mounted at /eating-out/setup
router.post('/operating-schedule', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, operatingSchedule = [], exceptions = [] } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute('SELECT * FROM restaurants WHERE id = ? AND user_id = ?', [restaurantId, userId]);
    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or access denied' });
    }

    // Upsert schedules: simple approach - delete existing and insert provided
    await pool.execute('DELETE FROM restaurant_schedules WHERE restaurant_id = ?', [restaurantId]);
    for (const s of operatingSchedule) {
      const day = typeof s.day_of_week !== 'undefined' ? s.day_of_week : s.day;
      await pool.execute(
        `INSERT INTO restaurant_schedules (restaurant_id, day_of_week, opens, closes, is_closed) VALUES (?, ?, ?, ?, ?)`,
        [restaurantId, day, s.opens || null, s.closes || null, s.is_closed ? 1 : 0]
      );
    }

    // Exceptions
    await pool.execute('DELETE FROM restaurant_schedule_exceptions WHERE restaurant_id = ?', [restaurantId]);
    for (const ex of exceptions) {
      await pool.execute(
        `INSERT INTO restaurant_schedule_exceptions (restaurant_id, date, opens, closes, is_closed, note) VALUES (?, ?, ?, ?, ?, ?)`,
        [restaurantId, ex.date, ex.opens || null, ex.closes || null, ex.is_closed ? 1 : 0, ex.note || null]
      );
    }

    // Save progress (if relevant)
    try {
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 4, true, { operatingSchedule, exceptions });
    } catch (err) {
      console.warn('Failed to update setup progress with schedule:', err.message || err);
    }

    return res.json({ success: true, message: 'Operating schedule saved' });
  } catch (error) {
    console.error('Error saving operating schedule:', error);
    return res.status(500).json({ success: false, message: 'Failed to save operating schedule', error: error.message });
  }
});

/**
 * Step 2 (Setup): Save Media
 * POST /api/eating-out/setup/media
 */
router.post('/media', authenticateToken, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'galleryImages', maxCount: 20 }
]), async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const userId = req.user.id;
    const files = req.files;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    // Handle logo upload
    if (files.logo && files.logo[0]) {
      const logoFile = files.logo[0];
      const logoUrl = `/uploads/restaurants/${logoFile.filename}`;
      
      // Delete old logo if exists
      await pool.execute(
        'DELETE FROM images WHERE entity_type = ? AND entity_id = ? AND image_type = ?',
        ['restaurant', restaurantId, 'logo']
      );

      // Insert new logo
      await pool.execute(
        `INSERT INTO images (id, entity_type, entity_id, image_url, image_type, is_primary, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'restaurant', restaurantId, logoUrl, 'logo', 1, 0]
      );
    }

    // Handle gallery images
    if (files.galleryImages && files.galleryImages.length > 0) {
      for (let i = 0; i < files.galleryImages.length; i++) {
        const galleryFile = files.galleryImages[i];
        const galleryUrl = `/uploads/restaurants/${galleryFile.filename}`;
        
        await pool.execute(
          `INSERT INTO images (id, entity_type, entity_id, image_url, image_type, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), 'restaurant', restaurantId, galleryUrl, 'gallery', 0, i]
        );
      }
    }

    // Save step progress (Step 5 - Media)
    try {
      const stepData = {
        hasLogo: !!(files.logo && files.logo[0]),
        hasGalleryImages: !!(files.galleryImages && files.galleryImages.length > 0),
        galleryImageCount: files.galleryImages ? files.galleryImages.length : 0
      };
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 5, true, stepData);
      console.log('✅ Step 5 (Media) progress saved');
      
      // Also save to onboarding progress tracking
      try {
        await restaurantOnboardingProgressService.completeStep(userId, 'media', restaurantId);
      } catch (onboardingError) {
        console.error('⚠️ Failed to save onboarding progress for media:', onboardingError);
      }
    } catch (progressError) {
      console.error('⚠️ Failed to save step 5 progress:', progressError);
      // Don't fail the request if progress save fails
    }

    res.json({
      success: true,
      message: 'Media saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving media:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save media',
      error: error.message 
    });
  }
});

/**
 * Step 3 (Setup): Save Payments & Pricing
 * POST /api/eating-out/setup/payments-pricing
 */
router.post('/payments-pricing', authenticateToken, async (req, res) => {
  try {
    const {
      restaurantId,
      averagePriceRange
    } = req.body;
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    await pool.execute(
      `UPDATE restaurants SET average_price_range = ? WHERE id = ? AND user_id = ?`,
      [averagePriceRange, restaurantId, userId]
    );

    // Save step progress (Step 6 - Payments & Pricing)
    try {
      const stepData = { averagePriceRange };
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 6, true, stepData);
      console.log('✅ Step 6 (Payments & Pricing) progress saved');
      
      // Also save to onboarding progress tracking
      try {
        await restaurantOnboardingProgressService.completeStep(userId, 'payments-pricing', restaurantId);
      } catch (onboardingError) {
        console.error('⚠️ Failed to save onboarding progress for payments-pricing:', onboardingError);
      }
    } catch (progressError) {
      console.error('⚠️ Failed to save step 6 progress:', progressError);
      // Don't fail the request if progress save fails
    }

    res.json({
      success: true,
      message: 'Payments & pricing saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving payments & pricing:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save payments & pricing',
      error: error.message 
    });
  }
});

/**
 * Step 4 (Setup): Save Restaurant Capacity
 * POST /api/v1/eating-out/setup/capacity
 */
router.post('/capacity', authenticateToken, async (req, res) => {
  try {
    const {
      restaurantId,
      capacity,
      availableSeats
    } = req.body;
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    if (!capacity || capacity <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Total capacity must be a positive number' 
      });
    }

    if (availableSeats === undefined || availableSeats < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Available seats must be a non-negative number' 
      });
    }

    if (availableSeats > capacity) {
      return res.status(400).json({ 
        success: false,
        message: 'Available seats cannot exceed total capacity' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    await pool.execute(
      `UPDATE restaurants SET
       capacity = ?,
       available_seats = ?
       WHERE id = ? AND user_id = ?`,
      [
        parseInt(capacity),
        parseInt(availableSeats),
        restaurantId,
        userId
      ]
    );

    // Save step progress (Step 6 - Capacity)
    try {
      const stepData = { capacity: parseInt(capacity), availableSeats: parseInt(availableSeats) };
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 6, true, stepData);
      console.log('✅ Step 6 (Capacity) progress saved');
      
      // Also save to onboarding progress tracking
      try {
        await restaurantOnboardingProgressService.completeStep(userId, 'capacity', restaurantId);
      } catch (onboardingError) {
        console.error('⚠️ Failed to save onboarding progress for capacity:', onboardingError);
      }
    } catch (progressError) {
      console.error('⚠️ Failed to save step 7 progress:', progressError);
      // Don't fail the request if progress save fails
    }

    res.json({
      success: true,
      message: 'Restaurant capacity saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving capacity:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save capacity',
      error: error.message 
    });
  }
});

/**
 * Step 5 (Setup): Save Tax & Legal Information
 * POST /api/eating-out/setup/tax-legal
 */
router.post('/tax-legal', authenticateToken, upload.fields([
  { name: 'businessLicenseFile', maxCount: 1 },
  { name: 'taxRegistrationCertificateFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      restaurantId,
      taxIdentificationNumber,
      registeredBusinessName,
      taxType,
      vatTaxRate,
      pricesVatInclusive
    } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const files = req.files;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    // Check step access (Step 7: Tax & Legal)
    const accessCheck = await restaurantSetupProgressService.canAccessStep(restaurantId, userId, 7);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.reason || 'Cannot access this step. Please complete previous steps first.'
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    // Check if tax_legal record exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM restaurant_tax_legal WHERE restaurant_id = ?',
      [restaurantId]
    );

    if (existingRows.length > 0) {
      // Update existing record
      await pool.execute(
        `UPDATE restaurant_tax_legal SET
         tax_identification_number = ?,
         registered_business_name = ?,
         tax_type = ?,
         vat_tax_rate = ?,
         prices_vat_inclusive = ?
         WHERE restaurant_id = ?`,
        [
          taxIdentificationNumber,
          registeredBusinessName,
          taxType,
          vatTaxRate || null,
          pricesVatInclusive || null,
          restaurantId
        ]
      );
    } else {
      // Create new record
      await pool.execute(
        `INSERT INTO restaurant_tax_legal 
         (id, restaurant_id, tax_identification_number, registered_business_name, tax_type, vat_tax_rate, prices_vat_inclusive)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          restaurantId,
          taxIdentificationNumber,
          registeredBusinessName,
          taxType,
          vatTaxRate || null,
          pricesVatInclusive || null
        ]
      );
    }

    // Handle document uploads
    if (files.businessLicenseFile && files.businessLicenseFile[0]) {
      const file = files.businessLicenseFile[0];
      const filePath = `/uploads/restaurants/${file.filename}`;
      
      await pool.execute(
        `INSERT INTO restaurant_documents 
         (id, restaurant_id, document_type, document_name, file_path, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          restaurantId,
          'business_license',
          file.originalname,
          filePath,
          file.size,
          file.mimetype
        ]
      );
    }

    if (files.taxRegistrationCertificateFile && files.taxRegistrationCertificateFile[0]) {
      const file = files.taxRegistrationCertificateFile[0];
      const filePath = `/uploads/restaurants/${file.filename}`;
      
      await pool.execute(
        `INSERT INTO restaurant_documents 
         (id, restaurant_id, document_type, document_name, file_path, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          restaurantId,
          'tax_certificate',
          file.originalname,
          filePath,
          file.size,
          file.mimetype
        ]
      );
    }

    // Save step progress (Step 7 - Tax & Legal)
    try {
      const stepData = {
        taxIdentificationNumber,
        registeredBusinessName,
        taxType,
        vatTaxRate: vatTaxRate || null,
        pricesVatInclusive: pricesVatInclusive || null,
        hasBusinessLicense: !!(files.businessLicenseFile && files.businessLicenseFile[0]),
        hasTaxCertificate: !!(files.taxRegistrationCertificateFile && files.taxRegistrationCertificateFile[0])
      };
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 7, true, stepData);
      console.log('✅ Step 7 (Tax & Legal) progress saved');
      
      // Also save to onboarding progress tracking
      try {
        await restaurantOnboardingProgressService.completeStep(userId, 'tax-legal', restaurantId);
      } catch (onboardingError) {
        console.error('⚠️ Failed to save onboarding progress for tax-legal:', onboardingError);
      }
    } catch (progressError) {
      console.error('⚠️ Failed to save step 8 progress:', progressError);
      // Don't fail the request if progress save fails
    }

    res.json({
      success: true,
      message: 'Tax & legal information saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving tax & legal information:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save tax & legal information',
      error: error.message 
    });
  }
});

/**
 * Step 6 (Setup): Save Menu Setup
 * POST /api/eating-out/setup/menu
 */
router.post('/menu', authenticateToken, upload.any(), async (req, res) => {
  try {
    const { restaurantId, categories, menuItems } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    // Parse JSON data
    const categoriesData = typeof categories === 'string' ? JSON.parse(categories) : categories;
    const menuItemsData = typeof menuItems === 'string' ? JSON.parse(menuItems) : menuItems;

    // Create a map of menu item images
    const menuItemImageMap = {};
    files.forEach(file => {
      if (file.fieldname.startsWith('menuItemImage_')) {
        const itemId = file.fieldname.replace('menuItemImage_', '');
        menuItemImageMap[itemId] = `/uploads/restaurants/${file.filename}`;
      }
    });

    // Save categories
    const categoryIdMap = {}; // Map old category names to new IDs
    if (categoriesData && Array.isArray(categoriesData)) {
      // Delete existing categories
      await pool.execute(
        'DELETE FROM menu_categories WHERE restaurant_id = ?',
        [restaurantId]
      );

      // Insert new categories
      for (let i = 0; i < categoriesData.length; i++) {
        const categoryName = categoriesData[i];
        const categoryId = uuidv4();
        categoryIdMap[categoryName] = categoryId;
        
        await pool.execute(
          `INSERT INTO menu_categories (id, restaurant_id, name, display_order)
           VALUES (?, ?, ?, ?)`,
          [categoryId, restaurantId, categoryName, i]
        );
      }
    }

    // Save menu items
    if (menuItemsData && Array.isArray(menuItemsData)) {
      // Get existing menu items to match against
      const [existingItems] = await pool.execute(
        'SELECT id, name FROM menu_items WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // Create a map of existing items by name for matching
      const existingItemsMap = new Map();
      existingItems.forEach(item => {
        existingItemsMap.set(item.name.toLowerCase().trim(), item.id);
      });
      
      // Track which items we're processing
      const processedItemIds = new Set();

      for (const item of menuItemsData) {
        const categoryId = item.category ? categoryIdMap[item.category] : null;
        const imageUrl = menuItemImageMap[item.id || item.tempId] || item.photo || null;
        const itemName = item.name.trim();
        const itemNameLower = itemName.toLowerCase();
        
        // Check if item already exists (match by name)
        const existingItemId = existingItemsMap.get(itemNameLower);
        let itemId;
        let isUpdate = false;

        if (existingItemId) {
          // Update existing item
          itemId = existingItemId;
          isUpdate = true;
          processedItemIds.add(itemId);
          // Determine availability boolean with clear defaults
          const availabilityValue = (item.availability || 'available').toString();
          const isAvailableFlag = (typeof item.available !== 'undefined')
            ? (item.available ? 1 : 0)
            : (availabilityValue.toLowerCase() === 'available' ? 1 : 0);

          await pool.execute(
            `UPDATE menu_items SET
             category_id = ?, name = ?, description = ?, price = ?, discount = ?, 
             availability = ?, preparation_time = ?, portion_size = ?, 
             image_url = ?, available = ?
             WHERE id = ?`,
            [
              categoryId,
              itemName,
              item.description || null,
              item.price || 0,
              item.discount || 0,
              availabilityValue || 'available',
              item.preparationTime || null,
              item.portionSize || null,
              imageUrl || null,
              isAvailableFlag,
              itemId
            ]
          );
        } else {
          // Insert new item
          itemId = uuidv4();
          isUpdate = false;
          // Determine availability boolean with clear defaults - default to available for new items
          // For new items, always default to 'available' unless explicitly set to 'unavailable'
          const availabilityValueNew = (item.availability || 'available').toString().trim().toLowerCase();
          // For new items, default to available (1) unless explicitly set to unavailable
          // Only set to unavailable if availability is explicitly 'unavailable' or 'out_of_stock'
          const isAvailableFlagNew = (availabilityValueNew === 'unavailable' || availabilityValueNew === 'out_of_stock') ? 0 : 1;

          await pool.execute(
            `INSERT INTO menu_items 
             (id, restaurant_id, category_id, name, description, price, discount, availability, preparation_time, portion_size, image_url, available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              itemId,
              restaurantId,
              categoryId,
              itemName,
              item.description || null,
              item.price || 0,
              item.discount || 0,
              availabilityValueNew || 'available',
              item.preparationTime || null,
              item.portionSize || null,
              imageUrl,
              isAvailableFlagNew
            ]
          );
        }

        // Delete existing add-ons and customizations for this item, then re-insert
        await pool.execute('DELETE FROM menu_item_addons WHERE menu_item_id = ?', [itemId]);
        await pool.execute('DELETE FROM menu_item_customizations WHERE menu_item_id = ?', [itemId]);

        // Save add-ons
        if (item.addOns && Array.isArray(item.addOns)) {
          for (let i = 0; i < item.addOns.length; i++) {
            const addon = item.addOns[i];
            await pool.execute(
              `INSERT INTO menu_item_addons (id, menu_item_id, name, price, display_order)
               VALUES (?, ?, ?, ?, ?)`,
              [uuidv4(), itemId, addon.name, addon.price || 0, i]
            );
          }
        }

        // Save customizations
        if (item.customizations && Array.isArray(item.customizations)) {
          for (let i = 0; i < item.customizations.length; i++) {
            const customization = item.customizations[i];
            await pool.execute(
              `INSERT INTO menu_item_customizations (id, menu_item_id, name, options, display_order)
               VALUES (?, ?, ?, ?, ?)`,
              [
                uuidv4(), 
                itemId, 
                customization.name, 
                JSON.stringify(customization.options || []), 
                i
              ]
            );
          }
        }
      }
      
      // Mark items that weren't in the new list as unavailable (soft delete)
      // This preserves order history while hiding them from the menu
      if (processedItemIds.size > 0) {
        const processedIdsArray = Array.from(processedItemIds);
        const placeholders = processedIdsArray.map(() => '?').join(',');
        await pool.execute(
          `UPDATE menu_items 
           SET available = 0, availability = 'out_of_stock'
           WHERE restaurant_id = ? AND id NOT IN (${placeholders})`,
          [restaurantId, ...processedIdsArray]
        );
      } else {
        // If no items were processed, mark all as unavailable
        await pool.execute(
          `UPDATE menu_items 
           SET available = 0, availability = 'out_of_stock'
           WHERE restaurant_id = ?`,
          [restaurantId]
        );
      }
    }

    // Save step progress (Step 8 - Menu)
    try {
      const stepData = {
        categoriesCount: categoriesData ? categoriesData.length : 0,
        menuItemsCount: menuItemsData ? menuItemsData.length : 0,
        hasMenuItems: !!(menuItemsData && menuItemsData.length > 0)
      };
      await restaurantSetupProgressService.updateStepProgress(restaurantId, userId, 8, true, stepData);
      console.log('✅ Step 8 (Menu) progress saved');
      
      // Also save to onboarding progress tracking
      try {
        await restaurantOnboardingProgressService.completeStep(userId, 'menu', restaurantId);
      } catch (onboardingError) {
        console.error('⚠️ Failed to save onboarding progress for menu:', onboardingError);
      }
    } catch (progressError) {
      console.error('⚠️ Failed to save step 9 progress:', progressError);
      // Don't fail the request if progress save fails
    }

    res.json({
      success: true,
      message: 'Menu setup saved successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving menu setup:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save menu setup',
      error: error.message 
    });
  }
});

/**
 * Step 6: Get Setup Status
 * GET /api/eating-out/setup/status/:restaurantId
 */
router.get('/status/:restaurantId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;

    // Verify restaurant belongs to user
    const [restaurantRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (restaurantRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    const restaurant = restaurantRows[0];

    // Check which steps are completed
    const steps = {
      step1_listing: !!restaurant.name,
      step1_business_details: !!(restaurant.business_registration_number || restaurant.email_address),
      step2_media: false,
      step3_payments_pricing: !!restaurant.average_price_range,
      step4_capacity: !!(restaurant.capacity && restaurant.capacity > 0),
      step5_tax_legal: false,
      step6_menu: false,
      step7_agreement: !!restaurant.agreement_accepted
    };

    // Check media
    const [imageRows] = await pool.execute(
      'SELECT * FROM images WHERE entity_type = ? AND entity_id = ? AND image_type = ?',
      ['restaurant', restaurantId, 'logo']
    );
    steps.step2_media = imageRows.length > 0;

    // Check tax legal
    const [taxRows] = await pool.execute(
      'SELECT * FROM restaurant_tax_legal WHERE restaurant_id = ?',
      [restaurantId]
    );
    steps.step5_tax_legal = taxRows.length > 0;

    // Check menu
    const [menuRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = ?',
      [restaurantId]
    );
    steps.step6_menu = menuRows[0].count > 0;

    const allComplete = Object.values(steps).every(step => step === true);

    res.json({
      success: true,
      data: {
        steps,
        allComplete,
        setupComplete: restaurant.setup_completed === 1
      }
    });
  } catch (error) {
    console.error('Error getting setup status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get setup status',
      error: error.message 
    });
  }
});

/**
 * Get setup progress for a restaurant
 * GET /api/v1/eating-out/setup/progress/:restaurantId
 */
router.get('/progress/:restaurantId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id || req.user.userId || req.user.user_id;

    const progress = await restaurantSetupProgressService.getProgress(restaurantId, userId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Setup progress not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting setup progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setup progress',
      error: error.message
    });
  }
});

/**
 * Get setup progress by user ID (for login check)
 * GET /api/v1/eating-out/setup/progress
 */
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;

    const progress = await restaurantSetupProgressService.getProgressByUserId(userId);

    if (!progress) {
      return res.json({
        success: true,
        data: null,
        message: 'No incomplete setup found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting setup progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setup progress',
      error: error.message
    });
  }
});

/**
 * Save step data
 * POST /api/v1/eating-out/setup/save-step
 */
router.post('/save-step', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, stepNumber, stepData } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id;

    if (!restaurantId || !stepNumber) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId and stepNumber are required'
      });
    }

    // Check if user can access this step
    const accessCheck = await restaurantSetupProgressService.canAccessStep(restaurantId, userId, stepNumber);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.reason || 'Cannot access this step'
      });
    }

    // Update progress (mark as complete if stepData is provided)
    await restaurantSetupProgressService.updateStepProgress(
      restaurantId,
      userId,
      stepNumber,
      true, // Mark as complete when saving
      stepData
    );

    res.json({
      success: true,
      message: 'Step data saved successfully'
    });
  } catch (error) {
    console.error('Error saving step data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save step data',
      error: error.message 
    });
  }
});

/**
 * Complete Setup (without agreement step)
 * POST /api/eating-out/setup/complete
 */
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    // Update restaurant to mark setup as complete
    // Set status to 'pending' - waiting for admin approval
    await pool.execute(
      `UPDATE restaurants SET
       setup_completed = ?,
       status = ?
       WHERE id = ? AND user_id = ?`,
      [
        1,
        'pending', // Requires admin approval
        restaurantId,
        userId
      ]
    );

    // Also save to onboarding progress tracking
    try {
      await restaurantOnboardingProgressService.completeStep(userId, 'review', restaurantId);
      // Mark complete step as well
      await restaurantOnboardingProgressService.completeStep(userId, 'complete', restaurantId);
    } catch (onboardingError) {
      console.error('⚠️ Failed to save onboarding progress:', onboardingError);
    }

    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error completing setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete setup',
      error: error.message 
    });
  }
});

/**
 * Step 7: Save Agreement Acceptance
 * POST /api/eating-out/setup/agreement
 */
router.post('/agreement', authenticateToken, async (req, res) => {
  try {
    const {
      restaurantId,
      signature,
      confirmed
    } = req.body;
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Restaurant ID is required' 
      });
    }

    if (!confirmed || signature?.toLowerCase() !== 'confirm') {
      return res.status(400).json({ 
        success: false,
        message: 'Agreement must be confirmed with signature' 
      });
    }

    // Verify restaurant belongs to user
    const [checkRows] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found or access denied' 
      });
    }

    // Update restaurant with agreement acceptance
    // Set status to 'pending' - waiting for admin approval
    await pool.execute(
      `UPDATE restaurants SET
       agreement_accepted = ?,
       agreement_signed_at = ?,
       setup_completed = ?,
       status = ?
       WHERE id = ? AND user_id = ?`,
      [
        1,
        new Date(),
        1,
        'pending', // Changed from 'active' to 'pending' - requires admin approval
        restaurantId,
        userId
      ]
    );

    // Also save to onboarding progress tracking
    try {
      await restaurantOnboardingProgressService.completeStep(userId, 'agreement', restaurantId);
      // Mark complete step as well
      await restaurantOnboardingProgressService.completeStep(userId, 'complete', restaurantId);
    } catch (onboardingError) {
      console.error('⚠️ Failed to save onboarding progress for agreement:', onboardingError);
    }

    res.json({
      success: true,
      message: 'Agreement accepted and setup completed successfully',
      data: { restaurantId }
    });
  } catch (error) {
    console.error('Error saving agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save agreement',
      error: error.message 
    });
  }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        success: false,
        message: 'Field value too long. Please reduce the size of your data (e.g., locationData, menuItems, categories). Maximum field size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 20 files per request.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check your file field names.'
      });
    }
    // Generic multer error
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
      code: error.code
    });
  }
  
  // Pass other errors to next error handler
  next(error);
});

module.exports = router;
