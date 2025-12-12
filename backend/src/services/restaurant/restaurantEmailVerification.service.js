const { executeQuery } = require('../../../config/database');
const crypto = require('crypto');
const EmailService = require('../../utils/email.service');

class RestaurantEmailVerificationService {
    /**
     * Generate a 6-digit verification code
     */
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send verification code via email
     */
    static async sendVerificationCode(email, code, userName) {
        try {
            console.log(`\n📧 Attempting to send verification email to: ${email}`);
            console.log(`📧 Verification code: ${code}`);
            
            // Verify SMTP connection first
            const isConnected = await EmailService.verifyConnection();
            if (!isConnected) {
                console.warn('⚠️  SMTP connection verification failed, but attempting to send anyway...');
            }

            // Send email using EmailService
            const result = await EmailService.sendVerificationCode(email, code, userName);
            
            console.log('✅ Verification email sent successfully!');
            return true;
        } catch (error) {
            console.error('❌ Error sending verification email:');
            console.error('Error details:', error.message);
            if (error.response) {
                console.error('SMTP Response:', error.response);
            }
            if (error.responseCode) {
                console.error('Response Code:', error.responseCode);
            }
            // For development, log the code even if email fails
            console.log(`\n⚠️  ===========================================`);
            console.log(`⚠️  DEVELOPMENT MODE - EMAIL FAILED`);
            console.log(`⚠️  Email: ${email}`);
            console.log(`⚠️  Verification Code: ${code}`);
            console.log(`⚠️  ===========================================\n`);
            throw error;
        }
    }

    /**
     * Store verification code in database
     */
    static async storeVerificationCode(userId, email, code) {
        try {
            // Hash the code before storing
            const codeHash = crypto.createHash('sha256').update(code).digest('hex');
            
            // Set expiry time (5 minutes from now)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Check if restaurant_email_verifications table exists, if not create it
            try {
                await executeQuery(`
                    CREATE TABLE IF NOT EXISTS restaurant_email_verifications (
                        verification_id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        code VARCHAR(6) NOT NULL,
                        code_hash VARCHAR(64) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        is_used TINYINT(1) DEFAULT 0,
                        verified_at DATETIME NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_user_email (user_id, email),
                        INDEX idx_code_hash (code_hash),
                        INDEX idx_expires_at (expires_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `);
            } catch (tableError) {
                // Table might already exist, continue
                console.log('Table check completed');
            }

            // Invalidate any existing unused codes for this user
            await executeQuery(
                `UPDATE restaurant_email_verifications 
                 SET is_used = 1 
                 WHERE user_id = ? AND email = ? AND is_used = 0`,
                [userId, email]
            );

            // Insert new verification code
            const result = await executeQuery(
                `INSERT INTO restaurant_email_verifications (user_id, email, code, code_hash, expires_at, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [userId, email, code, codeHash, expiresAt]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error storing verification code:', error);
            throw new Error('Failed to store verification code');
        }
    }

    /**
     * Verify email code
     */
    static async verifyCode(userId, email, code) {
        try {
            // Convert userId to string for restaurant_email_verifications (VARCHAR) and integer for restaurant_users (INT)
            const userIdStr = String(userId);
            const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            if (isNaN(userIdInt)) {
                console.error('Invalid userId format in email verification:', userId);
                throw new Error('Invalid user ID format');
            }
            
            console.log(`🔍 Verifying email for user_id: ${userIdInt} (string: ${userIdStr}), email: ${email}`);

            // Hash the provided code
            const codeHash = crypto.createHash('sha256').update(code).digest('hex');

            // Find matching code (use userIdStr because restaurant_email_verifications.user_id is VARCHAR)
            const result = await executeQuery(
                `SELECT * FROM restaurant_email_verifications 
                 WHERE user_id = ? 
                 AND email = ? 
                 AND code_hash = ? 
                 AND is_used = 0 
                 AND expires_at > NOW()
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [userIdStr, email, codeHash]
            );

            if (result.length === 0) {
                console.log(`❌ No valid verification code found for user_id: ${userIdStr}, email: ${email}`);
                // Also try with integer format in case it was stored differently
                const resultInt = await executeQuery(
                    `SELECT * FROM restaurant_email_verifications 
                     WHERE CAST(user_id AS UNSIGNED) = ? 
                     AND email = ? 
                     AND code_hash = ? 
                     AND is_used = 0 
                     AND expires_at > NOW()
                     ORDER BY created_at DESC
                     LIMIT 1`,
                    [userIdInt, email, codeHash]
                );
                if (resultInt.length === 0) {
                    return false;
                }
                // Use the integer result
                result[0] = resultInt[0];
            }

            console.log(`✅ Found verification code for user_id: ${userIdInt}`);

            // Mark code as used
            await executeQuery(
                `UPDATE restaurant_email_verifications 
                 SET is_used = 1, verified_at = NOW() 
                 WHERE verification_id = ?`,
                [result[0].verification_id]
            );

            // Update user email_verified status in restaurant_users table (use userIdInt because user_id is INT)
            const updateResult = await executeQuery(
                `UPDATE restaurant_users SET email_verified = 1 WHERE user_id = ?`,
                [userIdInt]
            );
            
            console.log(`📝 Update query executed. Rows affected: ${updateResult.affectedRows || 'unknown'}`);
            
            // Verify the update was successful
            const [verifyResult] = await executeQuery(
                `SELECT email_verified FROM restaurant_users WHERE user_id = ?`,
                [userIdInt]
            );
            
            if (verifyResult && verifyResult[0] && verifyResult[0].email_verified === 1) {
                console.log(`✅ Email verified successfully for user_id: ${userIdInt}`);
            } else {
                console.error(`❌ Failed to update email_verified for user_id: ${userIdInt}. Current value:`, verifyResult?.[0]?.email_verified);
                throw new Error('Failed to update email verification status');
            }

            return true;
        } catch (error) {
            console.error('Error verifying code:', error);
            throw new Error('Failed to verify code: ' + error.message);
        }
    }

    /**
     * Generate and send verification code
     */
    static async generateAndSendCode(userId, email, userName) {
        try {
            // Generate code
            const code = this.generateCode();

            // Store code in database
            await this.storeVerificationCode(userId, email, code);

            // Send email
            await this.sendVerificationCode(email, code, userName);

            return {
                message: 'Verification code sent successfully',
                expiresIn: 300, // 5 minutes in seconds
                // For development only - includes code in response
                code: code // Remove in production
            };
        } catch (error) {
            console.error('Error generating and sending verification code:', error);
            throw error;
        }
    }

    /**
     * Check rate limit (max 5 requests per hour per email)
     */
    static async checkRateLimit(email) {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            const result = await executeQuery(
                `SELECT COUNT(*) as count FROM restaurant_email_verifications 
                 WHERE email = ? AND created_at > ?`,
                [email, oneHourAgo]
            );

            return result[0]?.count >= 5 || false;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false; // Don't block on error
        }
    }
}

module.exports = RestaurantEmailVerificationService;

