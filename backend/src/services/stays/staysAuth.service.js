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

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} - Reset token and user data
     */
    static async requestPasswordReset(email) {
        try {
            // Find user by email
            const users = await executeQuery(
                `SELECT * FROM stays_users WHERE email = ? AND is_active = 1`,
                [email]
            );

            // Don't reveal if email exists or not (security best practice)
            if (users.length === 0) {
                return { message: 'If the email exists, a reset link has been sent' };
            }

            const user = users[0];

            // Generate reset token
            const resetToken = AuthUtils.generateResetToken();
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

            // Update user with reset token
            await executeQuery(
                `UPDATE stays_users 
                 SET password_reset_token = ?, password_reset_expires = ? 
                 WHERE user_id = ?`,
                [resetToken, resetExpires, user.user_id]
            );

            return {
                resetToken,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name
                }
            };
        } catch (error) {
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
            // Find user by reset token
            const users = await executeQuery(
                `SELECT * FROM stays_users 
                 WHERE password_reset_token = ? 
                 AND password_reset_expires > NOW() 
                 AND is_active = 1`,
                [token]
            );

            if (users.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const user = users[0];

            // Hash new password
            const hashedPassword = await AuthUtils.hashPassword(newPassword);

            // Update password and clear reset token
            await executeQuery(
                `UPDATE stays_users 
                 SET password_hash = ?, 
                     password_reset_token = NULL, 
                     password_reset_expires = NULL 
                 WHERE user_id = ?`,
                [hashedPassword, user.user_id]
            );

            return {
                message: 'Password reset successfully',
                user: {
                    user_id: user.user_id,
                    email: user.email
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthService;

