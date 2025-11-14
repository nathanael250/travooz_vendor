const { executeQuery } = require('../../../config/database');

class ClientBookingService {
  /**
   * Ensure payment_transactions table exists
   */
  async ensurePaymentTransactionsTable() {
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS payment_transactions (
          transaction_id INT AUTO_INCREMENT PRIMARY KEY,
          booking_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency CHAR(3) DEFAULT 'RWF',
          payment_method ENUM('card','paypal','stripe','bank_transfer','cash','mobile_money','other') NOT NULL DEFAULT 'card',
          status ENUM('pending','processing','completed','failed','refunded') DEFAULT 'pending',
          payment_gateway_id VARCHAR(255) DEFAULT NULL,
          gateway_response JSON DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_booking_id (booking_id),
          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (error) {
      console.error('Error ensuring payment_transactions table:', error);
      // Table might already exist, continue
    }
  }
  /**
   * Create a stay/room booking
   */
  async createStayBooking(bookingData) {
    try {
      const {
        property_id,
        room_type_id,
        check_in_date,
        check_out_date,
        guest_name,
        guest_email,
        guest_phone,
        number_of_adults,
        number_of_children = 0,
        special_requests,
        payment_method = 'card'
      } = bookingData;

      // Validate required fields
      if (!property_id || !room_type_id || !check_in_date || !check_out_date || 
          !guest_name || !guest_email || !guest_phone || !number_of_adults) {
        throw new Error('Missing required booking fields');
      }

      // Get room type details and pricing
      const roomType = await executeQuery(
        `SELECT * FROM room_types WHERE room_type_id = ?`,
        [room_type_id]
      );

      if (!roomType || roomType.length === 0) {
        throw new Error('Room type not found');
      }

      const room = roomType[0];

      // Calculate number of nights
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        throw new Error('Invalid date range');
      }

      // Check availability - join with bookings table to check status
      const existingBookings = await executeQuery(
        `SELECT COUNT(*) as count FROM room_bookings rb
         JOIN bookings b ON rb.booking_id = b.booking_id
         WHERE rb.room_type_id = ? 
         AND b.status IN ('pending', 'confirmed')
         AND ((rb.check_in_date < ? AND rb.check_out_date > ?) OR 
              (rb.check_in_date < ? AND rb.check_out_date > ?))`,
        [room_type_id, check_out_date, check_in_date, check_in_date, check_out_date]
      );

      const totalRooms = await executeQuery(
        `SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ? AND status = 'active'`,
        [room_type_id]
      );

      if (existingBookings[0].count >= totalRooms[0].count) {
        throw new Error('Room not available for selected dates');
      }

      // Calculate total amount
      const baseRate = parseFloat(room.room_price_per_night || room.base_rate || 0);
      const totalAmount = baseRate * nights;

      // Generate booking reference
      const bookingReference = `STAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create booking
      const bookingResult = await executeQuery(
        `INSERT INTO bookings (
          service_type, total_amount, status, payment_status, 
          booking_reference, booking_source, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['room', totalAmount, 'pending', 'pending', bookingReference, 'website', special_requests]
      );

      const bookingId = bookingResult.insertId;

      // Create room booking - use homestay_id for property_id
      await executeQuery(
        `INSERT INTO room_bookings (
          booking_id, room_type_id, check_in_date, check_out_date,
          number_of_adults, number_of_children, guest_name, guest_email, guest_phone,
          homestay_id, guests, room_price_per_night, total_room_amount, nights
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, room_type_id, check_in_date, check_out_date,
         number_of_adults, number_of_children, guest_name, guest_email, guest_phone,
         property_id, number_of_adults + number_of_children, baseRate, totalAmount, nights]
      );

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create payment transaction
      const transactionResult = await executeQuery(
        `INSERT INTO payment_transactions (
          booking_id, amount, payment_method, status
        ) VALUES (?, ?, ?, ?)`,
        [bookingId, totalAmount, payment_method, 'pending']
      );

      return {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        nights: nights,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending'
      };
    } catch (error) {
      console.error('Error creating stay booking:', error);
      throw error;
    }
  }

  /**
   * Create a tour package booking
   */
  async createTourBooking(bookingData) {
    try {
      const {
        tour_package_id,
        tour_date,
        number_of_participants,
        customer_name,
        customer_email,
        customer_phone,
        special_requests,
        payment_method = 'card'
      } = bookingData;

      // Validate required fields
      if (!tour_package_id || !tour_date || !number_of_participants || 
          !customer_name || !customer_email || !customer_phone) {
        throw new Error('Missing required booking fields');
      }

      // Get tour package details
      const tourPackage = await executeQuery(
        `SELECT * FROM tours_packages WHERE package_id = ? AND status = 'active'`,
        [tour_package_id]
      );

      if (!tourPackage || tourPackage.length === 0) {
        throw new Error('Tour package not found or not available');
      }

      const tour = tourPackage[0];

      // Check availability - join with bookings table
      const existingBookings = await executeQuery(
        `SELECT SUM(tb.number_of_participants) as total FROM tours_bookings tb
         JOIN bookings b ON tb.booking_id = b.booking_id
         WHERE tb.package_id = ? AND tb.tour_date = ? 
         AND b.status IN ('pending', 'confirmed')`,
        [tour_package_id, tour_date]
      );

      const availableSpots = (tour.max_participants || 0) - (existingBookings[0].total || 0);
      if (number_of_participants > availableSpots) {
        throw new Error('Not enough spots available for selected date');
      }

      // Calculate total amount
      const pricePerPerson = parseFloat(tour.price_per_person || 0);
      const totalAmount = pricePerPerson * number_of_participants;

      // Generate booking reference
      const bookingReference = `TOUR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create booking
      const bookingResult = await executeQuery(
        `INSERT INTO bookings (
          service_type, total_amount, status, payment_status, 
          booking_reference, booking_source, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['tour_package', totalAmount, 'pending', 'pending', bookingReference, 'website', special_requests]
      );

      const bookingId = bookingResult.insertId;

      // Create tour booking - use tours_bookings table
      await executeQuery(
        `INSERT INTO tours_bookings (
          booking_id, package_id, tour_business_id, tour_date, number_of_participants,
          customer_name, customer_email, customer_phone, total_amount, status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, tour_package_id, tour.vendor_id || tour.tour_business_id, tour_date, number_of_participants,
         customer_name, customer_email, customer_phone, totalAmount, 'pending', 'pending']
      );

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create payment transaction
      const transactionResult = await executeQuery(
        `INSERT INTO payment_transactions (
          booking_id, amount, payment_method, status
        ) VALUES (?, ?, ?, ?)`,
        [bookingId, totalAmount, payment_method, 'pending']
      );

      return {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        number_of_participants: number_of_participants,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending'
      };
    } catch (error) {
      console.error('Error creating tour booking:', error);
      throw error;
    }
  }

  /**
   * Create a restaurant table reservation
   */
  async createRestaurantReservation(bookingData) {
    try {
      const {
        restaurant_id,
        reservation_date,
        reservation_time,
        number_of_guests,
        customer_name,
        customer_email,
        customer_phone,
        special_requests,
        payment_method = 'card'
      } = bookingData;

      // Validate required fields
      if (!restaurant_id || !reservation_date || !reservation_time || 
          !number_of_guests || !customer_name || !customer_email || !customer_phone) {
        throw new Error('Missing required reservation fields');
      }

      // Get restaurant details
      const restaurant = await executeQuery(
        `SELECT * FROM restaurants WHERE restaurant_id = ? AND status = 'active'`,
        [restaurant_id]
      );

      if (!restaurant || restaurant.length === 0) {
        throw new Error('Restaurant not found or not available');
      }

      // Check availability using restaurant_capacity_bookings
      const existingReservations = await executeQuery(
        `SELECT COUNT(*) as count FROM restaurant_capacity_bookings rcb
         JOIN bookings b ON rcb.booking_id = b.booking_id
         WHERE rcb.eating_out_id = ? AND DATE(rcb.reservation_start) = ? 
         AND TIME(rcb.reservation_start) = ? 
         AND b.status IN ('pending', 'confirmed')`,
        [restaurant_id, reservation_date, reservation_time]
      );

      // For now, we'll allow reservations (can add table capacity check later)
      const totalAmount = 0; // Table reservations are usually free, deposit can be added

      // Generate booking reference
      const bookingReference = `REST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create booking
      const bookingResult = await executeQuery(
        `INSERT INTO bookings (
          service_type, total_amount, status, payment_status, 
          booking_reference, booking_source, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['restaurant_table', totalAmount, 'pending', 'pending', bookingReference, 'website', special_requests]
      );

      const bookingId = bookingResult.insertId;

      // Create restaurant reservation using restaurant_capacity_bookings
      const reservationStart = `${reservation_date} ${reservation_time}:00`;
      const reservationEnd = new Date(new Date(reservationStart).getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      
      await executeQuery(
        `INSERT INTO restaurant_capacity_bookings (
          booking_id, eating_out_id, reservation_start, reservation_end, guests
        ) VALUES (?, ?, ?, ?, ?)`,
        [bookingId, restaurant_id, reservationStart, reservationEnd, number_of_guests]
      );

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create payment transaction if deposit required
      let transactionId = null;
      if (totalAmount > 0) {
        const transactionResult = await executeQuery(
          `INSERT INTO payment_transactions (
            booking_id, amount, payment_method, status
          ) VALUES (?, ?, ?, ?)`,
          [bookingId, totalAmount, payment_method, 'pending']
        );
        transactionId = transactionResult.insertId;
      }

      return {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        number_of_guests: number_of_guests,
        transaction_id: transactionId,
        status: 'pending',
        payment_status: 'pending'
      };
    } catch (error) {
      console.error('Error creating restaurant reservation:', error);
      throw error;
    }
  }

  /**
   * Create a car rental booking
   */
  async createCarRentalBooking(bookingData) {
    try {
      const {
        car_id,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        customer_name,
        customer_email,
        customer_phone,
        driver_license_number,
        special_requests,
        payment_method = 'card'
      } = bookingData;

      // Validate required fields
      if (!car_id || !pickup_date || !return_date || 
          !customer_name || !customer_email || !customer_phone) {
        throw new Error('Missing required booking fields');
      }

      // Get car details
      const car = await executeQuery(
        `SELECT * FROM cars WHERE car_id = ? AND status = 'active' AND is_available = 1`,
        [car_id]
      );

      if (!car || car.length === 0) {
        throw new Error('Car not found or not available');
      }

      const carData = car[0];

      // Check availability
      // Note: car_rental_bookings uses booking_status (not status) and dropoff_date (not return_date)
      // Convert dates to DATETIME format for comparison if needed
      const pickupDateTime = pickup_date.includes(' ') ? pickup_date : `${pickup_date} 00:00:00`;
      const returnDateTime = return_date.includes(' ') ? return_date : `${return_date} 23:59:59`;
      
      // Check for overlapping bookings: existing booking overlaps if it starts before requested end AND ends after requested start
      const existingBookings = await executeQuery(
        `SELECT COUNT(*) as count FROM car_rental_bookings 
         WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
         AND pickup_date < ? AND dropoff_date > ?`,
        [car_id, returnDateTime, pickupDateTime]
      );

      if (existingBookings[0].count > 0) {
        throw new Error('Car not available for selected dates');
      }

      // Calculate number of days
      const pickup = new Date(pickup_date);
      const returnDate = new Date(return_date);
      const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        throw new Error('Invalid date range');
      }

      // Calculate total amount
      const dailyRate = parseFloat(carData.daily_rate || 0);
      const securityDeposit = parseFloat(carData.security_deposit || 0);
      const totalAmount = (dailyRate * days) + securityDeposit;

      // Generate booking reference
      const bookingReference = `CAR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create booking
      const bookingResult = await executeQuery(
        `INSERT INTO bookings (
          service_type, total_amount, status, payment_status, 
          booking_reference, booking_source, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['car_rental', totalAmount, 'pending', 'pending', bookingReference, 'website', special_requests]
      );

      const bookingId = bookingResult.insertId;

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create car rental booking
      // Note: car_rental_bookings uses dropoff_date (not return_date) and booking_status (not status)
      // Convert return_date to dropoff_date and set pickup/dropoff as DATETIME
      // Reuse pickupDateTime and returnDateTime but adjust times for booking (10:00 for pickup, 18:00 for dropoff)
      const bookingPickupDateTime = pickup_date.includes(' ') ? pickup_date : `${pickup_date} 10:00:00`;
      const bookingDropoffDateTime = return_date.includes(' ') ? return_date : `${return_date} 18:00:00`;
      
      // Store driver_license_number in special_requests if provided (column doesn't exist in table)
      let specialRequestsText = special_requests || '';
      if (driver_license_number) {
        const licenseInfo = `Driver License: ${driver_license_number}`;
        specialRequestsText = special_requests ? `${special_requests}\n${licenseInfo}` : licenseInfo;
      }
      
      await executeQuery(
        `INSERT INTO car_rental_bookings (
          booking_id, car_id, vendor_id, pickup_date, dropoff_date,
          pickup_location, dropoff_location, customer_name, customer_email, 
          customer_phone, total_amount, deposit_amount, booking_status, payment_status, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, car_id, carData.vendor_id, bookingPickupDateTime, bookingDropoffDateTime,
         pickup_location, return_location, customer_name, customer_email, 
         customer_phone, totalAmount, securityDeposit, 'pending', 'pending', specialRequestsText]
      );

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create payment transaction
      const transactionResult = await executeQuery(
        `INSERT INTO payment_transactions (
          booking_id, amount, payment_method, status
        ) VALUES (?, ?, ?, ?)`,
        [bookingId, totalAmount, payment_method, 'pending']
      );

      return {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        days: days,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending'
      };
    } catch (error) {
      console.error('Error creating car rental booking:', error);
      throw error;
    }
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(bookingReference) {
    try {
      const bookings = await executeQuery(
        `SELECT b.*, 
         rb.check_in_date, rb.check_out_date, rb.guest_name, rb.guest_email, rb.guest_phone,
         tb.tour_date, tb.number_of_participants, tb.customer_name as tour_customer_name,
         rcb.reservation_start, rcb.reservation_end, rcb.guests as restaurant_guests,
         crb.pickup_date, crb.dropoff_date as return_date, crb.pickup_location, crb.dropoff_location as return_location
         FROM bookings b
         LEFT JOIN room_bookings rb ON b.booking_id = rb.booking_id
         LEFT JOIN tours_bookings tb ON b.booking_id = tb.booking_id
         LEFT JOIN restaurant_capacity_bookings rcb ON b.booking_id = rcb.booking_id
         LEFT JOIN car_rental_bookings crb ON b.booking_id = crb.booking_id
         WHERE b.booking_reference = ?`,
        [bookingReference]
      );

      if (!bookings || bookings.length === 0) {
        return null;
      }

      return bookings[0];
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }
}

module.exports = new ClientBookingService();

