const StaysBooking = require('../../models/stays/staysBooking.model');
const { executeQuery } = require('../../../config/database');

class StaysBookingService {
    /**
     * Parse guest information from special_requests field
     */
    parseGuestInfo(specialRequests) {
        if (!specialRequests) return null;
        
        // Format: "Guest: {name}, Email: {email}, Phone: {phone}, Adults: {adults}, Children: {children}"
        const guestInfoMatch = specialRequests.match(/Guest: ([^,]+), Email: ([^,]+), Phone: ([^,]+), Adults: (\d+), Children: (\d+)/);
        
        if (guestInfoMatch) {
            return {
                guest_name: guestInfoMatch[1].trim(),
                guest_email: guestInfoMatch[2].trim(),
                guest_phone: guestInfoMatch[3].trim(),
                number_of_adults: parseInt(guestInfoMatch[4]),
                number_of_children: parseInt(guestInfoMatch[5])
            };
        }
        
        return null;
    }

    async getBookingsByProperty(propertyId, filters = {}) {
        try {
            // Join with bookings table to get booking_reference and special_requests
            let query = `
                SELECT 
                    sb.*,
                    b.booking_reference,
                    b.special_requests,
                    b.payment_status,
                    b.status as booking_status
                FROM stays_bookings sb
                LEFT JOIN bookings b ON sb.booking_id = b.booking_id
                WHERE sb.property_id = ?
            `;
            const params = [propertyId];

            if (filters.status && filters.status !== 'all') {
                query += ` AND sb.status = ?`;
                params.push(filters.status);
            }

            if (filters.startDate) {
                query += ` AND sb.check_out_date >= ?`;
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ` AND sb.check_in_date <= ?`;
                params.push(filters.endDate);
            }

            query += ` ORDER BY sb.check_in_date DESC`;

            if (filters.limit) {
                query += ` LIMIT ?`;
                params.push(filters.limit);
            }

            const bookings = await executeQuery(query, params);
            
            // Enrich bookings with room and guest information
            const enrichedBookings = await Promise.all(
                bookings.map(async (booking) => {
                    const bookingData = { ...booking };
                    
                    // Get room information
                    if (booking.room_id) {
                        const roomInfo = await executeQuery(
                            'SELECT room_id, room_name, room_type, number_of_rooms FROM stays_rooms WHERE room_id = ?',
                            [booking.room_id]
                        );
                        if (roomInfo.length > 0) {
                            bookingData.room_name = roomInfo[0].room_name;
                            bookingData.room_type = roomInfo[0].room_type;
                            bookingData.number_of_rooms = roomInfo[0].number_of_rooms;
                        }
                    }
                    
                    // Parse guest information from special_requests
                    const guestInfo = this.parseGuestInfo(booking.special_requests);
                    if (guestInfo) {
                        bookingData.guest_name = guestInfo.guest_name;
                        bookingData.guest_email = guestInfo.guest_email;
                        bookingData.guest_phone = guestInfo.guest_phone;
                        bookingData.number_of_adults = guestInfo.number_of_adults;
                        bookingData.number_of_children = guestInfo.number_of_children;
                    }
                    
                    return bookingData;
                })
            );
            
            return enrichedBookings;
        } catch (error) {
            console.error('Error getting bookings by property:', error);
            throw error;
        }
    }

    async getRoomAvailability(propertyId, startDate, endDate) {
        try {
            // Get all rooms for the property
            const rooms = await executeQuery(
                `SELECT 
                    r.room_id,
                    r.room_name,
                    r.room_type,
                    r.number_of_rooms,
                    r.room_status
                FROM stays_rooms r
                WHERE r.property_id = ?
                ORDER BY r.room_name ASC`,
                [propertyId]
            );

            // Get all bookings for the date range
            const bookings = await StaysBooking.getAvailabilityForDateRange(propertyId, startDate, endDate);

            // Calculate availability for each room
            const availability = rooms.map(room => {
                const roomBookings = bookings.filter(b => b.room_id === room.room_id);
                
                // Calculate booked rooms for each date in the range
                const dateAvailability = {};
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateKey = d.toISOString().split('T')[0];
                    const bookedCount = roomBookings.filter(booking => {
                        const checkIn = new Date(booking.check_in_date);
                        const checkOut = new Date(booking.check_out_date);
                        return d >= checkIn && d < checkOut && 
                               booking.status !== 'cancelled';
                    }).length;
                    
                    dateAvailability[dateKey] = {
                        date: dateKey,
                        total: room.number_of_rooms || 1,
                        booked: bookedCount,
                        available: (room.number_of_rooms || 1) - bookedCount,
                        bookings: roomBookings.filter(booking => {
                            const checkIn = new Date(booking.check_in_date);
                            const checkOut = new Date(booking.check_out_date);
                            return d >= checkIn && d < checkOut && 
                                   booking.status !== 'cancelled';
                        })
                    };
                }

                return {
                    room_id: room.room_id,
                    room_name: room.room_name,
                    room_type: room.room_type,
                    total_rooms: room.number_of_rooms || 1,
                    room_status: room.room_status,
                    bookings: roomBookings,
                    availability: dateAvailability
                };
            });

            return availability;
        } catch (error) {
            console.error('Error getting room availability:', error);
            throw error;
        }
    }

    async getBookingById(bookingId) {
        try {
            // Join with bookings table to get booking_reference and special_requests
            const results = await executeQuery(
                `SELECT 
                    sb.*,
                    b.booking_reference,
                    b.special_requests,
                    b.payment_status,
                    b.status as booking_status
                FROM stays_bookings sb
                LEFT JOIN bookings b ON sb.booking_id = b.booking_id
                WHERE sb.booking_id = ?`,
                [bookingId]
            );

            if (!results || results.length === 0) {
                return null;
            }

            const booking = results[0];

            // Get room information
            if (booking.room_id) {
                const roomInfo = await executeQuery(
                    'SELECT * FROM stays_rooms WHERE room_id = ?',
                    [booking.room_id]
                );
                if (roomInfo.length > 0) {
                    booking.room = roomInfo[0];
                    booking.room_name = roomInfo[0].room_name;
                    booking.room_type = roomInfo[0].room_type;
                }
            }

            // Parse guest information from special_requests
            const guestInfo = this.parseGuestInfo(booking.special_requests);
            if (guestInfo) {
                booking.guest_name = guestInfo.guest_name;
                booking.guest_email = guestInfo.guest_email;
                booking.guest_phone = guestInfo.guest_phone;
                booking.number_of_adults = guestInfo.number_of_adults;
                booking.number_of_children = guestInfo.number_of_children;
            }

            return booking;
        } catch (error) {
            console.error('Error getting booking by ID:', error);
            throw error;
        }
    }
}

module.exports = new StaysBookingService();

