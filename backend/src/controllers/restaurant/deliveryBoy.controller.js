const deliveryBoyProxyService = require('../../services/restaurant/deliveryBoyProxy.service');
const restaurantOrderService = require('../../services/restaurant/restaurantOrder.service');
const { pool } = require('../../../config/database');

class DeliveryBoyController {
  /**
   * GET /api/v1/restaurant/delivery-boys
   * Get all delivery boys
   */
  async getDeliveryBoys(req, res) {
    try {
      const {
        id = null,
        search = null,
        limit = 25,
        offset = 0,
        sort = 'id',
        order = 'DESC'
      } = req.query;

      const result = await deliveryBoyProxyService.getDeliveryBoys({
        id,
        search,
        limit,
        offset,
        sort,
        order
      });

      // Return the response from external API
      res.json(result);
    } catch (error) {
      console.error('Error getting delivery boys:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get delivery boys',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/restaurant/delivery-boys
   * Add or update delivery boy
   */
  async addDeliveryBoy(req, res) {
    try {
      // Get auth token from request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
      
      if (!authToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token required'
        });
      }

      const result = await deliveryBoyProxyService.addDeliveryBoy(req.body, authToken);

      // Return the response from external API
      res.json(result);
    } catch (error) {
      console.error('Error adding delivery boy:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add delivery boy',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/restaurant/delivery-boys/delete
   * Delete delivery boy
   */
  async deleteDeliveryBoy(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Delivery boy ID is required'
        });
      }

      // Get auth token from request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
      
      if (!authToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token required'
        });
      }

      const result = await deliveryBoyProxyService.deleteDeliveryBoy(id, authToken);

      // Return the response from external API
      res.json(result);
    } catch (error) {
      console.error('Error deleting delivery boy:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete delivery boy',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/restaurant/delivery-boys/cash-collection
   * Manage delivery boy cash collection
   */
  async manageCashCollection(req, res) {
    try {
      // Get auth token from request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
      
      if (!authToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token required'
        });
      }

      const result = await deliveryBoyProxyService.manageCashCollection(req.body, authToken);

      // Return the response from external API
      res.json(result);
    } catch (error) {
      console.error('Error managing cash collection:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to manage cash collection',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/restaurant/delivery-boys/cash-collection/list
   * Get delivery boy cash collection records
   */
  async getCashCollection(req, res) {
    try {
      const {
        delivery_boy_id = null,
        status = null,
        limit = 25,
        offset = 0,
        sort = 'id',
        order = 'DESC',
        search = null
      } = req.body;

      // Get auth token from request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
      
      if (!authToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token required'
        });
      }

      const result = await deliveryBoyProxyService.getCashCollection({
        delivery_boy_id,
        status,
        limit,
        offset,
        sort,
        order,
        search
      }, authToken);

      // Return the response from external API
      res.json(result);
    } catch (error) {
      console.error('Error getting cash collection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cash collection records',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/restaurant/delivery-boys/order/:orderId/map
   * Map restaurant order to delivery boy API format
   */
  async mapOrderToDeliveryBoyFormat(req, res) {
    try {
      const { orderId } = req.params;
      const vendorUserId = req.user.id || req.user.user_id;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Get the restaurant order
      const restaurantOrder = await restaurantOrderService.getOrderById(orderId);
      
      if (!restaurantOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Verify order belongs to vendor's restaurant
      const userType = req.user.userType || 'restaurant_user';
      let restaurantId = null;
      
      if (userType === 'restaurant_user') {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      } else {
        const [restaurants] = await pool.execute(
          'SELECT id FROM restaurants WHERE user_id = ? AND status = ? LIMIT 1',
          [vendorUserId, 'active']
        );
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      }

      if (restaurantOrder.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Order does not belong to your restaurant'
        });
      }

      // Map the order to delivery boy API format
      const mappedOrder = deliveryBoyProxyService.mapRestaurantOrderToDeliveryBoyFormat(restaurantOrder);

      return res.json({
        success: true,
        message: 'Order mapped successfully',
        data: mappedOrder
      });
    } catch (error) {
      console.error('Error mapping order to delivery boy format:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to map order',
        error: error.message
      });
    }
  }
}

module.exports = new DeliveryBoyController();

