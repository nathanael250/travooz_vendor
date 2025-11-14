const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CarRentalAuthService {
    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            console.log('🔍 Car rental login attempt for email:', email);

            // Find user in car_rental_users table
            const users = await executeQuery(
                `SELECT * FROM car_rental_users WHERE email = ?`,
                [email]
            );

            console.log('🔍 Found users:', users.length);

            if (users.length === 0) {
                console.log('❌ No user found with email:', email);
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Check if user is active (if the column exists)
            if (user.is_active !== undefined && !user.is_active) {
                console.log('❌ User account is deactivated:', email);
                throw new Error('Your account has been deactivated. Please contact support.');
            }

            // Verify password
            console.log('🔍 Verifying password for user:', user.user_id);
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                console.log('❌ Invalid password for user:', email);
                throw new Error('Invalid email or password');
            }

            console.log('✅ Password verified successfully for user:', email);

            // Get car rental business for this user
            const businesses = await executeQuery(
                `SELECT car_rental_business_id, business_name, status 
                 FROM car_rental_businesses 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [user.user_id]
            );

            // Update last login (if the column exists)
            if (user.last_login !== undefined) {
                await executeQuery(
                    `UPDATE car_rental_users SET last_login = NOW() WHERE user_id = ?`,
                    [user.user_id]
                );
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.user_id,
                    id: user.user_id,
                    email: user.email,
                    role: user.role || 'vendor'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            return {
                user: {
                    id: user.user_id,
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    role: user.role || 'vendor',
                    phone: user.phone
                },
                token,
                carRentalBusinessId: businesses.length > 0 ? businesses[0].car_rental_business_id : null,
                carRentalBusiness: businesses.length > 0 ? businesses[0] : null
            };
        } catch (error) {
            console.error('Error in car rental login:', error);
            throw error;
        }
    }

    /**
     * Get user profile
     * @param {number} userId 
     */
    async getProfile(userId) {
        try {
            const users = await executeQuery(
                `SELECT user_id, role, name, email, phone, created_at 
                 FROM car_rental_users 
                 WHERE user_id = ?`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            return users[0];
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }
}

module.exports = new CarRentalAuthService();

