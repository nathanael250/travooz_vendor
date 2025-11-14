const { executeQuery } = require('../../../config/database');

class ClientBookingService {
  /**
   * Ensure bookings table exists
   */
  async ensureBookingsTable() {
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS bookings (
          booking_id INT AUTO_INCREMENT PRIMARY KEY,
          service_type ENUM('stay','tour_package','restaurant','car_rental') NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
          payment_status ENUM('pending','paid','refunded','failed') DEFAULT 'pending',
          booking_reference VARCHAR(100) UNIQUE NOT NULL,
          booking_source VARCHAR(50) DEFAULT 'website',
          special_requests TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_service_type (service_type),
          INDEX idx_status (status),
          INDEX idx_booking_reference (booking_reference)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (error) {
      console.error('Error ensuring bookings table:', error);
      // Table might already exist, continue
    }
  }

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
      console.log('📥 Received booking request:', bookingData);
      
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
        console.error('❌ Missing required fields:', {
          tour_package_id: !!tour_package_id,
          tour_date: !!tour_date,
          number_of_participants: !!number_of_participants,
          customer_name: !!customer_name,
          customer_email: !!customer_email,
          customer_phone: !!customer_phone
        });
        throw new Error('Missing required booking fields');
      }

      console.log(`🔍 Checking tour package ${tour_package_id}...`);
      
      // Get tour package details with pricing - first check if package exists at all
      const packageCheck = await executeQuery(
        `SELECT package_id, status, name FROM tours_packages WHERE package_id = ?`,
        [tour_package_id]
      );
      
      console.log(`📊 Package check result:`, {
        found: packageCheck && packageCheck.length > 0,
        count: packageCheck ? packageCheck.length : 0,
        data: packageCheck && packageCheck.length > 0 ? packageCheck[0] : null
      });

      if (!packageCheck || packageCheck.length === 0) {
        console.error(`❌ Tour package ${tour_package_id} does not exist`);
        throw new Error('Tour package not found or not available');
      }

      const packageStatus = packageCheck[0].status;
      const packageName = packageCheck[0].name;
      
      console.log(`🔍 Tour package ${tour_package_id} found:`, {
        package_id: tour_package_id,
        name: packageName,
        status: packageStatus
      });

      // Get tour package details with pricing
      // In development, allow draft/pending packages; in production, only active
      const allowedStatuses = process.env.NODE_ENV === 'production' 
        ? ['active']
        : ['active', 'draft', 'pending'];
      
      const placeholders = allowedStatuses.map(() => '?').join(',');
      const queryParams = [tour_package_id, ...allowedStatuses];
      
      console.log(`🔍 Querying tour package:`, {
        package_id: tour_package_id,
        allowed_statuses: allowedStatuses,
        query_params: queryParams
      });
      
      const tourPackage = await executeQuery(
        `SELECT 
          tp.*,
          tp.tour_business_id,
          tp.max_group_size as max_participants,
          tp.price_per_person
        FROM tours_packages tp
        WHERE tp.package_id = ? AND tp.status IN (${placeholders})`,
        queryParams
      );

      console.log(`📦 Query result:`, {
        found: tourPackage && tourPackage.length > 0,
        count: tourPackage ? tourPackage.length : 0,
        package_data: tourPackage && tourPackage.length > 0 ? {
          package_id: tourPackage[0].package_id,
          name: tourPackage[0].name,
          status: tourPackage[0].status,
          price_per_person: tourPackage[0].price_per_person
        } : null
      });

      if (!tourPackage || tourPackage.length === 0) {
        console.error(`❌ Tour package ${tour_package_id} exists but status is '${packageStatus}' (not allowed for bookings)`);
        const allowedStatusesMsg = process.env.NODE_ENV === 'production' ? "'active'" : "'active', 'draft', or 'pending'";
        throw new Error(`Tour package not available. Current status: ${packageStatus}. Package must be ${allowedStatusesMsg} for bookings.`);
      }

      const tour = tourPackage[0];
      
      // Use simple price_per_person from tours_packages table
      let pricePerPerson = parseFloat(tour.price_per_person || 0);
      
