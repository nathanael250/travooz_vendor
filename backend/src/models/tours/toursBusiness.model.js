const { executeQuery } = require('../../../config/database');

const parseJsonField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        return JSON.parse(value);
    } catch (error) {
        if (typeof value === 'string') {
            return value
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
        }
        return [];
    }
};

const stringifyJsonField = (value) => {
    if (!value) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value);
    } catch (error) {
        return null;
    }
};

class ToursBusiness {
    constructor(data = {}) {
        this.tour_business_id = data.tour_business_id || null;
        this.user_id = data.user_id || null;
        this.location = data.location || null;
        this.location_data = data.location_data || null; // JSON field
        this.tour_business_name = data.tour_business_name || null;
        this.tour_type = data.tour_type || null;
        this.tour_type_name = data.tour_type_name || null;
        this.tour_type_ids = parseJsonField(data.tour_type_ids);
        this.tour_type_names = parseJsonField(data.tour_type_names);
        this.subcategory_id = data.subcategory_id || null;
        this.description = data.description || null;
        this.phone = data.phone || null;
        this.country_code = data.country_code || '+250';
        this.currency = data.currency || 'RWF';
        this.status = data.status || 'draft';
        this.is_live = data.is_live || 0;
        this.setup_complete = data.setup_complete || 0;
        this.submitted_at = data.submitted_at || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    async save() {
        try {
            // If location_data is an object, stringify it
            const locationDataJson = this.location_data 
                ? (typeof this.location_data === 'string' ? this.location_data : JSON.stringify(this.location_data))
                : null;

            const tourTypeIdsJson = stringifyJsonField(this.tour_type_ids);
            const tourTypeNamesJson = stringifyJsonField(this.tour_type_names);

            const result = await executeQuery(
                `INSERT INTO tours_businesses (
                    user_id, location, location_data, tour_business_name, tour_type,
                    tour_type_name, tour_type_ids, tour_type_names, subcategory_id, description,
                    phone, country_code, currency, status, is_live, setup_complete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    this.user_id,
                    this.location,
                    locationDataJson,
                    this.tour_business_name,
                    this.tour_type,
                    this.tour_type_name,
                    tourTypeIdsJson,
                    tourTypeNamesJson,
                    this.subcategory_id,
                    this.description,
                    this.phone,
                    this.country_code,
                    this.currency,
                    this.status,
                    this.is_live,
                    this.setup_complete
                ]
            );

            this.tour_business_id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving tour business:', error);
            throw error;
        }
    }

    async update() {
        try {
            const locationDataJson = this.location_data 
                ? (typeof this.location_data === 'string' ? this.location_data : JSON.stringify(this.location_data))
                : null;
            const tourTypeIdsJson = stringifyJsonField(this.tour_type_ids);
            const tourTypeNamesJson = stringifyJsonField(this.tour_type_names);

            await executeQuery(
                `UPDATE tours_businesses SET
                    location = ?, location_data = ?, tour_business_name = ?,
                    tour_type = ?, tour_type_name = ?, tour_type_ids = ?, tour_type_names = ?,
                    subcategory_id = ?, description = ?, phone = ?, country_code = ?,
                    currency = ?, status = ?, is_live = ?, setup_complete = ?
                WHERE tour_business_id = ?`,
                [
                    this.location,
                    locationDataJson,
                    this.tour_business_name,
                    this.tour_type,
                    this.tour_type_name,
                    tourTypeIdsJson,
                    tourTypeNamesJson,
                    this.subcategory_id,
                    this.description,
                    this.phone,
                    this.country_code,
                    this.currency,
                    this.status,
                    this.is_live,
                    this.setup_complete,
                    this.tour_business_id
                ]
            );

            return this;
        } catch (error) {
            console.error('Error updating tour business:', error);
            throw error;
        }
    }

    static async findById(tourBusinessId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM tours_businesses WHERE tour_business_id = ?`,
                [tourBusinessId]
            );
            return results.length > 0 ? new ToursBusiness(results[0]) : null;
        } catch (error) {
            console.error('Error finding tour business:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM tours_businesses WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );
            return results.map(row => new ToursBusiness(row));
        } catch (error) {
            console.error('Error finding tour businesses by user:', error);
            throw error;
        }
    }

    static async findAll(filters = {}) {
        try {
            let query = `SELECT * FROM tours_businesses WHERE 1=1`;
            const params = [];

            if (filters.status) {
                query += ` AND status = ?`;
                params.push(filters.status);
            }

            if (filters.tour_type) {
                query += ` AND tour_type = ?`;
                params.push(filters.tour_type);
            }

            query += ` ORDER BY created_at DESC`;

            if (filters.limit) {
                query += ` LIMIT ?`;
                params.push(filters.limit);
            }

            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(filters.offset);
            }

            const results = await executeQuery(query, params);
            return results.map(row => new ToursBusiness(row));
        } catch (error) {
            console.error('Error finding tour businesses:', error);
            throw error;
        }
    }

    async delete() {
        try {
            await executeQuery(
                `DELETE FROM tours_businesses WHERE tour_business_id = ?`,
                [this.tour_business_id]
            );
            return true;
        } catch (error) {
            console.error('Error deleting tour business:', error);
            throw error;
        }
    }
}

module.exports = ToursBusiness;

