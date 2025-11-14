const bookingsService = require('../../services/carRental/bookings.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Get all bookings for a vendor
const getBookings = async (req, res) => {
    try {
        const vendorId = req.params.businessId || req.params.vendorId || req.query.vendorId || req.query.businessId;
        const filters = {
            status: req.query.status,
            payment_status: req.query.payment_status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            limit: req.query.limit
        };
        
        if (!vendorId) {
            return sendError(res, 'Business ID is required', 400);
        }

        const bookings = await bookingsService.getBookingsByVendor(vendorId, filters);
        return sendSuccess(res, bookings, 'Bookings retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getBookings controller:', error);
        return sendError(res, error.message || 'Failed to get bookings', 500);
    }
};

// Get a single booking
const getBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await bookingsService.getBookingById(bookingId);
        
        if (!booking) {
            return sendError(res, 'Booking not found', 404);
        }

        return sendSuccess(res, booking, 'Booking retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getBooking controller:', error);
        return sendError(res, error.message || 'Failed to get booking', 500);
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        const booking = await bookingsService.createBooking(bookingData);
        return sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
        console.error('Error in createBooking controller:', error);
        return sendError(res, error.message || 'Failed to create booking', 500);
    }
};

// Update a booking
const updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const bookingData = req.body;
        const booking = await bookingsService.updateBooking(bookingId, bookingData);
        return sendSuccess(res, booking, 'Booking updated successfully', 200);
    } catch (error) {
        console.error('Error in updateBooking controller:', error);
        return sendError(res, error.message || 'Failed to update booking', 500);
    }
};

// Delete a booking
const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        await bookingsService.deleteBooking(bookingId);
        return sendSuccess(res, null, 'Booking deleted successfully', 200);
    } catch (error) {
        console.error('Error in deleteBooking controller:', error);
        return sendError(res, error.message || 'Failed to delete booking', 500);
    }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
    try {
        const vendorId = req.params.vendorId || req.query.vendorId;
        
        if (!vendorId) {
            return sendError(res, 'Vendor ID is required', 400);
        }

        const stats = await bookingsService.getBookingStats(vendorId);
        return sendSuccess(res, stats, 'Booking statistics retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getBookingStats controller:', error);
        return sendError(res, error.message || 'Failed to get booking statistics', 500);
    }
};

module.exports = {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingStats
};

