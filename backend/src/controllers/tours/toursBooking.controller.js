const toursBookingService = require('../../services/tours/toursBooking.service');
const { executeQuery } = require('../../../config/database');

const getBookings = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get all tour businesses for this user (in case user has multiple businesses)
        const businesses = await executeQuery(
            'SELECT tour_business_id, tour_business_name FROM tours_businesses WHERE user_id = ?',
            [userId]
        );

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: 'Tour business not found' });
        }

        // Get all business IDs for this user
        const tourBusinessIds = businesses.map(b => b.tour_business_id);
        const primaryBusinessId = businesses[0].tour_business_id;
        const primaryBusinessName = businesses[0].tour_business_name;
        
        console.log(`👤 User ${userId} is associated with ${businesses.length} tour business(es):`, tourBusinessIds);
        console.log(`👤 Primary business: ${primaryBusinessId} (${primaryBusinessName})`);

        // Debug: Check if any bookings exist for all user's businesses
        const placeholders = tourBusinessIds.map(() => '?').join(',');
        const allBookingsCheck = await executeQuery(
            `SELECT COUNT(*) as count FROM tours_bookings WHERE tour_business_id IN (${placeholders})`,
            tourBusinessIds
        );
        console.log(`🔍 Total bookings in tours_bookings for user's businesses (${tourBusinessIds.join(', ')}):`, allBookingsCheck[0]?.count || 0);
        
        // Debug: Show which businesses have bookings
        const businessesWithBookings = await executeQuery(
            `SELECT DISTINCT tour_business_id, COUNT(*) as booking_count 
             FROM tours_bookings 
             GROUP BY tour_business_id`,
            []
        );
        console.log(`🔍 Businesses with bookings:`, businessesWithBookings.map(b => ({ 
            business_id: b.tour_business_id, 
            count: b.booking_count 
        })));

        // Also check bookings table for tour packages
        const bookingsTableCheck = await executeQuery(
            `SELECT COUNT(*) as count FROM bookings b
             LEFT JOIN tours_bookings tb ON b.booking_id = tb.booking_id
             WHERE b.service_type = 'tour_package' AND (tb.tour_business_id IN (${placeholders}) OR tb.tour_business_id IS NULL)`,
            [...tourBusinessIds]
        );
        console.log(`🔍 Total tour bookings in bookings table:`, bookingsTableCheck[0]?.count || 0);

        // Get filters from query params
        const filters = {
            status: req.query.status || 'all',
            startDate: req.query.start_date || null,
            endDate: req.query.end_date || null,
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        console.log(`📊 Fetching bookings for tour businesses ${tourBusinessIds.join(', ')} with filters:`, filters);

        // Get bookings for all user's businesses
        const allBookings = [];
        for (const businessId of tourBusinessIds) {
            const businessBookings = await toursBookingService.getBookingsByBusinessId(businessId, filters);
            allBookings.push(...businessBookings);
        }
        
        // Sort by booking date descending
        allBookings.sort((a, b) => {
            const dateA = new Date(a.booking_date || a.tour_date || 0);
            const dateB = new Date(b.booking_date || b.tour_date || 0);
            return dateB - dateA;
        });

        console.log(`✅ Found ${allBookings.length} bookings for user's ${tourBusinessIds.length} business(es)`);

        res.json({
            success: true,
            data: allBookings
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

