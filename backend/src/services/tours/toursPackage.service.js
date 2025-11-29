const ToursPackage = require('../../models/tours/toursPackage.model');
const { executeQuery } = require('../../../config/database');
const toursCommissionService = require('./toursCommission.service');

class ToursPackageService {
    /**
     * Ensure tour_package_images table exists
     */
    async ensureTourPackageImagesTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS tour_package_images (
                    image_id INT AUTO_INCREMENT PRIMARY KEY,
                    package_id INT NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    image_name VARCHAR(255) DEFAULT NULL,
                    image_size INT DEFAULT NULL,
                    image_type VARCHAR(100) DEFAULT NULL,
                    display_order INT DEFAULT 0,
                    is_primary TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_package_id (package_id),
                    INDEX idx_display_order (display_order),
                    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ tour_package_images table ensured');
        } catch (error) {
            console.error('❌ Error ensuring tour_package_images table:', error);
            // Don't throw - table might already exist with different structure
        }
    }

    /**
     * Ensure price_per_person column exists in tours_packages table
     */
    async ensurePricePerPersonColumn() {
        try {
            // Check if column exists
            const columns = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tours_packages' 
                AND COLUMN_NAME = 'price_per_person'
            `);
            
            if (columns.length === 0) {
                // Add the column
                await executeQuery(`
                    ALTER TABLE tours_packages 
                    ADD COLUMN price_per_person DECIMAL(10,2) DEFAULT NULL 
                    AFTER pricing_type
                `);
                console.log('✅ Added price_per_person column to tours_packages table');
            }
        } catch (error) {
            console.error('❌ Error ensuring price_per_person column:', error);
            // Don't throw - column might already exist
        }
    }
    /**
     * Save or update tour package with all related data
     * Follows the same pattern as stays system - receives data from controller and handles transformation
     */
    async savePackage(packageData, packageId = null) {
        try {
            // Ensure price_per_person column exists
            await this.ensurePricePerPersonColumn();
            
            // Transform frontend camelCase to database snake_case (like stays system does)
            const transformedData = {
                tour_business_id: packageData.tour_business_id,
                // Step 1: Basic Informations
                name: packageData.name,
                category: packageData.category,
                short_description: packageData.shortDescription || packageData.short_description,
                full_description: packageData.fullDescription || packageData.full_description,
                // Step 2: Inclusions
                whats_included: packageData.whatsIncluded || packageData.whats_included,
                whats_not_included: packageData.whatsNotIncluded || packageData.whats_not_included,
                guide_type: packageData.guideType || packageData.guide_type,
                guide_language: packageData.guideLanguage || packageData.guide_language,
                food_included: packageData.foodIncluded || packageData.food_included || false,
                drinks_included: packageData.drinksIncluded || packageData.drinks_included || false,
                show_dietary_restrictions: packageData.showDietaryRestrictions || packageData.show_dietary_restrictions || false,
                transportation_used: packageData.transportationUsed || packageData.transportation_used || false,
                travel_to_different_city: packageData.travelToDifferentCity || packageData.travel_to_different_city || false,
                // Step 3: Extra Information
                pet_policy: packageData.petPolicy || packageData.pet_policy || false,
                pet_policy_details: packageData.petPolicyDetails || packageData.pet_policy_details,
                know_before_you_go: packageData.knowBeforeYouGo || packageData.know_before_you_go,
                emergency_country_code: packageData.emergencyCountryCode || packageData.emergency_country_code,
                emergency_phone: packageData.emergencyPhone || packageData.emergency_phone,
                voucher_information: packageData.voucherInformation || packageData.voucher_information,
                // Step 5: Options
                option_reference_code: packageData.optionReferenceCode || packageData.option_reference_code,
                max_group_size: packageData.maxGroupSize || packageData.max_group_size,
                guide_materials: packageData.guideMaterials || packageData.guide_materials || false,
                is_private_activity: packageData.isPrivateActivity || packageData.is_private_activity || false,
                skip_the_line: packageData.skipTheLine || packageData.skip_the_line || false,
                skip_the_line_type: packageData.skipTheLineType || packageData.skip_the_line_type,
                wheelchair_accessible: packageData.wheelchairAccessible || packageData.wheelchair_accessible || false,
                duration_type: packageData.durationType || packageData.duration_type,
                duration_value: packageData.durationValue || packageData.duration_value,
                customer_arrival_type: packageData.customerArrivalType || packageData.customer_arrival_type,
                pickup_type: packageData.pickupType || packageData.pickup_type,
                pickup_timing: packageData.pickupTiming || packageData.pickup_timing,
                pickup_confirmation: packageData.pickupConfirmation || packageData.pickup_confirmation,
                pickup_time: packageData.pickupTime || packageData.pickup_time,
                pickup_description: packageData.pickupDescription || packageData.pickup_description,
                drop_off_type: packageData.dropOffType || packageData.drop_off_type,
                pickup_transportation: packageData.pickupTransportation || packageData.pickup_transportation,
                availability_type: packageData.availabilityType || packageData.availability_type,
                pricing_type: packageData.pricingType || packageData.pricing_type,
                price_per_person: (packageData.pricePerPerson !== undefined && packageData.pricePerPerson !== null && packageData.pricePerPerson !== '') 
                    ? packageData.pricePerPerson 
                    : (packageData.price_per_person !== undefined && packageData.price_per_person !== null && packageData.price_per_person !== '') 
                        ? packageData.price_per_person 
                        : undefined, // Use undefined to indicate "not provided" - will preserve existing value in update
                // New packages created by vendors default to 'pending_review' - require admin approval before going live
                status: packageData.status || (packageId ? undefined : 'pending_review')
            };

            let packageRecord;

            if (packageId) {
                // Try to find existing package
                packageRecord = await ToursPackage.findById(packageId);
                if (!packageRecord) {
                    // Package not found - create new one
                    console.log(`⚠️ Package with ID ${packageId} not found. Creating new package.`);
                    packageRecord = new ToursPackage(transformedData);
                    await packageRecord.save();
                } else {
                    // Verify the package belongs to the same business
                    if (packageRecord.tour_business_id !== transformedData.tour_business_id) {
                        console.log(`⚠️ Package ${packageId} belongs to different business. Updating anyway.`);
                    }
                    // Update existing package
                    // Preserve price_per_person if not provided in update
                    if (transformedData.price_per_person === undefined) {
                        transformedData.price_per_person = packageRecord.price_per_person;
                    }
                    // Preserve status if not provided in update (don't change status unless explicitly set)
                    if (transformedData.status === undefined) {
                        transformedData.status = packageRecord.status;
                    }
                    Object.assign(packageRecord, transformedData);
                    await packageRecord.update();
                }
            } else {
                // Create new package
                packageRecord = new ToursPackage(transformedData);
                await packageRecord.save();
            }

            const pkgId = packageRecord.package_id;

            // Save related data (arrays and nested objects) - handle both camelCase and snake_case
            // Step 1: Basic Informations related data
            if (packageData.highlights) {
                await this.saveHighlights(pkgId, packageData.highlights);
            }
            if (packageData.locations) {
                await this.saveLocations(pkgId, packageData.locations);
            }
            if (packageData.tags) {
                await this.saveTags(pkgId, packageData.tags);
            }

            // Step 2: Inclusions related data
            if (packageData.meals) {
                await this.saveMeals(pkgId, packageData.meals);
            }
            if (packageData.dietaryRestrictions || packageData.dietary_restrictions) {
                await this.saveDietaryRestrictions(pkgId, packageData.dietaryRestrictions || packageData.dietary_restrictions);
            }
            if (packageData.transportationTypes || packageData.transportation_types) {
                await this.saveTransportationTypes(pkgId, packageData.transportationTypes || packageData.transportation_types);
            }

            // Step 3: Extra Information related data
            if (packageData.notSuitableFor || packageData.not_suitable_for) {
                await this.saveNotSuitable(pkgId, packageData.notSuitableFor || packageData.not_suitable_for);
            }
            if (packageData.notAllowed || packageData.not_allowed) {
                await this.saveNotAllowed(pkgId, packageData.notAllowed || packageData.not_allowed);
            }
            if (packageData.mandatoryItems || packageData.mandatory_items) {
                await this.saveMandatoryItems(pkgId, packageData.mandatoryItems || packageData.mandatory_items);
            }

            // Step 4: Photos
            // Only save photos if the photos field is explicitly provided
            // If photos field is undefined, preserve existing photos
            if (packageData.photos !== undefined) {
                await this.savePhotos(pkgId, packageData.photos);
            } else {
                console.log('📸 Photos field not provided - preserving existing photos');
            }

            // Step 5: Options related data
            if (packageData.languages) {
                await this.saveLanguages(pkgId, packageData.languages);
            }
            if (packageData.guideMaterials || packageData.guide_materials) {
                const guideMaterials = packageData.guideMaterials || packageData.guide_materials;
                // Handle both array format and object format
                if (Array.isArray(guideMaterials)) {
                    await this.saveGuideMaterials(pkgId, guideMaterials);
                } else if (packageData.guideMaterialsTypes) {
                    // Transform from separate arrays to object array
                    const materials = packageData.guideMaterialsTypes.map((type, index) => ({
                        type,
                        language: packageData.guideMaterialsLanguages?.[index] || null
                    }));
                    await this.saveGuideMaterials(pkgId, materials);
                }
            }

            // Step 5: Availability & Pricing
            if (packageData.schedules && packageData.schedules.length > 0) {
                await this.saveSchedules(pkgId, packageData.schedules);
            } else if (packageData.availabilityType || packageData.pricingType || packageData.pricingCategory || 
                       packageData.scheduleName || packageData.schedule_name || 
                       packageData.scheduleStartDate || packageData.schedule_start_date || 
                       packageData.weeklySchedule || packageData.weekly_schedule ||
                       (packageData.pricingTiers && packageData.pricingTiers.length > 0) ||
                       packageData.minParticipants || packageData.maxParticipants) {
                // Handle single schedule from form - check if schedule already exists for this package
                // First, check if there's an existing schedule for this package
                const existingSchedules = await executeQuery(
                    'SELECT schedule_id FROM tours_package_schedules WHERE package_id = ? LIMIT 1',
                    [pkgId]
                );
                
                // Format dates to YYYY-MM-DD format before creating schedule
                const scheduleStartDate = this.formatDateForDB(packageData.scheduleStartDate || packageData.schedule_start_date);
                const scheduleEndDate = this.formatDateForDB(packageData.scheduleEndDate || packageData.schedule_end_date);
                
                const schedule = {
                    // If schedule exists, use its ID to update instead of creating new
                    schedule_id: existingSchedules.length > 0 ? existingSchedules[0].schedule_id : null,
                    schedule_name: packageData.scheduleName || packageData.schedule_name || 'Default Schedule',
                    start_date: scheduleStartDate,
                    has_end_date: packageData.scheduleHasEndDate || packageData.schedule_has_end_date || false,
                    end_date: scheduleEndDate,
                    weeklySchedule: packageData.weeklySchedule || packageData.weekly_schedule || {},
                    exceptions: packageData.scheduleExceptions || packageData.schedule_exceptions || [],
                    // Include pricing category
                    pricingCategories: packageData.pricingCategory ? [{
                        category_type: packageData.pricingCategory,
                        type: packageData.pricingCategory
                    }] : [],
                    // Include capacity data
                    capacity: (packageData.minParticipants || packageData.maxParticipants) ? {
                        min_participants: packageData.minParticipants ? parseInt(packageData.minParticipants) : null,
                        max_participants: packageData.maxParticipants ? parseInt(packageData.maxParticipants) : null,
                        exceptions_share_capacity: packageData.exceptionsShareCapacity !== undefined ? packageData.exceptionsShareCapacity : true
                    } : null,
                    // Include pricing tiers
                    pricingTiers: packageData.pricingTiers || packageData.pricing_tiers || []
                };
                
                console.log('📅 Schedule data to save:', {
                    schedule_name: schedule.schedule_name,
                    has_pricing_tiers: !!(schedule.pricingTiers && schedule.pricingTiers.length > 0),
                    pricing_tiers_count: schedule.pricingTiers ? schedule.pricingTiers.length : 0,
                    pricing_tiers_sample: schedule.pricingTiers && schedule.pricingTiers.length > 0 ? schedule.pricingTiers[0] : null
                });
                
                await this.saveSchedules(pkgId, [schedule]);
            }

            return await this.getPackageWithRelations(pkgId);
        } catch (error) {
            console.error('Error saving tour package:', error);
            throw error;
        }
    }

    /**
     * Get package with all related data
     */
    async getPackageWithRelations(packageId) {
        try {
            const packageRecord = await ToursPackage.findById(packageId);
            if (!packageRecord) {
                return null;
            }

            const result = { ...packageRecord };

            // Load Step 1 data
            result.highlights = await this.getHighlights(packageId);
            result.locations = await this.getLocations(packageId);
            result.tags = await this.getTags(packageId);

            // Load Step 2 data
            result.meals = await this.getMeals(packageId);
            result.dietaryRestrictions = await this.getDietaryRestrictions(packageId);
            result.transportationTypes = await this.getTransportationTypes(packageId);

            // Load Step 3 data
            result.notSuitableFor = await this.getNotSuitable(packageId);
            result.notAllowed = await this.getNotAllowed(packageId);
            result.mandatoryItems = await this.getMandatoryItems(packageId);

            // Load Step 4 data
            result.photos = await this.getPhotos(packageId);

            // Load Step 5 data
            result.languages = await this.getLanguages(packageId);
            result.guideMaterials = await this.getGuideMaterials(packageId);
            result.schedules = await this.getSchedules(packageId);

            return result;
        } catch (error) {
            console.error('Error getting package with relations:', error);
            throw error;
        }
    }

    // Step 1: Highlights
    async saveHighlights(packageId, highlights) {
        await executeQuery('DELETE FROM tours_package_highlights WHERE package_id = ?', [packageId]);
        if (highlights && highlights.length > 0) {
            const values = highlights
                .filter(h => h && h.trim())
                .map((h, index) => [packageId, h.trim(), index]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_highlights (package_id, highlight_text, display_order) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getHighlights(packageId) {
        const results = await executeQuery(
            'SELECT highlight_text FROM tours_package_highlights WHERE package_id = ? ORDER BY display_order',
            [packageId]
        );
        return results.map(r => r.highlight_text);
    }

    // Step 1: Locations
    async saveLocations(packageId, locations) {
        await executeQuery('DELETE FROM tours_package_locations WHERE package_id = ?', [packageId]);
        if (locations && locations.length > 0) {
            for (let i = 0; i < locations.length; i++) {
                const loc = locations[i];
                const locationData = typeof loc === 'string' 
                    ? { location_name: loc }
                    : loc;
                await executeQuery(
                    `INSERT INTO tours_package_locations 
                    (package_id, location_name, formatted_address, place_id, latitude, longitude, address_components, display_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        packageId,
                        locationData.location_name || locationData.name || locationData,
                        locationData.formatted_address || null,
                        locationData.place_id || null,
                        locationData.latitude || null,
                        locationData.longitude || null,
                        locationData.address_components ? JSON.stringify(locationData.address_components) : null,
                        i
                    ]
                );
            }
        }
    }

    async getLocations(packageId) {
        const results = await executeQuery(
            'SELECT * FROM tours_package_locations WHERE package_id = ? ORDER BY display_order',
            [packageId]
        );
        return results.map(r => {
            let addressComponents = null;
            if (r.address_components) {
                try {
                    // Handle both string and already parsed JSON
                    if (typeof r.address_components === 'string') {
                        const trimmed = r.address_components.trim();
                        if (trimmed && trimmed !== 'null' && trimmed !== '') {
                            addressComponents = JSON.parse(trimmed);
                        }
                    } else {
                        addressComponents = r.address_components;
                    }
                } catch (error) {
                    console.warn('Error parsing address_components JSON:', error);
                    addressComponents = null;
                }
            }
            return {
                location_name: r.location_name,
                formatted_address: r.formatted_address,
                place_id: r.place_id,
                latitude: r.latitude,
                longitude: r.longitude,
                address_components: addressComponents
            };
        });
    }

    // Step 1: Tags
    async saveTags(packageId, tags) {
        await executeQuery('DELETE FROM tours_package_tags WHERE package_id = ?', [packageId]);
        if (tags && tags.length > 0) {
            const values = tags
                .filter(t => t && t.trim())
                .map((t, index) => [packageId, t.trim(), index]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_tags (package_id, tag_name, display_order) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getTags(packageId) {
        const results = await executeQuery(
            'SELECT tag_name FROM tours_package_tags WHERE package_id = ? ORDER BY display_order',
            [packageId]
        );
        return results.map(r => r.tag_name);
    }

    // Step 2: Meals
    async saveMeals(packageId, meals) {
        await executeQuery('DELETE FROM tours_package_meals WHERE package_id = ?', [packageId]);
        if (meals && meals.length > 0) {
            const values = meals
                .filter(m => m && (m.type || m.meal_type))
                .map((m, index) => [
                    packageId,
                    m.type || m.meal_type || null,
                    m.format || m.meal_format || null,
                    index
                ]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_meals (package_id, meal_type, meal_format, display_order) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getMeals(packageId) {
        const results = await executeQuery(
            'SELECT meal_type as type, meal_format as format FROM tours_package_meals WHERE package_id = ? ORDER BY display_order',
            [packageId]
        );
        return results;
    }

    // Step 2: Dietary Restrictions
    async saveDietaryRestrictions(packageId, restrictions) {
        await executeQuery('DELETE FROM tours_package_dietary_restrictions WHERE package_id = ?', [packageId]);
        if (restrictions && restrictions.length > 0) {
            const values = restrictions
                .filter(r => r && r.trim())
                .map(r => [packageId, r.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_dietary_restrictions (package_id, restriction_name) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getDietaryRestrictions(packageId) {
        const results = await executeQuery(
            'SELECT restriction_name FROM tours_package_dietary_restrictions WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.restriction_name);
    }

    // Step 2: Transportation Types
    async saveTransportationTypes(packageId, types) {
        await executeQuery('DELETE FROM tours_package_transportation_types WHERE package_id = ?', [packageId]);
        if (types && types.length > 0) {
            const values = types
                .filter(t => t && t.trim())
                .map(t => [packageId, t.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_transportation_types (package_id, transportation_type) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getTransportationTypes(packageId) {
        const results = await executeQuery(
            'SELECT transportation_type FROM tours_package_transportation_types WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.transportation_type);
    }

    // Step 3: Not Suitable For
    async saveNotSuitable(packageId, restrictions) {
        await executeQuery('DELETE FROM tours_package_not_suitable WHERE package_id = ?', [packageId]);
        if (restrictions && restrictions.length > 0) {
            const values = restrictions
                .filter(r => r && r.trim())
                .map(r => [packageId, r.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_not_suitable (package_id, restriction_name) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getNotSuitable(packageId) {
        const results = await executeQuery(
            'SELECT restriction_name FROM tours_package_not_suitable WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.restriction_name);
    }

    // Step 3: Not Allowed
    async saveNotAllowed(packageId, items) {
        await executeQuery('DELETE FROM tours_package_not_allowed WHERE package_id = ?', [packageId]);
        if (items && items.length > 0) {
            const values = items
                .filter(i => i && i.trim())
                .map(i => [packageId, i.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_not_allowed (package_id, item_name) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getNotAllowed(packageId) {
        const results = await executeQuery(
            'SELECT item_name FROM tours_package_not_allowed WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.item_name);
    }

    // Step 3: Mandatory Items
    async saveMandatoryItems(packageId, items) {
        await executeQuery('DELETE FROM tours_package_mandatory_items WHERE package_id = ?', [packageId]);
        if (items && items.length > 0) {
            const values = items
                .filter(i => i && i.trim())
                .map(i => [packageId, i.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_mandatory_items (package_id, item_name) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getMandatoryItems(packageId) {
        const results = await executeQuery(
            'SELECT item_name FROM tours_package_mandatory_items WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.item_name);
    }

    // Step 4: Photos
    async savePhotos(packageId, photos) {
        console.log(`📸 savePhotos called for package ${packageId} with ${photos ? photos.length : 0} photos`);
        
        // Ensure table exists
        await this.ensureTourPackageImagesTable();
        
        await executeQuery('DELETE FROM tour_package_images WHERE package_id = ?', [packageId]);
        if (photos && photos.length > 0) {
            let savedCount = 0;
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                
                // Handle different photo formats
                let photoUrl = null;
                let photoName = null;
                let photoSize = null;
                let photoType = null;
                let displayOrder = i;
                let isPrimary = i === 0 ? 1 : 0;
                
                if (typeof photo === 'string') {
                    // Direct URL string (file path or URL)
                    photoUrl = photo;
                    console.log(`📷 Photo ${i}: String format - ${photo}`);
                } else if (photo && typeof photo === 'object') {
                    // Object with photo data (from multer or existing photos)
                    photoUrl = photo.photo_url || photo.url || photo.image_url || photo.imageUrl || photo.photoUrl || null;
                    photoName = photo.photo_name || photo.name || photo.fileName || photo.file_name || photo.originalname || null;
                    photoSize = photo.photo_size || photo.size || photo.fileSize || photo.file_size || null;
                    photoType = photo.photo_type || photo.type || photo.fileType || photo.file_type || photo.mimeType || photo.mime_type || null;
                    displayOrder = photo.display_order !== undefined ? photo.display_order : i;
                    isPrimary = photo.is_primary !== undefined ? photo.is_primary : (i === 0 ? 1 : 0);
                    
                    console.log(`📷 Photo ${i}: Object format`, {
                        photoUrl,
                        photoName,
                        photoSize,
                        photoType,
                        displayOrder,
                        isPrimary
                    });
                } else {
                    console.warn(`⚠️ Photo at index ${i} has unexpected format:`, typeof photo, photo);
                    continue;
                }
                
                // Only save if we have a valid file path or URL
                // Accept: file paths starting with /uploads/, http/https URLs, or relative paths
                if (photoUrl && 
                    photoUrl !== '{}' && 
                    photoUrl !== 'null' && 
                    photoUrl !== 'undefined' &&
                    photoUrl.trim() !== '' &&
                    (photoUrl.startsWith('/uploads/') || 
                     photoUrl.startsWith('http://') || 
                     photoUrl.startsWith('https://') ||
                     photoUrl.startsWith('uploads/'))) {
                    try {
                        await executeQuery(
                            `INSERT INTO tour_package_images 
                            (package_id, image_url, image_name, image_size, image_type, display_order, is_primary)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                packageId,
                                photoUrl,
                                photoName,
                                photoSize,
                                photoType,
                                displayOrder,
                                isPrimary
                            ]
                        );
                        savedCount++;
                        console.log(`✅ Saved photo ${i} for package ${packageId}: ${photoUrl}`);
                    } catch (error) {
                        console.error(`❌ Error saving photo ${i} for package ${packageId}:`, error);
                    }
                } else {
                    console.warn(`⚠️ Skipping photo at index ${i} - invalid file path. PhotoUrl:`, photoUrl);
                }
            }
            console.log(`📸 savePhotos completed: ${savedCount} photos saved out of ${photos.length} for package ${packageId}`);
        } else {
            console.log(`📸 No photos to save for package ${packageId}`);
        }
    }

    async getPhotos(packageId) {
        // Ensure table exists
        await this.ensureTourPackageImagesTable();
        
        const results = await executeQuery(
            `SELECT 
                image_id as photo_id,
                package_id,
                image_url as photo_url,
                image_name as photo_name,
                image_size as photo_size,
                image_type as photo_type,
                display_order,
                is_primary,
                created_at
             FROM tour_package_images WHERE package_id = ? ORDER BY display_order`,
            [packageId]
        );
        return results;
    }

    // Step 5: Languages
    async saveLanguages(packageId, languages) {
        await executeQuery('DELETE FROM tours_package_languages WHERE package_id = ?', [packageId]);
        if (languages && languages.length > 0) {
            const values = languages
                .filter(l => l && l.trim())
                .map(l => [packageId, l.trim()]);
            if (values.length > 0) {
                await executeQuery(
                    'INSERT INTO tours_package_languages (package_id, language_name) VALUES ?',
                    [values]
                );
            }
        }
    }

    async getLanguages(packageId) {
        const results = await executeQuery(
            'SELECT language_name FROM tours_package_languages WHERE package_id = ?',
            [packageId]
        );
        return results.map(r => r.language_name);
    }

    // Step 5: Guide Materials
    async saveGuideMaterials(packageId, materials) {
        await executeQuery('DELETE FROM tours_package_guide_materials WHERE package_id = ?', [packageId]);
        if (materials && materials.length > 0) {
            const values = materials.map(m => [
                packageId,
                m.material_type || m.type || null,
                m.language_name || m.language || null
            ]);
            await executeQuery(
                'INSERT INTO tours_package_guide_materials (package_id, material_type, language_name) VALUES ?',
                [values]
            );
        }
    }

    async getGuideMaterials(packageId) {
        const results = await executeQuery(
            'SELECT material_type as type, language_name as language FROM tours_package_guide_materials WHERE package_id = ?',
            [packageId]
        );
        return results;
    }

    // Helper function to convert ISO datetime string to DATE format (YYYY-MM-DD)
    formatDateForDB(dateValue) {
        if (!dateValue) return null;
        // If it's already a date string in YYYY-MM-DD format, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        // If it's an ISO datetime string, extract just the date part
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0];
        }
        // If it's a Date object, format it
        if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0];
        }
        return null;
    }

    // Step 5: Schedules (simplified - full implementation would handle all schedule data)
    async saveSchedules(packageId, schedules) {
        if (schedules && schedules.length > 0) {
            for (const schedule of schedules) {
                let scheduleId = schedule.schedule_id;
                
                // Format dates to YYYY-MM-DD format
                const startDate = this.formatDateForDB(schedule.start_date);
                const endDate = this.formatDateForDB(schedule.end_date);
                
                if (!scheduleId) {
                    // Create new schedule - ensure schedule_name is not null
                    const scheduleName = schedule.schedule_name || schedule.name || 'Default Schedule';
                    const result = await executeQuery(
                        `INSERT INTO tours_package_schedules 
                        (package_id, schedule_name, start_date, has_end_date, end_date)
                        VALUES (?, ?, ?, ?, ?)`,
                        [
                            packageId,
                            scheduleName,
                            startDate,
                            schedule.has_end_date ? 1 : 0,
                            endDate
                        ]
                    );
                    scheduleId = result.insertId;
                } else {
                    // Update existing schedule
                    await executeQuery(
                        `UPDATE tours_package_schedules SET
                        schedule_name = ?, start_date = ?, has_end_date = ?, end_date = ?
                        WHERE schedule_id = ?`,
                        [
                            schedule.schedule_name || schedule.name || null,
                            startDate,
                            schedule.has_end_date ? 1 : 0,
                            endDate,
                            scheduleId
                        ]
                    );
                }

                // Save weekly schedule if provided
                if (schedule.weeklySchedule) {
                    await this.saveWeeklySchedule(scheduleId, schedule.weeklySchedule);
                }

                // Save exceptions if provided
                if (schedule.exceptions) {
                    await this.saveScheduleExceptions(scheduleId, schedule.exceptions);
                }

                // Save pricing categories if provided
                if (schedule.pricingCategories || schedule.pricing_categories) {
                    await this.savePricingCategories(scheduleId, schedule.pricingCategories || schedule.pricing_categories);
                }
                
                // Save pricing tiers if provided (with commission calculation)
                const pricingTiersToSave = schedule.pricingTiers || schedule.pricing_tiers;
                if (pricingTiersToSave && pricingTiersToSave.length > 0) {
                    console.log(`💰 Saving ${pricingTiersToSave.length} pricing tiers for schedule ${scheduleId}:`, pricingTiersToSave);
                    await this.savePricingTiers(scheduleId, pricingTiersToSave);
                } else {
                    console.log(`⚠️ No pricing tiers provided for schedule ${scheduleId}`);
                }
                
                // Save capacity if provided
                if (schedule.capacity) {
                    await this.saveCapacity(scheduleId, schedule.capacity);
                }
                
                // Save add-ons if provided (with commission calculation)
                if (schedule.addons || schedule.add_ons) {
                    await this.saveAddons(scheduleId, schedule.addons || schedule.add_ons);
                }
            }
        }
    }

    async saveWeeklySchedule(scheduleId, weeklySchedule) {
        await executeQuery('DELETE FROM tours_package_weekly_schedule WHERE schedule_id = ?', [scheduleId]);
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of days) {
            if (weeklySchedule[day] && weeklySchedule[day].length > 0) {
                for (let i = 0; i < weeklySchedule[day].length; i++) {
                    const slot = weeklySchedule[day][i];
                    await executeQuery(
                        `INSERT INTO tours_package_weekly_schedule 
                        (schedule_id, day_of_week, start_hour, start_minute, end_hour, end_minute, display_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            scheduleId,
                            day,
                            slot.startHour || '08',
                            slot.startMinute || '00',
                            slot.endHour || '18',
                            slot.endMinute || '00',
                            i
                        ]
                    );
                }
            }
        }
    }

    async saveScheduleExceptions(scheduleId, exceptions) {
        // Delete existing exceptions
        const existing = await executeQuery(
            'SELECT exception_id FROM tours_package_schedule_exceptions WHERE schedule_id = ?',
            [scheduleId]
        );
        for (const ex of existing) {
            await executeQuery('DELETE FROM tours_package_exception_time_slots WHERE exception_id = ?', [ex.exception_id]);
        }
        await executeQuery('DELETE FROM tours_package_schedule_exceptions WHERE schedule_id = ?', [scheduleId]);

        // Insert new exceptions
        for (const exception of exceptions) {
            const exceptionDate = this.formatDateForDB(exception.date || exception.exception_date);
            const result = await executeQuery(
                'INSERT INTO tours_package_schedule_exceptions (schedule_id, exception_date) VALUES (?, ?)',
                [scheduleId, exceptionDate]
            );
            const exceptionId = result.insertId;

            // Save time slots for exception
            if (exception.timeSlots && exception.timeSlots.length > 0) {
                for (let i = 0; i < exception.timeSlots.length; i++) {
                    const slot = exception.timeSlots[i];
                    await executeQuery(
                        `INSERT INTO tours_package_exception_time_slots 
                        (exception_id, start_hour, start_minute, end_hour, end_minute, display_order)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            exceptionId,
                            slot.startHour || '08',
                            slot.startMinute || '00',
                            slot.endHour || '18',
                            slot.endMinute || '00',
                            i
                        ]
                    );
                }
            }
        }
    }

    async getSchedules(packageId) {
        const schedules = await executeQuery(
            'SELECT * FROM tours_package_schedules WHERE package_id = ?',
            [packageId]
        );

        const result = [];
        for (const schedule of schedules) {
            // Get capacity for this schedule
            const capacity = await executeQuery(
                'SELECT * FROM tours_package_capacity WHERE schedule_id = ?',
                [schedule.schedule_id]
            );
            
            // Get pricing categories for this schedule
            const pricingCategories = await executeQuery(
                'SELECT * FROM tours_package_pricing_categories WHERE schedule_id = ?',
                [schedule.schedule_id]
            );
            
            // Get pricing tiers for this schedule
            const pricingTiers = await executeQuery(
                'SELECT * FROM tours_package_pricing_tiers WHERE schedule_id = ? ORDER BY display_order',
                [schedule.schedule_id]
            );
            
            // Get addons for this schedule
            const addons = await this.getAddons(schedule.schedule_id);
            
            const scheduleData = {
                ...schedule,
                has_end_date: Boolean(schedule.has_end_date),
                weeklySchedule: await this.getWeeklySchedule(schedule.schedule_id),
                exceptions: await this.getScheduleExceptions(schedule.schedule_id),
                capacity: capacity.length > 0 ? {
                    min_participants: capacity[0].min_participants,
                    max_participants: capacity[0].max_participants,
                    exceptions_share_capacity: Boolean(capacity[0].exceptions_share_capacity)
                } : null,
                pricingCategories: pricingCategories.map(cat => ({
                    category_type: cat.category_type,
                    type: cat.category_type
                })),
                pricingCategory: pricingCategories.length > 0 ? pricingCategories[0].category_type : null,
                pricingTiers: pricingTiers.map(tier => ({
                    minParticipants: tier.min_participants,
                    maxParticipants: tier.max_participants,
                    customerPays: tier.customer_pays,
                    commissionPercentage: tier.commission_percentage,
                    pricePerParticipant: tier.price_per_participant,
                    currency: tier.currency
                })),
                addons: addons
            };
            result.push(scheduleData);
        }

        return result;
    }

    async getWeeklySchedule(scheduleId) {
        const results = await executeQuery(
            'SELECT * FROM tours_package_weekly_schedule WHERE schedule_id = ? ORDER BY day_of_week, display_order',
            [scheduleId]
        );

        const weeklySchedule = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };

        for (const row of results) {
            weeklySchedule[row.day_of_week].push({
                startHour: row.start_hour,
                startMinute: row.start_minute,
                endHour: row.end_hour,
                endMinute: row.end_minute
            });
        }

        return weeklySchedule;
    }

    async getScheduleExceptions(scheduleId) {
        const exceptions = await executeQuery(
            'SELECT * FROM tours_package_schedule_exceptions WHERE schedule_id = ?',
            [scheduleId]
        );

        const result = [];
        for (const ex of exceptions) {
            const timeSlots = await executeQuery(
                'SELECT * FROM tours_package_exception_time_slots WHERE exception_id = ? ORDER BY display_order',
                [ex.exception_id]
            );

            result.push({
                exception_id: ex.exception_id,
                date: ex.exception_date,
                timeSlots: timeSlots.map(slot => ({
                    startHour: slot.start_hour,
                    startMinute: slot.start_minute,
                    endHour: slot.end_hour,
                    endMinute: slot.end_minute
                }))
            });
        }

        return result;
    }

    // Step 5: Pricing Categories
    async savePricingCategories(scheduleId, pricingCategories) {
        await executeQuery('DELETE FROM tours_package_pricing_categories WHERE schedule_id = ?', [scheduleId]);
        
        if (pricingCategories && pricingCategories.length > 0) {
            for (const category of pricingCategories) {
                await executeQuery(
                    `INSERT INTO tours_package_pricing_categories 
                    (schedule_id, category_type)
                    VALUES (?, ?)`,
                    [
                        scheduleId,
                        category.category_type || category.type || 'same-price'
                    ]
                );
            }
        } else if (pricingCategories && typeof pricingCategories === 'object') {
            // Single category object
            await executeQuery(
                `INSERT INTO tours_package_pricing_categories 
                (schedule_id, category_type)
                VALUES (?, ?)`,
                [
                    scheduleId,
                    pricingCategories.category_type || pricingCategories.type || 'same-price'
                ]
            );
        }
    }

    // Step 5: Pricing Tiers (with commission calculation)
    async savePricingTiers(scheduleId, pricingTiers) {
        console.log(`💰 savePricingTiers called for schedule ${scheduleId} with ${pricingTiers ? pricingTiers.length : 0} tiers`);
        
        if (!scheduleId) {
            console.error('❌ No scheduleId provided to savePricingTiers');
            return;
        }
        
        await executeQuery('DELETE FROM tours_package_pricing_tiers WHERE schedule_id = ?', [scheduleId]);
        
        if (pricingTiers && pricingTiers.length > 0) {
            // Get active commission for calculation
            const commission = await toursCommissionService.getActiveCommission();
            const commissionPercentage = commission ? commission.commission_percentage : 0;
            
            console.log(`💰 Commission info:`, {
                has_commission: !!commission,
                commission_percentage: commissionPercentage,
                commission_structure: commission?.commission_structure
            });
            
            let savedCount = 0;
            for (let i = 0; i < pricingTiers.length; i++) {
                const tier = pricingTiers[i];
                console.log(`💰 Processing tier ${i + 1}:`, tier);
                
                const customerPays = parseFloat(tier.customer_pays || tier.customerPays || tier.price || tier.customerPays || 0);
                
                if (customerPays === 0) {
                    console.warn(`⚠️ Tier ${i + 1} has customer_pays = 0, skipping`);
                    continue;
                }
                
                // Calculate vendor payout using commission
                let vendorPayout = customerPays;
                if (commission && commission.commission_structure === 'percentage') {
                    vendorPayout = customerPays * (1 - commissionPercentage / 100);
                } else if (commission && commission.commission_structure === 'fixed') {
                    vendorPayout = customerPays - (commission.fixed_commission || 0);
                } else if (commission && commission.commission_structure === 'hybrid') {
                    const fixed = commission.fixed_commission || 0;
                    const percentage = customerPays * (commissionPercentage / 100);
                    vendorPayout = customerPays - fixed - percentage;
                }
                
                const minParticipants = tier.min_participants || tier.minParticipants || tier.min || 1;
                const maxParticipants = tier.max_participants || tier.maxParticipants || tier.max || null;
                
                try {
                    await executeQuery(
                        `INSERT INTO tours_package_pricing_tiers 
                        (schedule_id, participant_range, min_participants, max_participants, 
                         customer_pays, commission_percentage, price_per_participant, currency, display_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            scheduleId,
                            tier.participant_range || tier.range || `${minParticipants}-${maxParticipants || 'unlimited'}`,
                            minParticipants,
                            maxParticipants,
                            customerPays,
                            commissionPercentage,
                            vendorPayout, // price_per_participant = vendor payout
                            tier.currency || 'RWF',
                            i
                        ]
                    );
                    savedCount++;
                    console.log(`✅ Saved pricing tier ${i + 1}:`, {
                        schedule_id: scheduleId,
                        min_participants: minParticipants,
                        max_participants: maxParticipants,
                        customer_pays: customerPays,
                        vendor_payout: vendorPayout
                    });
                } catch (error) {
                    console.error(`❌ Error saving pricing tier ${i + 1}:`, error);
                    throw error;
                }
            }
            console.log(`💰 Successfully saved ${savedCount} out of ${pricingTiers.length} pricing tiers for schedule ${scheduleId}`);
        } else {
            console.log(`⚠️ No pricing tiers to save for schedule ${scheduleId}`);
        }
    }

    // Step 5: Capacity
    async saveCapacity(scheduleId, capacity) {
        await executeQuery('DELETE FROM tours_package_capacity WHERE schedule_id = ?', [scheduleId]);
        
        if (capacity) {
            await executeQuery(
                `INSERT INTO tours_package_capacity 
                (schedule_id, min_participants, max_participants, exceptions_share_capacity)
                VALUES (?, ?, ?, ?)`,
                [
                    scheduleId,
                    capacity.min_participants || capacity.minParticipants || null,
                    capacity.max_participants || capacity.maxParticipants || null,
                    capacity.exceptions_share_capacity !== undefined 
                        ? (capacity.exceptions_share_capacity ? 1 : 0) 
                        : 1
                ]
            );
        }
    }

    // Step 5: Add-ons (with commission calculation)
    async saveAddons(scheduleId, addons) {
        await executeQuery('DELETE FROM tours_package_addon_tiers WHERE addon_id IN (SELECT addon_id FROM tours_package_addons WHERE schedule_id = ?)', [scheduleId]);
        await executeQuery('DELETE FROM tours_package_addons WHERE schedule_id = ?', [scheduleId]);
        
        if (addons && addons.length > 0) {
            // Get active commission for calculation
            const commission = await toursCommissionService.getActiveCommission();
            const commissionPercentage = commission ? commission.commission_percentage : 0;
            
            for (let i = 0; i < addons.length; i++) {
                const addon = addons[i];
                const customerPays = parseFloat(addon.customer_pays || addon.customerPays || addon.price || 0);
                
                // Calculate vendor payout using commission
                let vendorPayout = customerPays;
                if (commission && commission.commission_structure === 'percentage') {
                    vendorPayout = customerPays * (1 - commissionPercentage / 100);
                } else if (commission && commission.commission_structure === 'fixed') {
                    vendorPayout = customerPays - (commission.fixed_commission || 0);
                } else if (commission && commission.commission_structure === 'hybrid') {
                    const fixed = commission.fixed_commission || 0;
                    const percentage = customerPays * (commissionPercentage / 100);
                    vendorPayout = customerPays - fixed - percentage;
                }
                
                const addonResult = await executeQuery(
                    `INSERT INTO tours_package_addons 
                    (schedule_id, addon_name, addon_type, description, quantity_range, 
                     min_quantity, max_quantity, customer_pays, commission_percentage, 
                     payout, currency, is_required, display_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        scheduleId,
                        addon.addon_name || addon.name || addon.addonName || null,
                        addon.addon_type || addon.type || null,
                        addon.description || null,
                        addon.quantity_range || addon.quantityRange || null,
                        addon.min_quantity || addon.minQuantity || null,
                        addon.max_quantity || addon.maxQuantity || null,
                        customerPays,
                        commissionPercentage,
                        vendorPayout,
                        addon.currency || 'RWF',
                        addon.is_required || addon.isRequired ? 1 : 0,
                        i
                    ]
                );
                
                const addonId = addonResult.insertId;
                
                // Save addon tiers if provided
                if (addon.tiers && addon.tiers.length > 0) {
                    await this.saveAddonTiers(addonId, addon.tiers, commission);
                }
            }
        }
    }

    // Step 5: Get Add-ons
    async getAddons(scheduleId) {
        const addons = await executeQuery(
            'SELECT * FROM tours_package_addons WHERE schedule_id = ? ORDER BY display_order',
            [scheduleId]
        );

        const result = [];
        for (const addon of addons) {
            // Get tiers for this addon
            const tiers = await executeQuery(
                'SELECT * FROM tours_package_addon_tiers WHERE addon_id = ? ORDER BY display_order',
                [addon.addon_id]
            );

            result.push({
                addon_id: addon.addon_id,
                addon_name: addon.addon_name,
                name: addon.addon_name,
                addon_type: addon.addon_type,
                description: addon.description,
                quantity_range: addon.quantity_range,
                min_quantity: addon.min_quantity,
                max_quantity: addon.max_quantity,
                customer_pays: addon.customer_pays,
                commission_percentage: addon.commission_percentage,
                payout: addon.payout,
                currency: addon.currency || 'RWF',
                is_required: Boolean(addon.is_required),
                tiers: tiers.map(tier => ({
                    tier_id: tier.tier_id,
                    quantity_range: tier.quantity_range,
                    minQuantity: tier.min_quantity,
                    min_quantity: tier.min_quantity,
                    maxQuantity: tier.max_quantity,
                    max_quantity: tier.max_quantity,
                    customerPays: tier.customer_pays,
                    customer_pays: tier.customer_pays,
                    commissionPercentage: tier.commission_percentage,
                    commission_percentage: tier.commission_percentage,
                    payout: tier.payout,
                    currency: tier.currency || 'RWF'
                }))
            });
        }

        return result;
    }

    // Step 5: Add-on Tiers (with commission calculation)
    async saveAddonTiers(addonId, tiers, commission = null) {
        await executeQuery('DELETE FROM tours_package_addon_tiers WHERE addon_id = ?', [addonId]);
        
        if (tiers && tiers.length > 0) {
            if (!commission) {
                commission = await toursCommissionService.getActiveCommission();
            }
            const commissionPercentage = commission ? commission.commission_percentage : 0;
            
            for (let i = 0; i < tiers.length; i++) {
                const tier = tiers[i];
                const customerPays = parseFloat(tier.customer_pays || tier.customerPays || tier.price || 0);
                
                // Calculate vendor payout using commission
                let vendorPayout = customerPays;
                if (commission && commission.commission_structure === 'percentage') {
                    vendorPayout = customerPays * (1 - commissionPercentage / 100);
                } else if (commission && commission.commission_structure === 'fixed') {
                    vendorPayout = customerPays - (commission.fixed_commission || 0);
                } else if (commission && commission.commission_structure === 'hybrid') {
                    const fixed = commission.fixed_commission || 0;
                    const percentage = customerPays * (commissionPercentage / 100);
                    vendorPayout = customerPays - fixed - percentage;
                }
                
                await executeQuery(
                    `INSERT INTO tours_package_addon_tiers 
                    (addon_id, quantity_range, min_quantity, max_quantity, 
                     customer_pays, commission_percentage, payout, currency, display_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        addonId,
                        tier.quantity_range || tier.range || null,
                        tier.min_quantity || tier.minQuantity || null,
                        tier.max_quantity || tier.maxQuantity || null,
                        customerPays,
                        commissionPercentage,
                        vendorPayout,
                        tier.currency || 'RWF',
                        i
                    ]
                );
            }
        }
    }

    /**
     * Get all packages for a business
     */
    async getPackagesByBusinessId(tourBusinessId) {
        try {
            return await ToursPackage.findByBusinessId(tourBusinessId);
        } catch (error) {
            console.error('Error getting packages by business ID:', error);
            throw error;
        }
    }

    /**
     * Delete package
     */
    async deletePackage(packageId) {
        try {
            // Related data will be deleted via CASCADE
            await executeQuery('DELETE FROM tours_packages WHERE package_id = ?', [packageId]);
            return true;
        } catch (error) {
            console.error('Error deleting package:', error);
            throw error;
        }
    }
}

module.exports = new ToursPackageService();

