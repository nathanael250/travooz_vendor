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
            // Ensure propertyId is an integer
            const propertyIdInt = parseInt(propertyId);
            console.log(`[savePolicies] Saving policies for propertyId: ${propertyId} (converted to: ${propertyIdInt}), userId: ${userId}`);
            
            // Check if policy already exists
            const existing = await executeQuery(
                `SELECT policy_id FROM stays_property_policies WHERE property_id = ?`,
                [propertyIdInt]
            );
            console.log(`[savePolicies] Existing policies found: ${existing.length}`);

            const languagesJson = policiesData.languages ? JSON.stringify(policiesData.languages) : null;
            const cardTypesJson = policiesData.cardTypes ? JSON.stringify(policiesData.cardTypes) : null;
            const depositTypesJson = policiesData.depositTypes ? JSON.stringify(policiesData.depositTypes) : null;

            if (existing.length > 0) {
                // Update existing
                await executeQuery(
                    `UPDATE stays_property_policies SET
                        languages = ?, accept_cash = ?, accept_credit_debit_cards = ?,
                        card_types = ?, installments_at_front_desk = ?,
                        require_deposits = ?, deposit_types = ?, incidentals_payment_form = ?,
                        property_time_zone = ?, cancellation_window = ?, cancellation_fee = ?,
                        cut_off_time = ?, vat_percentage = ?, tourism_tax_percentage = ?,
                        taxes_included_in_rate = ?, request_tax_team_assistance = ?,
                        billing_currency = ?, updated_at = NOW()
                    WHERE property_id = ?`,
                    [
                        languagesJson,
                        policiesData.acceptCash ? 1 : 0,
                        policiesData.acceptCreditDebitCards ? 1 : 0,
                        cardTypesJson,
                        policiesData.installmentsAtFrontDesk ? 1 : 0,
                        policiesData.requireDeposits || 'no',
                        depositTypesJson,
                        policiesData.incidentalsPaymentForm || 'cash_only',
                        policiesData.propertyTimeZone,
                        policiesData.cancellationWindow || '24_hour',
                        policiesData.cancellationFee || 'first_night_plus_tax',
                        policiesData.cutOffTime || '18:00:00',
                        policiesData.vatPercentage || null,
                        policiesData.tourismTaxPercentage || null,
                        policiesData.taxesIncludedInRate ? 1 : 0,
                        policiesData.requestTaxTeamAssistance ? 1 : 0,
                        policiesData.billingCurrency,
                        propertyIdInt
                    ]
                );
                console.log(`[savePolicies] Updated existing policy for propertyId ${propertyIdInt}`);
            } else {
                // Insert new
                await executeQuery(
                    `INSERT INTO stays_property_policies (
                        property_id, languages, accept_cash, accept_credit_debit_cards,
                        card_types, installments_at_front_desk, require_deposits,
                        deposit_types, incidentals_payment_form, property_time_zone,
                        cancellation_window, cancellation_fee, cut_off_time,
                        vat_percentage, tourism_tax_percentage, taxes_included_in_rate,
                        request_tax_team_assistance, billing_currency
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        propertyIdInt,
                        languagesJson,
                        policiesData.acceptCash ? 1 : 0,
                        policiesData.acceptCreditDebitCards ? 1 : 0,
                        cardTypesJson,
                        policiesData.installmentsAtFrontDesk ? 1 : 0,
                        policiesData.requireDeposits || 'no',
                        depositTypesJson,
                        policiesData.incidentalsPaymentForm || 'cash_only',
                        policiesData.propertyTimeZone,
                        policiesData.cancellationWindow || '24_hour',
                        policiesData.cancellationFee || 'first_night_plus_tax',
                        policiesData.cutOffTime || '18:00:00',
                        policiesData.vatPercentage || null,
                        policiesData.tourismTaxPercentage || null,
                        policiesData.taxesIncludedInRate ? 1 : 0,
                        policiesData.requestTaxTeamAssistance ? 1 : 0,
                        policiesData.billingCurrency
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

            const additionalAmenitiesJson = amenitiesData.additionalAmenities ? JSON.stringify(amenitiesData.additionalAmenities) : null;
            const themesJson = amenitiesData.themes ? JSON.stringify(amenitiesData.themes) : null;

            const amenityFields = {
                min_check_in_age: amenitiesData.minCheckInAge || null,
                check_in_time: amenitiesData.checkInTime || null,
                check_in_ends: amenitiesData.checkInEnds || null,
                check_out_time: amenitiesData.checkOutTime || null,
                has_front_desk: amenitiesData.hasFrontDesk || 'no',
                front_desk_schedule: amenitiesData.frontDeskSchedule || null,
                front_desk_24_hours: amenitiesData.frontDesk24Hours ? 1 : 0,
                desk_opens: amenitiesData.deskOpens || null,
                desk_closes: amenitiesData.deskCloses || null,
                self_check_in_available: amenitiesData.selfCheckInAvailable || 'no',
                guest_access_method: amenitiesData.guestAccessMethod || null,
                late_check_in_available: amenitiesData.lateCheckInAvailable || 'no',
                late_check_in_cost: amenitiesData.lateCheckInCost || null,
                late_check_in_charge_type: amenitiesData.lateCheckInChargeType || null,
                late_check_in_amount: amenitiesData.lateCheckInAmount || null,
                advance_notice_required: amenitiesData.advanceNoticeRequired ? 1 : 0,
                advance_notice_hours: amenitiesData.advanceNoticeHours || null,
                late_check_in_different_location: amenitiesData.lateCheckInDifferentLocation ? 1 : 0,
                late_check_in_address: amenitiesData.lateCheckInAddress || null,
                offer_breakfast: amenitiesData.offerBreakfast || 'no',
                breakfast_type: amenitiesData.breakfastType || null,
                offer_internet: amenitiesData.offerInternet || 'no',
                wifi_in_guestrooms: amenitiesData.wifiInGuestrooms ? 1 : 0,
                wifi_guestrooms_min_speed: amenitiesData.wifiGuestroomsMinSpeed || null,
                wifi_in_public_areas: amenitiesData.wifiInPublicAreas ? 1 : 0,
                wired_internet: amenitiesData.wiredInternet ? 1 : 0,
                wired_internet_in_guestrooms: amenitiesData.wiredInternetInGuestrooms ? 1 : 0,
                offer_parking: amenitiesData.offerParking || 'no',
                self_parking: amenitiesData.selfParking ? 1 : 0,
                valet_parking: amenitiesData.valetParking ? 1 : 0,
                electric_car_charging: amenitiesData.electricCarCharging ? 1 : 0,
                parking_fee: amenitiesData.parkingFee || null,
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
                has_pet_surcharge: amenitiesData.hasPetSurcharge || 'no',
                pet_surcharge_amount: amenitiesData.petSurchargeAmount || null,
                pet_surcharge_currency: amenitiesData.petSurchargeCurrency || 'USD',
                pet_surcharge_unit: amenitiesData.petSurchargeUnit || 'per_pet',
                pet_surcharge_period: amenitiesData.petSurchargePeriod || 'per_night',
                pet_surcharge_max_fee_per_stay: amenitiesData.petSurchargeMaxFeePerStay ? 1 : 0,
                pet_surcharge_max_fee_amount: amenitiesData.petSurchargeMaxFeeAmount || null,
                pet_fee_varies_by_stay_length: amenitiesData.petFeeVariesByStayLength ? 1 : 0,
                additional_amenities: additionalAmenitiesJson,
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
                const [existingAmenities] = await connection.execute(
                    `SELECT room_amenity_id FROM stays_room_amenities WHERE room_id = ?`,
                    [roomId]
                );

                const bathroomAmenitiesJson = roomData.bathroomAmenities ? JSON.stringify(roomData.bathroomAmenities) : null;
                const kitchenFacilitiesJson = roomData.kitchenFacilities ? JSON.stringify(roomData.kitchenFacilities) : null;
                const roomLayoutJson = roomData.roomLayout ? JSON.stringify(roomData.roomLayout) : null;
                const additionalAmenitiesJson = roomData.additionalAmenities ? JSON.stringify(roomData.additionalAmenities) : null;

                if (existingAmenities.length > 0) {
                    await connection.execute(
                        `UPDATE stays_room_amenities SET
                            bathroom_type = ?, number_of_bathrooms = ?, bathroom_amenities = ?,
                            has_kitchen = ?, kitchen_facilities = ?,
                            has_air_conditioning = ?, has_heating = ?,
                            has_view = ?, room_view = ?,
                            room_size_sqm = ?, room_size_sqft = ?,
                            has_balcony = ?, has_terrace = ?, has_patio = ?,
                            room_layout = ?, additional_amenities = ?,
                            updated_at = NOW()
                        WHERE room_id = ?`,
                        [
                            nullIfUndefined(roomData.bathroomType) || 'private',
                            nullIfUndefined(roomData.numberOfBathrooms) ?? 1,
                            bathroomAmenitiesJson,
                            (roomData.hasKitchen === true) ? 1 : 0,
                            kitchenFacilitiesJson,
                            (roomData.hasAirConditioning === true) ? 1 : 0,
                            (roomData.hasHeating === true) ? 1 : 0,
                            nullIfUndefined(roomData.hasView) || 'no',
                            nullIfUndefined(roomData.roomView),
                            nullIfUndefined(roomData.roomSizeSqm),
                            nullIfUndefined(roomData.roomSizeSqft),
                            (roomData.hasBalcony === true) ? 1 : 0,
                            (roomData.hasTerrace === true) ? 1 : 0,
                            (roomData.hasPatio === true) ? 1 : 0,
                            roomLayoutJson,
                            additionalAmenitiesJson,
                            roomId
                        ]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO stays_room_amenities (
                            room_id, bathroom_type, number_of_bathrooms, bathroom_amenities,
                            has_kitchen, kitchen_facilities, has_air_conditioning, has_heating,
                            has_view, room_view, room_size_sqm, room_size_sqft,
                            has_balcony, has_terrace, has_patio, room_layout, additional_amenities
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            roomId,
                            nullIfUndefined(roomData.bathroomType) || 'private',
                            nullIfUndefined(roomData.numberOfBathrooms) ?? 1,
                            bathroomAmenitiesJson,
                            (roomData.hasKitchen === true) ? 1 : 0,
                            kitchenFacilitiesJson,
                            (roomData.hasAirConditioning === true) ? 1 : 0,
                            (roomData.hasHeating === true) ? 1 : 0,
                            nullIfUndefined(roomData.hasView) || 'no',
                            nullIfUndefined(roomData.roomView),
                            nullIfUndefined(roomData.roomSizeSqm),
                            nullIfUndefined(roomData.roomSizeSqft),
                            (roomData.hasBalcony === true) ? 1 : 0,
                            (roomData.hasTerrace === true) ? 1 : 0,
                            (roomData.hasPatio === true) ? 1 : 0,
                            roomLayoutJson,
                            additionalAmenitiesJson
                        ]
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

            // Check each step
            const steps = {
                step1_email: true, // Email verification is separate
                step2_contract: property[0].contract_accepted === 1,
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
}

module.exports = new PropertySetupService();

