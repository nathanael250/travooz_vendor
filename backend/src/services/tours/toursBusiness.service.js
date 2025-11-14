const ToursBusiness = require('../../models/tours/toursBusiness.model');
const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const ToursEmailVerificationService = require('./toursEmailVerification.service');

class ToursBusinessService {
    async createTourBusiness(data) {
        try {
            console.log('🔍 createTourBusiness called with data:', {
                hasUserId: !!data.user_id,
                userId: data.user_id,
                hasEmail: !!data.email,
                email: data.email,
                hasPassword: !!data.password,
                hasFirstName: !!data.firstName,
                hasLastName: !!data.lastName,
                hasTourBusinessName: !!data.tourBusinessName
            });
            
            // Create user account first if user data is provided (Step 3)
            let userId = data.user_id;
            
            // Check if we need to create a user (no userId AND have email/password)
            // Normalize email and password - treat empty strings as undefined
            const email = data.email && typeof data.email === 'string' ? data.email.trim() : null;
            const password = data.password && typeof data.password === 'string' ? data.password.trim() : null;
            
            const needsUserCreation = !userId && 
                                     email && 
                                     password && 
                                     email.length > 0 && 
                                     password.length > 0;
            
            console.log('🔍 User creation check:', {
                hasUserId: !!userId,
                hasEmail: !!email,
                hasPassword: !!password,
                emailValue: email || '',
                passwordLength: password ? password.length : 0,
                needsUserCreation: needsUserCreation
            });
            
            if (needsUserCreation) {
                console.log('✅ Creating user account for email:', email);
                
                // Check if user already exists in tours_users table
                let existingUser;
                try {
                    existingUser = await executeQuery(
                        `SELECT user_id FROM tours_users WHERE email = ?`,
                        [email]
                    );
                } catch (tableError) {
                    // If tours_users table doesn't exist, try stays_users as fallback
                    console.warn('tours_users table not found, trying stays_users:', tableError.message);
                    existingUser = await executeQuery(
                        `SELECT user_id FROM stays_users WHERE email = ?`,
                        [email]
                    );
                }

                if (existingUser && existingUser.length > 0) {
                    userId = existingUser[0].user_id;
                    console.log(`✅ Found existing user with ID: ${userId}`);
                } else {
                    // Create new user account - try tours_users first, fallback to stays_users
                    const hashedPassword = await bcrypt.hash(password, 10);
                    
                    // Combine first_name and last_name into a single name field
                    const fullName = [data.firstName || '', data.lastName || ''].filter(Boolean).join(' ').trim() || email.split('@')[0];
                    
                    let userResult;
                    try {
                        // Try tours_users table first
                        userResult = await executeQuery(
                            `INSERT INTO tours_users (
                                role, name, email, phone, password_hash, 
                                address, gender, is_active, email_verified
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                'vendor',
                                fullName,
                                email,
                                data.countryCode && data.phone ? `${data.countryCode}${data.phone}` : data.phone || null,
                                hashedPassword,
                                null, // address
                                null, // gender
                                1, // is_active
                                0 // email_verified
                            ]
                        );
                        console.log(`✅ Created new user in tours_users with ID: ${userResult.insertId}`);
                    } catch (insertError) {
                        // If tours_users table doesn't exist, use stays_users as fallback
                        console.warn('tours_users table not found, using stays_users:', insertError.message);
                        userResult = await executeQuery(
                            `INSERT INTO stays_users (
                                role, name, email, phone, password_hash, 
                                address, gender, is_active, email_verified
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                'vendor',
                                fullName,
                                email,
                                data.countryCode && data.phone ? `${data.countryCode}${data.phone}` : data.phone || null,
                                hashedPassword,
                                null, // address
                                null, // gender
                                1, // is_active
                                0 // email_verified
                            ]
                        );
                        console.log(`✅ Created new user in stays_users with ID: ${userResult.insertId}`);
                    }
                    
                    if (!userResult || !userResult.insertId) {
                        throw new Error('Failed to create user account. insertId is missing.');
                    }
                    
                    userId = userResult.insertId;
                    console.log(`✅ User created successfully with ID: ${userId}`);
                }
            }
            
            // Validate that userId is set before creating tour business
            if (!userId) {
                console.error('❌ User ID validation failed:', {
                    providedUserId: data.user_id,
                    providedEmail: email,
                    providedPassword: password ? '***' : null,
                    emailExists: !!email,
                    passwordExists: !!password,
                    emailValue: email,
                    passwordLength: password ? password.length : 0
                });
                throw new Error('User ID is required. Please provide user_id or email/password to create a new user account. Received data: ' + JSON.stringify({
                    hasEmail: !!email,
                    hasPassword: !!password,
                    email: email || null,
                    passwordLength: password ? password.length : 0,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    user_id: data.user_id || null
                }));
            }
            
            console.log(`✅ Using userId: ${userId} for tour business creation`);

            // Provide default location values if not provided
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

            const tourBusiness = new ToursBusiness({
                user_id: userId,
                location: data.location && data.location.trim() ? data.location : defaultLocation,
                location_data: data.locationData || defaultLocationData,
                tour_business_name: data.tourBusinessName,
                tour_type: data.tourType,
                tour_type_name: data.tourTypeName,
                subcategory_id: data.subcategoryId,
                description: data.description,
                phone: data.phone,
                country_code: data.countryCode || '+250',
                currency: data.currency || 'RWF',
                status: 'draft'
            });

            await tourBusiness.save();
            
            // Initialize setup progress
            await this.initializeSetupProgress(tourBusiness.tour_business_id, userId);
            
            // Note: Email verification code will be sent AFTER step 3 completion
            // This is handled separately when user navigates to email verification page
            
            return tourBusiness;
        } catch (error) {
            console.error('Error creating tour business:', error);
            throw error;
        }
    }

