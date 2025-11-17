const { pool } = require('../../../config/database');

class TableBookingService {
  /**
   * Ensure restaurant_table_bookings table exists
   */
  async ensureTableBookingsTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS restaurant_table_bookings (
          id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          booking_id int DEFAULT NULL,
          restaurant_id varchar(36) NOT NULL,
          user_id int DEFAULT NULL,
          customer_name varchar(255) NOT NULL,
          customer_email varchar(255) DEFAULT NULL,
          customer_phone varchar(50) NOT NULL,
          booking_date date NOT NULL,
          booking_time time NOT NULL,
          number_of_guests int NOT NULL DEFAULT 1,
          table_number varchar(20) DEFAULT NULL,
          status enum('pending','confirmed','seated','completed','cancelled','no_show') DEFAULT 'pending',
          special_requests text DEFAULT NULL,
          arrived_at timestamp NULL DEFAULT NULL,
          seated_at timestamp NULL DEFAULT NULL,
          completed_at timestamp NULL DEFAULT NULL,
          cancelled_at timestamp NULL DEFAULT NULL,
          cancellation_reason text DEFAULT NULL,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_restaurant_id (restaurant_id),
          KEY idx_user_id (user_id),
          KEY idx_booking_id (booking_id),
          KEY idx_booking_date (booking_date),
          KEY idx_status (status),
          KEY idx_booking_datetime (booking_date, booking_time),
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error) {
      console.error('Error ensuring restaurant_table_bookings table:', error);
    }
  }

  /**
   * Check table availability for a restaurant on a specific date/time
   */
  async checkAvailability(restaurantId, bookingDate, bookingTime, numberOfGuests) {
    await this.ensureTableBookingsTable();

    // Get restaurant capacity
    const [restaurants] = await pool.execute(
      'SELECT capacity, available_seats FROM restaurants WHERE id = ? AND status = ?',
      [restaurantId, 'active']
    );

    if (restaurants.length === 0) {
      throw new Error('Restaurant not found or not active');
    }

    const restaurant = restaurants[0];
    const totalCapacity = parseInt(restaurant.capacity) || 0;
    const availableSeats = parseInt(restaurant.available_seats) || totalCapacity;

    // Get existing bookings for the same date and time (within 2 hours window)
    const bookingDateTime = new Date(`${bookingDate} ${bookingTime}`);
    const windowStart = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const windowEnd = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after

    const [existingBookings] = await pool.execute(
      `SELECT SUM(number_of_guests) as total_guests
       FROM restaurant_table_bookings
       WHERE restaurant_id = ?
         AND booking_date = ?
         AND status IN ('pending', 'confirmed', 'seated')
         AND (
           (booking_time >= ? AND booking_time <= ?)
           OR (booking_time <= ? AND booking_time >= ?)
         )`,
      [
        restaurantId,
        bookingDate,
        windowStart.toTimeString().slice(0, 5),
        windowEnd.toTimeString().slice(0, 5),
        windowEnd.toTimeString().slice(0, 5),
        windowStart.toTimeString().slice(0, 5)
      ]
    );

    const bookedGuests = parseInt(existingBookings[0]?.total_guests || 0);
    const requestedGuests = parseInt(numberOfGuests) || 1;
    const availableCapacity = availableSeats - bookedGuests;

    return {
      available: availableCapacity >= requestedGuests,
      total_capacity: totalCapacity,
      available_seats: availableSeats,
      booked_guests: bookedGuests,
      requested_guests: requestedGuests,
      available_capacity: availableCapacity
    };
  }

  /**
   * Create a table booking
   */
  async createTableBooking(bookingData) {
    await this.ensureTableBookingsTable();

    const {
      restaurant_id,
      user_id = null,
      customer_name,
      customer_email = null,
      customer_phone,
      booking_date,
      booking_time,
      number_of_guests = 1,
      special_requests = null
    } = bookingData;

    // Validate required fields
    if (!restaurant_id || !customer_name || !customer_phone || !booking_date || !booking_time) {
      throw new Error('Restaurant ID, customer name, customer phone, booking date, and booking time are required');
    }

    // Check availability
    const availability = await this.checkAvailability(
      restaurant_id,
      booking_date,
      booking_time,
      number_of_guests
    );

    if (!availability.available) {
      throw new Error(
        `Not enough capacity available. Available: ${availability.available_capacity}, Requested: ${availability.requested_guests}`
      );
    }

    // Verify restaurant exists and is active
    const [restaurants] = await pool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND status = ?',
      [restaurant_id, 'active']
    );

    if (restaurants.length === 0) {
      throw new Error('Restaurant not found or not active');
    }

    // Create booking record in main bookings table
    let bookingId = null;
    try {
      const bookingReference = `TABLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const [bookingResult] = await pool.execute(
        `INSERT INTO bookings 
         (service_type, user_id, total_amount, status, payment_status, booking_reference, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['restaurant_table', user_id, 0, 'pending', 'pending', bookingReference, special_requests]
      );
      bookingId = bookingResult.insertId;
    } catch (bookingError) {
      console.error('Error creating booking record:', bookingError);
      // Continue without booking_id if table doesn't exist or error occurs
    }

    // Create table booking
    const [result] = await pool.execute(
      `INSERT INTO restaurant_table_bookings 
       (booking_id, restaurant_id, user_id, customer_name, customer_email, customer_phone,
        booking_date, booking_time, number_of_guests, special_requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        restaurant_id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        booking_time,
        number_of_guests,
        special_requests,
        'pending'
      ]
    );

    const bookingId_new = result.insertId;

    // Get created booking
    return await this.getTableBookingById(bookingId_new);
  }

  /**
   * Get table booking by ID
   */
  async getTableBookingById(bookingId) {
    await this.ensureTableBookingsTable();

    const [bookings] = await pool.execute(
      `SELECT tb.*, r.name as restaurant_name, r.address as restaurant_address,
              r.phone as restaurant_phone, r.capacity as restaurant_capacity
       FROM restaurant_table_bookings tb
       LEFT JOIN restaurants r ON tb.restaurant_id = r.id
       WHERE tb.id = ?`,
      [bookingId]
    );

    return bookings.length > 0 ? bookings[0] : null;
  }

  /**
   * Get table bookings for a restaurant
   */
  async getRestaurantTableBookings(restaurantId, filters = {}) {
    await this.ensureTableBookingsTable();

    const {
      status = null,
      booking_date = null,
      limit = 50,
      offset = 0
    } = filters;

    let query = `
      SELECT tb.*, r.name as restaurant_name
      FROM restaurant_table_bookings tb
      LEFT JOIN restaurants r ON tb.restaurant_id = r.id
      WHERE tb.restaurant_id = ?
    `;
    const params = [restaurantId];

    if (status) {
      query += ' AND tb.status = ?';
      params.push(status);
    }

    if (booking_date) {
      query += ' AND tb.booking_date = ?';
      params.push(booking_date);
    }

    query += ' ORDER BY tb.booking_date DESC, tb.booking_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await pool.execute(query, params);
    return bookings;
  }

  /**
   * Update table booking status
   */
  async updateTableBookingStatus(bookingId, status, additionalData = {}) {
    await this.ensureTableBookingsTable();

    const validStatuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateFields = ['status = ?'];
    const params = [status];

    if (status === 'seated' && !additionalData.seated_at) {
      updateFields.push('seated_at = CURRENT_TIMESTAMP');
    }

    if (status === 'completed' && !additionalData.completed_at) {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }

    if (status === 'cancelled') {
      if (additionalData.cancellation_reason) {
        updateFields.push('cancellation_reason = ?');
        params.push(additionalData.cancellation_reason);
      }
      updateFields.push('cancelled_at = CURRENT_TIMESTAMP');
    }

    params.push(bookingId);

    await pool.execute(
      `UPDATE restaurant_table_bookings 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      params
    );

    return await this.getTableBookingById(bookingId);
  }
}

module.exports = new TableBookingService();

