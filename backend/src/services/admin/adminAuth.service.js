const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminAuthService {
    /**
     * Login admin user with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Find user in travooz_user table
            const users = await executeQuery(
                `SELECT * FROM travooz_user WHERE email = ?`,
                [email]
            );

            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Check if user is active
            if (!user.is_active) {
                throw new Error('Your account has been deactivated. Please contact support.');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Update last login
            await executeQuery(
                `UPDATE travooz_user SET last_login = NOW() WHERE user_id = ?`,
                [user.user_id]
            );

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.user_id,
                    userId: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return {
                token,
                user: {
                    id: user.user_id,
                    userId: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    phone: user.phone
                }
            };
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    }

    /**
     * Get admin user profile
     * @param {number} userId 
     */
    async getProfile(userId) {
        try {
            const users = await executeQuery(
                `SELECT user_id, role, name, email, phone, is_active, last_login, created_at 
                 FROM travooz_user WHERE user_id = ?`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            return users[0];
        } catch (error) {
            console.error('Get admin profile error:', error);
            throw error;
        }
    }
}

module.exports = new AdminAuthService();

