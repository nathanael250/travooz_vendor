const { executeQuery } = require('../../../config/database');

class StaysProperty {
    constructor(data = {}) {
        this.property_id = data.property_id || null;
        this.user_id = data.user_id || null;
        this.location = data.location || null;
        this.location_data = data.location_data || null; // JSON field
        this.property_name = data.property_name || null;
        this.property_type = data.property_type || null;
        this.number_of_rooms = data.number_of_rooms || null;
        this.legal_name = data.legal_name || null;
        this.currency = data.currency || null;
        this.channel_manager = data.channel_manager || 'no';
        this.part_of_chain = data.part_of_chain || 'no';
        this.booking_com_url = data.booking_com_url || null;
        this.status = data.status || 'draft';
        this.is_live = data.is_live !== undefined ? data.is_live : (data.is_live === 1 ? 1 : 0);
        this.setup_complete = data.setup_complete !== undefined ? data.setup_complete : (data.setup_complete === 1 ? 1 : 0);
        this.approved_at = data.approved_at || null;
        this.approved_by = data.approved_by || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        
        // User account fields (from Step 3)
        this.first_name = data.first_name || null;
        this.last_name = data.last_name || null;
        this.phone = data.phone || null;
        this.email = data.email || null;
        this.password = data.password || null;
    }

    async save() {
        try {
            // If location_data is an object, stringify it
            const locationDataJson = this.location_data 
                ? (typeof this.location_data === 'string' ? this.location_data : JSON.stringify(this.location_data))
                : null;

            const result = await executeQuery(
                `INSERT INTO stays_properties (
                    user_id, location, location_data, property_name, property_type,
                    number_of_rooms, legal_name, currency, channel_manager,
                    part_of_chain, booking_com_url, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    this.user_id,
                    this.location,
                    locationDataJson,
                    this.property_name,
                    this.property_type,
                    this.number_of_rooms,
                    this.legal_name,
                    this.currency,
                    this.channel_manager,
                    this.part_of_chain,
                    this.booking_com_url,
                    this.status
                ]
            );

            this.property_id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving property:', error);
            throw error;
        }
    }

    async update() {
        try {
            const locationDataJson = this.location_data 
                ? (typeof this.location_data === 'string' ? this.location_data : JSON.stringify(this.location_data))
                : null;

            await executeQuery(
                `UPDATE stays_properties SET
                    location = ?, location_data = ?, property_name = ?,
                    property_type = ?, number_of_rooms = ?, legal_name = ?,
                    currency = ?, channel_manager = ?, part_of_chain = ?,
                    booking_com_url = ?, status = ?
                WHERE property_id = ?`,
                [
                    this.location,
                    locationDataJson,
                    this.property_name,
                    this.property_type,
                    this.number_of_rooms,
                    this.legal_name,
                    this.currency,
                    this.channel_manager,
                    this.part_of_chain,
                    this.booking_com_url,
                    this.status,
                    this.property_id
                ]
            );

            return this;
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    static async findById(propertyId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM stays_properties WHERE property_id = ?`,
                [propertyId]
            );
            return results.length > 0 ? new StaysProperty(results[0]) : null;
        } catch (error) {
            console.error('Error finding property:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM stays_properties WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );
            return results.map(row => new StaysProperty(row));
        } catch (error) {
            console.error('Error finding properties by user:', error);
            throw error;
        }
    }

    static async findAll(filters = {}) {
        try {
            let query = `SELECT * FROM stays_properties WHERE 1=1`;
            const params = [];

            if (filters.status) {
                query += ` AND status = ?`;
                params.push(filters.status);
            }

            if (filters.property_type) {
                query += ` AND property_type = ?`;
                params.push(filters.property_type);
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
            return results.map(row => new StaysProperty(row));
        } catch (error) {
            console.error('Error finding properties:', error);
            throw error;
        }
    }

    async delete() {
        try {
            await executeQuery(
                `DELETE FROM stays_properties WHERE property_id = ?`,
                [this.property_id]
            );
            return true;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }
}

module.exports = StaysProperty;

