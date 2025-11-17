const express = require('express');
const tableBookingController = require('../controllers/restaurant/tableBooking.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * GET /api/v1/restaurant/table-bookings
 * Get table bookings for a restaurant (requires authentication)
 */
router.get('/table-bookings', authenticateToken, (req, res) => {
  tableBookingController.getRestaurantTableBookings(req, res);
});

/**
 * PUT /api/v1/restaurant/table-bookings/:bookingId/status
 * Update table booking status (requires authentication)
 */
router.put('/table-bookings/:bookingId/status', authenticateToken, (req, res) => {
  tableBookingController.updateTableBookingStatus(req, res);
});

module.exports = router;

