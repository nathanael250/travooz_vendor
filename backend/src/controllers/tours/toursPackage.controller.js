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
            
            // Parse JSON stringified fields from FormData (multer sends them as strings)
            const parseFormDataField = (value) => {
                if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        return value;
                    }
                }
                return value;
            };
            
            // Parse all fields that might be JSON strings
            Object.keys(packageData).forEach(key => {
                if (key !== 'photos' && key !== 'existingPhotos') {
                    packageData[key] = parseFormDataField(packageData[key]);
                }
            });
            
            // Debug: Log pricing tiers if present
            if (packageData.pricingTiers || packageData.pricing_tiers) {
                const tiers = packageData.pricingTiers || packageData.pricing_tiers;
                console.log('💰 Controller received pricing tiers:', {
                    count: Array.isArray(tiers) ? tiers.length : 'not array',
                    type: typeof tiers,
                    sample: Array.isArray(tiers) && tiers.length > 0 ? tiers[0] : tiers
                });
            } else {
                console.log('⚠️ Controller: No pricing tiers found in packageData');
                console.log('📦 Available keys in packageData:', Object.keys(packageData));
            }

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

            // Handle file uploads - process req.files from multer
            const uploadedPhotos = [];
            if (req.files && req.files.length > 0) {
                console.log(`📸 Received ${req.files.length} photo files from multer`);
                // Convert uploaded files to photo objects with paths
                req.files.forEach((file, index) => {
                    uploadedPhotos.push({
                        photo_url: `/uploads/tours/packages/${file.filename}`,
                        photo_name: file.originalname,
                        photo_size: file.size,
                        photo_type: file.mimetype,
                        display_order: uploadedPhotos.length,
                        is_primary: uploadedPhotos.length === 0 ? 1 : 0
                    });
                });
                console.log('📸 Processed photo files:', uploadedPhotos.map(p => p.photo_url));
            }
            
            // Debug: Log what we received
            console.log('📸 Controller debug:', {
                hasFiles: !!req.files,
                filesCount: req.files ? req.files.length : 0,
                hasExistingPhotos: !!packageData.existingPhotos,
                existingPhotosType: packageData.existingPhotos ? typeof packageData.existingPhotos : 'null',
                hasPhotos: !!packageData.photos,
                photosType: packageData.photos ? typeof packageData.photos : 'null',
                photosIsArray: Array.isArray(packageData.photos),
                photosLength: Array.isArray(packageData.photos) ? packageData.photos.length : 'not array'
            });
            
            // Handle existing photos (if sent separately as JSON string)
            let existingPhotos = [];
            
            // Check existingPhotos field first
            if (packageData.existingPhotos) {
                try {
                    existingPhotos = typeof packageData.existingPhotos === 'string' 
                        ? JSON.parse(packageData.existingPhotos)
                        : packageData.existingPhotos;
                    // Ensure it's an array
                    if (!Array.isArray(existingPhotos)) {
                        existingPhotos = [];
                    }
                    console.log(`📸 Received ${existingPhotos.length} existing photos to preserve from existingPhotos field`);
                } catch (e) {
                    console.warn('⚠️ Error parsing existingPhotos:', e);
                    existingPhotos = [];
                }
            }
            
            // Also check photosArray field (sent from frontend)
            if (packageData.photosArray && existingPhotos.length === 0) {
                try {
                    const photosArray = typeof packageData.photosArray === 'string' 
                        ? JSON.parse(packageData.photosArray)
                        : packageData.photosArray;
                    if (Array.isArray(photosArray)) {
                        existingPhotos = photosArray.filter(p => p && typeof p === 'object' && (p.photo_url || p.image_url));
                        console.log(`📸 Received ${existingPhotos.length} existing photos from photosArray field`);
                    }
                } catch (e) {
                    console.warn('⚠️ Error parsing photosArray:', e);
                }
            }
            
            // Also check if photos array contains non-File objects (existing photos)
            // First, try to parse photos if it's a JSON string from FormData
            if (packageData.photos) {
                if (typeof packageData.photos === 'string') {
                    try {
                        packageData.photos = JSON.parse(packageData.photos);
                        console.log('📸 Parsed photos array from JSON string');
                    } catch (e) {
                        console.warn('⚠️ Error parsing photos array:', e);
                        packageData.photos = [];
                    }
                }
                
                if (Array.isArray(packageData.photos)) {
                    // Separate existing photos (objects with photo_url or image_url) from File objects
                    const photosFromArray = packageData.photos.filter(photo => {
                        // Keep objects with photo_url/image_url (existing photos) or strings (URLs)
                        // Exclude File objects
                        if (photo instanceof File) {
                            return false; // File objects are handled separately
                        }
                        return (photo && typeof photo === 'object' && (photo.photo_url || photo.image_url)) || 
                               (typeof photo === 'string' && (photo.startsWith('/uploads/') || photo.startsWith('http')));
                    });
                    
                    if (photosFromArray.length > 0) {
                        // Convert to consistent format
                        const parsedExisting = photosFromArray.map(photo => {
                            if (typeof photo === 'string') {
                                return { 
                                    photo_url: photo,
                                    photo_name: null,
                                    photo_size: null,
                                    photo_type: null
                                };
                            } else if (photo && typeof photo === 'object') {
                                // Normalize photo_url vs image_url
                                return {
                                    photo_url: photo.photo_url || photo.image_url || photo.url,
                                    photo_name: photo.photo_name || photo.image_name || photo.name || null,
                                    photo_size: photo.photo_size || photo.image_size || photo.size || null,
                                    photo_type: photo.photo_type || photo.image_type || photo.type || null,
                                    display_order: photo.display_order || 0,
                                    is_primary: photo.is_primary || 0
                                };
                            }
                            return null;
                        }).filter(p => p && p.photo_url);
                        
                        // Merge with existingPhotos if we found more
                        if (parsedExisting.length > 0) {
                            existingPhotos = [...existingPhotos, ...parsedExisting];
                            console.log(`📸 Found ${parsedExisting.length} existing photos in photos array (total: ${existingPhotos.length})`);
                        }
                    }
                }
            }
            
            // Merge existing photos with new uploaded photos
            if (uploadedPhotos.length > 0 || existingPhotos.length > 0) {
                // Combine existing photos (with their original display_order) and new photos
                const allPhotos = [...existingPhotos, ...uploadedPhotos];
                // Reorder to ensure proper display_order
                allPhotos.forEach((photo, index) => {
                    if (!photo.display_order) photo.display_order = index;
                    if (photo.is_primary === undefined) photo.is_primary = index === 0 ? 1 : 0;
                });
                packageData.photos = allPhotos;
                console.log(`📸 Total photos to save: ${allPhotos.length} (${existingPhotos.length} existing + ${uploadedPhotos.length} new)`);
            } else {
                // If no photos at all, check if we should clear them or keep existing
                // For updates, if photos field is explicitly empty array, clear photos
                if (packageId && packageData.photos && Array.isArray(packageData.photos) && packageData.photos.length === 0) {
                    console.log('📸 Explicitly clearing all photos for package update');
                    packageData.photos = [];
                } else if (!packageId) {
                    // New package with no photos
                    packageData.photos = [];
                    console.log('📸 No photos provided for new package');
                } else {
                    // Update without photos field - don't touch existing photos
                    console.log('📸 No photos in request - preserving existing photos');
                    delete packageData.photos;
                }
            }
            
            // Remove processed fields from packageData
            delete packageData.existingPhotos;
            delete packageData.photosArray;

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

