const { executeQuery } = require('../../../config/database');

class ToursReview {
    constructor(data = {}) {
        this.review_id = data.review_id || null;
        this.booking_id = data.booking_id || null;
        this.package_id = data.package_id || null;
        this.tour_business_id = data.tour_business_id || null;
        this.customer_id = data.customer_id || null;
        this.customer_name = data.customer_name || null;
        this.customer_email = data.customer_email || null;
        this.rating = data.rating || null;
        this.title = data.title || null;
        this.comment = data.comment || null;
        this.guide_rating = data.guide_rating || null;
        this.value_rating = data.value_rating || null;
        this.experience_rating = data.experience_rating || null;
        this.verified_booking = data.verified_booking !== undefined ? data.verified_booking : 1;
        this.would_recommend = data.would_recommend || null;
        this.helpful_count = data.helpful_count || 0;
        this.not_helpful_count = data.not_helpful_count || 0;
        this.vendor_response = data.vendor_response || null;
        this.vendor_responded_at = data.vendor_responded_at || null;
        this.status = data.status || 'approved';
    }

    async save() {
        const sql = `
            INSERT INTO tours_reviews (
                booking_id, package_id, tour_business_id, customer_id, customer_name,
                customer_email, rating, title, comment, guide_rating, value_rating,
                experience_rating, verified_booking, would_recommend, helpful_count,
                not_helpful_count, vendor_response, vendor_responded_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            this.booking_id, this.package_id, this.tour_business_id, this.customer_id,
            this.customer_name, this.customer_email, this.rating, this.title, this.comment,
            this.guide_rating, this.value_rating, this.experience_rating, this.verified_booking,
            this.would_recommend, this.helpful_count, this.not_helpful_count,
            this.vendor_response, this.vendor_responded_at, this.status
        ];

        const result = await executeQuery(sql, values);
        this.review_id = result.insertId;
        return this;
    }

    async update() {
        const sql = `
            UPDATE tours_reviews SET
                booking_id = ?, package_id = ?, tour_business_id = ?, customer_id = ?,
                customer_name = ?, customer_email = ?, rating = ?, title = ?, comment = ?,
                guide_rating = ?, value_rating = ?, experience_rating = ?, verified_booking = ?,
                would_recommend = ?, helpful_count = ?, not_helpful_count = ?,
                vendor_response = ?, vendor_responded_at = ?, status = ?
            WHERE review_id = ?
        `;
        
        const values = [
            this.booking_id, this.package_id, this.tour_business_id, this.customer_id,
            this.customer_name, this.customer_email, this.rating, this.title, this.comment,
            this.guide_rating, this.value_rating, this.experience_rating, this.verified_booking,
            this.would_recommend, this.helpful_count, this.not_helpful_count,
            this.vendor_response, this.vendor_responded_at, this.status,
            this.review_id
        ];

        await executeQuery(sql, values);
        return this;
    }

    static async findById(reviewId) {
        const results = await executeQuery(
            'SELECT * FROM tours_reviews WHERE review_id = ?',
            [reviewId]
        );
        return results.length > 0 ? new ToursReview(results[0]) : null;
    }

    static async findByBusinessId(tourBusinessId, filters = {}) {
        let sql = 'SELECT * FROM tours_reviews WHERE tour_business_id = ?';
        const params = [tourBusinessId];

        if (filters.status && filters.status !== 'all') {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.rating) {
            sql += ' AND rating = ?';
            params.push(filters.rating);
        }

        if (filters.packageId) {
            sql += ' AND package_id = ?';
            params.push(filters.packageId);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        const results = await executeQuery(sql, params);
        return results.map(row => new ToursReview(row));
    }

    static async findByPackageId(packageId) {
        const results = await executeQuery(
            'SELECT * FROM tours_reviews WHERE package_id = ? AND status = "approved" ORDER BY created_at DESC',
            [packageId]
        );
        return results.map(row => new ToursReview(row));
    }
}

module.exports = ToursReview;

