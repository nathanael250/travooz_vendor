const { executeQuery } = require('../../../config/database');

class ClientDiscoveryService {
  /**
   * Ensure bookings table exists
   */
  async ensureBookingsTable() {
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS bookings (
          booking_id INT AUTO_INCREMENT PRIMARY KEY,
          service_type ENUM('homestay','restaurant_table','tour_package','food_order','room','car_rental','activity') NOT NULL,
          user_id INT DEFAULT NULL,
          total_amount DECIMAL(10,2) DEFAULT NULL,
          status ENUM('pending','confirmed','cancelled','completed','active') DEFAULT 'pending',
          payment_status ENUM('pending','paid','refunded') DEFAULT 'pending',
          order_status ENUM('received','preparing','ready_for_pickup','out_for_delivery','delivered') DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          booking_reference VARCHAR(50) DEFAULT NULL COMMENT 'Unique booking reference code',
          booking_source ENUM('website','mobile_app','phone','email','walk_in','agent','ota') DEFAULT 'website',
          special_requests TEXT,
          cancellation_reason TEXT,
          cancelled_at TIMESTAMP NULL DEFAULT NULL,
          cancelled_by INT DEFAULT NULL COMMENT 'user_id who cancelled',
          confirmed_at TIMESTAMP NULL DEFAULT NULL,
          completed_at TIMESTAMP NULL DEFAULT NULL,
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
   * Get all properties (stays) with filters
   */
  async getProperties(filters = {}) {
    try {
      const {
        location,
        property_type,
        guests,
        limit = 20,
        offset = 0
      } = filters;

      const limitValue = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const offsetValue = Math.max(parseInt(offset, 10) || 0, 0);

      let query = `
        SELECT
          sp.property_id,
          sp.property_name AS name,
        NULL AS description,
          sp.location,
          sp.location_data,
          sp.property_type,
          sp.number_of_rooms,
          sp.currency,
          sp.status,
          sp.created_at
        FROM stays_properties sp
        WHERE sp.status = 'approved'
      `;

      const params = [];

      if (location) {
        query += ` AND (sp.location LIKE ? OR JSON_EXTRACT(sp.location_data, '$.formatted_address') LIKE ?)`;
        const locationParam = `%${location}%`;
        params.push(locationParam, locationParam);
      }

      if (property_type) {
        query += ` AND sp.property_type = ?`;
        params.push(property_type);
      }

      if (guests) {
        query += ` AND (sp.number_of_rooms IS NULL OR sp.number_of_rooms >= ?)`;
        params.push(parseInt(guests, 10) || 1);
      }

      query += ` ORDER BY sp.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limitValue, offsetValue);

      const properties = await executeQuery(query, params);

      for (const property of properties) {
        if (property.location_data) {
          try {
            property.location_data = JSON.parse(property.location_data);
          } catch (err) {
            property.location_data = null;
          }
        }

        const images = await executeQuery(
          `SELECT image_url FROM stays_property_images WHERE property_id = ? ORDER BY image_order ASC LIMIT 5`,
          [property.property_id]
        );
        property.images = images.map(img => img.image_url);
      }

      return properties;
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  /**
   * Get property details by ID
   */
  async getPropertyById(propertyId) {
    try {
      const properties = await executeQuery(
        `SELECT *, NULL as description FROM stays_properties WHERE property_id = ? AND status = 'approved'`,
        [propertyId]
      );

      if (!properties || properties.length === 0) {
        return null;
      }

      const property = properties[0];

      if (property.location_data) {
        try {
          property.location_data = JSON.parse(property.location_data);
        } catch (err) {
          property.location_data = null;
        }
      }

      const images = await executeQuery(
        `SELECT image_url FROM stays_property_images WHERE property_id = ? ORDER BY image_order ASC`,
        [propertyId]
      );
      property.images = images.map(img => img.image_url);

      const amenities = await executeQuery(
        `SELECT * FROM stays_property_amenities WHERE property_id = ?`,
        [propertyId]
      );
      property.amenities = amenities;

      const rooms = await executeQuery(
        `SELECT * FROM stays_rooms WHERE property_id = ?`,
        [propertyId]
      );
      property.rooms = rooms;

      const policies = await executeQuery(
        `SELECT * FROM stays_property_policies WHERE property_id = ?`,
        [propertyId]
      );
      property.policies = policies;

      return property;
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  /**
   * Check property availability for dates
   */
  async checkPropertyAvailability(propertyId, checkInDate, checkOutDate) {
    try {
      // Get all rooms for this property
      const rooms = await executeQuery(
        `SELECT * FROM stays_rooms WHERE property_id = ? AND room_status = 'active'`,
        [propertyId]
      );

      if (!rooms || rooms.length === 0) {
        return [];
      }

      const availability = [];

      for (const room of rooms) {
        // Count existing bookings for this room that overlap with the requested dates
        // A booking overlaps if:
        // - check_in_date < check_out_date AND check_out_date > check_in_date
        const existingBookings = await executeQuery(
          `SELECT COUNT(*) as count FROM stays_bookings sb
           WHERE sb.room_id = ? 
           AND sb.status IN ('pending', 'confirmed')
           AND sb.check_in_date < ? 
           AND sb.check_out_date > ?`,
          [room.room_id, checkOutDate, checkInDate]
        );

        const bookedCount = existingBookings[0].count || 0;
        const totalRooms = room.number_of_rooms || 1;
        const availableCount = Math.max(totalRooms - bookedCount, 0);

        availability.push({
          room_id: room.room_id,
          room_name: room.room_name,
          room_type: room.room_type,
          room_class: room.room_class,
          price_per_night: room.base_rate,
          max_guests: room.recommended_occupancy,
          available: availableCount > 0,
          available_count: availableCount,
          total_rooms: totalRooms,
          pricing_model: room.pricing_model,
          people_included: room.people_included
        });
      }

      return availability;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Get properties with available rooms for specific dates
   */
  async getPropertiesWithAvailableRooms(filters = {}) {
    try {
      const {
        check_in_date,
        check_out_date,
        guests,
        location,
        property_type,
        limit = 20,
        offset = 0
      } = filters;

      if (!check_in_date || !check_out_date) {
        throw new Error('check_in_date and check_out_date are required');
      }

      const limitValue = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const offsetValue = Math.max(parseInt(offset, 10) || 0, 0);

      // Build base query to get properties with available rooms
      let query = `
        SELECT DISTINCT
          sp.property_id,
          sp.property_name AS name,
          NULL AS description,
          sp.location,
          sp.location_data,
          sp.property_type,
          sp.number_of_rooms,
          sp.currency,
          sp.status,
          sp.created_at
        FROM stays_properties sp
        INNER JOIN stays_rooms sr ON sp.property_id = sr.property_id
        WHERE sp.status = 'approved'
        AND sr.room_status = 'active'
        AND sr.number_of_rooms > (
          SELECT COUNT(*) 
          FROM stays_bookings sb
          WHERE sb.room_id = sr.room_id
          AND sb.status IN ('pending', 'confirmed')
          AND sb.check_in_date < ?
          AND sb.check_out_date > ?
        )
      `;

      const params = [check_out_date, check_in_date];

      if (location) {
        query += ` AND (sp.location LIKE ? OR JSON_EXTRACT(sp.location_data, '$.formatted_address') LIKE ?)`;
        const locationParam = `%${location}%`;
        params.push(locationParam, locationParam);
      }

      if (property_type) {
        query += ` AND sp.property_type = ?`;
        params.push(property_type);
      }

      if (guests) {
        const guestsCount = parseInt(guests, 10) || 1;
        query += ` AND sr.recommended_occupancy >= ?`;
        params.push(guestsCount);
      }

      query += ` ORDER BY sp.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limitValue, offsetValue);

      const properties = await executeQuery(query, params);

      // For each property, get detailed availability info
      for (const property of properties) {
        if (property.location_data) {
          try {
            property.location_data = JSON.parse(property.location_data);
          } catch (err) {
            property.location_data = null;
          }
        }

        // Get images
        const images = await executeQuery(
          `SELECT image_url FROM stays_property_images WHERE property_id = ? ORDER BY image_order ASC LIMIT 5`,
          [property.property_id]
        );
        property.images = images.map(img => img.image_url);

        // Get available rooms with detailed info
        const availableRooms = await executeQuery(
          `SELECT 
            sr.room_id,
            sr.room_name,
            sr.room_type,
            sr.room_class,
            sr.base_rate,
            sr.recommended_occupancy,
            sr.number_of_rooms,
            sr.pricing_model,
            sr.people_included,
            (sr.number_of_rooms - COALESCE((
              SELECT COUNT(*) 
              FROM stays_bookings sb
              WHERE sb.room_id = sr.room_id
              AND sb.status IN ('pending', 'confirmed')
              AND sb.check_in_date < ?
              AND sb.check_out_date > ?
            ), 0)) as available_count
          FROM stays_rooms sr
          WHERE sr.property_id = ?
          AND sr.room_status = 'active'
          HAVING available_count > 0
          ORDER BY sr.base_rate ASC`,
          [check_out_date, check_in_date, property.property_id]
        );

        property.available_rooms = availableRooms;
        property.min_price = availableRooms.length > 0 
          ? Math.min(...availableRooms.map(r => parseFloat(r.base_rate || 0)))
          : null;
      }

      return properties;
    } catch (error) {
      console.error('Error getting properties with available rooms:', error);
      throw error;
    }
  }

  /**
   * Get all tour packages with filters
   */
  async getTourPackages(filters = {}) {
    try {
      const {
        location,
        tour_date,
        participants,
        min_price,
        max_price,
        category,
        limit = 20,
        offset = 0,
        include_draft = false // Allow including draft packages for development
      } = filters;

      const limitValue = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const offsetValue = Math.max(parseInt(offset, 10) || 0, 0);

      // First, let's check what packages exist in the database
      const allPackages = await executeQuery(
        `SELECT tp.package_id, tp.name, tp.status as package_status, tb.tour_business_id, tb.tour_business_name, tb.status as business_status
         FROM tours_packages tp
         JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
         LIMIT 10`
      );
      console.log('🔍 All packages in database:', allPackages);

      // Build status condition - for production, only show active packages from approved businesses
      // For development, we can show draft packages too
      let statusCondition = "tp.status = 'active' AND tb.status = 'approved'";
      if (include_draft || process.env.NODE_ENV === 'development') {
        // In development, show packages that are either active or draft, from approved or pending businesses
        statusCondition = "(tp.status IN ('active', 'draft') AND tb.status IN ('approved', 'pending_review'))";
        console.log('🔧 Development mode: Including draft packages');
      }

      let query = `
        SELECT 
          tp.package_id,
          tp.name,
          tp.short_description as description,
          tp.full_description,
          tp.duration_value as duration,
          tp.duration_type as duration_unit,
          tp.pricing_type,
          tp.max_group_size as max_participants,
          tp.category,
          tp.status,
          tp.price_per_person,
          tb.tour_business_id,
          tb.tour_business_name as business_name,
          tb.location as business_location
        FROM tours_packages tp
        JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
        WHERE ${statusCondition}
      `;

      const params = [];

      if (location) {
        query += ` AND tb.location LIKE ?`;
        const locationParam = `%${location}%`;
        params.push(locationParam);
      }

      if (category) {
        query += ` AND tp.category = ?`;
        params.push(category);
      }

      if (min_price) {
        query += ` AND tp.price_per_person >= ?`;
        params.push(min_price);
      }

      if (max_price) {
        query += ` AND tp.price_per_person <= ?`;
        params.push(max_price);
      }

      if (tour_date) {
        // Check availability for specific date
        query += ` AND tp.package_id NOT IN (
          SELECT DISTINCT tb2.package_id
          FROM tours_bookings tb2
          JOIN bookings b ON tb2.booking_id = b.booking_id
          WHERE tb2.tour_date = ? 
          AND b.status IN ('pending', 'confirmed')
          GROUP BY tb2.package_id
          HAVING SUM(tb2.number_of_participants) >= tp.max_group_size
        )`;
        params.push(tour_date);
      }

      query += ` ORDER BY tp.price_per_person ASC LIMIT ${limitValue} OFFSET ${offsetValue}`;

      console.log('🔍 Executing query:', query.substring(0, 200) + '...');
      console.log('🔍 Query params:', params);
      
      const tours = await executeQuery(query, params);
      
      console.log(`✅ Found ${tours.length} tour packages matching criteria`);

      // Get images for each tour
      // First ensure the table exists
      try {
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS tour_package_images (
            image_id INT AUTO_INCREMENT PRIMARY KEY,
            package_id INT NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            image_name VARCHAR(255) DEFAULT NULL,
            image_size INT DEFAULT NULL,
            image_type VARCHAR(100) DEFAULT NULL,
            display_order INT DEFAULT 0,
            is_primary TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_package_id (package_id),
            INDEX idx_display_order (display_order)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } catch (error) {
        // Table might already exist, ignore error
        console.log('Note: tour_package_images table check:', error.message);
      }
      
      for (const tour of tours) {
        try {
          const images = await executeQuery(
            `SELECT image_url as photo_url FROM tour_package_images WHERE package_id = ? ORDER BY display_order, is_primary DESC LIMIT 5`,
            [tour.package_id]
          );
          tour.images = images && images.length > 0 ? images.map(img => img.photo_url) : [];
          console.log(`📸 Package ${tour.package_id}: Found ${tour.images.length} images`);
        } catch (error) {
          console.error(`❌ Error getting images for package ${tour.package_id}:`, error);
          tour.images = [];
        }
      }

      return tours;
    } catch (error) {
      console.error('Error getting tour packages:', error);
      throw error;
    }
  }

  /**
   * Get tour package details by ID
   */
  async getTourPackageById(tourId) {
    try {
      const tours = await executeQuery(
        `SELECT tp.*, tp.price_per_person, tb.tour_business_name as business_name, tb.location as business_location
         FROM tours_packages tp
         JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
         WHERE tp.package_id = ? AND tp.status = 'active' AND tb.status = 'approved'`,
        [tourId]
      );

      if (!tours || tours.length === 0) {
        return null;
      }

      const tour = tours[0];

      // Get images - ensure table exists first
      try {
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS tour_package_images (
            image_id INT AUTO_INCREMENT PRIMARY KEY,
            package_id INT NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            image_name VARCHAR(255) DEFAULT NULL,
            image_size INT DEFAULT NULL,
            image_type VARCHAR(100) DEFAULT NULL,
            display_order INT DEFAULT 0,
            is_primary TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_package_id (package_id),
            INDEX idx_display_order (display_order)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } catch (error) {
        // Table might already exist, ignore error
        console.log('Note: tour_package_images table check:', error.message);
      }
      
      const images = await executeQuery(
        `SELECT image_url as photo_url FROM tour_package_images WHERE package_id = ? ORDER BY display_order, is_primary DESC`,
        [tourId]
      );
      tour.images = images && images.length > 0 ? images.map(img => img.photo_url) : [];
      console.log(`📸 Package ${tourId}: Found ${tour.images.length} images`);

      return tour;
    } catch (error) {
      console.error('Error getting tour package:', error);
      throw error;
    }
  }

  /**
   * Check tour availability for a date
   */
  async checkTourAvailability(tourId, tourDate) {
    try {
      // Get tour package details
      const tours = await executeQuery(
        `SELECT * FROM tours_packages WHERE package_id = ? AND status = 'active'`,
        [tourId]
      );

      if (!tours || tours.length === 0) {
        return { available: false, message: 'Tour not found' };
      }

      const tour = tours[0];

      // Count existing bookings for this date
      const existingBookings = await executeQuery(
        `SELECT SUM(tb.number_of_participants) as total FROM tours_bookings tb
         JOIN bookings b ON tb.booking_id = b.booking_id
         WHERE tb.package_id = ? AND tb.tour_date = ? 
         AND b.status IN ('pending', 'confirmed')`,
        [tourId, tourDate]
      );

      const bookedParticipants = Number(existingBookings[0].total || 0);
      const maxParticipants = Number(
        tour.max_group_size ??
        tour.max_participants ??
        tour.capacity ??
        0
      );
      const availableSpots = Math.max(maxParticipants - bookedParticipants, 0);

      return {
        available: availableSpots > 0,
        available_spots: availableSpots,
        max_participants: maxParticipants,
        booked_participants: bookedParticipants,
        price_per_person: tour.price_per_person
      };
    } catch (error) {
      console.error('Error checking tour availability:', error);
      throw error;
    }
  }

  /**
   * Get all restaurants with filters
   */
  async getRestaurants(filters = {}) {
    try {
      const {
        location,
        cuisine_type,
        min_rating,
        reservation_date,
        reservation_time,
        guests,
        limit = 20,
        offset = 0
      } = filters;

      let query = `
        SELECT 
          r.id as restaurant_id,
          r.name,
          r.description,
          r.address,
          r.latitude,
          r.longitude,
          r.restaurant_type as cuisine_type,
          r.contact_number as phone,
          r.phone as phone_alt,
          r.email_address as email,
          r.status,
          NULL as average_rating
        FROM restaurants r
        WHERE r.status = 'active'
      `;

      const params = [];

      if (location) {
        query += ` AND r.address LIKE ?`;
        const locationParam = `%${location}%`;
        params.push(locationParam);
      }

      if (cuisine_type) {
        query += ` AND r.restaurant_type = ?`;
        params.push(cuisine_type);
      }

      if (reservation_date && reservation_time) {
        // Check availability for specific date/time
        // Note: This assumes restaurant_table_bookings table exists
        query += ` AND r.id NOT IN (
          SELECT DISTINCT rtb.restaurant_id
          FROM restaurant_table_bookings rtb
          JOIN bookings b ON rtb.booking_id = b.booking_id
          WHERE DATE(rtb.booking_date) = ? 
          AND TIME(rtb.booking_time) = ?
          AND b.status IN ('pending', 'confirmed', 'active')
        )`;
        params.push(reservation_date, reservation_time);
      }

      // Note: Removed GROUP BY and HAVING for average_rating since reviews table doesn't exist
      // If min_rating filter is needed in the future, implement reviews table first
      // if (min_rating) {
      //   query += ` HAVING average_rating >= ?`;
      //   params.push(min_rating);
      // }

      query += ` ORDER BY r.name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const restaurants = await executeQuery(query, params);

      // Get images for each restaurant from images table
      for (const restaurant of restaurants) {
        const images = await executeQuery(
          `SELECT image_url FROM images WHERE entity_type = 'restaurant' AND entity_id = ? ORDER BY display_order, is_primary DESC LIMIT 5`,
          [restaurant.restaurant_id]
        );
        restaurant.images = images.map(img => img.image_url);
      }

      return restaurants;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      throw error;
    }
  }

  /**
   * Get restaurant details by ID
   */
  async getRestaurantById(restaurantId) {
    try {
      const restaurants = await executeQuery(
        `SELECT * FROM restaurants WHERE id = ? AND status = 'active'`,
        [restaurantId]
      );

      if (!restaurants || restaurants.length === 0) {
        return null;
      }

      const restaurant = restaurants[0];
      restaurant.restaurant_id = restaurant.id; // Add alias for compatibility

      // Get images from images table
      const images = await executeQuery(
        `SELECT image_url FROM images WHERE entity_type = 'restaurant' AND entity_id = ? ORDER BY display_order, is_primary DESC`,
        [restaurantId]
      );
      restaurant.images = images.map(img => img.image_url);

      // Get menu items
      const menuItems = await executeQuery(
        `SELECT * FROM menu_items WHERE restaurant_id = ? AND available = 1`,
        [restaurantId]
      );
      restaurant.menu = menuItems;

      // Capacity info is already in the restaurant object (capacity and available_seats columns)
      // Format it for API response - store original values first
      const totalCapacity = restaurant.capacity || 0;
      const availableSeats = restaurant.available_seats || 0;
      restaurant.capacity = {
        total_seats: totalCapacity,
        available_seats: availableSeats,
        max_capacity: totalCapacity
      };

      return restaurant;
    } catch (error) {
      console.error('Error getting restaurant:', error);
      throw error;
    }
  }

  /**
   * Check restaurant table availability
   */
  async checkRestaurantAvailability(restaurantId, reservationDate, reservationTime, guests) {
    try {
      // Get restaurant with capacity info
      const restaurants = await executeQuery(
        `SELECT id, capacity, available_seats FROM restaurants WHERE id = ? AND status = 'active'`,
        [restaurantId]
      );

      if (!restaurants || restaurants.length === 0) {
        return { available: false, message: 'Restaurant not found' };
      }

      const restaurant = restaurants[0];
      const maxCapacity = restaurant.capacity || 0;

      // If no capacity is set, assume available
      if (maxCapacity === 0) {
        return { available: true, message: 'No capacity restrictions' };
      }

      // Count existing reservations for this time
      // Note: restaurant_capacity_bookings uses eating_out_id which should match restaurant id
      const existingReservations = await executeQuery(
        `SELECT COUNT(*) as count FROM restaurant_capacity_bookings rcb
         JOIN bookings b ON rcb.booking_id = b.booking_id
         WHERE rcb.eating_out_id = ? 
         AND DATE(rcb.reservation_start) = ? 
         AND TIME(rcb.reservation_start) = ?
         AND b.status IN ('pending', 'confirmed')`,
        [restaurantId, reservationDate, reservationTime]
      );

      const bookedCount = existingReservations[0].count || 0;
      const available = bookedCount < maxCapacity;

      return {
        available: available,
        max_capacity: maxCapacity,
        booked_tables: bookedCount,
        available_tables: Math.max(maxCapacity - bookedCount, 0)
      };
    } catch (error) {
      console.error('Error checking restaurant availability:', error);
      throw error;
    }
  }

  /**
   * Get all car rentals with filters
   */
  async getCarRentals(filters = {}) {
    try {
      // Ensure tables exist
      await this.ensureBookingsTable();
      const carsService = require('../carRental/cars.service');
      await carsService.ensureCarImagesTable();
      const {
        location,
        pickup_date,
        return_date,
        car_type,
        transmission,
        min_price,
        max_price,
        seats,
        limit = 20,
        offset = 0
      } = filters;

      let query = `
        SELECT 
          c.car_id,
          c.brand,
          c.model,
          c.year,
          c.transmission,
          c.seat_capacity as seats,
          c.daily_rate,
          c.security_deposit,
          c.is_available,
          c.status,
          crb.business_name,
          crb.location as business_location
        FROM cars c
        JOIN car_rental_businesses crb ON c.vendor_id = crb.car_rental_business_id
        WHERE c.status = 'active' AND c.is_available = 1 
        AND crb.status = 'approved'
      `;

      const params = [];

      if (location) {
        query += ` AND crb.location LIKE ?`;
        params.push(`%${location}%`);
      }

      // Note: car_type is not a direct column, might need to check subcategory_id or other fields
      // For now, we'll skip this filter or implement it differently

      if (transmission) {
        query += ` AND c.transmission = ?`;
        params.push(transmission);
      }

      if (seats) {
        query += ` AND c.seat_capacity >= ?`;
        params.push(seats);
      }

      if (min_price) {
        query += ` AND c.daily_rate >= ?`;
        params.push(min_price);
      }

      if (max_price) {
        query += ` AND c.daily_rate <= ?`;
        params.push(max_price);
      }

      if (pickup_date && return_date) {
        // Check availability for dates
        // Note: car_rental_bookings uses dropoff_date, not return_date
        query += ` AND c.car_id NOT IN (
          SELECT DISTINCT crb2.car_id
          FROM car_rental_bookings crb2
          JOIN bookings b ON crb2.booking_id = b.booking_id
          WHERE b.status IN ('pending', 'confirmed', 'active')
          AND ((crb2.pickup_date <= ? AND crb2.dropoff_date >= ?) OR
               (crb2.pickup_date <= ? AND crb2.dropoff_date >= ?) OR
               (crb2.pickup_date >= ? AND crb2.dropoff_date <= ?))
        )`;
        params.push(return_date, pickup_date, pickup_date, return_date, pickup_date, return_date);
      }

      query += ` ORDER BY c.daily_rate ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const cars = await executeQuery(query, params);

      // Get images for each car from car_images table
      for (const car of cars) {
        const images = await executeQuery(
          `SELECT image_path FROM car_images WHERE car_id = ? ORDER BY is_primary DESC, image_order ASC LIMIT 5`,
          [car.car_id]
        );
        car.images = images.map(img => img.image_path);
      }

      return cars;
    } catch (error) {
      console.error('Error getting car rentals:', error);
      throw error;
    }
  }

  /**
   * Get car rental details by ID
   */
  async getCarRentalById(carId) {
    try {
      // Ensure car_images table exists
      const carsService = require('../carRental/cars.service');
      await carsService.ensureCarImagesTable();
      const cars = await executeQuery(
        `SELECT c.*, crb.business_name, crb.location as business_location
         FROM cars c
         JOIN car_rental_businesses crb ON c.vendor_id = crb.car_rental_business_id
         WHERE c.car_id = ? AND c.status = 'active' AND crb.status = 'approved'`,
        [carId]
      );

      if (!cars || cars.length === 0) {
        return null;
      }

      const car = cars[0];

      // Get images from car_images table
      const images = await executeQuery(
        `SELECT image_path FROM car_images WHERE car_id = ? ORDER BY image_order ASC, is_primary DESC`,
        [carId]
      );
      car.images = images.map(img => img.image_path);

      // Get features
      if (car.features) {
        try {
          car.features = JSON.parse(car.features);
        } catch (e) {
          car.features = [];
        }
      }

      return car;
    } catch (error) {
      console.error('Error getting car rental:', error);
      throw error;
    }
  }

  /**
   * Check car availability for dates
   */
  async checkCarAvailability(carId, pickupDate, returnDate) {
    try {
      // Ensure bookings table exists
      await this.ensureBookingsTable();
      
      // Get car details
      const cars = await executeQuery(
        `SELECT * FROM cars WHERE car_id = ? AND status = 'active' AND is_available = 1`,
        [carId]
      );

      if (!cars || cars.length === 0) {
        return { available: false, message: 'Car not found or not available' };
      }

      const car = cars[0];

      // Check for conflicting bookings
      // Note: car_rental_bookings uses dropoff_date, not return_date
      const existingBookings = await executeQuery(
        `SELECT COUNT(*) as count FROM car_rental_bookings crb
         JOIN bookings b ON crb.booking_id = b.booking_id
         WHERE crb.car_id = ? 
         AND b.status IN ('pending', 'confirmed', 'active')
         AND ((crb.pickup_date <= ? AND crb.dropoff_date >= ?) OR
              (crb.pickup_date <= ? AND crb.dropoff_date >= ?) OR
              (crb.pickup_date >= ? AND crb.dropoff_date <= ?))`,
        [carId, returnDate, pickupDate, pickupDate, returnDate, pickupDate, returnDate]
      );

      const isBooked = existingBookings[0].count > 0;

      // Calculate total price
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);
      const days = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
      const totalPrice = (car.daily_rate * days) + (car.security_deposit || 0);

      return {
        available: !isBooked,
        daily_rate: car.daily_rate,
        security_deposit: car.security_deposit,
        days: days,
        total_price: totalPrice
      };
    } catch (error) {
      console.error('Error checking car availability:', error);
      throw error;
    }
  }
}

module.exports = new ClientDiscoveryService();

