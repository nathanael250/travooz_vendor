const { executeQuery } = require('../../../config/database');

class BookingsService {
    /**
     * Ensure bookings table exists with updated structure
     */
    async ensureBookingsTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS car_rental_bookings (
                    booking_id INT AUTO_INCREMENT PRIMARY KEY,
                    car_id VARCHAR(50) NOT NULL,
                    vendor_id INT NOT NULL,
                    customer_first_name VARCHAR(255) NOT NULL,
                    customer_email VARCHAR(255),
                    customer_phone VARCHAR(50) NOT NULL,
                    pickup_date DATE NOT NULL,
                    pickup_time TIME NOT NULL,
                    return_date DATE NOT NULL,
                    return_time TIME NOT NULL,
                    pickup_location VARCHAR(255),
                    dropoff_location VARCHAR(255),
                    driver_option ENUM('self-drive', 'with-driver') DEFAULT 'self-drive',
                    total_amount DECIMAL(10,2) NOT NULL,
                    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
                    payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
                    booking_status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                    special_requests TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_car_id (car_id),
                    INDEX idx_vendor_id (vendor_id),
                    INDEX idx_booking_status (booking_status),
                    INDEX idx_pickup_date (pickup_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        } catch (error) {
            console.error('Error ensuring bookings table:', error);
            // Table might already exist, continue
        }
    }

    /**
     * Get all bookings for a vendor
     * @param {number} vendorId 
     * @param {object} filters 
     */
    async getBookingsByVendor(vendorId, filters = {}) {
        try {
            await this.ensureBookingsTable();
            let query = `
                SELECT 
                    cb.*,
                    cb.return_date,
                    cb.booking_status as status,
                    c.brand as car_brand, c.model as car_model, c.license_plate as car_license_plate
                FROM car_rental_bookings cb
                LEFT JOIN cars c ON cb.car_id = c.car_id
                WHERE cb.vendor_id = ?
            `;
            const params = [vendorId];

            if (filters.status) {
                query += ' AND cb.booking_status = ?';
                params.push(filters.status);
            }

            if (filters.payment_status) {
                query += ' AND cb.payment_status = ?';
                params.push(filters.payment_status);
            }

            if (filters.startDate) {
                query += ' AND cb.pickup_date >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ' AND cb.pickup_date <= ?';
                params.push(filters.endDate);
            }

            query += ' ORDER BY cb.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            const bookings = await executeQuery(query, params);
            return bookings;
        } catch (error) {
            console.error('Error getting bookings:', error);
            throw error;
        }
    }

    /**
     * Get a single booking by ID
     * @param {number} bookingId 
     */
    async getBookingById(bookingId) {
        try {
            await this.ensureBookingsTable();
            const bookings = await executeQuery(
                `SELECT 
                    cb.*,
                    c.brand, c.model, c.license_plate, c.daily_rate
                 FROM car_rental_bookings cb
                 LEFT JOIN cars c ON cb.car_id = c.car_id
                 WHERE cb.booking_id = ?`,
                [bookingId]
            );
            return bookings[0] || null;
        } catch (error) {
            console.error('Error getting booking:', error);
            throw error;
        }
    }

