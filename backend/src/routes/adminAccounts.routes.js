const express = require('express');
const router = express.Router();
const adminAccountsController = require('../controllers/admin/adminAccounts.controller');
const adminAuthController = require('../controllers/admin/adminAuth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Admin Routes for Account Management
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

// Auth routes
router.get('/auth/profile', adminAuthController.getProfile.bind(adminAuthController));

// Account management routes
router.get('/accounts', adminAccountsController.getAllPendingAccounts.bind(adminAccountsController));
router.get('/accounts/stats', adminAccountsController.getAccountStats.bind(adminAccountsController));
router.get('/accounts/:serviceType/:accountId', adminAccountsController.getAccountDetails.bind(adminAccountsController));
router.post('/accounts/:serviceType/:accountId/approve', adminAccountsController.approveAccount.bind(adminAccountsController));
router.post('/accounts/:serviceType/:accountId/reject', adminAccountsController.rejectAccount.bind(adminAccountsController));

module.exports = router;

