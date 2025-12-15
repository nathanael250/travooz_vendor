const StaysProperty = require('../../models/stays/staysProperty.model');
const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const EmailVerificationService = require('./emailVerification.service');
const path = require('path');
const fs = require('fs');

const createErrorWithStatus = (message, statusCode) => {
    const error = new Error(message);
    if (statusCode) {
        error.statusCode = statusCode;
    }
    return error;
};

const resolveAbsoluteUploadPath = (imageUrl) => {
    if (!imageUrl) return null;
    const normalizedPath = imageUrl.replace(/^\/+/, '');
    return path.join(__dirname, '../../..', normalizedPath);
};

const removeImageFromDisk = (imageUrl) => {
    try {
        const absolutePath = resolveAbsoluteUploadPath(imageUrl);
        if (absolutePath && fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (error) {
        console.warn('Failed to remove image from disk:', error.message);
    }
};

class StaysPropertyService {
    async createProperty(data) {
        try {
            // Create user account first if user data is provided (Step 3)
            let userId = data.user_id;
            
            const normalizedCountryCode = (data.countryCode || '+250').trim();
            const normalizedPhone = (data.phone || '').replace(/\s+/g, '');
            const userPhone = normalizedPhone
                ? `${normalizedCountryCode.replace(/\s+/g, '')}${normalizedPhone.replace(/^\+/, '')}`
                : null;

            if (!userId && data.email && data.password) {
                // Create new user account
                const hashedPassword = await bcrypt.hash(data.password, 10);
                
                // Combine first_name and last_name into a single name field (matching main users table)
                const fullName = [data.firstName || '', data.lastName || ''].filter(Boolean).join(' ').trim() || data.email.split('@')[0];
                
                // Insert into stays_users table (will be merged with main users table later)
                const userResult = await executeQuery(
                    `INSERT INTO stays_users (
                        role, name, email, phone, password_hash, 
                        address, gender, is_active, email_verified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'vendor',
                        fullName,
                        data.email,
                        userPhone,
                        hashedPassword,
                        null, // address
                        null, // gender
                        1, // is_active
                        0 // email_verified
                    ]
                );
                
                userId = userResult.insertId;
            }

            // Create property
            // Provide default location values if not provided (for demo/testing purposes)
            const defaultLocation = 'Kigali, Rwanda';
            const defaultLocationData = {
                name: 'Kigali, Rwanda',
                formatted_address: 'Kigali, Rwanda',
                place_id: 'demo_kigali_rwanda',
                lat: -1.9441,
                lng: 30.0619,
                address_components: [
                    { long_name: 'Kigali', short_name: 'Kigali', types: ['locality', 'political'] },
                    { long_name: 'Rwanda', short_name: 'RW', types: ['country', 'political'] }
                ]
            };

            // Ensure location_data is always populated
            let finalLocationData = null;
            
            // First, try to use provided locationData
            if (data.locationData) {
                try {
                    // If it's a string, try to parse it
                    if (typeof data.locationData === 'string') {
                        finalLocationData = JSON.parse(data.locationData);
                    } else if (typeof data.locationData === 'object') {
                        finalLocationData = data.locationData;
                    }
                    
                    // Validate that we have meaningful data (at least a name or formatted_address)
                    if (finalLocationData && (finalLocationData.name || finalLocationData.formatted_address)) {
                        console.log('✅ Using provided locationData:', finalLocationData.name || finalLocationData.formatted_address);
                    } else {
                        console.log('⚠️ locationData provided but invalid, will use location string or default');
                        finalLocationData = null;
                    }
                } catch (parseError) {
                    console.error('Error parsing locationData:', parseError);
                    finalLocationData = null;
                }
            }
            
            // If no valid locationData, try to create from location string
            if (!finalLocationData && data.location && data.location.trim()) {
                console.log('📍 Creating locationData from location string:', data.location);
                finalLocationData = {
                    name: data.location.trim(),
                    formatted_address: data.location.trim(),
                    place_id: `manual_${data.location.trim().toLowerCase().replace(/\s+/g, '_')}`,
                    lat: -1.9441, // Default to Kigali coordinates
                    lng: 30.0619,
                    address_components: []
                };
            }
            
            // Only use default if we have nothing else
            if (!finalLocationData) {
                console.log('⚠️ Using default location data');
                finalLocationData = defaultLocationData;
            }

            const property = new StaysProperty({
                user_id: userId,
                location: data.location && data.location.trim() ? data.location : defaultLocation,
                location_data: finalLocationData,
                property_name: data.propertyName,
                property_type: data.propertyType,
                number_of_rooms: data.numberOfRooms,
                legal_name: data.legalName,
                currency: data.currency,
                channel_manager: data.channelManager || 'no',
                part_of_chain: data.partOfChain || 'no',
                booking_com_url: data.bookingComUrl,
                status: 'pending'
            });

            await property.save();
            
            // Send email verification code
            let verificationCode = null;
            try {
                const fullName = [data.firstName || '', data.lastName || ''].filter(Boolean).join(' ').trim() || data.email.split('@')[0];
                const result = await EmailVerificationService.generateAndSendCode(
                    userId,
                    data.email,
                    fullName
                );
                verificationCode = result.code; // Store code for response
                console.log(`✅ Email verification code sent to ${data.email}`);
            } catch (emailError) {
                console.error('❌ Error sending verification email:', emailError.message);
                // Still generate and store code even if email fails
                try {
                    const code = EmailVerificationService.generateCode();
                    await EmailVerificationService.storeVerificationCode(userId, data.email, code);
                    verificationCode = code;
                    console.log(`⚠️  Email failed but code stored. Code: ${code}`);
                } catch (storeError) {
                    console.error('❌ Error storing verification code:', storeError);
                }
            }
            
            // Store verification code in property object for response
            property.verification_code = verificationCode;
            
            return property;
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    async updateProperty(propertyId, data) {
        try {
            const property = await StaysProperty.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            // Update property fields
            if (data.location !== undefined) property.location = data.location;
            if (data.locationData !== undefined) property.location_data = data.locationData;
            if (data.propertyName !== undefined) property.property_name = data.propertyName;
            if (data.propertyType !== undefined) property.property_type = data.propertyType;
            if (data.numberOfRooms !== undefined) property.number_of_rooms = data.numberOfRooms;
            if (data.legalName !== undefined) property.legal_name = data.legalName;
            if (data.currency !== undefined) property.currency = data.currency;
            if (data.channelManager !== undefined) property.channel_manager = data.channelManager;
            if (data.partOfChain !== undefined) property.part_of_chain = data.partOfChain;
            if (data.bookingComUrl !== undefined) property.booking_com_url = data.bookingComUrl;
            if (data.status !== undefined) property.status = data.status;

            await property.update();
            return property;
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    async getPropertyById(propertyId) {
        try {
            const property = await StaysProperty.findById(propertyId);
            return property;
        } catch (error) {
            console.error('Error getting property:', error);
            throw error;
        }
    }

    async getPropertiesByUserId(userId) {
        try {
            const properties = await StaysProperty.findByUserId(userId);
            return properties;
        } catch (error) {
            console.error('Error getting properties by user:', error);
            throw error;
        }
    }

    async getAllProperties(filters = {}) {
        try {
            const properties = await StaysProperty.findAll(filters);
            return properties;
        } catch (error) {
            console.error('Error getting all properties:', error);
            throw error;
        }
    }

    async deleteProperty(propertyId) {
        try {
            const property = await StaysProperty.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            await property.delete();
            return true;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }

    async getPropertyWithAllData(propertyId) {
        try {
            const property = await StaysProperty.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            // Get all related data
            const [images, policies, amenities, rooms, taxDetails, connectivity, promotions] = await Promise.all([
                // Images
                executeQuery(
                    `SELECT * FROM stays_property_images WHERE property_id = ? ORDER BY image_order ASC, is_primary DESC`,
                    [propertyId]
                ),
                // Policies
                executeQuery(
                    `SELECT * FROM stays_property_policies WHERE property_id = ?`,
                    [propertyId]
                ),
                // Amenities
                executeQuery(
                    `SELECT * FROM stays_property_amenities WHERE property_id = ?`,
                    [propertyId]
                ),
                // Rooms with their related data
                executeQuery(
                    `SELECT * FROM stays_rooms WHERE property_id = ? ORDER BY created_at ASC`,
                    [propertyId]
                ),
                // Tax Details
                executeQuery(
                    `SELECT * FROM stays_property_tax_details WHERE property_id = ?`,
                    [propertyId]
                ),
                // Connectivity
                executeQuery(
                    `SELECT * FROM stays_property_connectivity WHERE property_id = ?`,
                    [propertyId]
                ),
                // Promotions
                executeQuery(
                    `SELECT * FROM stays_property_promotions WHERE property_id = ? ORDER BY created_at DESC`,
                    [propertyId]
                )
            ]);

            // Get room details (beds, amenities, images, rate plans)
            const roomIds = rooms.map(r => r.room_id);
            let roomBeds = [];
            let roomAmenities = [];
            let roomImages = [];
            let ratePlans = [];

            if (roomIds.length > 0) {
                [roomBeds, roomAmenities, roomImages, ratePlans] = await Promise.all([
                    executeQuery(
                        `SELECT * FROM stays_room_beds WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
                        roomIds
                    ),
                    executeQuery(
                        `SELECT * FROM stays_room_amenities WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
                        roomIds
                    ),
                    executeQuery(
                        `SELECT * FROM stays_room_images WHERE room_id IN (${roomIds.map(() => '?').join(',')}) ORDER BY image_order ASC, is_primary DESC`,
                        roomIds
                    ),
                    executeQuery(
                        `SELECT * FROM stays_room_rate_plans WHERE room_id IN (${roomIds.map(() => '?').join(',')}) ORDER BY created_at ASC`,
                        roomIds
                    )
                ]);
            }

            // Parse JSON fields
            const parseJsonField = (field) => {
                if (!field) return null;
                if (typeof field === 'string') {
                    try {
                        return JSON.parse(field);
                    } catch {
                        return field;
                    }
                }
                return field;
            };

            // Attach room details to rooms
            const roomsWithDetails = rooms.map(room => {
                const beds = roomBeds.filter(b => b.room_id === room.room_id);
                const roomAmenity = roomAmenities.find(a => a.room_id === room.room_id);
                const images = roomImages.filter(i => i.room_id === room.room_id);
                const plans = ratePlans.filter(p => p.room_id === room.room_id);

                return {
                    ...room,
                    beds,
                    amenities: roomAmenity ? {
                        ...roomAmenity,
                        bathroom_amenities: parseJsonField(roomAmenity.bathroom_amenities),
                        kitchen_facilities: parseJsonField(roomAmenity.kitchen_facilities),
                        room_layout: parseJsonField(roomAmenity.room_layout),
                        additional_amenities: parseJsonField(roomAmenity.additional_amenities)
                    } : null,
                    images,
                    ratePlans: plans
                };
            });

            // Parse JSON fields in policies
            const parsedPolicies = policies.length > 0 ? {
                ...policies[0],
                languages: parseJsonField(policies[0].languages),
                card_types: parseJsonField(policies[0].card_types),
                deposit_types: parseJsonField(policies[0].deposit_types)
            } : null;

            // Parse JSON fields in amenities
            const parsedAmenities = amenities.length > 0 ? {
                ...amenities[0],
                additional_amenities: parseJsonField(amenities[0].additional_amenities),
                themes: parseJsonField(amenities[0].themes)
            } : null;

            // Parse location_data
            const locationData = parseJsonField(property.location_data);

            return {
                ...property,
                location_data: locationData,
                images,
                policies: parsedPolicies,
                amenities: parsedAmenities,
                rooms: roomsWithDetails,
                taxDetails: taxDetails.length > 0 ? taxDetails[0] : null,
                connectivity: connectivity.length > 0 ? connectivity[0] : null,
                promotions
            };
        } catch (error) {
            console.error('Error getting property with all data:', error);
            throw error;
        }
    }

    async ensurePropertyOwnership(propertyId, userId, includeDetails = false) {
        const property = await executeQuery(
            `SELECT property_id, user_id, property_name, property_type, number_of_rooms 
             FROM stays_properties WHERE property_id = ?`,
            [propertyId]
        );

        if (!property || property.length === 0) {
            throw createErrorWithStatus('Property not found', 404);
        }

        const propertyRecord = property[0];
        if (propertyRecord.user_id && userId && Number(propertyRecord.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this property', 403);
        }

        return includeDetails ? propertyRecord : true;
    }

    async ensureRoomOwnership(roomId, userId, includeDetails = false) {
        const room = await executeQuery(
            `SELECT sr.*, sp.user_id, sp.property_name 
             FROM stays_rooms sr
             INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
             WHERE sr.room_id = ?`,
            [roomId]
        );

        if (!room || room.length === 0) {
            throw createErrorWithStatus('Room not found', 404);
        }

        const roomRecord = room[0];
        if (roomRecord.user_id && userId && Number(roomRecord.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this room', 403);
        }

        return includeDetails ? roomRecord : true;
    }

    async getPropertyImageLibrary(propertyId, userId) {
        const property = await this.ensurePropertyOwnership(propertyId, userId, true);

        const propertyImages = await executeQuery(
            `SELECT image_id, property_id, image_url, image_order, is_primary, created_at 
             FROM stays_property_images 
             WHERE property_id = ? 
             ORDER BY image_order ASC, created_at ASC`,
            [propertyId]
        );

        const rooms = await executeQuery(
            `SELECT room_id, room_name, room_type, number_of_rooms, room_status 
             FROM stays_rooms 
             WHERE property_id = ? 
             ORDER BY room_name ASC`,
            [propertyId]
        );

        let roomImagesMap = {};
        if (rooms.length > 0) {
            const roomIds = rooms.map((room) => room.room_id);
            const placeholders = roomIds.map(() => '?').join(',');
            const roomImages = await executeQuery(
                `SELECT image_id, room_id, image_url, image_order, is_primary, created_at 
                 FROM stays_room_images 
                 WHERE room_id IN (${placeholders})
                 ORDER BY room_id ASC, image_order ASC, created_at ASC`,
                roomIds
            );

            roomImagesMap = roomImages.reduce((acc, image) => {
                if (!acc[image.room_id]) {
                    acc[image.room_id] = [];
                }
                acc[image.room_id].push(image);
                return acc;
            }, {});
        }

        const roomsWithImages = rooms.map((room) => ({
            ...room,
            images: roomImagesMap[room.room_id] || []
        }));

        return {
            property: {
                property_id: property.property_id,
                property_name: property.property_name,
                property_type: property.property_type,
                number_of_rooms: property.number_of_rooms
            },
            propertyImages,
            rooms: roomsWithImages
        };
    }

    async addPropertyImages(propertyId, userId, images = []) {
        await this.ensurePropertyOwnership(propertyId, userId);
        if (!images || images.length === 0) {
            return this.getPropertyImageLibrary(propertyId, userId);
        }

        const existingOrder = await executeQuery(
            `SELECT COALESCE(MAX(image_order), -1) AS max_order 
             FROM stays_property_images 
             WHERE property_id = ?`,
            [propertyId]
        );
        let nextOrder = (existingOrder[0]?.max_order ?? -1) + 1;

        for (const image of images) {
            await executeQuery(
                `INSERT INTO stays_property_images (property_id, image_url, image_order, is_primary)
                 VALUES (?, ?, ?, ?)`,
                [
                    propertyId,
                    image.url,
                    nextOrder,
                    image.isPrimary ? 1 : 0
                ]
            );
            nextOrder += 1;
        }

        return this.getPropertyImageLibrary(propertyId, userId);
    }

    async addRoomImages(roomId, userId, images = []) {
        const room = await this.ensureRoomOwnership(roomId, userId, true);
        if (!images || images.length === 0) {
            return this.getPropertyImageLibrary(room.property_id, userId);
        }

        const existingOrder = await executeQuery(
            `SELECT COALESCE(MAX(image_order), -1) AS max_order 
             FROM stays_room_images 
             WHERE room_id = ?`,
            [roomId]
        );
        let nextOrder = (existingOrder[0]?.max_order ?? -1) + 1;

        for (const image of images) {
            await executeQuery(
                `INSERT INTO stays_room_images (room_id, image_url, image_order, is_primary)
                 VALUES (?, ?, ?, ?)`,
                [
                    roomId,
                    image.url,
                    nextOrder,
                    image.isPrimary ? 1 : 0
                ]
            );
            nextOrder += 1;
        }

        return this.getPropertyImageLibrary(room.property_id, userId);
    }

    async deletePropertyImage(imageId, userId) {
        const imageRecords = await executeQuery(
            `SELECT spi.*, sp.user_id 
             FROM stays_property_images spi
             INNER JOIN stays_properties sp ON spi.property_id = sp.property_id
             WHERE spi.image_id = ?`,
            [imageId]
        );

        if (!imageRecords || imageRecords.length === 0) {
            throw createErrorWithStatus('Image not found', 404);
        }

        const image = imageRecords[0];
        if (Number(image.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this image', 403);
        }

        await executeQuery(`DELETE FROM stays_property_images WHERE image_id = ?`, [imageId]);
        removeImageFromDisk(image.image_url);
        return image;
    }

    async deleteRoomImage(imageId, userId) {
        // First check if image exists at all
        const imageCheck = await executeQuery(
            `SELECT image_id, room_id, image_url FROM stays_room_images WHERE image_id = ?`,
            [imageId]
        );

        if (!imageCheck || imageCheck.length === 0) {
            console.error(`[deleteRoomImage] Image ID ${imageId} not found in stays_room_images table`);
            throw createErrorWithStatus('Image not found', 404);
        }

        // Then verify ownership through room and property
        const imageRecords = await executeQuery(
            `SELECT sri.*, sp.user_id, sp.property_id, sr.room_id
             FROM stays_room_images sri
             INNER JOIN stays_rooms sr ON sri.room_id = sr.room_id
             INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
             WHERE sri.image_id = ?`,
            [imageId]
        );

        if (!imageRecords || imageRecords.length === 0) {
            console.error(`[deleteRoomImage] Image ID ${imageId} exists but cannot be linked to a property (room or property may be deleted)`);
            // Image exists but room/property relationship is broken - still allow deletion
            const image = imageCheck[0];
            await executeQuery(`DELETE FROM stays_room_images WHERE image_id = ?`, [imageId]);
            removeImageFromDisk(image.image_url);
            return image;
        }

        const image = imageRecords[0];
        if (Number(image.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this image', 403);
        }

        await executeQuery(`DELETE FROM stays_room_images WHERE image_id = ?`, [imageId]);
        removeImageFromDisk(image.image_url);
        return image;
    }

    async updatePropertyImage(imageId, userId, updates = {}) {
        const imageRecords = await executeQuery(
            `SELECT spi.*, sp.user_id 
             FROM stays_property_images spi
             INNER JOIN stays_properties sp ON spi.property_id = sp.property_id
             WHERE spi.image_id = ?`,
            [imageId]
        );

        if (!imageRecords || imageRecords.length === 0) {
            throw createErrorWithStatus('Image not found', 404);
        }

        const image = imageRecords[0];
        if (Number(image.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this image', 403);
        }

        const fields = [];
        const params = [];

        if (updates.image_order !== undefined) {
            fields.push('image_order = ?');
            params.push(Number(updates.image_order));
        }

        if (updates.is_primary !== undefined) {
            if (updates.is_primary) {
                await executeQuery(
                    `UPDATE stays_property_images 
                     SET is_primary = 0 
                     WHERE property_id = ? AND image_id != ?`,
                    [image.property_id, imageId]
                );
            }

            fields.push('is_primary = ?');
            params.push(updates.is_primary ? 1 : 0);
        }

        if (fields.length === 0) {
            throw createErrorWithStatus('No valid fields provided for update', 400);
        }

        params.push(imageId);
        await executeQuery(
            `UPDATE stays_property_images 
             SET ${fields.join(', ')}
             WHERE image_id = ?`,
            params
        );

        return this.getPropertyImageLibrary(image.property_id, userId);
    }

    async getPropertyRooms(propertyId, userId) {
        try {
            // Verify property ownership
            const property = await executeQuery(
                `SELECT property_id, user_id FROM stays_properties WHERE property_id = ?`,
                [propertyId]
            );

            if (!property || property.length === 0) {
                throw createErrorWithStatus('Property not found', 404);
            }

            if (Number(property[0].user_id) !== Number(userId)) {
                throw createErrorWithStatus('Unauthorized access to this property', 403);
            }

            // Get all rooms for the property
            const rooms = await executeQuery(
                `SELECT * FROM stays_rooms WHERE property_id = ? ORDER BY created_at ASC`,
                [propertyId]
            );

            // Get room details (beds, amenities)
            const roomIds = rooms.map(r => r.room_id);
            let roomBeds = [];
            let roomAmenities = [];

            if (roomIds.length > 0) {
                [roomBeds, roomAmenities] = await Promise.all([
                    executeQuery(
                        `SELECT * FROM stays_room_beds WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
                        roomIds
                    ),
                    executeQuery(
                        `SELECT * FROM stays_room_amenities WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
                        roomIds
                    )
                ]);
            }

            // Map beds and amenities to rooms
            const roomsWithDetails = rooms.map(room => {
                const beds = roomBeds.filter(b => b.room_id === room.room_id).map(b => ({
                    bedType: b.bed_type,
                    quantity: b.quantity
                }));

                const amenities = roomAmenities.find(a => a.room_id === room.room_id) || {};

                // Parse JSON fields
                const kitchenFacilities = amenities.kitchen_facilities 
                    ? (typeof amenities.kitchen_facilities === 'string' ? JSON.parse(amenities.kitchen_facilities) : amenities.kitchen_facilities)
                    : [];
                const roomLayout = amenities.room_layout
                    ? (typeof amenities.room_layout === 'string' ? JSON.parse(amenities.room_layout) : amenities.room_layout)
                    : [];
                const additionalAmenities = amenities.additional_amenities
                    ? (typeof amenities.additional_amenities === 'string' ? JSON.parse(amenities.additional_amenities) : amenities.additional_amenities)
                    : [];

                // Preserve both database format (snake_case) and frontend format (camelCase) for compatibility
                return {
                    ...room,
                    beds,
                    amenities: {
                        // Database format (snake_case) - preserved for RoomAmenitiesStep loading
                        has_kitchen: amenities.has_kitchen,
                        kitchen_facilities: amenities.kitchen_facilities,
                        has_air_conditioning: amenities.has_air_conditioning,
                        air_conditioning_type: amenities.air_conditioning_type,
                        has_heating: amenities.has_heating,
                        has_view: amenities.has_view,
                        room_view: amenities.room_view,
                        room_size_sqm: amenities.room_size_sqm,
                        room_size_sqft: amenities.room_size_sqft,
                        has_balcony: amenities.has_balcony,
                        has_terrace: amenities.has_terrace,
                        has_patio: amenities.has_patio,
                        desk: amenities.desk,
                        separate_sitting_area: amenities.separate_sitting_area,
                        private_spa_tub: amenities.private_spa_tub,
                        laptop_friendly_workspace: amenities.laptop_friendly_workspace,
                        separate_dining_area: amenities.separate_dining_area,
                        private_pool: amenities.private_pool,
                        room_layout: amenities.room_layout,
                        additional_amenities: amenities.additional_amenities,
                        // Frontend format (camelCase) - for compatibility
                        hasKitchen: amenities.has_kitchen === 1 ? 'yes' : 'no',
                        kitchenFacilities: kitchenFacilities,
                        kitchenAmenities: Array.isArray(kitchenFacilities) ? kitchenFacilities.reduce((acc, facility) => {
                            acc[facility] = true;
                            return acc;
                        }, {
                            cookware: false,
                            stovetop: false,
                            oven: false,
                            microwave: false,
                            refrigerator: false,
                            dishwasher: false
                        }) : {
                            cookware: false,
                            stovetop: false,
                            oven: false,
                            microwave: false,
                            refrigerator: false,
                            dishwasher: false
                        },
                        airConditioning: amenities.has_air_conditioning === 1,
                        hasAirConditioning: amenities.has_air_conditioning === 1,
                        airConditioningType: amenities.air_conditioning_type || 'in-room',
                        hasHeating: amenities.has_heating === 1,
                        hasView: amenities.has_view === 1 ? 'yes' : 'no',
                        roomView: amenities.room_view,
                        roomSizeSqm: amenities.room_size_sqm,
                        roomSizeSqft: amenities.room_size_sqft,
                        roomSize: amenities.room_size_sqft || amenities.room_size_sqm || '',
                        roomSizeUnit: amenities.room_size_sqm ? 'square_meters' : 'square_feet',
                        hasBalcony: amenities.has_balcony === 1,
                        hasTerrace: amenities.has_terrace === 1,
                        hasPatio: amenities.has_patio === 1,
                        hasOutdoorSpace: (amenities.has_balcony === 1 || amenities.has_terrace === 1 || amenities.has_patio === 1) ? 'yes' : 'no',
                        desk: amenities.desk === 1,
                        separateSittingArea: amenities.separate_sitting_area === 1,
                        privateSpaTub: amenities.private_spa_tub === 1,
                        laptopFriendlyWorkspace: amenities.laptop_friendly_workspace === 1,
                        separateDiningArea: amenities.separate_dining_area === 1,
                        privatePool: amenities.private_pool === 1,
                        roomLayout: roomLayout,
                        additionalAmenities: additionalAmenities
                    },
                    roomSetupComplete: true // All rooms from database are complete
                };
            });

            return roomsWithDetails;
        } catch (error) {
            console.error('Error getting property rooms:', error);
            throw error;
        }
    }

    async updateRoomImage(imageId, userId, updates = {}) {
        const imageRecords = await executeQuery(
            `SELECT sri.*, sp.user_id, sr.property_id 
             FROM stays_room_images sri
             INNER JOIN stays_rooms sr ON sri.room_id = sr.room_id
             INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
             WHERE sri.image_id = ?`,
            [imageId]
        );

        if (!imageRecords || imageRecords.length === 0) {
            throw createErrorWithStatus('Image not found', 404);
        }

        const image = imageRecords[0];
        if (Number(image.user_id) !== Number(userId)) {
            throw createErrorWithStatus('Unauthorized access to this image', 403);
        }

        const fields = [];
        const params = [];

        if (updates.image_order !== undefined) {
            fields.push('image_order = ?');
            params.push(Number(updates.image_order));
        }

        if (updates.is_primary !== undefined) {
            if (updates.is_primary) {
                await executeQuery(
                    `UPDATE stays_room_images 
                     SET is_primary = 0 
                     WHERE room_id = ? AND image_id != ?`,
                    [image.room_id, imageId]
                );
            }

            fields.push('is_primary = ?');
            params.push(updates.is_primary ? 1 : 0);
        }

        if (fields.length === 0) {
            throw createErrorWithStatus('No valid fields provided for update', 400);
        }

        params.push(imageId);
        await executeQuery(
            `UPDATE stays_room_images 
             SET ${fields.join(', ')}
             WHERE image_id = ?`,
            params
        );

        return this.getPropertyImageLibrary(image.property_id, userId);
    }
}

module.exports = new StaysPropertyService();

