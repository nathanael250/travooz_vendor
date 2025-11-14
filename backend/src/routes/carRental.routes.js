const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const carRentalSetupService = require('../services/carRental/carRentalSetup.service');
const carRentalAuthController = require('../controllers/carRental/carRentalAuth.controller');
const carsController = require('../controllers/carRental/cars.controller');
const driversController = require('../controllers/carRental/drivers.controller');
const bookingsController = require('../controllers/carRental/bookings.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Configure multer for car image uploads
const carImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/cars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
router.put('/cars/:carId', authenticate, carsController.updateCar);
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

module.exports = router;
