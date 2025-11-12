const toursBookingService = require('../../services/tours/toursBooking.service');
const { executeQuery } = require('../../../config/database');

const getBookings = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get tour business ID for this user
        const businesses = await executeQuery(
            'SELECT tour_business_id FROM tours_businesses WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: 'Tour business not found' });
        }

        const tourBusinessId = businesses[0].tour_business_id;

        // Get filters from query params
        const filters = {
            status: req.query.status || 'all',
            startDate: req.query.start_date || null,
            endDate: req.query.end_date || null,
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const bookings = await toursBookingService.getBookingsByBusinessId(tourBusinessId, filters);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await toursBookingService.getBookingById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellation_reason } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const validStatuses = ['pending', 'pending_payment', 'confirmed', 'completed', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await toursBookingService.updateBookingStatus(id, status, cancellation_reason);

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update booking status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getParticipants = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get tour business ID for this user
        const businesses = await executeQuery(
            'SELECT tour_business_id FROM tours_businesses WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: 'Tour business not found' });
        }

        const tourBusinessId = businesses[0].tour_business_id;

        const filters = {
            status: req.query.status || 'all',
            startDate: req.query.start_date || null,
            endDate: req.query.end_date || null
        };

        const participants = await toursBookingService.getAllParticipants(tourBusinessId, filters);

        res.json({
            success: true,
            data: participants
        });
    } catch (error) {
        console.error('Error getting participants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch participants',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getBookings,
    getBookingById,
    updateBookingStatus,
    getParticipants
};

