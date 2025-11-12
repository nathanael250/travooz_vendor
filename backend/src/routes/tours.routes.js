const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const toursBusinessController = require('../controllers/tours/toursBusiness.controller');
const toursAuthController = require('../controllers/tours/toursAuth.controller');
const toursEmailVerificationController = require('../controllers/tours/toursEmailVerification.controller');
const toursBusinessOwnerInfoController = require('../controllers/tours/toursBusinessOwnerInfo.controller');
const toursIdentityProofController = require('../controllers/tours/toursIdentityProof.controller');
const toursBusinessProofController = require('../controllers/tours/toursBusinessProof.controller');
const toursSetupProgressController = require('../controllers/tours/toursSetupProgress.controller');
const toursSetupSubmissionController = require('../controllers/tours/toursSetupSubmission.controller');
const toursPackageController = require('../controllers/tours/toursPackage.controller');
const toursCommissionController = require('../controllers/tours/toursCommission.controller');
const toursBookingController = require('../controllers/tours/toursBooking.controller');
const toursReviewController = require('../controllers/tours/toursReview.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/tours');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use different prefixes for different file types
        if (file.fieldname === 'idCardPhoto') {
            cb(null, 'id-card-' + uniqueSuffix + path.extname(file.originalname));
        } else {
            cb(null, 'certificate-' + uniqueSuffix + path.extname(file.originalname));
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
        fieldSize: 10 * 1024 * 1024, // 10MB field value limit (for JSON fields like locationData, etc.)
        fields: 50, // Maximum number of non-file fields
        fieldNameSize: 100 // Maximum field name size
    },
    fileFilter: (req, file, cb) => {
        // Allow PDF, JPG, PNG files
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
        }
    }
});

// Auth routes (no authentication required)
router.post('/auth/login', toursAuthController.login);
router.get('/auth/profile', authenticate, toursAuthController.getProfile);

// Tour business routes
router.post('/businesses', toursBusinessController.createTourBusiness);
router.get('/businesses/my', authenticate, toursBusinessController.getMyTourBusinesses);
router.get('/businesses/by-user/:userId', toursBusinessController.getTourBusinessesByUserId); // No auth required for setup flow
router.get('/businesses/:id', toursBusinessController.getTourBusinessById);
router.put('/businesses/:id', authenticate, toursBusinessController.updateTourBusiness);
router.delete('/businesses/:id', authenticate, toursBusinessController.deleteTourBusiness);

// Email verification routes
router.post('/email-verification/send', toursEmailVerificationController.sendVerificationCode);
router.post('/email-verification/verify', toursEmailVerificationController.verifyCode);

// Business owner info routes
router.post('/setup/business-owner-info', authenticate, toursBusinessOwnerInfoController.saveBusinessOwnerInfo);
router.get('/setup/business-owner-info', authenticate, toursBusinessOwnerInfoController.getBusinessOwnerInfo);

// Identity proof routes
router.post('/setup/identity-proof', authenticate, upload.single('idCardPhoto'), toursIdentityProofController.saveIdentityProof);
router.get('/setup/identity-proof', authenticate, toursIdentityProofController.getIdentityProof);

// Business proof routes
router.post('/setup/business-proof', authenticate, upload.single('professionalCertificate'), toursBusinessProofController.saveBusinessProof);
router.get('/setup/business-proof', authenticate, toursBusinessProofController.getBusinessProof);

// Setup progress routes
router.post('/setup/progress', authenticate, toursSetupProgressController.updateStepProgress);
router.get('/setup/progress', authenticate, toursSetupProgressController.getProgress);

// Submission routes
router.post('/setup/submit', authenticate, toursSetupSubmissionController.submitForVerification);
router.get('/setup/submission-status', authenticate, toursSetupSubmissionController.getSubmissionStatus);

// Tour package routes
router.post('/packages', authenticate, toursPackageController.savePackage);
router.put('/packages/:packageId', authenticate, toursPackageController.savePackage);
router.get('/packages/:id', authenticate, toursPackageController.getPackage);
router.get('/packages/business/:businessId', authenticate, toursPackageController.getPackagesByBusiness);
router.delete('/packages/:id', authenticate, toursPackageController.deletePackage);

// Commission routes
router.get('/commission/active', authenticate, toursCommissionController.getActiveCommission);

// Booking routes
router.get('/bookings', authenticate, toursBookingController.getBookings);
router.get('/bookings/:id', authenticate, toursBookingController.getBookingById);
router.patch('/bookings/:id/status', authenticate, toursBookingController.updateBookingStatus);
router.get('/bookings/participants/all', authenticate, toursBookingController.getParticipants);

// Review routes
router.get('/reviews', authenticate, toursReviewController.getReviews);
router.get('/reviews/stats', authenticate, toursReviewController.getReviewStats);
router.get('/reviews/:id', authenticate, toursReviewController.getReviewById);
router.patch('/reviews/:id/response', authenticate, toursReviewController.updateVendorResponse);

module.exports = router;

