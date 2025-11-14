const { executeQuery } = require('../../../config/database');

class BookingsService {
    /**
     * Ensure bookings table exists
     */
    async ensureBookingsTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS car_rental_bookings (
                    booking_id INT AUTO_INCREMENT PRIMARY KEY,
                    car_id INT NOT NULL,
                    driver_id INT,
                    vendor_id INT NOT NULL,
                    customer_name VARCHAR(255) NOT NULL,
                    customer_email VARCHAR(255),
                    customer_phone VARCHAR(50) NOT NULL,
                    pickup_date DATETIME NOT NULL,
                    dropoff_date DATETIME NOT NULL,
                    pickup_location VARCHAR(255),
                    dropoff_location VARCHAR(255),
                    total_amount DECIMAL(10,2) NOT NULL,
                    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
                    payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
                    booking_status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                    special_requests TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_car_id (car_id),
                    INDEX idx_driver_id (driver_id),
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
                    cb.dropoff_date as return_date,
                    cb.booking_status as status,
                    c.brand as car_brand, c.model as car_model, c.license_plate as car_license_plate,
                    d.name as driver_name, d.phone as driver_phone
                FROM car_rental_bookings cb
                LEFT JOIN cars c ON cb.car_id = c.car_id
                LEFT JOIN drivers d ON cb.driver_id = d.driver_id
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
                    c.brand, c.model, c.license_plate, c.daily_rate,
                    d.name as driver_name, d.phone as driver_phone
                 FROM car_rental_bookings cb
                 LEFT JOIN cars c ON cb.car_id = c.car_id
                 LEFT JOIN drivers d ON cb.driver_id = d.driver_id
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
     * @param {object} bookingData 
     */
    async createBooking(bookingData) {
        try {
            await this.ensureBookingsTable();
            const {
                car_id,
                driver_id,
                vendor_id,
                customer_name,
                customer_email,
                customer_phone,
                pickup_date,
                dropoff_date,
                pickup_location,
                dropoff_location,
                total_amount,
                deposit_amount = 0.00,
                payment_status = 'pending',
                booking_status = 'pending',
                special_requests,
                notes
            } = bookingData;

            const result = await executeQuery(
                `INSERT INTO car_rental_bookings (
                    car_id, driver_id, vendor_id, customer_name, customer_email, customer_phone,
                    pickup_date, dropoff_date, pickup_location, dropoff_location,
                    total_amount, deposit_amount, payment_status, booking_status,
                    special_requests, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    car_id,
                    driver_id || null,
                    vendor_id,
                    customer_name,
                    customer_email || null,
                    customer_phone,
                    pickup_date,
                    dropoff_date,
                    pickup_location || null,
                    dropoff_location || null,
                    total_amount,
                    deposit_amount,
                    payment_status,
                    booking_status,
                    special_requests || null,
                    notes || null
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
            const {
                car_id,
                driver_id,
                customer_name,
                customer_email,
                customer_phone,
                pickup_date,
                dropoff_date,
                pickup_location,
                dropoff_location,
                total_amount,
                deposit_amount,
                payment_status,
                booking_status,
                special_requests,
                notes
            } = bookingData;

            const updateFields = [];
            const updateValues = [];

            if (car_id !== undefined) { updateFields.push('car_id = ?'); updateValues.push(car_id); }
            if (driver_id !== undefined) { updateFields.push('driver_id = ?'); updateValues.push(driver_id); }
            if (customer_name !== undefined) { updateFields.push('customer_name = ?'); updateValues.push(customer_name); }
            if (customer_email !== undefined) { updateFields.push('customer_email = ?'); updateValues.push(customer_email); }
            if (customer_phone !== undefined) { updateFields.push('customer_phone = ?'); updateValues.push(customer_phone); }
            if (pickup_date !== undefined) { updateFields.push('pickup_date = ?'); updateValues.push(pickup_date); }
            if (dropoff_date !== undefined) { updateFields.push('dropoff_date = ?'); updateValues.push(dropoff_date); }
            if (pickup_location !== undefined) { updateFields.push('pickup_location = ?'); updateValues.push(pickup_location); }
            if (dropoff_location !== undefined) { updateFields.push('dropoff_location = ?'); updateValues.push(dropoff_location); }
            if (total_amount !== undefined) { updateFields.push('total_amount = ?'); updateValues.push(total_amount); }
            if (deposit_amount !== undefined) { updateFields.push('deposit_amount = ?'); updateValues.push(deposit_amount); }
            if (payment_status !== undefined) { updateFields.push('payment_status = ?'); updateValues.push(payment_status); }
            if (booking_status !== undefined) { updateFields.push('booking_status = ?'); updateValues.push(booking_status); }
            if (special_requests !== undefined) { updateFields.push('special_requests = ?'); updateValues.push(special_requests); }
            if (notes !== undefined) { updateFields.push('notes = ?'); updateValues.push(notes); }

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

