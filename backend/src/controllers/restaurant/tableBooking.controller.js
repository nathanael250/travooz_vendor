const tableBookingService = require('../../services/restaurant/tableBooking.service');

class TableBookingController {
  /**
   * POST /api/v1/client/bookings/tables
   * Create a table booking (client-facing)
   */
  async createTableBooking(req, res) {
    try {
      const booking = await tableBookingService.createTableBooking(req.body);

      res.status(201).json({
        success: true,
        message: 'Table booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('Error creating table booking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create table booking',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/client/restaurants/:restaurantId/table-availability
   * Check table availability (client-facing)
   */
  async checkAvailability(req, res) {
    try {
      const { restaurantId } = req.params;
      const { booking_date, booking_time, number_of_guests = 1 } = req.query;

      if (!booking_date || !booking_time) {
        return res.status(400).json({
          success: false,
          message: 'Booking date and time are required'
        });
      }

      const availability = await tableBookingService.checkAvailability(
        restaurantId,
        booking_date,
        booking_time,
        number_of_guests
      );

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to check availability',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/restaurant/table-bookings
   * Get table bookings for a restaurant (requires authentication)
   */
  async getRestaurantTableBookings(req, res) {
    try {
      const restaurantId = req.user.restaurant_id || req.query.restaurant_id;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required'
        });
      }

      const {
        status = null,
        booking_date = null,
        limit = 50,
        offset = 0
      } = req.query;

      const bookings = await tableBookingService.getRestaurantTableBookings(restaurantId, {
        status,
        booking_date,
        limit,
        offset
      });

      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      console.error('Error getting table bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get table bookings',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/v1/restaurant/table-bookings/:bookingId/status
   * Update table booking status (requires authentication)
   */
  async updateTableBookingStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const { status, cancellation_reason = null } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const booking = await tableBookingService.updateTableBookingStatus(bookingId, status, {
        cancellation_reason
      });

      res.json({
        success: true,
        message: 'Table booking status updated successfully',
        data: booking
      });
    } catch (error) {
      console.error('Error updating table booking status:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update table booking status',
        error: error.message
      });
    }
  }
}

module.exports = new TableBookingController();