    async initializeSetupProgress(tourBusinessId, userId) {
        try {
            await executeQuery(
                `INSERT INTO tours_setup_progress (
                    tour_business_id, user_id, current_step
                ) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE current_step = ?`,
                [tourBusinessId, userId, 1, 1]
            );
        } catch (error) {
            console.error('Error initializing setup progress:', error);
            // Don't throw - this is not critical
        }
    }

    async updateTourBusiness(tourBusinessId, data) {
        try {
            const tourBusiness = await ToursBusiness.findById(tourBusinessId);
            if (!tourBusiness) {
                throw new Error('Tour business not found');
            }

            // Update tour business fields
            if (data.location !== undefined) tourBusiness.location = data.location;
            if (data.locationData !== undefined) tourBusiness.location_data = data.locationData;
            if (data.tourBusinessName !== undefined) tourBusiness.tour_business_name = data.tourBusinessName;
            if (data.tourType !== undefined) tourBusiness.tour_type = data.tourType;
            if (data.tourTypeName !== undefined) tourBusiness.tour_type_name = data.tourTypeName;
            if (data.subcategoryId !== undefined) tourBusiness.subcategory_id = data.subcategoryId;
            if (data.description !== undefined) tourBusiness.description = data.description;
            if (data.phone !== undefined) tourBusiness.phone = data.phone;
            if (data.countryCode !== undefined) tourBusiness.country_code = data.countryCode;
            if (data.currency !== undefined) tourBusiness.currency = data.currency;
            if (data.status !== undefined) tourBusiness.status = data.status;
            if (data.setup_complete !== undefined) tourBusiness.setup_complete = data.setup_complete;

            await tourBusiness.update();
            return tourBusiness;
        } catch (error) {
            console.error('Error updating tour business:', error);
            throw error;
        }
    }

    async getTourBusinessById(tourBusinessId) {
        try {
            const tourBusiness = await ToursBusiness.findById(tourBusinessId);
            return tourBusiness;
        } catch (error) {
            console.error('Error getting tour business:', error);
            throw error;
        }
    }

    async getTourBusinessesByUserId(userId) {
        try {
            const tourBusinesses = await ToursBusiness.findByUserId(userId);
            return tourBusinesses;
        } catch (error) {
            console.error('Error getting tour businesses by user:', error);
            throw error;
        }
    }

    async deleteTourBusiness(tourBusinessId) {
        try {
            const tourBusiness = await ToursBusiness.findById(tourBusinessId);
            if (!tourBusiness) {
                throw new Error('Tour business not found');
            }
            await tourBusiness.delete();
            return true;
        } catch (error) {
            console.error('Error deleting tour business:', error);
            throw error;
        }
    }
}

module.exports = new ToursBusinessService();


