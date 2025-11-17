const express = require('express');
const deliveryBoyController = require('../controllers/restaurant/deliveryBoy.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * GET /api/v1/restaurant/delivery-boys
 * Get all delivery boys from external API (with optional filters)
 * Query params: id, search, limit, offset, sort, order
 */
router.get('/delivery-boys', authenticateToken, (req, res) => {
  deliveryBoyController.getDeliveryBoys(req, res);
});

/**
 * POST /api/v1/restaurant/delivery-boys/add
 * Add or update delivery boy
 * Body: name, email, password, confirm_password, mobile, address, bonus_type, bonus_amount, bonus_percentage, edit_delivery_boy (optional)
 */
router.post('/delivery-boys/add', authenticateToken, (req, res) => {
  deliveryBoyController.addDeliveryBoy(req, res);
});

/**
 * POST /api/v1/restaurant/delivery-boys/delete
 * Delete delivery boy
 * Body: id
 */
router.post('/delivery-boys/delete', authenticateToken, (req, res) => {
  deliveryBoyController.deleteDeliveryBoy(req, res);
});

/**
 * POST /api/v1/restaurant/delivery-boys/cash-collection
 * Manage delivery boy cash collection
 * Body: delivery_boy_id, amount, transaction_date, message, status
 */
router.post('/delivery-boys/cash-collection', authenticateToken, (req, res) => {
  deliveryBoyController.manageCashCollection(req, res);
});

/**
 * POST /api/v1/restaurant/delivery-boys/cash-collection/list
 * Get delivery boy cash collection records
 * Body: delivery_boy_id (optional), status (optional), limit, offset, sort, order, search
 */
router.post('/delivery-boys/cash-collection/list', authenticateToken, (req, res) => {
  deliveryBoyController.getCashCollection(req, res);
});

/**
 * GET /api/v1/restaurant/delivery-boys/order/:orderId/map
 * Map restaurant order to delivery boy API provider format
 */
router.get('/delivery-boys/order/:orderId/map', authenticateToken, (req, res) => {
  deliveryBoyController.mapOrderToDeliveryBoyFormat(req, res);
});

module.exports = router;

