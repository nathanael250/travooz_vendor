const { executeQuery } = require('../../../config/database');

class AdminPackagesService {
    /**
     * Get all packages with filters for admin review
     * @param {object} filters - { status, search, page, limit, service_type }
     */
    async getPackages(filters = {}) {
        try {
            const {
                status = 'all',
                search = '',
                page = 1,
                limit = 10,
                service_type = 'all',
                businessId = null
            } = filters;

            let whereConditions = [];
            let queryParams = [];

            // Filter by business ID
            if (businessId) {
                whereConditions.push('tb.tour_business_id = ?');
                queryParams.push(businessId);
            }

            // Filter by status
            if (status !== 'all' && status !== null) {
                whereConditions.push('tp.status = ?');
                queryParams.push(status);
            }

            // Search filter
            if (search) {
                whereConditions.push('(tp.name LIKE ? OR tb.tour_business_name LIKE ? OR tu.name LIKE ?)');
                const searchTerm = `%${search}%`;
                queryParams.push(searchTerm, searchTerm, searchTerm);
            }

            // Service type filter (always tours for now, but keeping for consistency)
            if (service_type !== 'all' && service_type === 'tours') {
                // Already filtering tours packages
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            // Get total count
            const countResult = await executeQuery(
                `SELECT COUNT(*) as total
                 FROM tours_packages tp
                 JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
                 JOIN tours_users tu ON tb.user_id = tu.user_id
                 ${whereClause}`,
                queryParams
            );
            const total = countResult[0]?.total || 0;

            // Get packages with pagination
            const offset = (page - 1) * limit;
            const packages = await executeQuery(
                `SELECT 
                    tp.package_id,
                    tp.name as package_name,
                    tp.status,
                    tp.short_description,
                    tp.price_per_person,
                    tp.created_at,
                    tp.updated_at,
                    tb.tour_business_id,
                    tb.tour_business_name,
                    tb.status as business_status,
                    tu.user_id,
                    tu.name as vendor_name,
                    tu.email as vendor_email
                 FROM tours_packages tp
                 JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
                 JOIN tours_users tu ON tb.user_id = tu.user_id
                 ${whereClause}
                 ORDER BY tp.created_at DESC
                 LIMIT ? OFFSET ?`,
                [...queryParams, limit, offset]
            );

            return {
                packages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting packages:', error);
            throw error;
        }
    }

    /**
     * Get package statistics
     */
    async getPackageStats() {
        try {
            const stats = await executeQuery(
                `SELECT 
                    status,
                    COUNT(*) as count
                 FROM tours_packages
                 GROUP BY status`
            );

            const total = await executeQuery(
                'SELECT COUNT(*) as total FROM tours_packages'
            );

            const byStatus = stats.reduce((acc, stat) => {
                acc[stat.status] = stat.count;
                return acc;
            }, {});

            return {
                byStatus,
                total: total[0]?.total || 0,
                pending_review: byStatus.pending_review || 0,
                active: byStatus.active || 0,
                rejected: byStatus.rejected || 0,
                draft: byStatus.draft || 0
            };
        } catch (error) {
            console.error('Error getting package stats:', error);
            throw error;
        }
    }

    /**
     * Get package details by ID
     */
    async getPackageDetails(packageId) {
        try {
            const packages = await executeQuery(
                `SELECT 
                    tp.*,
                    tb.tour_business_id,
                    tb.tour_business_name,
                    tb.status as business_status,
                    tu.user_id,
                    tu.name as vendor_name,
                    tu.email as vendor_email,
                    tu.phone as vendor_phone
                 FROM tours_packages tp
                 JOIN tours_businesses tb ON tp.tour_business_id = tb.tour_business_id
                 JOIN tours_users tu ON tb.user_id = tu.user_id
                 WHERE tp.package_id = ?`,
                [packageId]
            );

            if (packages.length === 0) {
                return null;
            }

            // Get package images
            const images = await executeQuery(
                `SELECT * FROM tour_package_images WHERE package_id = ? ORDER BY display_order, image_id`,
                [packageId]
            );

            return {
                ...packages[0],
                images
            };
        } catch (error) {
            console.error('Error getting package details:', error);
            throw error;
        }
    }

    /**
     * Approve a package (set status to 'active')
     */
    async approvePackage(packageId, adminId, notes = null) {
        try {
            await executeQuery(
                `UPDATE tours_packages 
                 SET status = 'active', updated_at = NOW()
                 WHERE package_id = ?`,
                [packageId]
            );

            return { success: true, packageId, status: 'active' };
        } catch (error) {
            console.error('Error approving package:', error);
            throw error;
        }
    }

    /**
     * Reject a package (set status to 'rejected')
     */
    async rejectPackage(packageId, adminId, rejectionReason = null, notes = null) {
        try {
            await executeQuery(
                `UPDATE tours_packages 
                 SET status = 'rejected', updated_at = NOW()
                 WHERE package_id = ?`,
                [packageId]
            );

            return { success: true, packageId, status: 'rejected' };
        } catch (error) {
            console.error('Error rejecting package:', error);
            throw error;
        }
    }
}

module.exports = new AdminPackagesService();

