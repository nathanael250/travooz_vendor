const express = require('express');
const router = express.Router();
const adminPackagesController = require('../controllers/admin/adminPackages.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Admin Routes for Package Management
 * All routes require authentication and admin role
 */

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        // Check if user is admin from travooz_user table
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error checking admin access',
            error: error.message 
        });
    }
};

// Protected routes - require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Package management routes
router.get('/packages', adminPackagesController.getPackages.bind(adminPackagesController));
router.get('/packages/stats', adminPackagesController.getPackageStats.bind(adminPackagesController));
router.get('/packages/:packageId', adminPackagesController.getPackageDetails.bind(adminPackagesController));
router.post('/packages/:packageId/approve', adminPackagesController.approvePackage.bind(adminPackagesController));
router.post('/packages/:packageId/reject', adminPackagesController.rejectPackage.bind(adminPackagesController));

module.exports = router;

