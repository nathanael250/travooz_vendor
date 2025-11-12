const ToursBooking = require('../../models/tours/toursBooking.model');
const { executeQuery } = require('../../../config/database');

class ToursBookingService {
    async getBookingsByBusinessId(tourBusinessId, filters = {}) {
        try {
            const bookings = await ToursBooking.findByBusinessId(tourBusinessId, filters);
            
            // Enrich bookings with package and participant data
            const enrichedBookings = await Promise.all(
                bookings.map(async (booking) => {
                    const bookingData = { ...booking };
                    
                    // Get package info
                    const packageInfo = await executeQuery(
                        'SELECT package_id, name, category FROM tours_packages WHERE package_id = ?',
                        [booking.package_id]
                    );
                    if (packageInfo.length > 0) {
                        bookingData.package_name = packageInfo[0].name;
                        bookingData.tour_package_name = packageInfo[0].name;
                        bookingData.package_category = packageInfo[0].category;
                    }
                    
                    // Get participants
                    const participants = await executeQuery(
                        'SELECT * FROM tours_booking_participants WHERE booking_id = ?',
                        [booking.booking_id]
                    );
                    bookingData.participants = participants;
                    
                    // Get add-ons
                    const addons = await executeQuery(
                        'SELECT * FROM tours_booking_addons WHERE booking_id = ?',
                        [booking.booking_id]
                    );
                    bookingData.addons = addons;
                    
                    return bookingData;
                })
            );
            
            return enrichedBookings;
        } catch (error) {
            console.error('Error getting bookings by business ID:', error);
            throw error;
        }
    }

    async getBookingById(bookingId) {
        try {
            const booking = await ToursBooking.findById(bookingId);
            if (!booking) {
                return null;
            }

            const bookingData = { ...booking };
            
            // Get package info
            const packageInfo = await executeQuery(
                'SELECT * FROM tours_packages WHERE package_id = ?',
                [booking.package_id]
            );
            if (packageInfo.length > 0) {
                bookingData.package = packageInfo[0];
                bookingData.package_name = packageInfo[0].name;
                bookingData.tour_package_name = packageInfo[0].name;
            }
            
            // Get participants
            const participants = await executeQuery(
                'SELECT * FROM tours_booking_participants WHERE booking_id = ?',
                [bookingId]
            );
            bookingData.participants = participants;
            
            // Get add-ons
            const addons = await executeQuery(
                'SELECT * FROM tours_booking_addons WHERE booking_id = ?',
                [bookingId]
            );
            bookingData.addons = addons;
            
            return bookingData;
        } catch (error) {
            console.error('Error getting booking by ID:', error);
            throw error;
        }
    }

    async updateBookingStatus(bookingId, status, cancellationReason = null) {
        try {
            const booking = await ToursBooking.findById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }

            booking.status = status;
            if (status === 'cancelled' && cancellationReason) {
                booking.cancellation_reason = cancellationReason;
                booking.cancellation_date = new Date();
            }
            
            await booking.update();
            return booking;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    async getAllParticipants(tourBusinessId, filters = {}) {
        try {
            // Get all bookings for the business
            const bookings = await ToursBooking.findByBusinessId(tourBusinessId, filters);
            const bookingIds = bookings.map(b => b.booking_id);
            
            if (bookingIds.length === 0) {
                return [];
            }
            
            // Get all participants for these bookings
            const placeholders = bookingIds.map(() => '?').join(',');
            const participants = await executeQuery(
                `SELECT 
                    p.*,
                    b.booking_id,
                    b.tour_date as booking_date,
                    b.tour_date,
                    b.status as booking_status,
                    pk.name as tour_package_name,
                    pk.package_id
                FROM tours_booking_participants p
                INNER JOIN tours_bookings b ON p.booking_id = b.booking_id
                INNER JOIN tours_packages pk ON b.package_id = pk.package_id
                WHERE p.booking_id IN (${placeholders})
                ORDER BY p.created_at DESC`,
                bookingIds
            );
            
            return participants;
        } catch (error) {
            console.error('Error getting all participants:', error);
            throw error;
        }
    }
}

module.exports = new ToursBookingService();