    /**
     * Create a new booking
     * Accepts structure: { customer: { first_name, phone, email }, car_id, rental: { pickup_date, pickup_time, return_date, return_time, pickup_location, dropoff_location }, driver_option }
     * @param {object} bookingData 
     */
    async createBooking(bookingData) {
        try {
            await this.ensureBookingsTable();
            
            // Extract data from new structure
            const customer = bookingData.customer || {};
            const rental = bookingData.rental || {};
            const car_id = bookingData.car_id;
            const driver_option = bookingData.driver_option || 'self-drive';
            
            // Get vendor_id from car (if needed) or from bookingData
            const vendor_id = bookingData.vendor_id || null;
            
            // Combine date and time for pickup and return
            const pickup_datetime = rental.pickup_date && rental.pickup_time 
                ? `${rental.pickup_date} ${rental.pickup_time}:00`
                : null;
            const return_datetime = rental.return_date && rental.return_time
                ? `${rental.return_date} ${rental.return_time}:00`
                : null;

            // Calculate total amount if not provided (optional - can be calculated based on car rates)
            const total_amount = bookingData.total_amount || 0.00;
            const deposit_amount = bookingData.deposit_amount || 0.00;
            const payment_status = bookingData.payment_status || 'pending';
            const booking_status = bookingData.booking_status || 'pending';
            const special_requests = bookingData.special_requests || null;
            const notes = bookingData.notes || null;

            const result = await executeQuery(
                `INSERT INTO car_rental_bookings (
                    car_id, vendor_id, customer_first_name, customer_email, customer_phone,
                    pickup_date, pickup_time, return_date, return_time,
                    pickup_location, dropoff_location, driver_option,
                    total_amount, deposit_amount, payment_status, booking_status,
                    special_requests, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    car_id,
                    vendor_id,
                    customer.first_name || customer.firstName || '',
                    customer.email || '',
                    customer.phone || '',
                    rental.pickup_date || null,
                    rental.pickup_time || null,
                    rental.return_date || null,
                    rental.return_time || null,
                    rental.pickup_location || null,
                    rental.dropoff_location || null,
                    driver_option,
                    total_amount,
                    deposit_amount,
                    payment_status,
                    booking_status,
                    special_requests,
                    notes
                ]
            );

            const bookingId = result.insertId;
            return await this.getBookingById(bookingId);
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Update a booking
     * @param {number} bookingId 
     * @param {object} bookingData 
     */
    async updateBooking(bookingId, bookingData) {
        try {
            await this.ensureBookingsTable();
            
            // Handle both old and new structure
            const customer = bookingData.customer || {};
            const rental = bookingData.rental || {};
            
            const updateFields = [];
            const updateValues = [];

            if (bookingData.car_id !== undefined) { 
                updateFields.push('car_id = ?'); 
                updateValues.push(bookingData.car_id); 
            }
            if (bookingData.vendor_id !== undefined) { 
                updateFields.push('vendor_id = ?'); 
                updateValues.push(bookingData.vendor_id); 
            }
            if (customer.first_name !== undefined || customer.firstName !== undefined) { 
                updateFields.push('customer_first_name = ?'); 
                updateValues.push(customer.first_name || customer.firstName); 
            }
            if (customer.email !== undefined) { 
                updateFields.push('customer_email = ?'); 
                updateValues.push(customer.email); 
            }
            if (customer.phone !== undefined) { 
                updateFields.push('customer_phone = ?'); 
                updateValues.push(customer.phone); 
            }
            if (rental.pickup_date !== undefined) { 
                updateFields.push('pickup_date = ?'); 
                updateValues.push(rental.pickup_date); 
            }
            if (rental.pickup_time !== undefined) { 
                updateFields.push('pickup_time = ?'); 
                updateValues.push(rental.pickup_time); 
            }
            if (rental.return_date !== undefined) { 
                updateFields.push('return_date = ?'); 
                updateValues.push(rental.return_date); 
            }
            if (rental.return_time !== undefined) { 
                updateFields.push('return_time = ?'); 
                updateValues.push(rental.return_time); 
            }
            if (rental.pickup_location !== undefined) { 
                updateFields.push('pickup_location = ?'); 
                updateValues.push(rental.pickup_location); 
            }
            if (rental.dropoff_location !== undefined) { 
                updateFields.push('dropoff_location = ?'); 
                updateValues.push(rental.dropoff_location); 
            }
            if (bookingData.driver_option !== undefined) { 
                updateFields.push('driver_option = ?'); 
                updateValues.push(bookingData.driver_option); 
            }
            if (bookingData.total_amount !== undefined) { 
                updateFields.push('total_amount = ?'); 
                updateValues.push(bookingData.total_amount); 
            }
            if (bookingData.deposit_amount !== undefined) { 
                updateFields.push('deposit_amount = ?'); 
                updateValues.push(bookingData.deposit_amount); 
            }
            if (bookingData.payment_status !== undefined) { 
                updateFields.push('payment_status = ?'); 
                updateValues.push(bookingData.payment_status); 
            }
            if (bookingData.booking_status !== undefined) { 
                updateFields.push('booking_status = ?'); 
                updateValues.push(bookingData.booking_status); 
            }
            if (bookingData.special_requests !== undefined) { 
                updateFields.push('special_requests = ?'); 
                updateValues.push(bookingData.special_requests); 
            }
            if (bookingData.notes !== undefined) { 
                updateFields.push('notes = ?'); 
                updateValues.push(bookingData.notes); 
            }

            if (updateFields.length === 0) {
                return await this.getBookingById(bookingId);
            }

            updateValues.push(bookingId);

            await executeQuery(
                `UPDATE car_rental_bookings SET ${updateFields.join(', ')} WHERE booking_id = ?`,
                updateValues
            );

            return await this.getBookingById(bookingId);
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    /**
     * Delete a booking
     * @param {number} bookingId 
     */
    async deleteBooking(bookingId) {
        try {
            await this.ensureBookingsTable();
            await executeQuery(
                `DELETE FROM car_rental_bookings WHERE booking_id = ?`,
                [bookingId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    }

    /**
     * Get booking statistics for a vendor
     * @param {number} vendorId 
     */
    async getBookingStats(vendorId) {
        try {
            await this.ensureBookingsTable();
            const stats = await executeQuery(
                `SELECT 
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                    SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                    SUM(CASE WHEN booking_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_bookings,
                    SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
                    SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                    SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
                 FROM car_rental_bookings
                 WHERE vendor_id = ?`,
                [vendorId]
            );
            return stats[0] || {};
        } catch (error) {
            console.error('Error getting booking stats:', error);
            throw error;
        }
    }
}

module.exports = new BookingsService();
