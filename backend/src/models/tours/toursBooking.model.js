const { executeQuery } = require('../../../config/database');

class ToursBooking {
    constructor(data = {}) {
        this.booking_id = data.booking_id || null;
        this.package_id = data.package_id || null;
        this.tour_business_id = data.tour_business_id || null;
        this.customer_id = data.customer_id || null;
        this.customer_name = data.customer_name || null;
        this.customer_email = data.customer_email || null;
        this.customer_phone = data.customer_phone || null;
        this.customer_country_code = data.customer_country_code || null;
        this.booking_date = data.booking_date || null;
        this.tour_date = data.tour_date || null;
        this.tour_time = data.tour_time || null;
        this.number_of_participants = data.number_of_participants || 1;
        this.base_price = data.base_price || null;
        this.addon_price = data.addon_price || 0.00;
        this.discount_amount = data.discount_amount || 0.00;
        this.total_amount = data.total_amount || null;
        this.commission_percentage = data.commission_percentage || null;
        this.commission_amount = data.commission_amount || null;
        this.vendor_payout = data.vendor_payout || null;
        this.currency = data.currency || 'RWF';
        this.status = data.status || 'pending';
        this.payment_status = data.payment_status || 'pending';
        this.payment_method = data.payment_method || null;
        this.payment_transaction_id = data.payment_transaction_id || null;
        this.special_requests = data.special_requests || null;
        this.cancellation_reason = data.cancellation_reason || null;
        this.cancellation_date = data.cancellation_date || null;
        this.notes = data.notes || null;
    }

    async save() {
        const sql = `
            INSERT INTO tours_bookings (
                package_id, tour_business_id, customer_id, customer_name, customer_email,
                customer_phone, customer_country_code, booking_date, tour_date, tour_time,
                number_of_participants, base_price, addon_price, discount_amount, total_amount,
                commission_percentage, commission_amount, vendor_payout, currency, status,
                payment_status, payment_method, payment_transaction_id, special_requests,
                cancellation_reason, cancellation_date, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            this.package_id, this.tour_business_id, this.customer_id, this.customer_name,
            this.customer_email, this.customer_phone, this.customer_country_code, this.booking_date,
            this.tour_date, this.tour_time, this.number_of_participants, this.base_price,
            this.addon_price, this.discount_amount, this.total_amount, this.commission_percentage,
            this.commission_amount, this.vendor_payout, this.currency, this.status,
            this.payment_status, this.payment_method, this.payment_transaction_id,
            this.special_requests, this.cancellation_reason, this.cancellation_date, this.notes
        ];

        const result = await executeQuery(sql, values);
        this.booking_id = result.insertId;
        return this;
    }

    async update() {
        const sql = `
            UPDATE tours_bookings SET
                package_id = ?, tour_business_id = ?, customer_id = ?, customer_name = ?,
                customer_email = ?, customer_phone = ?, customer_country_code = ?,
                booking_date = ?, tour_date = ?, tour_time = ?, number_of_participants = ?,
                base_price = ?, addon_price = ?, discount_amount = ?, total_amount = ?,
                commission_percentage = ?, commission_amount = ?, vendor_payout = ?,
                currency = ?, status = ?, payment_status = ?, payment_method = ?,
                payment_transaction_id = ?, special_requests = ?, cancellation_reason = ?,
                cancellation_date = ?, notes = ?
            WHERE booking_id = ?
        `;
        
        const values = [
            this.package_id, this.tour_business_id, this.customer_id, this.customer_name,
            this.customer_email, this.customer_phone, this.customer_country_code, this.booking_date,
            this.tour_date, this.tour_time, this.number_of_participants, this.base_price,
            this.addon_price, this.discount_amount, this.total_amount, this.commission_percentage,
            this.commission_amount, this.vendor_payout, this.currency, this.status,
            this.payment_status, this.payment_method, this.payment_transaction_id,
            this.special_requests, this.cancellation_reason, this.cancellation_date, this.notes,
            this.booking_id
        ];

        await executeQuery(sql, values);
        return this;
    }

    static async findById(bookingId) {
        const results = await executeQuery(
            'SELECT * FROM tours_bookings WHERE booking_id = ?',
            [bookingId]
        );
        return results.length > 0 ? new ToursBooking(results[0]) : null;
    }

    static async findByBusinessId(tourBusinessId, filters = {}) {
        // First, check if tours_bookings table exists and has any data
        try {
            const tableCheck = await executeQuery(
                'SELECT COUNT(*) as count FROM tours_bookings WHERE tour_business_id = ?',
                [tourBusinessId]
            );
            console.log(`🔍 Direct count from tours_bookings for business ${tourBusinessId}:`, tableCheck[0]?.count || 0);
        } catch (error) {
            console.error('⚠️ Error checking tours_bookings table:', error.message);
        }

        // Join with bookings table to get booking reference and ensure we get all bookings
        let sql = `
            SELECT 
                tb.*,
                b.booking_reference,
                b.service_type,
                b.special_requests as booking_special_requests,
                b.created_at as booking_created_at
            FROM tours_bookings tb
            LEFT JOIN bookings b ON tb.booking_id = b.booking_id
            WHERE tb.tour_business_id = ?
        `;
        const params = [tourBusinessId];

        // Filter by status - prioritize tours_bookings.status, fallback to bookings.status
        if (filters.status && filters.status !== 'all') {
            sql += ' AND (tb.status = ? OR (tb.status IS NULL AND b.status = ?))';
            params.push(filters.status, filters.status);
        }

        if (filters.startDate) {
            sql += ' AND tb.tour_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            sql += ' AND tb.tour_date <= ?';
            params.push(filters.endDate);
        }

        sql += ' ORDER BY COALESCE(tb.booking_date, b.created_at, tb.tour_date) DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        console.log('🔍 Executing query:', sql);
        console.log('🔍 Query params:', params);
        
        const results = await executeQuery(sql, params);
        
        console.log(`📊 Query returned ${results.length} results`);
        if (results.length > 0) {
            console.log('📊 First booking sample:', {
                booking_id: results[0].booking_id,
                tour_business_id: results[0].tour_business_id,
                package_id: results[0].package_id,
                customer_name: results[0].customer_name,
                status: results[0].status
            });
        } else {
            // If no results, check if there are any bookings at all for this business
            const allBookingsCheck = await executeQuery(
                'SELECT booking_id, tour_business_id, package_id FROM tours_bookings LIMIT 5',
                []
            );
            console.log('🔍 Sample of all bookings in tours_bookings:', allBookingsCheck);
            
            // Also check what tour_business_ids exist
            const businessIdsCheck = await executeQuery(
                'SELECT DISTINCT tour_business_id FROM tours_bookings',
                []
            );
            console.log('🔍 All tour_business_ids in tours_bookings:', businessIdsCheck.map(b => b.tour_business_id));
        }
        
        return results.map(row => new ToursBooking(row));
    }

    static async findByPackageId(packageId) {
        const results = await executeQuery(
            'SELECT * FROM tours_bookings WHERE package_id = ? ORDER BY booking_date DESC',
            [packageId]
        );
        return results.map(row => new ToursBooking(row));
    }
}

module.exports = ToursBooking;

