const { executeQuery } = require('../../../config/database');
const EmailService = require('../../utils/email.service');

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
      console.log('📥 [createStayBooking] Received booking request:', bookingData);
      
      const {
        property_id,
        room_id,  // Changed from room_type_id to room_id (using stays_rooms.room_id)
        check_in_date,
        check_out_date,
        guest_name,
        guest_email,
        guest_phone,
        number_of_adults,
        number_of_children = 0,
        special_requests,
        payment_method = 'card',
        user_id = null  // Optional: if user is logged in
      } = bookingData;

      // Validate required fields
      if (!property_id || !room_id || !check_in_date || !check_out_date || 
          !guest_name || !guest_email || !guest_phone || !number_of_adults) {
        console.error('❌ [createStayBooking] Missing required fields');
        throw new Error('Missing required booking fields: property_id, room_id, check_in_date, check_out_date, guest_name, guest_email, guest_phone, and number_of_adults are required');
      }

      // Get room details and pricing from stays_rooms table
      const rooms = await executeQuery(
        `SELECT * FROM stays_rooms WHERE room_id = ? AND property_id = ? AND room_status = 'active'`,
        [room_id, property_id]
      );

      if (!rooms || rooms.length === 0) {
        console.error(`❌ [createStayBooking] Room not found: room_id=${room_id}, property_id=${property_id}`);
        throw new Error('Room not found or not available');
      }

      const room = rooms[0];
      
      const properties = await executeQuery(
        `SELECT property_name, location, location_data FROM stays_properties WHERE property_id = ? LIMIT 1`,
        [property_id]
      );
      const property = properties && properties.length > 0 ? properties[0] : {};
      console.log('✅ [createStayBooking] Room found:', {
        room_id: room.room_id,
        room_name: room.room_name,
        base_rate: room.base_rate,
        recommended_occupancy: room.recommended_occupancy,
        number_of_rooms: room.number_of_rooms
      });

      // Validate guest count
      const totalGuests = parseInt(number_of_adults) + parseInt(number_of_children || 0);
      if (room.recommended_occupancy && totalGuests > room.recommended_occupancy) {
        throw new Error(`Room can only accommodate ${room.recommended_occupancy} guests, but ${totalGuests} guests requested`);
      }

      // Calculate number of nights
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        throw new Error('Invalid date range: check-out date must be after check-in date');
      }

      console.log(`📅 [createStayBooking] Booking dates: ${check_in_date} to ${check_out_date} (${nights} nights)`);

      // Check availability using stays_bookings table
      // Count existing bookings for this room that overlap with requested dates
      const existingBookings = await executeQuery(
        `SELECT COUNT(*) as count FROM stays_bookings sb
         WHERE sb.room_id = ? 
         AND sb.status IN ('pending', 'confirmed')
         AND sb.check_in_date < ? 
         AND sb.check_out_date > ?`,
        [room_id, check_out_date, check_in_date]
      );

      const bookedCount = existingBookings[0].count || 0;
      const totalRooms = room.number_of_rooms || 1;
      const availableCount = totalRooms - bookedCount;

      console.log(`📊 [createStayBooking] Availability check:`, {
        room_id,
        total_rooms: totalRooms,
        booked_count: bookedCount,
        available_count: availableCount
      });

      if (availableCount <= 0) {
        throw new Error('Room not available for selected dates');
      }

      // Calculate total amount
      const baseRate = parseFloat(room.base_rate || 0);
      if (baseRate === 0) {
        console.warn(`⚠️ [createStayBooking] Warning: base_rate is 0 for room_id=${room_id}`);
      }
      
      const totalAmount = baseRate * nights;
      console.log(`💰 [createStayBooking] Pricing:`, {
        base_rate: baseRate,
        nights: nights,
        total_amount: totalAmount
      });

      // Generate booking reference
      const bookingReference = `STAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Ensure bookings table exists
      await this.ensureBookingsTable();

      // Create booking in bookings table
      // Note: Using 'room' to match existing database enum (not 'stay')
      const bookingResult = await executeQuery(
        `INSERT INTO bookings (
          service_type, total_amount, status, payment_status, 
          booking_reference, booking_source, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['room', totalAmount, 'pending', 'pending', bookingReference, 'website', special_requests]
      );

      const bookingId = bookingResult.insertId;
      console.log(`✅ [createStayBooking] Created booking in bookings table: booking_id=${bookingId}`);

      // Create stay booking in stays_bookings table
      // Note: stays_bookings doesn't have guest_name, guest_email, guest_phone fields
      // We'll store guest info in special_requests or a separate table if needed
      // For now, we'll use the guests field for total guest count
      await executeQuery(
        `INSERT INTO stays_bookings (
          booking_id, property_id, room_id, user_id, check_in_date, check_out_date,
          guests, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, property_id, room_id, user_id, check_in_date, check_out_date,
         totalGuests, totalAmount, 'pending']
      );

      console.log(`✅ [createStayBooking] Created stay booking in stays_bookings table`);

      // Store guest information in special_requests for now
      // TODO: Create a separate guest_profiles or booking_guests table if needed
      const guestInfo = `Guest: ${guest_name}, Email: ${guest_email}, Phone: ${guest_phone}, Adults: ${number_of_adults}, Children: ${number_of_children}`;
      const fullSpecialRequests = special_requests 
        ? `${special_requests}\n${guestInfo}` 
        : guestInfo;

      // Update booking with guest info in special_requests
      await executeQuery(
        `UPDATE bookings SET special_requests = ? WHERE booking_id = ?`,
        [fullSpecialRequests, bookingId]
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

      console.log(`✅ [createStayBooking] Booking created successfully:`, {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        nights: nights
      });

      const bookingDetails = {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        nights: nights,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending',
        room_id: room_id,
        property_id: property_id,
        check_in_date: check_in_date,
        check_out_date: check_out_date,
        guests: totalGuests
      };

      // Send confirmation email to customer (non-blocking)
      this.sendStayBookingConfirmationEmail({
        guest_name,
        guest_email,
        property_name: property.property_name,
        room_name: room.room_name,
        booking_reference: bookingReference,
        check_in_date,
        check_out_date,
        total_amount: totalAmount,
        number_of_adults,
        number_of_children,
        special_requests,
        nights
      });

      // Get vendor email and send notification (non-blocking)
      try {
        const vendorInfo = await executeQuery(
          `SELECT u.email as vendor_email, u.name as vendor_name 
           FROM stays_properties p
           LEFT JOIN stays_users u ON p.user_id = u.user_id
           WHERE p.property_id = ? LIMIT 1`,
          [property_id]
        );

        if (vendorInfo && vendorInfo.length > 0 && vendorInfo[0].vendor_email) {
          this.sendStayBookingVendorNotification({
            vendor_email: vendorInfo[0].vendor_email,
            vendor_name: vendorInfo[0].vendor_name,
            property_name: property.property_name,
            room_name: room.room_name,
            booking_reference: bookingReference,
            check_in_date,
            check_out_date,
            total_amount: totalAmount,
            number_of_adults,
            number_of_children,
            guest_name,
            guest_email,
            guest_phone,
            special_requests,
            nights
          });
        }
      } catch (vendorEmailError) {
        console.error('⚠️ Failed to send vendor notification for stay booking:', vendorEmailError.message);
      }

      return bookingDetails;
    } catch (error) {
      console.error('❌ [createStayBooking] Error creating stay booking:', error);
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

      const bookingDetails = {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        number_of_participants: number_of_participants,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending'
      };

      // Send confirmation email to customer (non-blocking)
      this.sendTourBookingConfirmationEmail({
        customer_name,
        customer_email,
        customer_phone,
        package_name: tour.name,
        booking_reference: bookingReference,
        tour_date,
        number_of_participants,
        total_amount: totalAmount,
        special_requests
      });

      // Get vendor email and send notification (non-blocking)
      try {
        const vendorInfo = await executeQuery(
          `SELECT email as vendor_email, CONCAT(first_name, ' ', last_name) as vendor_name 
           FROM tours_business_owner_info 
           WHERE tour_business_id = ? LIMIT 1`,
          [tourBusinessId]
        );

        if (vendorInfo && vendorInfo.length > 0 && vendorInfo[0].vendor_email) {
          this.sendTourBookingVendorNotification({
            vendor_email: vendorInfo[0].vendor_email,
            vendor_name: vendorInfo[0].vendor_name,
            package_name: tour.name,
            booking_reference: bookingReference,
            tour_date,
            number_of_participants,
            total_amount: totalAmount,
            customer_name,
            customer_email,
            customer_phone,
            special_requests
          });
        }
      } catch (vendorEmailError) {
        console.error('⚠️ Failed to send vendor notification for tour booking:', vendorEmailError.message);
      }

      return bookingDetails;
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

      // Check availability using restaurant_capacity_bookings (if table exists)
      let existingReservations = [{ count: 0 }];
      try {
        const tableCheck = await executeQuery(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = DATABASE() 
           AND table_name = 'restaurant_capacity_bookings'`
        );
        if (tableCheck && tableCheck[0] && tableCheck[0].count > 0) {
          existingReservations = await executeQuery(
            `SELECT COUNT(*) as count FROM restaurant_capacity_bookings rcb
             JOIN bookings b ON rcb.booking_id = b.booking_id
             WHERE rcb.eating_out_id = ? AND DATE(rcb.reservation_start) = ? 
             AND TIME(rcb.reservation_start) = ? 
             AND b.status IN ('pending', 'confirmed')`,
            [restaurant_id, reservation_date, reservation_time]
          );
        }
      } catch (err) {
        console.log('Note: restaurant_capacity_bookings table does not exist, skipping availability check');
      }

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

      // Create restaurant reservation using restaurant_capacity_bookings (if table exists)
      try {
        const tableCheck = await executeQuery(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = DATABASE() 
           AND table_name = 'restaurant_capacity_bookings'`
        );
        if (tableCheck && tableCheck[0] && tableCheck[0].count > 0) {
          const reservationStart = `${reservation_date} ${reservation_time}:00`;
          const reservationEnd = new Date(new Date(reservationStart).getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
          
          await executeQuery(
            `INSERT INTO restaurant_capacity_bookings (
              booking_id, eating_out_id, reservation_start, reservation_end, guests
            ) VALUES (?, ?, ?, ?, ?)`,
            [bookingId, restaurant_id, reservationStart, reservationEnd, number_of_guests]
          );
        } else {
          console.log('Note: restaurant_capacity_bookings table does not exist, skipping reservation creation');
        }
      } catch (err) {
        console.log('Note: Could not create restaurant capacity booking:', err.message);
      }

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

      const reservationDetails = {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        number_of_guests: number_of_guests,
        transaction_id: transactionId,
        status: 'pending',
        payment_status: 'pending'
      };

      // Send confirmation email to customer (non-blocking)
      this.sendRestaurantReservationConfirmationEmail({
        customer_name,
        customer_email,
        customer_phone,
        restaurant_name: restaurant[0]?.restaurant_name || restaurant[0]?.name,
        reservation_date,
        reservation_time,
        number_of_guests,
        booking_reference: bookingReference,
        special_requests
      });

      // Get vendor email and send notification (non-blocking)
      try {
        const restaurantData = restaurant[0];
        let vendorEmail = restaurantData?.email_address;
        let vendorName = restaurantData?.name || restaurantData?.restaurant_name;

        // If email_address is not available, try to get from restaurant_users table
        if (!vendorEmail && restaurantData?.user_id) {
          const vendorInfo = await executeQuery(
            `SELECT email as vendor_email, name as vendor_name 
             FROM restaurant_users 
             WHERE user_id = ? LIMIT 1`,
            [restaurantData.user_id]
          );

          if (vendorInfo && vendorInfo.length > 0) {
            vendorEmail = vendorInfo[0].vendor_email;
            vendorName = vendorInfo[0].vendor_name || vendorName;
          }
        }

        if (vendorEmail) {
          this.sendRestaurantReservationVendorNotification({
            vendor_email: vendorEmail,
            vendor_name: vendorName,
            restaurant_name: restaurantData?.restaurant_name || restaurantData?.name,
            reservation_date,
            reservation_time,
            number_of_guests,
            booking_reference: bookingReference,
            customer_name,
            customer_email,
            customer_phone,
            special_requests
          });
        }
      } catch (vendorEmailError) {
        console.error('⚠️ Failed to send vendor notification for restaurant reservation:', vendorEmailError.message);
      }

      return reservationDetails;
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
      // Handle both old and new structure for backward compatibility
      const customer = bookingData.customer || {};
      const rental = bookingData.rental || {};
      
      const car_id = bookingData.car_id;
      const driver_option = bookingData.driver_option || 'self-drive';
      const pickup_date = rental.pickup_date || bookingData.pickup_date;
      const pickup_time = rental.pickup_time || bookingData.pickup_time || '09:00';
      const return_date = rental.return_date || bookingData.return_date;
      const return_time = rental.return_time || bookingData.return_time || '17:00';
      const pickup_location = rental.pickup_location || bookingData.pickup_location;
      const dropoff_location = rental.dropoff_location || bookingData.dropoff_location || bookingData.return_location;
      const return_location = dropoff_location; // Alias for consistency
      
      const customer_first_name = customer.first_name || customer.firstName || bookingData.customer_name;
      const customer_name = customer_first_name; // Alias for email functions
      const customer_email = customer.email || bookingData.customer_email;
      const customer_phone = customer.phone || bookingData.customer_phone;
      
      const special_requests = bookingData.special_requests;
      const payment_method = bookingData.payment_method || 'card';

      // Validate required fields
      if (!car_id || !pickup_date || !return_date || 
          !customer_first_name || !customer_phone) {
        throw new Error('Missing required booking fields: car_id, rental.pickup_date, rental.return_date, customer.first_name, customer.phone');
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

      // Check availability - handle both old and new table structures
      // Calculate date/time strings first (needed for error messages)
      const pickupDateTime = pickup_date.includes(' ') ? pickup_date : `${pickup_date} ${pickup_time}:00`;
      const returnDateTime = return_date.includes(' ') ? return_date : `${return_date} ${return_time}:00`;
      
      let existingBookings;
      try {
        // Check if table has new structure columns
        const tableCheck = await executeQuery(
          `SELECT COLUMN_NAME FROM information_schema.columns 
           WHERE table_schema = DATABASE() 
           AND table_name = 'car_rental_bookings'
           AND COLUMN_NAME IN ('pickup_time', 'return_time', 'return_date')`
        );
        const hasNewStructure = tableCheck && tableCheck.some(col => col.COLUMN_NAME === 'pickup_time');
        const hasReturnDate = tableCheck && tableCheck.some(col => col.COLUMN_NAME === 'return_date');
        
        if (hasNewStructure && hasReturnDate) {
          // New structure with separate date and time columns
          existingBookings = await executeQuery(
            `SELECT COUNT(*) as count FROM car_rental_bookings 
             WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
             AND CONCAT(pickup_date, ' ', COALESCE(pickup_time, '00:00:00')) < ? 
             AND CONCAT(return_date, ' ', COALESCE(return_time, '23:59:59')) > ?`,
            [car_id, returnDateTime, pickupDateTime]
          );
        } else {
          // Old structure - pickup_date and dropoff_date are DATETIME
          // Allow bookings that end exactly when another starts, or start exactly when another ends
          existingBookings = await executeQuery(
            `SELECT COUNT(*) as count FROM car_rental_bookings 
             WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
             AND pickup_date < ? AND dropoff_date > ?`,
            [car_id, returnDateTime, pickupDateTime]
          );
        }
      } catch (err) {
        console.error('Error checking car availability:', err);
        // Fallback to old structure query
        existingBookings = await executeQuery(
          `SELECT COUNT(*) as count FROM car_rental_bookings 
           WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
           AND pickup_date < ? AND dropoff_date > ?`,
          [car_id, returnDateTime, pickupDateTime]
        );
      }

      if (existingBookings[0].count > 0) {
        // Get details of conflicting bookings for better error message
        let conflictingBookings = [];
        try {
          const tableCheck = await executeQuery(
            `SELECT COLUMN_NAME FROM information_schema.columns 
             WHERE table_schema = DATABASE() 
             AND table_name = 'car_rental_bookings'
             AND COLUMN_NAME IN ('pickup_time', 'return_time', 'return_date')`
          );
          const hasNewStructure = tableCheck && tableCheck.some(col => col.COLUMN_NAME === 'pickup_time');
          const hasReturnDate = tableCheck && tableCheck.some(col => col.COLUMN_NAME === 'return_date');
          
          if (hasNewStructure && hasReturnDate) {
            conflictingBookings = await executeQuery(
              `SELECT booking_id, 
               CONCAT(pickup_date, ' ', COALESCE(pickup_time, '00:00:00')) as pickup_datetime,
               CONCAT(return_date, ' ', COALESCE(return_time, '23:59:59')) as return_datetime,
               booking_status
               FROM car_rental_bookings 
               WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
               AND CONCAT(pickup_date, ' ', COALESCE(pickup_time, '00:00:00')) < ? 
               AND CONCAT(return_date, ' ', COALESCE(return_time, '23:59:59')) > ?`,
              [car_id, returnDateTime, pickupDateTime]
            );
          } else {
            conflictingBookings = await executeQuery(
              `SELECT booking_id, pickup_date as pickup_datetime, dropoff_date as return_datetime, booking_status
               FROM car_rental_bookings 
               WHERE car_id = ? AND booking_status IN ('pending', 'confirmed', 'in_progress')
               AND pickup_date < ? AND dropoff_date > ?`,
              [car_id, returnDateTime, pickupDateTime]
            );
          }
        } catch (err) {
          console.error('Error fetching conflicting bookings:', err);
        }
        
        const conflictDetails = conflictingBookings.length > 0 
          ? ` Conflicting booking(s): ${conflictingBookings.map(b => {
              // Format dates nicely
              const pickup = new Date(b.pickup_datetime);
              const returnDate = new Date(b.return_datetime);
              const pickupFormatted = pickup.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              const returnFormatted = returnDate.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              return `#${b.booking_id} (${pickupFormatted} to ${returnFormatted}, status: ${b.booking_status})`;
            }).join('; ')}`
          : '';
        
        // Format requested dates nicely
        const requestedPickup = new Date(pickupDateTime);
        const requestedReturn = new Date(returnDateTime);
        const requestedPickupFormatted = requestedPickup.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const requestedReturnFormatted = requestedReturn.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        throw new Error(`Car not available for selected dates (${requestedPickupFormatted} to ${requestedReturnFormatted}).${conflictDetails}`);
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

      // Create car rental booking - check table structure first
      let insertQuery, insertParams;
      try {
        const tableCheck = await executeQuery(
          `SELECT COLUMN_NAME FROM information_schema.columns 
           WHERE table_schema = DATABASE() 
           AND table_name = 'car_rental_bookings'
           AND COLUMN_NAME IN ('return_date', 'pickup_time', 'return_time', 'driver_option', 'customer_first_name')`
        );
        const hasNewStructure = tableCheck && tableCheck.length > 0;
        
        if (hasNewStructure) {
          // New structure
          insertQuery = `INSERT INTO car_rental_bookings (
            booking_id, car_id, vendor_id, customer_first_name, customer_email, customer_phone,
            pickup_date, pickup_time, return_date, return_time,
            pickup_location, dropoff_location, driver_option,
            total_amount, deposit_amount, booking_status, payment_status, special_requests
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          insertParams = [
            bookingId, car_id, carData.vendor_id, customer_first_name, customer_email || null, customer_phone,
            pickup_date, pickup_time, return_date, return_time,
            pickup_location || null, dropoff_location || null, driver_option,
            totalAmount, securityDeposit, 'pending', 'pending', special_requests || null
          ];
        } else {
          // Old structure - combine date and time into DATETIME for pickup_date and dropoff_date
          const pickupDateTime = pickup_date.includes(' ') ? pickup_date : `${pickup_date} ${pickup_time}:00`;
          const dropoffDateTime = return_date.includes(' ') ? return_date : `${return_date} ${return_time}:00`;
          
          // Store driver_option and times in special_requests if needed
          let specialRequestsText = special_requests || '';
          if (driver_option && driver_option !== 'self-drive') {
            specialRequestsText = specialRequestsText ? `${specialRequestsText}\nDriver Option: ${driver_option}` : `Driver Option: ${driver_option}`;
          }
          
          insertQuery = `INSERT INTO car_rental_bookings (
            booking_id, car_id, vendor_id, customer_name, customer_email, customer_phone,
            pickup_date, dropoff_date,
            pickup_location, dropoff_location,
            total_amount, deposit_amount, booking_status, payment_status, special_requests
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          insertParams = [
            bookingId, car_id, carData.vendor_id, customer_first_name, customer_email || null, customer_phone,
            pickupDateTime, dropoffDateTime,
            pickup_location || null, dropoff_location || null,
            totalAmount, securityDeposit, 'pending', 'pending', specialRequestsText
          ];
        }
        
        await executeQuery(insertQuery, insertParams);
      } catch (err) {
        console.error('Error creating car rental booking:', err);
        throw err;
      }

      // Ensure payment_transactions table exists
      await this.ensurePaymentTransactionsTable();

      // Create payment transaction
      const transactionResult = await executeQuery(
        `INSERT INTO payment_transactions (
          booking_id, amount, payment_method, status
        ) VALUES (?, ?, ?, ?)`,
        [bookingId, totalAmount, payment_method, 'pending']
      );

      const bookingDetails = {
        booking_id: bookingId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        days: days,
        transaction_id: transactionResult.insertId,
        status: 'pending',
        payment_status: 'pending'
      };

      // Send confirmation email to customer (non-blocking)
      this.sendCarRentalBookingConfirmationEmail({
        customer_name: customer_first_name,
        customer_email,
        customer_phone,
        car_name: carData.name || carData.model || carData.make,
        booking_reference: bookingReference,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        total_amount: totalAmount,
        days,
        special_requests: specialRequestsText
      });

      // Get vendor email and send notification (non-blocking)
      try {
        const vendorInfo = await executeQuery(
          `SELECT u.email as vendor_email, u.name as vendor_name 
           FROM cars c
           JOIN car_rental_businesses crb ON c.vendor_id = crb.car_rental_business_id
           JOIN car_rental_users u ON crb.user_id = u.user_id
           WHERE c.car_id = ? LIMIT 1`,
          [car_id]
        );

        if (vendorInfo && vendorInfo.length > 0 && vendorInfo[0].vendor_email) {
          this.sendCarRentalBookingVendorNotification({
            vendor_email: vendorInfo[0].vendor_email,
            vendor_name: vendorInfo[0].vendor_name,
            car_name: carData.name || carData.model || carData.make,
            booking_reference: bookingReference,
            pickup_date,
            return_date,
            pickup_location,
            return_location,
            total_amount: totalAmount,
            days,
            customer_name: customer_first_name,
            customer_email,
            customer_phone,
            special_requests: specialRequestsText
          });
        }
      } catch (vendorEmailError) {
        console.error('⚠️ Failed to send vendor notification for car rental booking:', vendorEmailError.message);
      }

      return bookingDetails;
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
      // Check if restaurant_capacity_bookings table exists
      let restaurantJoin = '';
      try {
        const tableCheck = await executeQuery(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = DATABASE() 
           AND table_name = 'restaurant_capacity_bookings'`
        );
        if (tableCheck && tableCheck[0] && tableCheck[0].count > 0) {
          restaurantJoin = `LEFT JOIN restaurant_capacity_bookings rcb ON b.booking_id = rcb.booking_id`;
        }
      } catch (err) {
        // Table doesn't exist, skip the join
        console.log('Note: restaurant_capacity_bookings table does not exist, skipping join');
      }

      // Build query dynamically based on table existence
      const restaurantFields = restaurantJoin 
        ? 'rcb.reservation_start, rcb.reservation_end, rcb.guests as restaurant_guests,'
        : 'NULL as reservation_start, NULL as reservation_end, NULL as restaurant_guests,';
      
      // Check if car_rental_bookings has new structure (return_date, pickup_time, etc.)
      let carRentalFields = '';
      try {
        const carTableCheck = await executeQuery(
          `SELECT COLUMN_NAME FROM information_schema.columns 
           WHERE table_schema = DATABASE() 
           AND table_name = 'car_rental_bookings'
           AND COLUMN_NAME IN ('return_date', 'pickup_time', 'return_time', 'driver_option', 'customer_first_name')`
        );
        const hasNewStructure = carTableCheck && carTableCheck.length > 0;
        
        if (hasNewStructure) {
          // New structure with return_date, pickup_time, return_time, driver_option
          carRentalFields = `crb.pickup_date, 
          crb.return_date, 
          crb.pickup_time,
          crb.return_time,
          crb.pickup_location, 
          crb.dropoff_location,
          crb.driver_option,
          crb.customer_first_name as car_customer_name,
          crb.customer_email as car_customer_email,
          crb.customer_phone as car_customer_phone`;
        } else {
          // Old structure with dropoff_date, customer_name
          carRentalFields = `crb.pickup_date, 
          crb.dropoff_date as return_date, 
          NULL as pickup_time,
          NULL as return_time,
          crb.pickup_location, 
          crb.dropoff_location,
          'self-drive' as driver_option,
          crb.customer_name as car_customer_name,
          crb.customer_email as car_customer_email,
          crb.customer_phone as car_customer_phone`;
        }
      } catch (err) {
        // Fallback to old structure
        carRentalFields = `crb.pickup_date, 
          crb.dropoff_date as return_date, 
          NULL as pickup_time,
          NULL as return_time,
          crb.pickup_location, 
          crb.dropoff_location,
          'self-drive' as driver_option,
          crb.customer_name as car_customer_name,
          crb.customer_email as car_customer_email,
          crb.customer_phone as car_customer_phone`;
      }
      
      const query = `SELECT 
          b.*,
          sb.property_id as stay_property_id,
          sb.room_id as stay_room_id,
          sb.check_in_date, 
          sb.check_out_date, 
          sb.guests as stay_guests,
          tb.tour_date, 
          tb.number_of_participants, 
          tb.customer_name as tour_customer_name,
          ${restaurantFields}
          ${carRentalFields}
         FROM bookings b
         LEFT JOIN stays_bookings sb ON b.booking_id = sb.booking_id
         LEFT JOIN tours_bookings tb ON b.booking_id = tb.booking_id
         ${restaurantJoin || ''}
         LEFT JOIN car_rental_bookings crb ON b.booking_id = crb.booking_id
         WHERE b.booking_reference = ?`;

      const bookings = await executeQuery(query, [bookingReference]);

      if (!bookings || bookings.length === 0) {
        return null;
      }

      const booking = bookings[0];
      
      // Parse guest info from special_requests if it's a stay booking
      // Note: service_type is 'room' in the database for stays
      if ((booking.service_type === 'stay' || booking.service_type === 'room' || booking.service_type === 'homestay') && booking.special_requests) {
        const guestInfoMatch = booking.special_requests.match(/Guest: ([^,]+), Email: ([^,]+), Phone: ([^,]+), Adults: (\d+), Children: (\d+)/);
        if (guestInfoMatch) {
          booking.guest_name = guestInfoMatch[1];
          booking.guest_email = guestInfoMatch[2];
          booking.guest_phone = guestInfoMatch[3];
          booking.number_of_adults = parseInt(guestInfoMatch[4]);
          booking.number_of_children = parseInt(guestInfoMatch[5]);
        }
      }

      return booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Send stay booking confirmation email
   */
  async sendStayBookingConfirmationEmail(details) {
    if (!details?.guest_email) {
      return;
    }

    try {
      const {
        guest_name,
        guest_email,
        property_name,
        room_name,
        booking_reference,
        check_in_date,
        check_out_date,
        total_amount,
        number_of_adults,
        number_of_children,
        special_requests,
        nights
      } = details;

      const stayLabel = property_name || 'Travooz stay';
      const subject = `Thank you for booking ${stayLabel} (Ref ${booking_reference})`;

      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">Hi ${guest_name || 'there'},</h2>
          <p>Thank you for choosing Travooz! We have received your booking for <strong>${stayLabel}</strong>${room_name ? ` (Room: ${room_name})` : ''}.</p>
          <p>Here are the details:</p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking_reference}</li>
            <li><strong>Check-in:</strong> ${check_in_date}</li>
            <li><strong>Check-out:</strong> ${check_out_date}</li>
            <li><strong>Nights:</strong> ${nights}</li>
            <li><strong>Guests:</strong> ${number_of_adults} adults${number_of_children ? `, ${number_of_children} children` : ''}</li>
            <li><strong>Total Amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>We will contact you soon to confirm the next steps. If you have any questions, simply reply to this email.</p>
          <p>Safe travels,<br/>The Travooz Team</p>
        </div>
      `;

      const text = `
Hi ${guest_name || ''},

Thank you for choosing Travooz! We have received your booking.

Booking reference: ${booking_reference}
Property: ${stayLabel}
Room: ${room_name || 'N/A'}
Check-in: ${check_in_date}
Check-out: ${check_out_date}
Nights: ${nights}
Guests: ${number_of_adults} adults${number_of_children ? `, ${number_of_children} children` : ''}
Total amount: ${total_amount} RWF
${special_requests ? `Special requests: ${special_requests}` : ''}

We will contact you with next steps shortly.

Travooz Team
      `;

      await EmailService.sendEmail({
        to: guest_email,
        subject,
        html,
        text
      });
    } catch (error) {
      console.error('⚠️ Failed to send stay booking confirmation email:', error.message);
    }
  }

  async sendTourBookingConfirmationEmail(details) {
    if (!details?.customer_email) return;
    try {
      const {
        customer_name,
        customer_email,
        package_name,
        booking_reference,
        tour_date,
        number_of_participants,
        total_amount,
        special_requests
      } = details;

      const subject = `Tour booking received for ${package_name || 'your tour'} (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">Hello ${customer_name || 'traveler'},</h2>
          <p>Thanks for booking <strong>${package_name || 'your tour'}</strong> on Travooz.</p>
          <ul>
            <li><strong>Booking reference:</strong> ${booking_reference}</li>
            <li><strong>Tour date:</strong> ${tour_date}</li>
            <li><strong>Participants:</strong> ${number_of_participants}</li>
            <li><strong>Total amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>We'll reach out soon with more details.</p>
          <p>Best regards,<br/>Travooz Team</p>
        </div>
      `;
      const text = `
Hi ${customer_name || ''},
We received your tour booking (${booking_reference}).
Tour: ${package_name || 'Tour'}
Date: ${tour_date}
Participants: ${number_of_participants}
Total: ${total_amount} RWF
${special_requests ? `Special requests: ${special_requests}` : ''}
We’ll follow up soon.
Travooz Team`;

      await EmailService.sendEmail({ to: customer_email, subject, html, text });
    } catch (error) {
      console.error('⚠️ Failed to send tour booking confirmation email:', error.message);
    }
  }

  async sendRestaurantReservationConfirmationEmail(details) {
    if (!details?.customer_email) return;
    try {
      const {
        customer_name,
        customer_email,
        restaurant_name,
        reservation_date,
        reservation_time,
        number_of_guests,
        booking_reference,
        special_requests
      } = details;

      const subject = `Restaurant reservation received (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">Hi ${customer_name || 'there'},</h2>
          <p>Your reservation request for <strong>${restaurant_name || 'the restaurant'}</strong> has been received.</p>
          <ul>
            <li><strong>Booking reference:</strong> ${booking_reference}</li>
            <li><strong>Date:</strong> ${reservation_date}</li>
            <li><strong>Time:</strong> ${reservation_time}</li>
            <li><strong>Guests:</strong> ${number_of_guests}</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>We’ll confirm availability shortly.</p>
          <p>Travooz Team</p>
        </div>
      `;
      const text = `
Hi ${customer_name || ''},
We received your restaurant reservation (${booking_reference}).
Restaurant: ${restaurant_name || 'Restaurant'}
Date: ${reservation_date}
Time: ${reservation_time}
Guests: ${number_of_guests}
${special_requests ? `Special requests: ${special_requests}` : ''}
We'll confirm soon.
Travooz Team`;

      await EmailService.sendEmail({ to: customer_email, subject, html, text });
    } catch (error) {
      console.error('⚠️ Failed to send restaurant reservation confirmation email:', error.message);
    }
  }

  async sendCarRentalBookingConfirmationEmail(details) {
    if (!details?.customer_email) return;
    try {
      const {
        customer_name,
        customer_email,
        car_name,
        booking_reference,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        total_amount,
        days,
        special_requests
      } = details;

      const subject = `Car rental booking received (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">Hello ${customer_name || 'traveler'},</h2>
          <p>We’ve received your car rental booking${car_name ? ` for <strong>${car_name}</strong>` : ''}.</p>
          <ul>
            <li><strong>Booking reference:</strong> ${booking_reference}</li>
            <li><strong>Pickup:</strong> ${pickup_date} ${pickup_location ? `at ${pickup_location}` : ''}</li>
            <li><strong>Return:</strong> ${return_date} ${return_location ? `at ${return_location}` : ''}</li>
            <li><strong>Duration:</strong> ${days} days</li>
            <li><strong>Total amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          ${special_requests ? `<p><strong>Notes:</strong> ${special_requests}</p>` : ''}
          <p>We’ll contact you to finalize pickup instructions.</p>
          <p>Travooz Team</p>
        </div>
      `;
      const text = `
Hi ${customer_name || ''},
Your car rental booking (${booking_reference}) has been received.
Car: ${car_name || 'Selected car'}
Pickup: ${pickup_date} ${pickup_location ? `at ${pickup_location}` : ''}
Return: ${return_date} ${return_location ? `at ${return_location}` : ''}
Duration: ${days} days
Total: ${total_amount} RWF
${special_requests ? `Notes: ${special_requests}` : ''}
We will follow up shortly.
Travooz Team`;

      await EmailService.sendEmail({ to: customer_email, subject, html, text });
    } catch (error) {
      console.error('⚠️ Failed to send car rental booking confirmation email:', error.message);
    }
  }

  /**
   * Send stay booking notification email to vendor
   */
  async sendStayBookingVendorNotification(details) {
    if (!details?.vendor_email) {
      console.warn('⚠️ Vendor email not provided for stay booking notification');
      return;
    }

    try {
      const {
        vendor_email,
        vendor_name,
        property_name,
        room_name,
        booking_reference,
        check_in_date,
        check_out_date,
        total_amount,
        number_of_adults,
        number_of_children,
        guest_name,
        guest_email,
        guest_phone,
        special_requests,
        nights
      } = details;

      const subject = `New Booking Received - ${property_name || 'Your Property'} (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">New Booking Alert!</h2>
          <p>Hello ${vendor_name || 'Property Owner'},</p>
          <p>You have received a new booking for <strong>${property_name || 'your property'}</strong>${room_name ? ` (Room: ${room_name})` : ''}.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking_reference}</li>
            <li><strong>Check-in:</strong> ${check_in_date}</li>
            <li><strong>Check-out:</strong> ${check_out_date}</li>
            <li><strong>Nights:</strong> ${nights}</li>
            <li><strong>Guests:</strong> ${number_of_adults} adults${number_of_children ? `, ${number_of_children} children` : ''}</li>
            <li><strong>Total Amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          <p><strong>Guest Information:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${guest_name || 'N/A'}</li>
            <li><strong>Email:</strong> ${guest_email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${guest_phone || 'N/A'}</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>Please log in to your dashboard to manage this booking.</p>
          <p>Best regards,<br/>The Travooz Team</p>
        </div>
      `;

      const text = `
New Booking Alert!

Hello ${vendor_name || 'Property Owner'},

You have received a new booking for ${property_name || 'your property'}${room_name ? ` (Room: ${room_name})` : ''}.

Booking Reference: ${booking_reference}
Check-in: ${check_in_date}
Check-out: ${check_out_date}
Nights: ${nights}
Guests: ${number_of_adults} adults${number_of_children ? `, ${number_of_children} children` : ''}
Total Amount: ${total_amount} RWF

Guest Information:
Name: ${guest_name || 'N/A'}
Email: ${guest_email || 'N/A'}
Phone: ${guest_phone || 'N/A'}

${special_requests ? `Special requests: ${special_requests}` : ''}

Please log in to your dashboard to manage this booking.

Travooz Team
      `;

      await EmailService.sendEmail({
        to: vendor_email,
        subject,
        html,
        text
      });
      console.log(`✅ Stay booking vendor notification sent to ${vendor_email}`);
    } catch (error) {
      console.error('⚠️ Failed to send stay booking vendor notification:', error.message);
    }
  }

  /**
   * Send tour booking notification email to vendor
   */
  async sendTourBookingVendorNotification(details) {
    if (!details?.vendor_email) {
      console.warn('⚠️ Vendor email not provided for tour booking notification');
      return;
    }

    try {
      const {
        vendor_email,
        vendor_name,
        package_name,
        booking_reference,
        tour_date,
        number_of_participants,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        special_requests
      } = details;

      const subject = `New Tour Booking Received - ${package_name || 'Your Tour'} (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">New Booking Alert!</h2>
          <p>Hello ${vendor_name || 'Tour Operator'},</p>
          <p>You have received a new booking for <strong>${package_name || 'your tour'}</strong>.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking_reference}</li>
            <li><strong>Tour Date:</strong> ${tour_date}</li>
            <li><strong>Participants:</strong> ${number_of_participants}</li>
            <li><strong>Total Amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          <p><strong>Customer Information:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${customer_name || 'N/A'}</li>
            <li><strong>Email:</strong> ${customer_email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${customer_phone || 'N/A'}</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>Please log in to your dashboard to manage this booking.</p>
          <p>Best regards,<br/>The Travooz Team</p>
        </div>
      `;

      const text = `
New Booking Alert!

Hello ${vendor_name || 'Tour Operator'},

You have received a new booking for ${package_name || 'your tour'}.

Booking Reference: ${booking_reference}
Tour Date: ${tour_date}
Participants: ${number_of_participants}
Total Amount: ${total_amount} RWF

Customer Information:
Name: ${customer_name || 'N/A'}
Email: ${customer_email || 'N/A'}
Phone: ${customer_phone || 'N/A'}

${special_requests ? `Special requests: ${special_requests}` : ''}

Please log in to your dashboard to manage this booking.

Travooz Team
      `;

      await EmailService.sendEmail({
        to: vendor_email,
        subject,
        html,
        text
      });
      console.log(`✅ Tour booking vendor notification sent to ${vendor_email}`);
    } catch (error) {
      console.error('⚠️ Failed to send tour booking vendor notification:', error.message);
    }
  }

  /**
   * Send restaurant reservation notification email to vendor
   */
  async sendRestaurantReservationVendorNotification(details) {
    if (!details?.vendor_email) {
      console.warn('⚠️ Vendor email not provided for restaurant reservation notification');
      return;
    }

    try {
      const {
        vendor_email,
        vendor_name,
        restaurant_name,
        reservation_date,
        reservation_time,
        number_of_guests,
        booking_reference,
        customer_name,
        customer_email,
        customer_phone,
        special_requests
      } = details;

      const subject = `New Reservation Received - ${restaurant_name || 'Your Restaurant'} (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">New Reservation Alert!</h2>
          <p>Hello ${vendor_name || 'Restaurant Owner'},</p>
          <p>You have received a new reservation for <strong>${restaurant_name || 'your restaurant'}</strong>.</p>
          <p><strong>Reservation Details:</strong></p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking_reference}</li>
            <li><strong>Date:</strong> ${reservation_date}</li>
            <li><strong>Time:</strong> ${reservation_time}</li>
            <li><strong>Guests:</strong> ${number_of_guests}</li>
          </ul>
          <p><strong>Customer Information:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${customer_name || 'N/A'}</li>
            <li><strong>Email:</strong> ${customer_email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${customer_phone || 'N/A'}</li>
          </ul>
          ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
          <p>Please log in to your dashboard to manage this reservation.</p>
          <p>Best regards,<br/>The Travooz Team</p>
        </div>
      `;

      const text = `
New Reservation Alert!

Hello ${vendor_name || 'Restaurant Owner'},

You have received a new reservation for ${restaurant_name || 'your restaurant'}.

Booking Reference: ${booking_reference}
Date: ${reservation_date}
Time: ${reservation_time}
Guests: ${number_of_guests}

Customer Information:
Name: ${customer_name || 'N/A'}
Email: ${customer_email || 'N/A'}
Phone: ${customer_phone || 'N/A'}

${special_requests ? `Special requests: ${special_requests}` : ''}

Please log in to your dashboard to manage this reservation.

Travooz Team
      `;

      await EmailService.sendEmail({
        to: vendor_email,
        subject,
        html,
        text
      });
      console.log(`✅ Restaurant reservation vendor notification sent to ${vendor_email}`);
    } catch (error) {
      console.error('⚠️ Failed to send restaurant reservation vendor notification:', error.message);
    }
  }

  /**
   * Send car rental booking notification email to vendor
   */
  async sendCarRentalBookingVendorNotification(details) {
    if (!details?.vendor_email) {
      console.warn('⚠️ Vendor email not provided for car rental booking notification');
      return;
    }

    try {
      const {
        vendor_email,
        vendor_name,
        car_name,
        booking_reference,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        total_amount,
        days,
        customer_name,
        customer_email,
        customer_phone,
        special_requests
      } = details;

      const subject = `New Car Rental Booking Received (Ref ${booking_reference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="color: #16a34a;">New Booking Alert!</h2>
          <p>Hello ${vendor_name || 'Car Rental Owner'},</p>
          <p>You have received a new car rental booking${car_name ? ` for <strong>${car_name}</strong>` : ''}.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking_reference}</li>
            <li><strong>Pickup:</strong> ${pickup_date} ${pickup_location ? `at ${pickup_location}` : ''}</li>
            <li><strong>Return:</strong> ${return_date} ${return_location ? `at ${return_location}` : ''}</li>
            <li><strong>Duration:</strong> ${days} days</li>
            <li><strong>Total Amount:</strong> ${Number(total_amount || 0).toLocaleString()} RWF</li>
          </ul>
          <p><strong>Customer Information:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${customer_name || 'N/A'}</li>
            <li><strong>Email:</strong> ${customer_email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${customer_phone || 'N/A'}</li>
          </ul>
          ${special_requests ? `<p><strong>Notes:</strong> ${special_requests}</p>` : ''}
          <p>Please log in to your dashboard to manage this booking.</p>
          <p>Best regards,<br/>The Travooz Team</p>
        </div>
      `;

      const text = `
New Booking Alert!

Hello ${vendor_name || 'Car Rental Owner'},

You have received a new car rental booking${car_name ? ` for ${car_name}` : ''}.

Booking Reference: ${booking_reference}
Pickup: ${pickup_date} ${pickup_location ? `at ${pickup_location}` : ''}
Return: ${return_date} ${return_location ? `at ${return_location}` : ''}
Duration: ${days} days
Total Amount: ${total_amount} RWF

Customer Information:
Name: ${customer_name || 'N/A'}
Email: ${customer_email || 'N/A'}
Phone: ${customer_phone || 'N/A'}

${special_requests ? `Notes: ${special_requests}` : ''}

Please log in to your dashboard to manage this booking.

Travooz Team
      `;

      await EmailService.sendEmail({
        to: vendor_email,
        subject,
        html,
        text
      });
      console.log(`✅ Car rental booking vendor notification sent to ${vendor_email}`);
    } catch (error) {
      console.error('⚠️ Failed to send car rental booking vendor notification:', error.message);
    }
  }
}

module.exports = new ClientBookingService();

