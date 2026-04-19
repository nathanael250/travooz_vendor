const { executeQuery } = require('../../../config/database');
const AuthUtils = require('../../utils/auth.utils');
const jwt = require('jsonwebtoken');
const UnifiedUserService = require('../shared/unifiedUser.service');
const { SERVICES } = require('../../constants/services');

class AuthService {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data and token
     */
    static async login(email, password) {
        try {
            // Find user by email in unified users table with service filter
            const user = await UnifiedUserService.getUserByEmail(SERVICES.STAYS, email);

            if (!user || !user.is_active) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await AuthUtils.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Update last login
            await executeQuery(
                `UPDATE users SET last_login = NOW() WHERE id = ? AND service = ?`,
                [user.id, SERVICES.STAYS]
            );

            // Generate JWT token with service scoping
            const token = jwt.sign(
                {
                    userId: user.id,
                    id: user.id,
                    email: user.email,
                    role: user.role || 'vendor',
                    service: 'stays' // CRITICAL: Service scoping
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            // Return user data (without password)
            return {
                user: {
                    id: user.id,
                    user_id: user.id,
                    email: user.email,
                    name: user.name || null,
                    role: user.role || 'vendor',
                    phone: user.phone || null,
                    email_verified: Boolean(user.email_verified),
                    property_id: user.property_id || null
                },
                token
            };
        } catch (error) {
            console.error('Error in stays login:', error);
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
            const user = await UnifiedUserService.getUserById(SERVICES.STAYS, userId);

            if (!user || !user.is_active) {
                throw new Error('User not found');
            }

            return {
                user_id: user.id,
                id: user.id,
                role: user.role,
                email: user.email,
                name: user.name,
                phone: user.phone,
                email_verified: Boolean(user.email_verified),
                is_active: user.is_active,
                created_at: user.created_at,
                property_id: user.property_id || null
            };
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} - Reset token and user data
     */
    static async requestPasswordReset(email) {
        try {
            // Find user by email in unified users table with service filter
            const user = await UnifiedUserService.getUserByEmail(SERVICES.STAYS, email);

            // Don't reveal if email exists or not (security best practice)
            if (!user || !user.is_active) {
                return { message: 'If the email exists, a reset link has been sent' };
            }

            // Generate reset token
            const resetToken = AuthUtils.generateResetToken();
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

            // Update user with reset token in unified users table
            await executeQuery(
                `UPDATE users 
                 SET password_reset_token = ?, password_reset_expires = ? 
                 WHERE id = ? AND service = ?`,
                [resetToken, resetExpires, user.id, SERVICES.STAYS]
            );

            return {
                resetToken,
                user: {
                    user_id: user.id,
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            };
        } catch (error) {
            console.error('Error requesting password reset:', error);
            throw error;
        }
    }

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} - Success message
     */
    static async resetPassword(token, newPassword) {
        try {
            // Find user by reset token in unified users table with service filter
            const users = await executeQuery(
                `SELECT * FROM users 
                 WHERE service = ?
                 AND password_reset_token = ? 
                 AND password_reset_expires > NOW()
                 AND is_active = 1`,
                [SERVICES.STAYS, token]
            );

            if (users.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const user = users[0];

            // Hash new password
            const hashedPassword = await AuthUtils.hashPassword(newPassword);

            // Update password and clear reset token in unified users table
            await executeQuery(
                `UPDATE users 
                 SET password_hash = ?, 
                     password_reset_token = NULL, 
                     password_reset_expires = NULL 
                 WHERE id = ? AND service = ?`,
                [hashedPassword, user.id, SERVICES.STAYS]
            );

            return {
                message: 'Password reset successfully',
                user: {
                    user_id: user.id,
                    id: user.id,
                    email: user.email
                }
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

module.exports = AuthService;

