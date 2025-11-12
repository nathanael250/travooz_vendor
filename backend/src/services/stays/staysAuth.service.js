const { executeQuery } = require('../../../config/database');
const AuthUtils = require('../../utils/auth.utils');

class AuthService {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data and token
     */
    static async login(email, password) {
        try {
            // Find user by email
            const users = await executeQuery(
                `SELECT * FROM stays_users WHERE email = ? AND is_active = 1`,
                [email]
            );

            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Verify password
            const isPasswordValid = await AuthUtils.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Generate token
            const tokenPayload = {
                userId: user.user_id,
                email: user.email,
                role: user.role || 'vendor'
            };

            const token = AuthUtils.generateToken(tokenPayload);

            // Return user data (without password)
            const { password_hash, ...userWithoutPassword } = user;

            return {
                user: {
                    ...userWithoutPassword,
                    email_verified: Boolean(user.email_verified)
                },
                token
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - User data
     */
    static async getUserById(userId) {
        try {
            const users = await executeQuery(
                `SELECT user_id, role, name, email, phone, address, gender, is_active, email_verified, created_at
                 FROM stays_users 
                 WHERE user_id = ? AND is_active = 1`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];
            return {
                ...user,
                email_verified: Boolean(user.email_verified)
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthService;

