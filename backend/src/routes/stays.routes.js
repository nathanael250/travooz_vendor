const express = require('express');
const router = express.Router();
const staysPropertyController = require('../controllers/stays/staysProperty.controller');
const emailVerificationController = require('../controllers/stays/emailVerification.controller');
const propertySetupController = require('../controllers/stays/propertySetup.controller');
const staysAuthController = require('../controllers/stays/staysAuth.controller');
const staysBookingController = require('../controllers/stays/staysBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const { getUploadPath } = require('../config/uploads.config');

const storageFactory = (subFolder) => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = getUploadPath(subFolder);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const propertyImageUpload = multer({
    storage: storageFactory('stays/property-images'),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const roomImageUpload = multer({
    storage: storageFactory('stays/room-images'),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Auth routes (no authentication required)
router.post('/auth/login', staysAuthController.login);
router.get('/auth/profile', authenticate, staysAuthController.getProfile);
router.post('/auth/forgot-password', staysAuthController.requestPasswordReset);
router.post('/auth/reset-password', staysAuthController.resetPassword);

// Property routes
router.post('/properties', staysPropertyController.createProperty);
router.get('/properties/my', authenticate, staysPropertyController.getMyProperties);
router.get('/properties/by-user/:userId', staysPropertyController.getPropertiesByUserId); // No auth required for setup flow
router.get('/properties/:id', staysPropertyController.getPropertyById);
router.get('/properties/:id/complete', authenticate, staysPropertyController.getPropertyWithAllData);
router.put('/properties/:id', staysPropertyController.updateProperty);
router.delete('/properties/:id', staysPropertyController.deleteProperty);
router.get('/properties/:id/images', authenticate, staysPropertyController.getPropertyImages);
router.post(
    '/properties/:id/images/property',
    authenticate,
    propertyImageUpload.array('images', 20),
    staysPropertyController.uploadPropertyImages
);
router.delete('/properties/images/:imageId', authenticate, staysPropertyController.deletePropertyImage);
router.put('/properties/images/:imageId', authenticate, staysPropertyController.updatePropertyImage);
router.post(
    '/rooms/:roomId/images',
    authenticate,
    roomImageUpload.array('images', 20),
    staysPropertyController.uploadRoomImages
);
router.delete('/rooms/images/:imageId', authenticate, staysPropertyController.deleteRoomImage);
router.put('/rooms/images/:imageId', authenticate, staysPropertyController.updateRoomImage);

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

