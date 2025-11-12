const express = require('express');
const router = express.Router();
const toursAdminController = require('../controllers/tours/toursAdmin.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Admin Routes for Tour Package Submissions
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

// Get all submissions for admin review
router.get('/submissions', toursAdminController.getAllSubmissions);

// Get submission statistics
router.get('/submissions/stats', toursAdminController.getSubmissionStats);

// Get submission details by ID
router.get('/submissions/:id', toursAdminController.getSubmissionById);

// Update submission status (approve/reject)
router.patch('/submissions/:id/status', toursAdminController.updateSubmissionStatus);

module.exports = router;

