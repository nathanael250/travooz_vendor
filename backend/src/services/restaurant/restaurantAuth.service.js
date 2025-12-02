const { executeQuery } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class RestaurantAuthService {
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

            console.log('🔍 Restaurant login attempt for email:', email);

            // Find user in restaurant_users table
            const users = await executeQuery(
                `SELECT * FROM restaurant_users WHERE email = ?`,
                [email]
            );

            console.log('🔍 Found users:', users.length);

            if (users.length === 0) {
                console.log('❌ No user found with email:', email);
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Check if user is active
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

            // Get restaurant business for this user
            const businesses = await executeQuery(
                `SELECT restaurant_id, business_name, status 
                 FROM restaurants 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [user.user_id]
            );

            // Update last login (if the column exists)
            if (user.last_login !== undefined) {
                await executeQuery(
                    `UPDATE restaurant_users SET last_login = NOW() WHERE user_id = ?`,
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
                restaurantId: businesses.length > 0 ? businesses[0].restaurant_id : null,
                restaurant: businesses.length > 0 ? businesses[0] : null
            };
        } catch (error) {
            console.error('Error in restaurant login:', error);
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
                 FROM restaurant_users 
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

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} - Reset token and user data
     */
    async requestPasswordReset(email) {
        try {
            // Find user by email
            const users = await executeQuery(
                `SELECT * FROM restaurant_users WHERE email = ?`,
                [email]
            );

            // Don't reveal if email exists or not (security best practice)
            if (users.length === 0) {
                return { message: 'If the email exists, a reset link has been sent' };
            }

            const user = users[0];

            // Generate reset token (random 32-character string)
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

            // Update user with reset token
            await executeQuery(
                `UPDATE restaurant_users 
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
    async resetPassword(token, newPassword) {
        try {
            // Find user by reset token
            const users = await executeQuery(
                `SELECT * FROM restaurant_users 
                 WHERE password_reset_token = ? 
                 AND password_reset_expires > NOW()`,
                [token]
            );

            if (users.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const user = users[0];

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and clear reset token
            await executeQuery(
                `UPDATE restaurant_users 
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
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

module.exports = new RestaurantAuthService();



