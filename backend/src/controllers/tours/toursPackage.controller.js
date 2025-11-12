const toursPackageService = require('../../services/tours/toursPackage.service');

// Helper function to convert undefined to null recursively
const cleanData = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
        return obj.map(item => cleanData(item));
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            if (obj[key] === undefined) {
                cleaned[key] = null;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                cleaned[key] = cleanData(obj[key]);
            } else {
                cleaned[key] = obj[key];
            }
        }
        return cleaned;
    }
    return obj;
};

class ToursPackageController {
    /**
     * Create or update tour package
     * POST /tours/packages
     * PUT /tours/packages/:id
     */
    async savePackage(req, res) {
        try {
            // Get packageId from URL params or request body (like stays system)
            const packageId = req.params?.packageId || req.body?.packageId || null;
            
            // Extract packageId from body if present, pass the rest to service (like stays pattern)
            const { packageId: bodyPackageId, ...packageData } = req.body;

            // Get tour_business_id from user's business or from request
            let tourBusinessId = packageData.tour_business_id || packageData.tourBusinessId;
            
            if (!tourBusinessId && req.user) {
                // Try to get user's business
                const { executeQuery } = require('../../../config/database');
                const businesses = await executeQuery(
                    'SELECT tour_business_id FROM tours_businesses WHERE user_id = ? LIMIT 1',
                    [req.user.user_id || req.user.id]
                );
                if (businesses.length > 0) {
                    tourBusinessId = businesses[0].tour_business_id;
                }
            }

            if (!tourBusinessId) {
                return res.status(400).json({
                    success: false,
                    message: 'Tour business ID is required. Please ensure you have a tour business set up.'
                });
            }

            // Validate required fields for new packages
            if (!packageId && !packageData.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Package name is required'
                });
            }

            // Add tour_business_id to packageData (like stays adds propertyId)
            packageData.tour_business_id = tourBusinessId;

            // Clean undefined values (like stays system does)
            const cleanedData = cleanData(packageData);
            
            // Pass data directly to service (like stays system does)
            const savedPackage = await toursPackageService.savePackage(cleanedData, packageId);

            res.json({
                success: true,
                message: packageId ? 'Package updated successfully' : 'Package created successfully',
                data: savedPackage
            });
        } catch (error) {
            console.error('❌ Error saving package:', error);
            console.error('❌ Error stack:', error.stack);
            res.status(400).json({
                success: false,
                message: error.message || 'Error saving package',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Get package by ID
     * GET /tours/packages/:id
     */
    async getPackage(req, res) {
        try {
            const { id } = req.params;
            const packageData = await toursPackageService.getPackageWithRelations(id);

            if (!packageData) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            res.json({
                success: true,
                data: packageData
            });
        } catch (error) {
            console.error('Error getting package:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error getting package'
            });
        }
    }

    /**
     * Get all packages for a business
     * GET /tours/packages/business/:businessId
     */
    async getPackagesByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const packages = await toursPackageService.getPackagesByBusinessId(businessId);

            res.json({
                success: true,
                data: packages
            });
        } catch (error) {
            console.error('Error getting packages:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error getting packages'
            });
        }
    }

    /**
     * Delete package
     * DELETE /tours/packages/:id
     */
    async deletePackage(req, res) {
        try {
            const { id } = req.params;
            await toursPackageService.deletePackage(id);

            res.json({
                success: true,
                message: 'Package deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting package:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error deleting package'
            });
        }
    }
}

module.exports = new ToursPackageController();

