const { executeQuery } = require('../../../config/database');
const crypto = require('crypto');
const EmailService = require('../../utils/email.service');

class EmailVerificationService {
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

            // Invalidate any existing unused codes for this user
            await executeQuery(
                `UPDATE stays_email_verifications 
                 SET is_used = 1 
                 WHERE user_id = ? AND email = ? AND is_used = 0`,
                [userId, email]
            );

            // Insert new verification code
            const result = await executeQuery(
                `INSERT INTO stays_email_verifications (user_id, email, code, code_hash, expires_at, created_at)
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
            // Hash the provided code
            const codeHash = crypto.createHash('sha256').update(code).digest('hex');

            // Find matching code
            const result = await executeQuery(
                `SELECT * FROM stays_email_verifications 
                 WHERE user_id = ? 
                 AND email = ? 
                 AND code_hash = ? 
                 AND is_used = 0 
                 AND expires_at > NOW()
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [userId, email, codeHash]
            );

            if (result.length === 0) {
                return false;
            }

            // Mark code as used
            await executeQuery(
                `UPDATE stays_email_verifications 
                 SET is_used = 1, verified_at = NOW() 
                 WHERE verification_id = ?`,
                [result[0].verification_id]
            );

            // Update user's email_verified status (using stays_users table)
            await executeQuery(
                `UPDATE stays_users 
                 SET email_verified = 1 
                 WHERE user_id = ? AND email = ?`,
                [userId, email]
            );

            return true;
        } catch (error) {
            console.error('Error verifying code:', error);
            throw new Error('Failed to verify code');
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
            const result = await executeQuery(
                `SELECT COUNT(*) as count 
                 FROM stays_email_verifications 
                 WHERE email = ? 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
                [email]
            );

            const maxRequests = 5;
            return result[0].count >= maxRequests;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false;
        }
    }
}

module.exports = EmailVerificationService;

