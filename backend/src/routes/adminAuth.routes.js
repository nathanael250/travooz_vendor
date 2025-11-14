const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin/adminAuth.controller');

/**
 * Public Admin Auth Routes
 * These routes do NOT require authentication
 */

// Public login route
router.post('/auth/login', adminAuthController.login.bind(adminAuthController));

module.exports = router;

