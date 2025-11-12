const { executeQuery } = require('../../../config/database');

class StaysBooking {
    constructor(data = {}) {
        this.booking_id = data.booking_id || null;
        this.property_id = data.property_id || null;
        this.room_id = data.room_id || null;
        this.user_id = data.user_id || null;
        this.check_in_date = data.check_in_date || null;
        this.check_out_date = data.check_out_date || null;
        this.guests = data.guests || 1;
        this.total_amount = data.total_amount || null;
        this.status = data.status || 'pending';
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    async save() {
        try {
            const result = await executeQuery(
                `INSERT INTO stays_bookings (
                    property_id, room_id, user_id, check_in_date, check_out_date,
                    guests, total_amount, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    this.property_id,
                    this.room_id,
                    this.user_id,
                    this.check_in_date,
                    this.check_out_date,
                    this.guests,
                    this.total_amount,
                    this.status
                ]
            );

            this.booking_id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving booking:', error);
            throw error;
        }
    }

    async update() {
        try {
            await executeQuery(
                `UPDATE stays_bookings SET
                    property_id = ?, room_id = ?, user_id = ?,
                    check_in_date = ?, check_out_date = ?,
                    guests = ?, total_amount = ?, status = ?
                WHERE booking_id = ?`,
                [
                    this.property_id,
                    this.room_id,
                    this.user_id,
                    this.check_in_date,
                    this.check_out_date,
                    this.guests,
                    this.total_amount,
                    this.status,
                    this.booking_id
                ]
            );

            return this;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    static async findById(bookingId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM stays_bookings WHERE booking_id = ?`,
                [bookingId]
            );
            return results.length > 0 ? new StaysBooking(results[0]) : null;
        } catch (error) {
            console.error('Error finding booking:', error);
            throw error;
        }
    }

    static async findByPropertyId(propertyId, filters = {}) {
        try {
            let query = `SELECT * FROM stays_bookings WHERE property_id = ?`;
            const params = [propertyId];

            if (filters.status && filters.status !== 'all') {
                query += ` AND status = ?`;
                params.push(filters.status);
            }

            if (filters.startDate) {
                query += ` AND check_out_date >= ?`;
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ` AND check_in_date <= ?`;
                params.push(filters.endDate);
            }

            query += ` ORDER BY check_in_date DESC`;

            if (filters.limit) {
                query += ` LIMIT ?`;
                params.push(filters.limit);
            }

            const results = await executeQuery(query, params);
            return results.map(row => new StaysBooking(row));
        } catch (error) {
            console.error('Error finding bookings by property:', error);
            throw error;
        }
    }

    static async findByRoomId(roomId, filters = {}) {
        try {
            let query = `SELECT * FROM stays_bookings WHERE room_id = ?`;
            const params = [roomId];

            if (filters.startDate) {
                query += ` AND check_out_date >= ?`;
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ` AND check_in_date <= ?`;
                params.push(filters.endDate);
            }

            query += ` ORDER BY check_in_date ASC`;

            const results = await executeQuery(query, params);
            return results.map(row => new StaysBooking(row));
        } catch (error) {
            console.error('Error finding bookings by room:', error);
            throw error;
        }
    }

    static async getAvailabilityForDateRange(propertyId, startDate, endDate) {
        try {
            // Get all bookings that overlap with the date range
            const bookings = await executeQuery(
                `SELECT 
                    b.booking_id,
                    b.room_id,
                    b.check_in_date,
                    b.check_out_date,
                    b.status,
                    r.room_name,
                    r.room_type,
                    r.number_of_rooms
                FROM stays_bookings b
                LEFT JOIN stays_rooms r ON b.room_id = r.room_id
                WHERE b.property_id = ?
                    AND b.status IN ('pending', 'confirmed', 'completed')
                    AND b.check_in_date <= ?
                    AND b.check_out_date >= ?
                ORDER BY b.check_in_date ASC`,
                [propertyId, endDate, startDate]
            );

            return bookings;
        } catch (error) {
            console.error('Error getting availability:', error);
            throw error;
        }
    }
}

module.exports = StaysBooking;

