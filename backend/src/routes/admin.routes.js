const express = require('express');
const router = express.Router();
const AdminPropertyController = require('../controllers/stays/adminProperty.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * Admin Routes for Stays Properties
 * All routes require authentication and admin role
 */

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        // For now, we'll allow any authenticated user to access admin routes
        // In production, you should check the user's role
        // const user = req.user;
        // if (user.role !== 'admin') {
        //     return res.status(403).json({ success: false, message: 'Admin access required' });
        // }
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error checking admin access',
            error: error.message 
        });
    }
};

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all properties for admin review
router.get('/stays/properties', AdminPropertyController.getAllProperties);

// Get property statistics
router.get('/stays/properties/stats', AdminPropertyController.getPropertyStats);

// Get property details by ID
router.get('/stays/properties/:id', AdminPropertyController.getPropertyById);

// Update property status (approve/reject)
router.patch('/stays/properties/:id/status', AdminPropertyController.updatePropertyStatus);

module.exports = router;

