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

            // Find user in unified users table with service filter
            const users = await executeQuery(
                `SELECT u.*, rp.name, rp.phone, rp.restaurant_id, rp.status as profile_status
                 FROM users u
                 LEFT JOIN restaurant_profiles rp ON rp.user_id = u.id
                 WHERE u.service = 'restaurant' AND u.email = ?`,
                [email]
            );

            console.log('🔍 Found users:', users.length);

            if (users.length === 0) {
                console.log('❌ No user found with email:', email);
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Check if user is active
            if (!user.is_active) {
                console.log('❌ User account is deactivated:', email);
                throw new Error('Your account has been deactivated. Please contact support.');
            }

            // Verify password
            console.log('🔍 Verifying password for user:', user.id);
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                console.log('❌ Invalid password for user:', email);
                throw new Error('Invalid email or password');
            }

            console.log('✅ Password verified successfully for user:', email);

            // Get restaurant business for this user
            // First try to find by restaurant_id in profile
            let businesses = [];
            if (user.restaurant_id) {
                businesses = await executeQuery(
                    `SELECT id as restaurant_id, name as business_name, status 
                     FROM restaurants 
                     WHERE id = ? 
                     ORDER BY created_at DESC 
                     LIMIT 1`,
                    [user.restaurant_id]
                );
            }
            
            // Fallback: try to find by user_id directly (unified architecture)
            // The restaurants table user_id should match the unified users.id
            if (businesses.length === 0) {
                businesses = await executeQuery(
                    `SELECT id as restaurant_id, name as business_name, status 
                     FROM restaurants 
                     WHERE user_id = ? OR CAST(user_id AS CHAR) = ?
                     ORDER BY created_at DESC 
                     LIMIT 1`,
                    [user.id, String(user.id)]
                );
            }

            // Update last login
            await executeQuery(
                `UPDATE users SET last_login = NOW() WHERE id = ?`,
                [user.id]
            );

            // Generate JWT token with service scoping
            const token = jwt.sign(
                {
                    userId: user.id,
                    id: user.id,
                    email: user.email,
                    role: user.role || 'vendor',
                    service: 'restaurant' // CRITICAL: Service scoping
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            const restaurant = businesses.length > 0 ? businesses[0] : null;
            
            return {
                user: {
                    id: user.id,
                    user_id: user.id,
                    email: user.email,
                    name: user.name || null,
                    role: user.role || 'vendor',
                    phone: user.phone || null,
                    restaurant_id: restaurant?.restaurant_id || null,
                    restaurant_status: restaurant?.status || null,
                    restaurant_name: restaurant?.business_name || null
                },
                token,
                restaurantId: restaurant?.restaurant_id || null,
                restaurant: restaurant
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
                `SELECT u.id, u.role, u.email, u.email_verified, u.is_active, u.created_at,
                        rp.name, rp.phone, rp.restaurant_id, rp.status as profile_status
                 FROM users u
                 LEFT JOIN restaurant_profiles rp ON rp.user_id = u.id
                 WHERE u.id = ? AND u.service = 'restaurant'`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];
            return {
                user_id: user.id,
                id: user.id,
                role: user.role,
                email: user.email,
                name: user.name,
                phone: user.phone,
                email_verified: Boolean(user.email_verified),
                is_active: Boolean(user.is_active),
                created_at: user.created_at,
                restaurant_id: user.restaurant_id,
                profile_status: user.profile_status
            };
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
            console.log('🔍 [Restaurant Service] Searching for email:', email);
            
            // Find user by email in unified users table with service filter
            const users = await executeQuery(
                `SELECT u.*, rp.name 
                 FROM users u
                 LEFT JOIN restaurant_profiles rp ON rp.user_id = u.id
                 WHERE u.service = 'restaurant' AND u.email = ?`,
                [email]
            );

            console.log('🔍 [Restaurant Service] Users found:', users.length);
            
            // Don't reveal if email exists or not (security best practice)
            if (users.length === 0) {
                console.log('❌ [Restaurant Service] No user found with email:', email);
                return { message: 'If the email exists, a reset link has been sent' };
            }

            const user = users[0];
            console.log('✅ [Restaurant Service] User found:', { user_id: user.id, email: user.email, name: user.name });

            // Generate reset token (random 32-character string)
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

            // Update user with reset token
            console.log('💾 [Restaurant Service] Updating user with reset token...');
            const updateResult = await executeQuery(
                `UPDATE users 
                 SET password_reset_token = ?, password_reset_expires = ? 
                 WHERE id = ? AND service = 'restaurant'`,
                [resetToken, resetExpires, user.id]
            );
            console.log('✅ [Restaurant Service] Update result:', updateResult);

            console.log('📧 [Restaurant Service] Returning reset data to controller');
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
    async resetPassword(token, newPassword) {
        try {
            // Find user by reset token in unified users table with service filter
            const users = await executeQuery(
                `SELECT * FROM users 
                 WHERE service = 'restaurant'
                 AND password_reset_token = ? 
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
                `UPDATE users 
                 SET password_hash = ?, 
                     password_reset_token = NULL, 
                     password_reset_expires = NULL 
                 WHERE id = ? AND service = 'restaurant'`,
                [hashedPassword, user.id]
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

module.exports = new RestaurantAuthService();













