/**
 * Unified User Service
 * 
 * Centralized service for creating and managing users in the unified users table.
 * This replaces direct inserts into service-specific user tables.
 */

const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const { SERVICES } = require('../../constants/services');

class UnifiedUserService {
    /**
     * Create a new user in the unified users table
     * @param {Object} userData - User data
     * @param {string} userData.service - Service identifier (restaurant, car_rental, tours, stays)
     * @param {string} userData.email - User email
     * @param {string} userData.password - Plain text password (will be hashed)
     * @param {string} userData.name - User full name
     * @param {string} userData.phone - User phone (optional)
     * @param {string} userData.role - User role (default: 'vendor')
     * @returns {Promise<Object>} - Created user with id
     */
    static async createUser(userData) {
        const { service, email, password, name, phone, role = 'vendor' } = userData;

        if (!service || !email || !password) {
            throw new Error('Service, email, and password are required');
        }

        if (!Object.values(SERVICES).includes(service)) {
            throw new Error(`Invalid service: ${service}`);
        }

        // Check if user already exists for this service
        const existing = await this.getUserByEmail(service, email);
        if (existing) {
            throw new Error(`User with email ${email} already exists for service ${service}`);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into unified users table
        const result = await executeQuery(
            `INSERT INTO users (service, email, password_hash, role, is_active, email_verified, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [service, email, passwordHash, role, 1, 0]
        );

        const userId = result.insertId;

        // Create service-specific profile
        await this.createServiceProfile(service, userId, {
            name,
            phone
        });

        return {
            id: userId,
            user_id: userId,
            service,
            email,
            name,
            phone,
            role,
            email_verified: false,
            is_active: true
        };
    }

    /**
     * Get user by email and service
     * @param {string} service - Service identifier
     * @param {string} email - User email
     * @returns {Promise<Object|null>} - User object or null
     */
    static async getUserByEmail(service, email) {
        const users = await executeQuery(
            `SELECT u.*, 
                    rp.name as profile_name, rp.phone as profile_phone, rp.restaurant_id,
                    crp.name as crp_name, crp.phone as crp_phone, crp.car_rental_business_id,
                    tp.name as tp_name, tp.phone as tp_phone, tp.tour_business_id,
                    sp.name as sp_name, sp.phone as sp_phone, sp.property_id
             FROM users u
             LEFT JOIN restaurant_profiles rp ON rp.user_id = u.id AND u.service = 'restaurant'
             LEFT JOIN car_rental_profiles crp ON crp.user_id = u.id AND u.service = 'car_rental'
             LEFT JOIN tour_profiles tp ON tp.user_id = u.id AND u.service = 'tours'
             LEFT JOIN stay_profiles sp ON sp.user_id = u.id AND u.service = 'stays'
             WHERE u.service = ? AND u.email COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci`,
            [service, email]
        );

        if (users.length === 0) {
            return null;
        }

        const user = users[0];
        
        // Map profile data to user object based on service
        if (service === SERVICES.RESTAURANT) {
            user.name = user.profile_name || user.name;
            user.phone = user.profile_phone || user.phone;
            user.restaurant_id = user.restaurant_id;
        } else if (service === SERVICES.CAR_RENTAL) {
            user.name = user.crp_name || user.name;
            user.phone = user.crp_phone || user.phone;
            user.car_rental_business_id = user.car_rental_business_id;
        } else if (service === SERVICES.TOURS) {
            user.name = user.tp_name || user.name;
            user.phone = user.tp_phone || user.phone;
            user.tour_business_id = user.tour_business_id;
        } else if (service === SERVICES.STAYS) {
            user.name = user.sp_name || user.name;
            user.phone = user.sp_phone || user.phone;
            user.property_id = user.property_id;
        }

        return user;
    }

    /**
     * Get user by ID and service
     * @param {string} service - Service identifier
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} - User object or null
     */
    static async getUserById(service, userId) {
        const users = await executeQuery(
            `SELECT u.*, 
                    rp.name as profile_name, rp.phone as profile_phone, rp.restaurant_id,
                    crp.name as crp_name, crp.phone as crp_phone, crp.car_rental_business_id,
                    tp.name as tp_name, tp.phone as tp_phone, tp.tour_business_id,
                    sp.name as sp_name, sp.phone as sp_phone, sp.property_id
             FROM users u
             LEFT JOIN restaurant_profiles rp ON rp.user_id = u.id AND u.service = 'restaurant'
             LEFT JOIN car_rental_profiles crp ON crp.user_id = u.id AND u.service = 'car_rental'
             LEFT JOIN tour_profiles tp ON tp.user_id = u.id AND u.service = 'tours'
             LEFT JOIN stay_profiles sp ON sp.user_id = u.id AND u.service = 'stays'
             WHERE u.service = ? AND u.id = ?`,
            [service, userId]
        );

        if (users.length === 0) {
            return null;
        }

        const user = users[0];
        
        // Map profile data
        if (service === SERVICES.RESTAURANT) {
            user.name = user.profile_name || user.name;
            user.phone = user.profile_phone || user.phone;
        } else if (service === SERVICES.CAR_RENTAL) {
            user.name = user.crp_name || user.name;
            user.phone = user.crp_phone || user.phone;
        } else if (service === SERVICES.TOURS) {
            user.name = user.tp_name || user.name;
            user.phone = user.tp_phone || user.phone;
        } else if (service === SERVICES.STAYS) {
            user.name = user.sp_name || user.name;
            user.phone = user.sp_phone || user.phone;
        }

        return user;
    }

    /**
     * Create service-specific profile
     * @param {string} service - Service identifier
     * @param {number} userId - User ID from unified users table
     * @param {Object} profileData - Profile data
     * @returns {Promise<Object>} - Created profile
     */
    static async createServiceProfile(service, userId, profileData) {
        // Helper function to convert undefined to null for SQL
        const toNull = (value) => (value === undefined ? null : value);
        
        const { name, phone, phone_verified = 0, address, gender, profile_image, cover_image } = profileData;

        if (service === SERVICES.RESTAURANT) {
            await executeQuery(
                `INSERT INTO restaurant_profiles (user_id, name, phone, phone_verified, address, gender, profile_image, cover_image, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
                [userId, toNull(name), toNull(phone), phone_verified, toNull(address), toNull(gender), toNull(profile_image), toNull(cover_image)]
            );
        } else if (service === SERVICES.CAR_RENTAL) {
            await executeQuery(
                `INSERT INTO car_rental_profiles (user_id, name, phone, status, created_at, updated_at)
                 VALUES (?, ?, ?, 'draft', NOW(), NOW())`,
                [userId, toNull(name), toNull(phone)]
            );
        } else if (service === SERVICES.TOURS) {
            await executeQuery(
                `INSERT INTO tour_profiles (user_id, name, phone, phone_verified, address, gender, profile_image, cover_image, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
                [userId, toNull(name), toNull(phone), phone_verified, toNull(address), toNull(gender), toNull(profile_image), toNull(cover_image)]
            );
        } else if (service === SERVICES.STAYS) {
            await executeQuery(
                `INSERT INTO stay_profiles (user_id, name, phone, phone_verified, address, gender, profile_image, cover_image, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
                [userId, toNull(name), toNull(phone), phone_verified, toNull(address), toNull(gender), toNull(profile_image), toNull(cover_image)]
            );
        }
    }

    /**
     * Update user email verification status
     * @param {string} service - Service identifier
     * @param {number} userId - User ID
     * @param {boolean} verified - Verification status
     * @returns {Promise<void>}
     */
    static async updateEmailVerification(service, userId, verified) {
        await executeQuery(
            `UPDATE users SET email_verified = ? WHERE service = ? AND id = ?`,
            [verified ? 1 : 0, service, userId]
        );
    }

    /**
     * Update user password
     * @param {string} service - Service identifier
     * @param {number} userId - User ID
     * @param {string} newPassword - New plain text password
     * @returns {Promise<void>}
     */
    static async updatePassword(service, userId, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await executeQuery(
            `UPDATE users SET password_hash = ? WHERE service = ? AND id = ?`,
            [passwordHash, service, userId]
        );
    }
}

module.exports = UnifiedUserService;


