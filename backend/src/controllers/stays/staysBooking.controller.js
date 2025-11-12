const staysBookingService = require('../../services/stays/staysBooking.service');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response.utils');
const { executeQuery } = require('../../../config/database');

// Get bookings for a property
const getBookings = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.user_id || req.user?.id;
        if (!userId) {
            return sendError(res, 'Authentication required', 401);
        }

        // Get user's property
        const properties = await executeQuery(
            'SELECT property_id FROM stays_properties WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (properties.length === 0) {
            return sendError(res, 'Property not found', 404);
        }

        const propertyId = properties[0].property_id;

        // Get filters from query params
        const filters = {
            status: req.query.status || 'all',
            startDate: req.query.start_date || null,
            endDate: req.query.end_date || null,
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const bookings = await staysBookingService.getBookingsByProperty(propertyId, filters);
        return sendSuccess(res, bookings);
    } catch (err) {
        console.error('Error getting bookings:', err);
        return sendError(res, err.message || 'Failed to fetch bookings', 500);
    }
};

// Get room availability
const getRoomAvailability = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.user_id || req.user?.id;
        if (!userId) {
            return sendError(res, 'Authentication required', 401);
        }

        // Get user's property
        const properties = await executeQuery(
            'SELECT property_id FROM stays_properties WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (properties.length === 0) {
            return sendError(res, 'Property not found', 404);
        }

        const propertyId = properties[0].property_id;

        // Get date range from query params (default to current month)
        const startDate = req.query.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = req.query.end_date || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        const availability = await staysBookingService.getRoomAvailability(propertyId, startDate, endDate);
        return sendSuccess(res, availability);
    } catch (err) {
        console.error('Error getting room availability:', err);
        return sendError(res, err.message || 'Failed to fetch room availability', 500);
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (!bookingId) {
            return sendError(res, 'Invalid booking ID', 400);
        }

        const booking = await staysBookingService.getBookingById(bookingId);
        
        if (!booking) {
            return sendNotFound(res, 'Booking not found');
        }

        return sendSuccess(res, booking);
    } catch (err) {
        console.error('Error getting booking:', err);
        return sendError(res, err.message || 'Failed to fetch booking', 500);
    }
};

module.exports = {
    getBookings,
    getRoomAvailability,
    getBookingById
};

