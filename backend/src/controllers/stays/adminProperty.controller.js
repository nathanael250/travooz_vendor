const { executeQuery } = require('../../../config/database');
const { sendSuccess, sendError } = require('../../utils/response.utils');

class AdminPropertyController {
    /**
     * Get all properties for admin review
     * GET /api/v1/admin/stays/properties
     */
    static async getAllProperties(req, res) {
        try {
            const { status, search, page = 1, limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            let query = `
                SELECT 
                    p.*,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone
                FROM stays_properties p
                LEFT JOIN stays_users u ON p.user_id = u.user_id
                WHERE 1=1
            `;
            const params = [];
            
            if (status && status !== 'all') {
                query += ' AND p.status = ?';
                params.push(status);
            }
            // If status is 'all', don't add any status filter - show all properties
            
            if (search) {
                query += ' AND (p.property_name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);
            
            const properties = await executeQuery(query, params);
            
            // Get total count
            let countQuery = `
                SELECT COUNT(*) as total
                FROM stays_properties p
                LEFT JOIN stays_users u ON p.user_id = u.user_id
                WHERE 1=1
            `;
            const countParams = [];
            
            if (status && status !== 'all') {
                countQuery += ' AND p.status = ?';
                countParams.push(status);
            }
            // If status is 'all', don't add any status filter - show all properties
            
            if (search) {
                countQuery += ' AND (p.property_name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }
            
            const [countResult] = await executeQuery(countQuery, countParams);
            const total = countResult[0].total;
            
            return sendSuccess(res, {
                data: properties,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }, 'Properties retrieved successfully');
        } catch (error) {
            console.error('Error fetching properties for admin:', error);
            return sendError(res, error.message || 'Failed to fetch properties', 500);
        }
    }

    /**
     * Get property statistics for admin dashboard
     * GET /api/v1/admin/stays/properties/stats
     */
    static async getPropertyStats(req, res) {
        try {
            const [stats] = await executeQuery(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
                    SUM(CASE WHEN is_live = 1 THEN 1 ELSE 0 END) as live
                FROM stays_properties
            `);
            
            return sendSuccess(res, stats[0], 'Statistics retrieved successfully');
        } catch (error) {
            console.error('Error fetching property stats:', error);
            return sendError(res, error.message || 'Failed to fetch statistics', 500);
        }
    }

    /**
     * Get property details by ID for admin review
     * GET /api/v1/admin/stays/properties/:id
     */
    static async getPropertyById(req, res) {
        try {
            const { id } = req.params;
            
            // Get property with owner info (using stays_users table)
            const [properties] = await executeQuery(`
                SELECT 
                    p.*,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone
                FROM stays_properties p
                LEFT JOIN stays_users u ON p.user_id = u.user_id
                WHERE p.property_id = ?
            `, [id]);
            
            if (properties.length === 0) {
                return sendError(res, 'Property not found', 404);
            }
            
            const property = properties[0];
            
            // Get images
            const [images] = await executeQuery(
                'SELECT * FROM stays_property_images WHERE property_id = ? ORDER BY image_order ASC',
                [id]
            );
            property.images = images;
            
            // Get policies
            const [policies] = await executeQuery(
                'SELECT * FROM stays_property_policies WHERE property_id = ?',
                [id]
            );
            property.policies = policies[0] || null;
            
            // Get amenities
            const [amenities] = await executeQuery(
                'SELECT * FROM stays_property_amenities WHERE property_id = ?',
                [id]
            );
            property.amenities = amenities[0] || null;
            
            // Get rooms
            const [rooms] = await executeQuery(
                'SELECT * FROM stays_rooms WHERE property_id = ?',
                [id]
            );
            property.rooms = rooms;
            
            return sendSuccess(res, property, 'Property details retrieved successfully');
        } catch (error) {
            console.error('Error fetching property details:', error);
            return sendError(res, error.message || 'Failed to fetch property details', 500);
        }
    }

    /**
     * Approve or reject property
     * PATCH /api/v1/admin/stays/properties/:id/status
     */
    static async updatePropertyStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const adminId = req.user?.userId || req.user?.user_id;
            
            // Validate status
            const validStatuses = ['pending', 'approved', 'rejected', 'draft'];
            if (!validStatuses.includes(status)) {
                return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
            }
            
            // Check if property exists
            const [properties] = await executeQuery(
                'SELECT * FROM stays_properties WHERE property_id = ?',
                [id]
            );
            
            if (properties.length === 0) {
                return sendError(res, 'Property not found', 404);
            }
            
            // Update property status
            const updateFields = ['status = ?', 'updated_at = NOW()'];
            const updateParams = [status];
            
            if (status === 'approved') {
                updateFields.push('is_live = 1', 'approved_at = NOW()');
                if (adminId) {
                    updateFields.push('approved_by = ?');
                    updateParams.push(adminId);
                }
            } else if (status === 'rejected') {
                updateFields.push('is_live = 0');
            }
            
            await executeQuery(
                `UPDATE stays_properties SET ${updateFields.join(', ')} WHERE property_id = ?`,
                [...updateParams, id]
            );
            
            return sendSuccess(res, {
                propertyId: id,
                status,
                is_live: status === 'approved' ? 1 : 0
            }, `Property ${status === 'approved' ? 'approved' : status} successfully`);
        } catch (error) {
            console.error('Error updating property status:', error);
            return sendError(res, error.message || 'Failed to update property status', 500);
        }
    }
}

module.exports = AdminPropertyController;

