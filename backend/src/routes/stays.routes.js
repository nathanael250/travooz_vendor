const express = require('express');
const router = express.Router();
const staysPropertyController = require('../controllers/stays/staysProperty.controller');
const emailVerificationController = require('../controllers/stays/emailVerification.controller');
const propertySetupController = require('../controllers/stays/propertySetup.controller');
const staysAuthController = require('../controllers/stays/staysAuth.controller');
const staysBookingController = require('../controllers/stays/staysBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Auth routes (no authentication required)
router.post('/auth/login', staysAuthController.login);
router.get('/auth/profile', authenticate, staysAuthController.getProfile);

// Property routes
router.post('/properties', staysPropertyController.createProperty);
router.get('/properties/my', authenticate, staysPropertyController.getMyProperties);
router.get('/properties/by-user/:userId', staysPropertyController.getPropertiesByUserId); // No auth required for setup flow
router.get('/properties/:id', staysPropertyController.getPropertyById);
router.get('/properties/:id/complete', authenticate, staysPropertyController.getPropertyWithAllData);
router.put('/properties/:id', staysPropertyController.updateProperty);
router.delete('/properties/:id', staysPropertyController.deleteProperty);

// Email verification routes
router.post('/email-verification/send', emailVerificationController.sendVerificationCode);
router.post('/email-verification/verify', emailVerificationController.verifyCode);

// Property Setup routes (all require authentication)
router.post('/setup/contract', authenticate, propertySetupController.saveContract);
router.post('/setup/policies', authenticate, propertySetupController.savePolicies);
router.post('/setup/amenities', authenticate, propertySetupController.saveAmenities);
router.post('/setup/room', authenticate, propertySetupController.saveRoom);
router.post('/setup/promotions', authenticate, propertySetupController.savePromotions);
router.post('/setup/images', authenticate, propertySetupController.saveImages);
router.post('/setup/taxes', authenticate, propertySetupController.saveTaxDetails);
router.post('/setup/connectivity', authenticate, propertySetupController.saveConnectivity);
router.get('/setup/status/:propertyId', authenticate, propertySetupController.getSetupStatus);
router.post('/setup/submit', authenticate, propertySetupController.submitListing);

// Booking and Availability routes
router.get('/bookings', authenticate, staysBookingController.getBookings);
router.get('/bookings/:id', authenticate, staysBookingController.getBookingById);
router.get('/availability', authenticate, staysBookingController.getRoomAvailability);

module.exports = router;

