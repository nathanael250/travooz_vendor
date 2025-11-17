const express = require('express');
const restaurantOrderController = require('../controllers/restaurant/restaurantOrder.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/v1/restaurant/orders
 * Create a new order (dine_in, delivery, or pickup)
 * Requires authentication (vendor must be logged in)
 */
router.post('/orders', authenticateToken, restaurantOrderController.createOrder);

/**
 * GET /api/v1/restaurant/orders/check-availability
 * Check table availability for dine-in orders
 */
router.get('/orders/check-availability', authenticateToken, restaurantOrderController.checkTableAvailability);

/**
 * GET /api/v1/restaurant/orders
 * Get all orders for vendor's restaurant (requires authentication)
 */
router.get('/orders', authenticateToken, restaurantOrderController.getOrders);

/**
 * GET /api/v1/restaurant/orders/:id
 * Get order by ID (requires authentication)
 */
router.get('/orders/:id', authenticateToken, restaurantOrderController.getOrderById);

/**
 * PATCH /api/v1/restaurant/orders/:id/status
 * Update order status (requires authentication)
 */
router.patch('/orders/:id/status', authenticateToken, restaurantOrderController.updateOrderStatus);

module.exports = router;

