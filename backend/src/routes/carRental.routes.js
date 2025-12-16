const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const carRentalSetupService = require('../services/carRental/carRentalSetup.service');
const carRentalOnboardingProgressService = require('../services/carRental/onboardingProgress.service');
const carRentalAuthController = require('../controllers/carRental/carRentalAuth.controller');
const carRentalEmailVerificationController = require('../controllers/carRental/carRentalEmailVerification.controller');
const carsController = require('../controllers/carRental/cars.controller');
const driversController = require('../controllers/carRental/drivers.controller');
const bookingsController = require('../controllers/carRental/bookings.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Configure multer for car image uploads
const { CARS } = require('../config/uploads.config');
const carImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, CARS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const carImageUpload = multer({ 
  storage: carImageStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Auth routes (no authentication required)
router.post('/auth/login', carRentalAuthController.login);
router.get('/auth/profile', authenticate, carRentalAuthController.getProfile);
router.post('/auth/forgot-password', carRentalAuthController.requestPasswordReset);
router.post('/auth/reset-password', carRentalAuthController.resetPassword);

// Email verification routes (no authentication required)
router.post('/email-verification/send', carRentalEmailVerificationController.sendVerificationCode);
router.post('/email-verification/verify', carRentalEmailVerificationController.verifyCode);

// Register or create car rental business (Step 3)
router.post('/register', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.registerVendor(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Save business details (Step 4)
router.post('/business-details', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.saveBusinessDetails(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Save tax & payment info (Step 5)
router.post('/tax-payment', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.saveTaxPayment(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Create optional car rental listing (Step 6) - OLD ROUTE (for setup flow)
router.post('/setup/cars', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.createCarRental(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Submit agreement (Step 8)
router.post('/agreement', async (req, res, next) => {
  try {
    const result = await carRentalSetupService.submitAgreement(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get submission status (Step 9)
router.get('/status/:carRentalBusinessId', async (req, res, next) => {
  try {
    const { carRentalBusinessId } = req.params;
    const result = await carRentalSetupService.getSubmissionStatus(carRentalBusinessId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Cars management routes (protected)
router.get('/business/:businessId/cars', authenticate, carsController.getCars);
router.get('/cars/:carId', authenticate, carsController.getCar);
router.post('/cars', authenticate, carImageUpload.array('images', 10), carsController.createCar);
router.put('/cars/:carId', authenticate, carImageUpload.array('images', 10), carsController.updateCar);
router.delete('/cars/:carId', authenticate, carsController.deleteCar);
router.post('/cars/:carId/images', authenticate, carImageUpload.array('images', 10), carsController.addCarImages);
router.delete('/cars/images/:imageId', authenticate, carsController.deleteCarImage);

// Drivers management routes (protected)
router.get('/business/:businessId/drivers', authenticate, driversController.getDrivers);
router.get('/drivers/:driverId', authenticate, driversController.getDriver);
router.post('/drivers', authenticate, driversController.createDriver);
router.put('/drivers/:driverId', authenticate, driversController.updateDriver);
router.delete('/drivers/:driverId', authenticate, driversController.deleteDriver);

// Bookings management routes (protected)
router.get('/business/:businessId/bookings', authenticate, bookingsController.getBookings);
router.get('/bookings/stats/:vendorId', authenticate, bookingsController.getBookingStats);
router.get('/bookings/:bookingId', authenticate, bookingsController.getBooking);
router.post('/bookings', authenticate, bookingsController.createBooking);
router.put('/bookings/:bookingId', authenticate, bookingsController.updateBooking);
router.delete('/bookings/:bookingId', authenticate, bookingsController.deleteBooking);

// Onboarding Progress Routes
/**
 * Get onboarding progress
 * GET /api/v1/car-rental/onboarding/progress
 */
router.get('/onboarding/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const progress = await carRentalOnboardingProgressService.getProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting car rental onboarding progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding progress',
      error: error.message
    });
  }
});

/**
 * Save onboarding progress
 * POST /api/v1/car-rental/onboarding/progress
 */
router.post('/onboarding/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const { stepKey, businessId, isComplete } = req.body;
    
    if (!stepKey) {
      return res.status(400).json({
        success: false,
        message: 'stepKey is required'
      });
    }
    
    const progress = await carRentalOnboardingProgressService.saveProgress(
      userId,
      stepKey,
      businessId,
      isComplete
    );
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error saving car rental onboarding progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save onboarding progress',
      error: error.message
    });
  }
});

/**
 * Complete a step and move to next
 * POST /api/v1/car-rental/onboarding/complete-step
 */
router.post('/onboarding/complete-step', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const { stepKey, businessId } = req.body;
    
    if (!stepKey) {
      return res.status(400).json({
        success: false,
        message: 'stepKey is required'
      });
    }
    
    const nextStep = await carRentalOnboardingProgressService.completeStep(
      userId,
      stepKey,
      businessId
    );
    
    res.json({
      success: true,
      data: {
        nextStep,
        message: nextStep ? `Moved to ${nextStep.stepName}` : 'All steps completed'
      }
    });
  } catch (error) {
    console.error('Error completing car rental step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete step',
      error: error.message
    });
  }
});

/**
 * Get next step
 * GET /api/v1/car-rental/onboarding/next-step
 */
router.get('/onboarding/next-step', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const nextStep = await carRentalOnboardingProgressService.getNextStep(userId);
    
    res.json({
      success: true,
      data: nextStep
    });
  } catch (error) {
    console.error('Error getting next car rental step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next step',
      error: error.message
    });
  }
});

// Setup Progress Routes
/**
 * Get setup progress by business ID
 * GET /api/v1/car-rental/setup/progress/:businessId
 */
router.get('/setup/progress/:businessId', authenticate, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id || req.user.userId || req.user.user_id;
    
    // Get onboarding progress which includes business_id
    const progress = await carRentalOnboardingProgressService.getProgress(userId);
    
    if (!progress || progress.business_id != businessId) {
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
    console.error('Error getting car rental setup progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setup progress',
      error: error.message
    });
  }
});

/**
 * Get setup progress by user ID
 * GET /api/v1/car-rental/setup/progress
 */
router.get('/setup/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const progress = await carRentalOnboardingProgressService.getProgress(userId);
    
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
    console.error('Error getting car rental setup progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setup progress',
      error: error.message
    });
  }
});

/**
 * Save step data
 * POST /api/v1/car-rental/setup/save-step
 */
router.post('/setup/save-step', authenticate, async (req, res) => {
  try {
    const { businessId, stepNumber, stepData } = req.body;
    const userId = req.user.id || req.user.userId || req.user.user_id;
    
    if (!businessId || !stepNumber) {
      return res.status(400).json({
        success: false,
        message: 'businessId and stepNumber are required'
      });
    }
    
    // Map step number to step key
    const stepKeyMap = {
      2: 'business-details',
      3: 'tax-payment',
      4: 'review',
      5: 'agreement',
      6: 'complete'
    };
    
    const stepKey = stepKeyMap[stepNumber];
    if (!stepKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number'
      });
    }
    
    // Save progress
    await carRentalOnboardingProgressService.saveProgress(userId, stepKey, businessId, false);
    
    res.json({
      success: true,
      message: 'Step data saved successfully'
    });
  } catch (error) {
    console.error('Error saving car rental step data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save step data',
      error: error.message
    });
  }
});

module.exports = router;
