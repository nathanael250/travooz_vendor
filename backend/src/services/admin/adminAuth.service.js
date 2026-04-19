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

            // Find user in unified users table with service='admin'
            const users = await executeQuery(
                `SELECT u.*, ap.name, ap.phone 
                 FROM users u
                 LEFT JOIN admin_profiles ap ON u.id = ap.user_id
                 WHERE u.email = ? AND u.service = 'admin'`,
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

            // Update last login (note: users table may not have last_login, so we'll skip if it doesn't exist)
            try {
                await executeQuery(
                    `UPDATE users SET last_login = NOW() WHERE id = ?`,
                    [user.id]
                );
            } catch (updateError) {
                // Ignore if last_login column doesn't exist
                console.log('Note: last_login column may not exist in users table');
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    userId: user.id,
                    email: user.email,
                    role: user.role || 'admin',
                    name: user.name || user.email.split('@')[0],
                    service: 'admin'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return {
                token,
                user: {
                    id: user.id,
                    userId: user.id,
                    email: user.email,
                    role: user.role || 'admin',
                    name: user.name || user.email.split('@')[0],
                    phone: user.phone || null,
                    service: 'admin'
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
                `SELECT u.id, u.user_id, u.role, u.email, u.is_active, u.email_verified, u.created_at, u.updated_at,
                        ap.name, ap.phone
                 FROM users u
                 LEFT JOIN admin_profiles ap ON u.id = ap.user_id
                 WHERE u.id = ? AND u.service = 'admin'`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];
            return {
                id: user.id,
                user_id: user.id,
                role: user.role || 'admin',
                email: user.email,
                name: user.name || user.email.split('@')[0],
                phone: user.phone || null,
                is_active: user.is_active,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            };
        } catch (error) {
            console.error('Get admin profile error:', error);
            throw error;
        }
    }
}

module.exports = new AdminAuthService();