      if (pricePerPerson === 0) {
        console.warn(`⚠️ No price_per_person set for tour package ${tour_package_id}`);
      }
      
      // Add price_per_person to tour object for consistency
      tour.price_per_person = pricePerPerson;
      
      console.log('📦 Tour package retrieved:', {
        package_id: tour.package_id,
        tour_business_id: tour.tour_business_id,
        max_participants: tour.max_participants || tour.max_group_size,
        price_per_person: pricePerPerson,
        number_of_participants: number_of_participants
      });

      // Ensure bookings table exists
      await this.ensureBookingsTable();

      // Check availability - join with bookings table
      const existingBookings = await executeQuery(
        `SELECT COALESCE(SUM(tb.number_of_participants), 0) as total 
         FROM tours_bookings tb
         JOIN bookings b ON tb.booking_id = b.booking_id
         WHERE tb.package_id = ? AND DATE(tb.tour_date) = DATE(?) 
         AND b.status IN ('pending', 'confirmed')`,
        [tour_package_id, tour_date]
      );

      const maxParticipants = parseInt(tour.max_participants || tour.max_group_size || 0);
      const bookedParticipants = parseInt(existingBookings[0]?.total || 0);
      const availableSpots = maxParticipants - bookedParticipants;
      
      console.log(`📊 Tour availability check:`, {
        package_id: tour_package_id,
        tour_date,
        max_participants: maxParticipants,
        max_group_size: tour.max_group_size,
        booked_participants: bookedParticipants,
        available_spots: availableSpots,
        requested_participants: number_of_participants,
        existing_bookings_query: existingBookings[0]
      });
      
      if (maxParticipants === 0) {
        console.warn(`⚠️ Warning: max_group_size is 0 or not set for package ${tour_package_id}. Allowing booking anyway.`);
        // If max_group_size is not set, allow the booking (unlimited capacity)
      } else if (number_of_participants > availableSpots) {
        throw new Error(`Not enough spots available for selected date. Available: ${availableSpots}, Requested: ${number_of_participants}. Max capacity: ${maxParticipants}, Already booked: ${bookedParticipants}`);
      }

      // Calculate total amount (price_per_person is already set above)
      const totalAmount = pricePerPerson * number_of_participants;
      
      if (totalAmount === 0) {
        console.warn(`⚠️ Warning: Total amount is 0 for tour package ${tour_package_id}. Price per person: ${pricePerPerson}, Participants: ${number_of_participants}`);
        console.warn(`⚠️ This usually means pricing tiers are not set up for this tour package.`);
      }
      
      console.log(`💰 Booking amount calculation:`, {
        price_per_person: pricePerPerson,
        number_of_participants: number_of_participants,
        total_amount: totalAmount
      });

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

      // Get tour business ID
      const tourBusinessId = tour.tour_business_id || tour.vendor_id;
      if (!tourBusinessId) {
        console.error('❌ Tour business ID not found in tour object:', {
          package_id: tour.package_id,
          tour_business_id: tour.tour_business_id,
          vendor_id: tour.vendor_id,
          available_keys: Object.keys(tour)
        });
        throw new Error('Tour business ID not found');
      }

      console.log('💾 Creating tour booking:', {
        booking_id: bookingId,
        package_id: tour_package_id,
        tour_business_id: tourBusinessId,
        tour_date,
        number_of_participants,
        total_amount: totalAmount
      });

      // Create tour booking - use tours_bookings table
      const bookingDate = new Date().toISOString().split('T')[0]; // Current date as YYYY-MM-DD
      const insertResult = await executeQuery(
        `INSERT INTO tours_bookings (
          booking_id, package_id, tour_business_id, booking_date, tour_date, number_of_participants,
          customer_name, customer_email, customer_phone, total_amount, status, payment_status, currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, tour_package_id, tourBusinessId, bookingDate, tour_date, number_of_participants,
         customer_name, customer_email, customer_phone, totalAmount, 'pending', 'pending', 'RWF']
      );
      
      console.log('✅ Tour booking created successfully:', {
        tours_booking_id: insertResult.insertId || 'N/A',
        booking_id: bookingId,
        tour_business_id: tourBusinessId
      });

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

