const { executeQuery, pool } = require('../../../config/database');

class PropertySetupService {
    // Step 2: Save Contract Acceptance
    async saveContract(userId, propertyId) {
        try {
            await executeQuery(
                `UPDATE stays_properties 
                SET contract_accepted = 1, contract_accepted_at = NOW() 
                WHERE property_id = ? AND user_id = ?`,
                [propertyId, userId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error saving contract:', error);
            throw error;
        }
    }

    // Step 3: Save Policies and Settings
    async savePolicies(userId, propertyId, policiesData) {
        try {
            // Helper function to convert undefined to null
            const nullIfUndefined = (value) => value === undefined ? null : value;
            
            // Ensure propertyId is an integer
            const propertyIdInt = parseInt(propertyId);
            console.log(`[savePolicies] Saving policies for propertyId: ${propertyId} (converted to: ${propertyIdInt}), userId: ${userId}`);
            
            // Check if policy already exists
            const existing = await executeQuery(
                `SELECT policy_id FROM stays_property_policies WHERE property_id = ?`,
                [propertyIdInt]
            );
            console.log(`[savePolicies] Existing policies found: ${existing.length}`);

            // Prepare data to match ACTUAL database table structure
            // Database columns: languages, accept_credit_debit_cards, accept_travooz_card, 
            // accept_mobile_money, accept_airtel_money, require_deposits, cancellation_window,
            // cancellation_fee, vat_percentage, tourism_tax_percentage, taxes_included_in_rate,
            // request_tax_team_assistance
            
            // Convert languages array to JSON
            const languagesJson = policiesData.languages && Array.isArray(policiesData.languages) 
                ? JSON.stringify(policiesData.languages) 
                : null;
            
            // Map frontend boolean values to database tinyint (0 or 1)
            const acceptCreditDebitCards = policiesData.acceptCreditDebitCards ? 1 : 0;
            const acceptTravoozCard = policiesData.acceptTravoozCard ? 1 : 0;
            const acceptMobileMoney = policiesData.acceptMobileMoney ? 1 : 0;
            const acceptAirtelMoney = policiesData.acceptAirtelMoney ? 1 : 0;
            
            // Map other fields
            const requireDeposits = policiesData.requireDeposits || 'no';
            const cancellationWindow = policiesData.cancellationWindow || '24_hour';
            const cancellationFee = policiesData.cancellationFee || 'first_night_plus_tax';
            const vatPercentage = nullIfUndefined(policiesData.vatPercentage);
            const tourismTaxPercentage = nullIfUndefined(policiesData.tourismTaxPercentage);
            const taxesIncludedInRate = policiesData.taxesIncludedInRate ? 1 : 0;
            const requestTaxTeamAssistance = policiesData.requestTaxTeamAssistance ? 1 : 0;

            // Build query to match ACTUAL database table structure
            if (existing.length > 0) {
                // Update existing policy
                await executeQuery(
                    `UPDATE stays_property_policies SET
                        languages = ?,
                        accept_credit_debit_cards = ?,
                        accept_travooz_card = ?,
                        accept_mobile_money = ?,
                        accept_airtel_money = ?,
                        require_deposits = ?,
                        cancellation_window = ?,
                        cancellation_fee = ?,
                        vat_percentage = ?,
                        tourism_tax_percentage = ?,
                        taxes_included_in_rate = ?,
                        request_tax_team_assistance = ?,
                        updated_at = NOW()
                    WHERE property_id = ?`,
                    [
                        languagesJson,
                        acceptCreditDebitCards,
                        acceptTravoozCard,
                        acceptMobileMoney,
                        acceptAirtelMoney,
                        requireDeposits,
                        cancellationWindow,
                        cancellationFee,
                        vatPercentage,
                        tourismTaxPercentage,
                        taxesIncludedInRate,
                        requestTaxTeamAssistance,
                        propertyIdInt
                    ]
                );
                console.log(`[savePolicies] Updated existing policy for propertyId ${propertyIdInt}`);
            } else {
                // Insert new policy
                await executeQuery(
                    `INSERT INTO stays_property_policies (
                        property_id,
                        languages,
                        accept_credit_debit_cards,
                        accept_travooz_card,
                        accept_mobile_money,
                        accept_airtel_money,
                        require_deposits,
                        cancellation_window,
                        cancellation_fee,
                        vat_percentage,
                        tourism_tax_percentage,
                        taxes_included_in_rate,
                        request_tax_team_assistance
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        propertyIdInt,
                        languagesJson,
                        acceptCreditDebitCards,
                        acceptTravoozCard,
                        acceptMobileMoney,
                        acceptAirtelMoney,
                        requireDeposits,
                        cancellationWindow,
                        cancellationFee,
                        vatPercentage,
                        tourismTaxPercentage,
                        taxesIncludedInRate,
                        requestTaxTeamAssistance
                    ]
                );
                console.log(`[savePolicies] Inserted new policy for propertyId ${propertyIdInt}`);
            }
            console.log(`[savePolicies] Policies saved successfully for propertyId ${propertyIdInt}`);
            return { success: true };
        } catch (error) {
            console.error('Error saving policies:', error);
            throw error;
        }
    }

    // Step 4: Save Property Amenities
    async saveAmenities(userId, propertyId, amenitiesData) {
        try {
            const existing = await executeQuery(
                `SELECT amenity_id FROM stays_property_amenities WHERE property_id = ?`,
                [propertyId]
            );

            // Convert themes array to JSON (only field that exists in actual table)
            const themesJson = amenitiesData.themes && Array.isArray(amenitiesData.themes) 
                ? JSON.stringify(amenitiesData.themes) 
                : null;

            // Build amenityFields to match ACTUAL database table structure
            // Actual columns: min_check_in_age, check_in_time, check_in_ends, has_front_desk,
            // offer_breakfast, breakfast_type, offer_internet, offer_parking, has_pool, pool_type,
            // has_spa, has_fitness_center, has_restaurant, has_bar, has_concierge, has_laundry,
            // has_business_center, pets_allowed, themes
            const amenityFields = {
                min_check_in_age: amenitiesData.minCheckInAge ? parseInt(amenitiesData.minCheckInAge) : null,
                check_in_time: amenitiesData.checkInTime || null,
                check_in_ends: amenitiesData.checkInEnds || null,
                has_front_desk: amenitiesData.hasFrontDesk || 'no',
                offer_breakfast: amenitiesData.offerBreakfast || 'no',
                breakfast_type: amenitiesData.breakfastType || null,
                offer_internet: amenitiesData.offerInternet || 'no',
                offer_parking: amenitiesData.offerParking || 'no',
                has_pool: amenitiesData.hasPool ? 1 : 0,
                pool_type: amenitiesData.poolType || null,
                has_spa: amenitiesData.hasSpa ? 1 : 0,
                has_fitness_center: amenitiesData.hasFitnessCenter ? 1 : 0,
                has_restaurant: amenitiesData.hasRestaurant ? 1 : 0,
                has_bar: amenitiesData.hasBar ? 1 : 0,
                has_concierge: amenitiesData.hasConcierge ? 1 : 0,
                has_laundry: amenitiesData.hasLaundry ? 1 : 0,
                has_business_center: amenitiesData.hasBusinessCenter ? 1 : 0,
                pets_allowed: amenitiesData.petsAllowed || 'no',
                themes: themesJson
            };

            if (existing.length > 0) {
                // Build update query
                const updateFields = Object.keys(amenityFields).map(key => `${key} = ?`).join(', ');
                const values = Object.values(amenityFields);
                values.push(propertyId);

                await executeQuery(
                    `UPDATE stays_property_amenities SET ${updateFields}, updated_at = NOW() WHERE property_id = ?`,
                    values
                );
            } else {
                // Insert new
                const insertFields = Object.keys(amenityFields).join(', ');
                const placeholders = Object.keys(amenityFields).map(() => '?').join(', ');
                const values = [propertyId, ...Object.values(amenityFields)];

                await executeQuery(
                    `INSERT INTO stays_property_amenities (property_id, ${insertFields}) VALUES (?, ${placeholders})`,
                    values
                );
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving amenities:', error);
            throw error;
        }
    }

    // Step 5-6: Save Room (with beds, amenities, rate plans)
    async saveRoom(userId, propertyId, roomData) {
        const connection = await pool.getConnection();
        
        // Helper function to convert undefined to null
        const nullIfUndefined = (value) => value === undefined ? null : value;
        
        try {
            await connection.beginTransaction();

            try {
                // Insert or update room
                let roomId = nullIfUndefined(roomData.roomId);
                
                // Parse and validate roomId - must be a valid positive integer
                if (roomId) {
                    const parsedId = parseInt(roomId, 10);
                    // Only use if it's a valid positive integer and not a temporary ID (Date.now() would be > 1e12)
                    // Valid room IDs from database should be reasonable integers (typically < 1e6)
                    if (isNaN(parsedId) || parsedId <= 0 || parsedId > 1000000) {
                        console.warn('[PropertySetupService] Invalid roomId detected, treating as new room:', roomId);
                        roomId = null;
                    } else {
                        roomId = parsedId;
                    }
                }
                
                if (roomId) {
                    // Update existing room
                    await connection.execute(
                        `UPDATE stays_rooms SET
                            room_name = ?, room_type = ?, room_class = ?,
                            smoking_policy = ?, number_of_rooms = ?,
                            recommended_occupancy = ?, pricing_model = ?,
                            base_rate = ?, people_included = ?, updated_at = NOW()
                        WHERE room_id = ? AND property_id = ?`,
                        [
                            nullIfUndefined(roomData.roomName),
                            nullIfUndefined(roomData.roomType),
                            nullIfUndefined(roomData.roomClass) || 'standard',
                            nullIfUndefined(roomData.smokingPolicy) || 'non-smoking',
                            nullIfUndefined(roomData.numberOfRooms) ?? 1,
                            nullIfUndefined(roomData.recommendedOccupancy),
                            nullIfUndefined(roomData.pricingModel) || 'per-day',
                            nullIfUndefined(roomData.baseRate),
                            nullIfUndefined(roomData.peopleIncluded) ?? 2,
                            roomId,
                            propertyId
                        ]
                    );
                } else {
                    // Insert new room
                    const [result] = await connection.execute(
                        `INSERT INTO stays_rooms (
                        property_id, room_name, room_type, room_class,
                        smoking_policy, number_of_rooms, recommended_occupancy,
                        pricing_model, base_rate, people_included
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        propertyId,
                        nullIfUndefined(roomData.roomName),
                        nullIfUndefined(roomData.roomType),
                        nullIfUndefined(roomData.roomClass) || 'standard',
                        nullIfUndefined(roomData.smokingPolicy) || 'non-smoking',
                        nullIfUndefined(roomData.numberOfRooms) ?? 1,
                        nullIfUndefined(roomData.recommendedOccupancy),
                        nullIfUndefined(roomData.pricingModel) || 'per-day',
                        nullIfUndefined(roomData.baseRate),
                        nullIfUndefined(roomData.peopleIncluded) ?? 2
                    ]
                );
                roomId = result.insertId;
                }

                // Delete existing beds and insert new ones
                await connection.execute(`DELETE FROM stays_room_beds WHERE room_id = ?`, [roomId]);
                if (roomData.beds && roomData.beds.length > 0) {
                    for (const bed of roomData.beds) {
                        await connection.execute(
                            `INSERT INTO stays_room_beds (room_id, bed_type, quantity) VALUES (?, ?, ?)`,
                            [roomId, nullIfUndefined(bed.bedType), nullIfUndefined(bed.quantity) ?? 1]
                        );
                    }
                }

                // Update or insert room amenities
                // Check which columns exist in the database table
                const [columnCheck] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = DATABASE() 
                     AND TABLE_NAME = 'stays_room_amenities'`
                );
                const existingColumns = columnCheck.map(col => col.COLUMN_NAME);
                
                const [existingAmenities] = await connection.execute(
                    `SELECT room_amenity_id FROM stays_room_amenities WHERE room_id = ?`,
                    [roomId]
                );

                // Prepare JSON fields (only if columns exist)
                console.log('[PropertySetupService] kitchenFacilities received:', roomData.kitchenFacilities);
                console.log('[PropertySetupService] kitchen_facilities column exists:', existingColumns.includes('kitchen_facilities'));
                const kitchenFacilitiesJson = (existingColumns.includes('kitchen_facilities') && roomData.kitchenFacilities && Array.isArray(roomData.kitchenFacilities) && roomData.kitchenFacilities.length > 0)
                    ? JSON.stringify(roomData.kitchenFacilities)
                    : null;
                console.log('[PropertySetupService] kitchenFacilitiesJson:', kitchenFacilitiesJson);

                const roomLayoutJson = (existingColumns.includes('room_layout') && roomData.roomLayout && Array.isArray(roomData.roomLayout) && roomData.roomLayout.length > 0)
                    ? JSON.stringify(roomData.roomLayout)
                    : null;

                const additionalAmenitiesJson = (existingColumns.includes('additional_amenities') && roomData.additionalAmenities && Array.isArray(roomData.additionalAmenities) && roomData.additionalAmenities.length > 0)
                    ? JSON.stringify(roomData.additionalAmenities)
                    : null;

                // Build dynamic SQL based on existing columns
                const updateFields = [];
                const updateValues = [];
                const insertFields = [];
                const insertValues = [];

                // Always include these base columns
                if (existingColumns.includes('has_kitchen')) {
                    updateFields.push('has_kitchen = ?');
                    updateValues.push((roomData.hasKitchen === true) ? 1 : 0);
                    insertFields.push('has_kitchen');
                    insertValues.push((roomData.hasKitchen === true) ? 1 : 0);
                }

                if (existingColumns.includes('kitchen_facilities')) {
                    updateFields.push('kitchen_facilities = ?');
                    updateValues.push(kitchenFacilitiesJson);
                    insertFields.push('kitchen_facilities');
                    insertValues.push(kitchenFacilitiesJson);
                }

                if (existingColumns.includes('has_air_conditioning')) {
                    updateFields.push('has_air_conditioning = ?');
                    updateValues.push((roomData.hasAirConditioning === true) ? 1 : 0);
                    insertFields.push('has_air_conditioning');
                    insertValues.push((roomData.hasAirConditioning === true) ? 1 : 0);
                }

                if (existingColumns.includes('air_conditioning_type')) {
                    updateFields.push('air_conditioning_type = ?');
                    updateValues.push(nullIfUndefined(roomData.airConditioningType));
                    insertFields.push('air_conditioning_type');
                    insertValues.push(nullIfUndefined(roomData.airConditioningType));
                }

                if (existingColumns.includes('has_heating')) {
                    updateFields.push('has_heating = ?');
                    updateValues.push((roomData.hasHeating === true) ? 1 : 0);
                    insertFields.push('has_heating');
                    insertValues.push((roomData.hasHeating === true) ? 1 : 0);
                }

                if (existingColumns.includes('has_view')) {
                    updateFields.push('has_view = ?');
                    updateValues.push(nullIfUndefined(roomData.hasView) || 'no');
                    insertFields.push('has_view');
                    insertValues.push(nullIfUndefined(roomData.hasView) || 'no');
                }

                if (existingColumns.includes('room_view')) {
                    updateFields.push('room_view = ?');
                    updateValues.push(nullIfUndefined(roomData.roomView));
                    insertFields.push('room_view');
                    insertValues.push(nullIfUndefined(roomData.roomView));
                }

                if (existingColumns.includes('room_size_sqm')) {
                    updateFields.push('room_size_sqm = ?');
                    updateValues.push(nullIfUndefined(roomData.roomSizeSqm));
                    insertFields.push('room_size_sqm');
                    insertValues.push(nullIfUndefined(roomData.roomSizeSqm));
                }

                if (existingColumns.includes('room_size_sqft')) {
                    updateFields.push('room_size_sqft = ?');
                    updateValues.push(nullIfUndefined(roomData.roomSizeSqft));
                    insertFields.push('room_size_sqft');
                    insertValues.push(nullIfUndefined(roomData.roomSizeSqft));
                }

                if (existingColumns.includes('has_balcony')) {
                    updateFields.push('has_balcony = ?');
                    updateValues.push((roomData.hasBalcony === true) ? 1 : 0);
                    insertFields.push('has_balcony');
                    insertValues.push((roomData.hasBalcony === true) ? 1 : 0);
                }

                if (existingColumns.includes('has_terrace')) {
                    updateFields.push('has_terrace = ?');
                    updateValues.push((roomData.hasTerrace === true) ? 1 : 0);
                    insertFields.push('has_terrace');
                    insertValues.push((roomData.hasTerrace === true) ? 1 : 0);
                }

                if (existingColumns.includes('has_patio')) {
                    updateFields.push('has_patio = ?');
                    updateValues.push((roomData.hasPatio === true) ? 1 : 0);
                    insertFields.push('has_patio');
                    insertValues.push((roomData.hasPatio === true) ? 1 : 0);
                }

                // Optional columns (may not exist yet)
                if (existingColumns.includes('desk')) {
                    updateFields.push('desk = ?');
                    updateValues.push((roomData.desk === true) ? 1 : 0);
                    insertFields.push('desk');
                    insertValues.push((roomData.desk === true) ? 1 : 0);
                }

                if (existingColumns.includes('separate_sitting_area')) {
                    updateFields.push('separate_sitting_area = ?');
                    updateValues.push((roomData.separateSittingArea === true) ? 1 : 0);
                    insertFields.push('separate_sitting_area');
                    insertValues.push((roomData.separateSittingArea === true) ? 1 : 0);
                }

                if (existingColumns.includes('private_spa_tub')) {
                    updateFields.push('private_spa_tub = ?');
                    updateValues.push((roomData.privateSpaTub === true) ? 1 : 0);
                    insertFields.push('private_spa_tub');
                    insertValues.push((roomData.privateSpaTub === true) ? 1 : 0);
                }

                if (existingColumns.includes('laptop_friendly_workspace')) {
                    updateFields.push('laptop_friendly_workspace = ?');
                    updateValues.push((roomData.laptopFriendlyWorkspace === true) ? 1 : 0);
                    insertFields.push('laptop_friendly_workspace');
                    insertValues.push((roomData.laptopFriendlyWorkspace === true) ? 1 : 0);
                }

                if (existingColumns.includes('separate_dining_area')) {
                    updateFields.push('separate_dining_area = ?');
                    updateValues.push((roomData.separateDiningArea === true) ? 1 : 0);
                    insertFields.push('separate_dining_area');
                    insertValues.push((roomData.separateDiningArea === true) ? 1 : 0);
                }

                if (existingColumns.includes('private_pool')) {
                    updateFields.push('private_pool = ?');
                    updateValues.push((roomData.privatePool === true) ? 1 : 0);
                    insertFields.push('private_pool');
                    insertValues.push((roomData.privatePool === true) ? 1 : 0);
                }

                if (existingColumns.includes('room_layout')) {
                    updateFields.push('room_layout = ?');
                    updateValues.push(roomLayoutJson);
                    insertFields.push('room_layout');
                    insertValues.push(roomLayoutJson);
                }

                if (existingColumns.includes('additional_amenities')) {
                    updateFields.push('additional_amenities = ?');
                    updateValues.push(additionalAmenitiesJson);
                    insertFields.push('additional_amenities');
                    insertValues.push(additionalAmenitiesJson);
                }

                // Always add updated_at for UPDATE
                updateFields.push('updated_at = NOW()');

                if (existingAmenities.length > 0) {
                    // UPDATE existing amenities
                    updateValues.push(roomId);
                    await connection.execute(
                        `UPDATE stays_room_amenities SET ${updateFields.join(', ')} WHERE room_id = ?`,
                        updateValues
                    );
                } else {
                    // INSERT new amenities
                    insertFields.unshift('room_id');
                    insertValues.unshift(roomId);
                    await connection.execute(
                        `INSERT INTO stays_room_amenities (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
                        insertValues
                    );
                }

                // Delete existing rate plans and insert new ones
                await connection.execute(`DELETE FROM stays_room_rate_plans WHERE room_id = ?`, [roomId]);
                if (roomData.ratePlans && roomData.ratePlans.length > 0) {
                    for (const plan of roomData.ratePlans) {
                        await connection.execute(
                            `INSERT INTO stays_room_rate_plans (
                                room_id, plan_type, rate_type, discount_type,
                                amount, discount_value, final_rate, description, is_active
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                roomId,
                                nullIfUndefined(plan.planType),
                                nullIfUndefined(plan.rateType),
                                nullIfUndefined(plan.discountType),
                                nullIfUndefined(plan.amount),
                                nullIfUndefined(plan.discountValue),
                                nullIfUndefined(plan.finalRate),
                                nullIfUndefined(plan.description),
                                (plan.isActive !== false) ? 1 : 0
                            ]
                        );
                    }
                }

                await connection.commit();
                return { success: true, roomId };
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error saving room:', error);
            throw error;
        }
    }

    // Step 7: Save Promotions
    async savePromotions(userId, propertyId, promotionsData) {
        try {
            // Delete existing promotions and insert new ones
            await executeQuery(`DELETE FROM stays_property_promotions WHERE property_id = ?`, [propertyId]);
            
            if (promotionsData && promotionsData.length > 0) {
                for (const promotion of promotionsData) {
                    await executeQuery(
                        `INSERT INTO stays_property_promotions (
                            property_id, promotion_type, title, description,
                            discount_percentage, discount_amount,
                            start_date, end_date, is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            propertyId,
                            promotion.promotionType,
                            promotion.title,
                            promotion.description,
                            promotion.discountPercentage,
                            promotion.discountAmount,
                            promotion.startDate,
                            promotion.endDate,
                            promotion.isActive !== false ? 1 : 0
                        ]
                    );
                }
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving promotions:', error);
            throw error;
        }
    }

    // Step 8: Save Images
    async saveImages(userId, propertyId, imagesData) {
        try {
            // Property images
            if (imagesData.propertyImages && imagesData.propertyImages.length > 0) {
                await executeQuery(`DELETE FROM stays_property_images WHERE property_id = ?`, [propertyId]);
                for (let i = 0; i < imagesData.propertyImages.length; i++) {
                    const img = imagesData.propertyImages[i];
                    await executeQuery(
                        `INSERT INTO stays_property_images (
                            property_id, image_url, image_order, is_primary
                        ) VALUES (?, ?, ?, ?)`,
                        [propertyId, img.url, i, img.isPrimary ? 1 : 0]
                    );
                }
            }

            // Room images
            if (imagesData.roomImages && Object.keys(imagesData.roomImages).length > 0) {
                for (const [roomId, images] of Object.entries(imagesData.roomImages)) {
                    await executeQuery(`DELETE FROM stays_room_images WHERE room_id = ?`, [roomId]);
                    for (let i = 0; i < images.length; i++) {
                        const img = images[i];
                        await executeQuery(
                            `INSERT INTO stays_room_images (
                                room_id, image_url, image_order, is_primary
                            ) VALUES (?, ?, ?, ?)`,
                            [roomId, img.url, i, img.isPrimary ? 1 : 0]
                        );
                    }
                }
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving images:', error);
            throw error;
        }
    }

    // Step 9: Save Tax Details
    async saveTaxDetails(userId, propertyId, taxData) {
        try {
            const existing = await executeQuery(
                `SELECT tax_detail_id FROM stays_property_tax_details WHERE property_id = ?`,
                [propertyId]
            );

            if (existing.length > 0) {
                await executeQuery(
                    `UPDATE stays_property_tax_details SET
                        legal_name = ?, vat_registered = ?, vat_id = ?, updated_at = NOW()
                    WHERE property_id = ?`,
                    [
                        taxData.legalName,
                        taxData.vatRegistered || 'no',
                        taxData.vatId,
                        propertyId
                    ]
                );
            } else {
                await executeQuery(
                    `INSERT INTO stays_property_tax_details (
                        property_id, legal_name, vat_registered, vat_id
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        propertyId,
                        taxData.legalName,
                        taxData.vatRegistered || 'no',
                        taxData.vatId
                    ]
                );
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving tax details:', error);
            throw error;
        }
    }

    // Step 10: Save Connectivity Settings
    async saveConnectivity(userId, propertyId, connectivityData) {
        try {
            const existing = await executeQuery(
                `SELECT connectivity_id FROM stays_property_connectivity WHERE property_id = ?`,
                [propertyId]
            );

            if (existing.length > 0) {
                await executeQuery(
                    `UPDATE stays_property_connectivity SET
                        add_connectivity_provider = ?, connectivity_provider_name = ?,
                        connectivity_provider_token = ?, is_connected = ?,
                        connected_at = ?, updated_at = NOW()
                    WHERE property_id = ?`,
                    [
                        connectivityData.addConnectivityProvider || 'no',
                        connectivityData.connectivityProviderName,
                        connectivityData.connectivityProviderToken,
                        connectivityData.isConnected ? 1 : 0,
                        connectivityData.isConnected ? new Date() : null,
                        propertyId
                    ]
                );
            } else {
                await executeQuery(
                    `INSERT INTO stays_property_connectivity (
                        property_id, add_connectivity_provider, connectivity_provider_name,
                        connectivity_provider_token, is_connected, connected_at
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        propertyId,
                        connectivityData.addConnectivityProvider || 'no',
                        connectivityData.connectivityProviderName,
                        connectivityData.connectivityProviderToken,
                        connectivityData.isConnected ? 1 : 0,
                        connectivityData.isConnected ? new Date() : null
                    ]
                );
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving connectivity:', error);
            throw error;
        }
    }

    // Check setup completion status
    async getSetupStatus(userId, propertyId) {
        try {
            const property = await executeQuery(
                `SELECT setup_complete, contract_accepted FROM stays_properties 
                WHERE property_id = ? AND user_id = ?`,
                [propertyId, userId]
            );

            if (property.length === 0) {
                return { error: 'Property not found' };
            }

            // Check each step (contract step removed)
            const steps = {
                step1_email: true, // Email verification is separate
                step3_policies: false,
                step4_amenities: false,
                step5_rooms: false,
                step7_promotions: false,
                step8_images: false,
                step9_taxes: false,
                step10_connectivity: false
            };

            // Check each step
            // Ensure propertyId is an integer for the query
            const propertyIdInt = parseInt(propertyId);
            console.log(`[getSetupStatus] Checking policies for propertyId: ${propertyId} (converted to: ${propertyIdInt})`);
            const policies = await executeQuery(
                `SELECT policy_id FROM stays_property_policies WHERE property_id = ?`,
                [propertyIdInt]
            );
            console.log(`[getSetupStatus] Found ${policies.length} policies for propertyId ${propertyIdInt}`);
            steps.step3_policies = policies.length > 0;

            const amenities = await executeQuery(
                `SELECT amenity_id FROM stays_property_amenities WHERE property_id = ?`,
                [propertyIdInt]
            );
            steps.step4_amenities = amenities.length > 0;

            // Check rooms (step 5)
            const rooms = await executeQuery(
                `SELECT room_id FROM stays_rooms WHERE property_id = ?`,
                [propertyIdInt]
            );
            steps.step5_rooms = rooms.length > 0;

            const taxes = await executeQuery(
                `SELECT tax_detail_id FROM stays_property_tax_details WHERE property_id = ?`,
                [propertyIdInt]
            );
            steps.step9_taxes = taxes.length > 0;

            // Connectivity (step 10) - optional, so mark as complete even if not set
            const connectivity = await executeQuery(
                `SELECT connectivity_id FROM stays_property_connectivity WHERE property_id = ?`,
                [propertyIdInt]
            );
            // Connectivity is optional, so mark as complete even if none exist
            steps.step10_connectivity = true;

            // Check images (step 8)
            const images = await executeQuery(
                `SELECT image_id FROM stays_property_images WHERE property_id = ?`,
                [propertyIdInt]
            );
            // TODO: Images should be saved to DB when user uploads them
            // For now, mark as complete to allow submission (images are in localStorage)
            // Change to `steps.step8_images = images.length > 0;` once images are saved via API
            steps.step8_images = true;

            // Check promotions (step 7) - optional, so mark as complete if not set
            const promotions = await executeQuery(
                `SELECT promotion_id FROM stays_property_promotions WHERE property_id = ?`,
                [propertyId]
            );
            // Promotions are optional, so mark as complete even if none exist
            steps.step7_promotions = true;

            const allComplete = Object.values(steps).every(step => step === true);

            return {
                steps,
                allComplete,
                setupComplete: property[0].setup_complete === 1
            };
        } catch (error) {
            console.error('Error getting setup status:', error);
            throw error;
        }
    }

    // Get Policies
    async getPolicies(userId, propertyId) {
        try {
            const propertyIdInt = parseInt(propertyId);
            const policies = await executeQuery(
                `SELECT * FROM stays_property_policies WHERE property_id = ?`,
                [propertyIdInt]
            );

            if (policies.length === 0) {
                return null;
            }

            const policy = policies[0];
            
            // Parse languages JSON if it exists
            let languages = [];
            if (policy.languages) {
                try {
                    languages = typeof policy.languages === 'string' 
                        ? JSON.parse(policy.languages) 
                        : policy.languages;
                } catch (e) {
                    languages = [];
                }
            }

            // Convert to frontend format
            return {
                languages: languages,
                acceptCreditDebitCards: policy.accept_credit_debit_cards === 1,
                acceptTravoozCard: policy.accept_travooz_card === 1,
                acceptMobileMoney: policy.accept_mobile_money === 1,
                acceptAirtelMoney: policy.accept_airtel_money === 1,
                requireDeposits: policy.require_deposits || 'no',
                cancellationWindow: policy.cancellation_window || '24_hour',
                cancellationFee: policy.cancellation_fee || 'first_night_plus_tax',
                vatPercentage: policy.vat_percentage || 18.00,
                tourismTaxPercentage: policy.tourism_tax_percentage || 3.00,
                taxesIncludedInRate: policy.taxes_included_in_rate === 1,
                requestTaxTeamAssistance: policy.request_tax_team_assistance === 1
            };
        } catch (error) {
            console.error('Error getting policies:', error);
            throw error;
        }
    }

    // Get Amenities
    async getAmenities(userId, propertyId) {
        try {
            const propertyIdInt = parseInt(propertyId);
            const amenities = await executeQuery(
                `SELECT * FROM stays_property_amenities WHERE property_id = ?`,
                [propertyIdInt]
            );

            if (amenities.length === 0) {
                return null;
            }

            const amenity = amenities[0];
            
            // Parse themes JSON if it exists
            let themes = [];
            if (amenity.themes) {
                try {
                    themes = typeof amenity.themes === 'string' 
                        ? JSON.parse(amenity.themes) 
                        : amenity.themes;
                } catch (e) {
                    themes = [];
                }
            }

            // Convert to frontend format
            return {
                minCheckInAge: amenity.min_check_in_age || '',
                checkInTime: amenity.check_in_time || '',
                checkInEnds: amenity.check_in_ends || '',
                hasFrontDesk: amenity.has_front_desk || 'no',
                offerBreakfast: amenity.offer_breakfast || 'no',
                breakfastType: amenity.breakfast_type || '',
                offerInternet: amenity.offer_internet || 'no',
                offerParking: amenity.offer_parking || 'no',
                hasPool: amenity.has_pool === 1,
                poolType: amenity.pool_type || '',
                hasSpa: amenity.has_spa === 1,
                hasFitnessCenter: amenity.has_fitness_center === 1,
                hasRestaurant: amenity.has_restaurant === 1,
                hasBar: amenity.has_bar === 1,
                hasConcierge: amenity.has_concierge === 1,
                hasLaundry: amenity.has_laundry === 1,
                hasBusinessCenter: amenity.has_business_center === 1,
                petsAllowed: amenity.pets_allowed || 'no',
                themes: themes
            };
        } catch (error) {
            console.error('Error getting amenities:', error);
            throw error;
        }
    }

    // Get Tax Details
    async getTaxDetails(userId, propertyId) {
        try {
            const propertyIdInt = parseInt(propertyId);
            const taxes = await executeQuery(
                `SELECT * FROM stays_property_tax_details WHERE property_id = ?`,
                [propertyIdInt]
            );

            if (taxes.length === 0) {
                return null;
            }

            const tax = taxes[0];
            
            // Convert to frontend format
            return {
                vatNumber: tax.vat_number || '',
                tourismTaxNumber: tax.tourism_tax_number || '',
                vatPercentage: tax.vat_percentage || 18.00,
                tourismTaxPercentage: tax.tourism_tax_percentage || 3.00,
                taxesIncludedInRate: tax.taxes_included_in_rate === 1,
                requestTaxTeamAssistance: tax.request_tax_team_assistance === 1
            };
        } catch (error) {
            console.error('Error getting tax details:', error);
            throw error;
        }
    }

    // Get Connectivity Settings
    async getConnectivity(userId, propertyId) {
        try {
            const propertyIdInt = parseInt(propertyId);
            const connectivity = await executeQuery(
                `SELECT * FROM stays_property_connectivity WHERE property_id = ?`,
                [propertyIdInt]
            );

            if (connectivity.length === 0) {
                return null;
            }

            const conn = connectivity[0];
            
            // Convert to frontend format
            return {
                wifiAvailable: conn.wifi_available === 1,
                wifiType: conn.wifi_type || '',
                wifiSpeed: conn.wifi_speed || '',
                wifiCost: conn.wifi_cost || 'free',
                mobileNetwork: conn.mobile_network || '',
                signalStrength: conn.signal_strength || ''
            };
        } catch (error) {
            console.error('Error getting connectivity:', error);
            throw error;
        }
    }

    // Submit final listing
    async submitListing(userId, propertyId) {
        try {
            // Check if all steps are complete
            const status = await this.getSetupStatus(userId, propertyId);
            
            if (!status.allComplete) {
                return { 
                    success: false, 
                    message: 'Please complete all setup steps before submitting',
                    incompleteSteps: Object.entries(status.steps)
                        .filter(([_, complete]) => !complete)
                        .map(([step, _]) => step)
                };
            }

            // Mark as complete and submitted, but NOT live (waiting for admin approval)
            await executeQuery(
                `UPDATE stays_properties SET
                    setup_complete = 1, submitted_at = NOW(), status = 'pending', is_live = 0
                WHERE property_id = ? AND user_id = ?`,
                [propertyId, userId]
            );

            return { success: true, message: 'Listing submitted successfully' };
        } catch (error) {
            console.error('Error submitting listing:', error);
            throw error;
        }
    }

    // Delete Room
    async deleteRoom(userId, propertyId, roomId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verify the room belongs to the property and user
            const [roomCheck] = await connection.execute(
                `SELECT sr.room_id, sp.user_id, sp.property_id
                 FROM stays_rooms sr
                 INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
                 WHERE sr.room_id = ? AND sr.property_id = ?`,
                [roomId, propertyId]
            );

            if (!roomCheck || roomCheck.length === 0) {
                throw new Error('Room not found or does not belong to this property');
            }

            const room = roomCheck[0];
            if (Number(room.user_id) !== Number(userId)) {
                throw new Error('Unauthorized: You do not own this property');
            }

            // Delete related data first (foreign key constraints)
            // Delete room images
            await connection.execute(
                `DELETE FROM stays_room_images WHERE room_id = ?`,
                [roomId]
            );

            // Delete room beds
            await connection.execute(
                `DELETE FROM stays_room_beds WHERE room_id = ?`,
                [roomId]
            );

            // Delete room amenities
            await connection.execute(
                `DELETE FROM stays_room_amenities WHERE room_id = ?`,
                [roomId]
            );

            // Finally, delete the room itself
            await connection.execute(
                `DELETE FROM stays_rooms WHERE room_id = ? AND property_id = ?`,
                [roomId, propertyId]
            );

            await connection.commit();
            return { success: true, message: 'Room deleted successfully' };
        } catch (error) {
            await connection.rollback();
            console.error('Error deleting room:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new PropertySetupService();

