const StaysBooking = require('../../models/stays/staysBooking.model');
const { executeQuery } = require('../../../config/database');

class StaysBookingService {
    async getBookingsByProperty(propertyId, filters = {}) {
        try {
            const bookings = await StaysBooking.findByPropertyId(propertyId, filters);
            
            // Enrich bookings with room information
            const enrichedBookings = await Promise.all(
                bookings.map(async (booking) => {
                    const bookingData = { ...booking };
                    
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
            const booking = await StaysBooking.findById(bookingId);
            if (!booking) {
                return null;
            }

            // Get room information
            if (booking.room_id) {
                const roomInfo = await executeQuery(
                    'SELECT * FROM stays_rooms WHERE room_id = ?',
                    [booking.room_id]
                );
                if (roomInfo.length > 0) {
                    booking.room = roomInfo[0];
                }
            }

            return booking;
        } catch (error) {
            console.error('Error getting booking by ID:', error);
            throw error;
        }
    }
}

module.exports = new StaysBookingService();

