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

            // Find user in unified users table with service filter
            const users = await executeQuery(
                `SELECT u.*, crp.name, crp.phone, crp.car_rental_business_id, crp.status as profile_status
                 FROM users u
                 LEFT JOIN car_rental_profiles crp ON crp.user_id = u.id
                 WHERE u.service = 'car_rental' AND u.email = ?`,
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

            // Get car rental business for this user
            let businesses = [];
            
            // First, try to find by business_id from profile
            if (user.car_rental_business_id) {
                businesses = await executeQuery(
                    `SELECT car_rental_business_id, business_name, status 
                     FROM car_rental_businesses 
                     WHERE car_rental_business_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT 1`,
                    [user.car_rental_business_id]
                );
            }
            
            // Fallback: try to find businesses by user_id directly
            // Note: car_rental_businesses.user_id might reference old car_rental_users table
            // or the unified users table, so we try both approaches
            if (businesses.length === 0) {
                // Try with the unified user ID (for newly created businesses)
                businesses = await executeQuery(
                    `SELECT car_rental_business_id, business_name, status 
                     FROM car_rental_businesses 
                     WHERE user_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT 1`,
                    [user.id]
                );
            }
            
            // If still not found, try to find via car_rental_profiles
            if (businesses.length === 0) {
                const profileBusiness = await executeQuery(
                    `SELECT crp.car_rental_business_id 
                     FROM car_rental_profiles crp
                     WHERE crp.user_id = ? AND crp.car_rental_business_id IS NOT NULL
                     LIMIT 1`,
                    [user.id]
                );
                
                if (profileBusiness.length > 0 && profileBusiness[0].car_rental_business_id) {
                    businesses = await executeQuery(
                        `SELECT car_rental_business_id, business_name, status 
                         FROM car_rental_businesses 
                         WHERE car_rental_business_id = ? 
                         ORDER BY created_at DESC 
                         LIMIT 1`,
                        [profileBusiness[0].car_rental_business_id]
                    );
                }
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
                    service: 'car_rental' // CRITICAL: Service scoping
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            return {
                user: {
                    id: user.id,
                    user_id: user.id,
                    email: user.email,
                    name: user.name || null,
                    role: user.role || 'vendor',
                    phone: user.phone || null,
                    email_verified: Boolean(user.email_verified)
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
                `SELECT u.id, u.user_id, u.role, u.email, u.email_verified, u.is_active, u.created_at,
                        crp.name, crp.phone, crp.car_rental_business_id, crp.status as profile_status
                 FROM users u
                 LEFT JOIN car_rental_profiles crp ON crp.user_id = u.id
                 WHERE u.id = ? AND u.service = 'car_rental'`,
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
                is_active: user.is_active,
                created_at: user.created_at,
                car_rental_business_id: user.car_rental_business_id,
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
            // Find user by email in unified users table with service filter
            const users = await executeQuery(
                `SELECT u.*, crp.name 
                 FROM users u
                 LEFT JOIN car_rental_profiles crp ON crp.user_id = u.id
                 WHERE u.service = 'car_rental' AND u.email = ?`,
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
                `UPDATE users 
                 SET password_reset_token = ?, password_reset_expires = ? 
                 WHERE id = ? AND service = 'car_rental'`,
                [resetToken, resetExpires, user.id]
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
    async resetPassword(token, newPassword) {
        try {
            // Find user by reset token in unified users table with service filter
            const users = await executeQuery(
                `SELECT * FROM users 
                 WHERE service = 'car_rental'
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
                 WHERE id = ? AND service = 'car_rental'`,
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

module.exports = new CarRentalAuthService();

