const { executeQuery } = require('../../../config/database');
const crypto = require('crypto');
const EmailService = require('../../utils/email.service');

class ToursEmailVerificationService {
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
                `UPDATE tours_email_verifications 
                 SET is_used = 1 
                 WHERE user_id = ? AND email = ? AND is_used = 0`,
                [userId, email]
            );

            // Insert new verification code
            const result = await executeQuery(
                `INSERT INTO tours_email_verifications (user_id, email, code, code_hash, expires_at, created_at)
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
                `SELECT * FROM tours_email_verifications 
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
                `UPDATE tours_email_verifications 
                 SET is_used = 1, verified_at = NOW() 
                 WHERE verification_id = ?`,
                [result[0].verification_id]
            );

            // Update user email_verified status in tours_users table
            await executeQuery(
                `UPDATE tours_users SET email_verified = 1 WHERE user_id = ?`,
                [userId]
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
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            const result = await executeQuery(
                `SELECT COUNT(*) as count FROM tours_email_verifications 
                 WHERE email = ? AND created_at > ?`,
                [email, oneHourAgo]
            );

            return result[0].count >= 5;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false; // Don't block on error
        }
    }

    /**
     * Send confirmation email after verification succeeds
     */
    static async sendVerificationSuccessEmail({ userId, email, tourBusinessId }) {
        if (!email) {
            console.warn('⚠️  Post-verification email skipped: email missing');
            return;
        }

        try {
            const userName = await this.getUserDisplayName(userId);
            const businessName = await this.getBusinessName(tourBusinessId);

            const dashboardUrl = process.env.TOURS_VENDOR_DASHBOARD_URL 
                || process.env.VENDOR_DASHBOARD_URL 
                || 'https://vendor.travoozapp.com/tours/dashboard';

            const safeName = userName || (email?.split('@')[0]) || 'there';
            const safeBusiness = businessName || 'your tour business';

            console.log('\n📧 Sending verification success email:', {
                email,
                safeName,
                safeBusiness
            });

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Travooz</h1>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <h2 style="color: #1f2937; margin-top: 0;">You're verified, ${safeName}!</h2>
                        <p style="color: #4b5563; font-size: 16px;">
                            Thanks for confirming your email for <strong>${safeBusiness}</strong>. You can now continue setting up your listing and manage everything from your vendor dashboard.
                        </p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${dashboardUrl}" style="display: inline-block; background-color: #3CAF54; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
                                Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #4b5563; font-size: 14px;">
                            If the button above doesn’t work, copy and paste this link into your browser:<br />
                            <a href="${dashboardUrl}" style="color: #3CAF54;">${dashboardUrl}</a>
                        </p>
                        <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
                            Need help? Just reply to this email and our support team will assist you.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                    </div>
                </div>
            `;

            const text = `
Hi ${safeName},

Thanks for verifying your email for ${safeBusiness}. You can now access your Travooz vendor dashboard:
${dashboardUrl}

If the link doesn’t work, copy and paste it into your browser. Need help? Just reply to this email.

© ${new Date().getFullYear()} Travooz. All rights reserved.
            `;

            const isConnected = await EmailService.verifyConnection();
            if (!isConnected) {
                console.warn('⚠️  SMTP verification failed before post-verification email, attempting send anyway...');
            }

            await EmailService.sendEmail({
                to: email,
                subject: 'You’re verified! Access your Travooz dashboard',
                html,
                text
            });

            console.log('✅ Verification success email sent');
        } catch (error) {
            console.error('❌ Failed to send verification success email:', error.message);
            if (error.response) console.error('SMTP Response:', error.response);
            if (error.responseCode) console.error('SMTP Response Code:', error.responseCode);
            // Don't throw to avoid blocking verification success
        }
    }

    static async getUserDisplayName(userId) {
        if (!userId) return null;

        try {
            const [result] = await executeQuery(
                `SELECT name FROM tours_users WHERE user_id = ? LIMIT 1`,
                [userId]
            );
            if (result?.name) return result.name;
        } catch (error) {
            console.warn('⚠️  Failed to get user name from tours_users:', error.message);
        }

        try {
            const [result] = await executeQuery(
                `SELECT name FROM stays_users WHERE user_id = ? LIMIT 1`,
                [userId]
            );
            if (result?.name) return result.name;
        } catch (error) {
            console.warn('⚠️  Failed to get user name from stays_users:', error.message);
        }

        return null;
    }

    static async getBusinessName(tourBusinessId) {
        if (!tourBusinessId) return null;

        try {
            const [result] = await executeQuery(
                `SELECT tour_business_name FROM tours_businesses WHERE tour_business_id = ? LIMIT 1`,
                [tourBusinessId]
            );
            return result?.tour_business_name || null;
        } catch (error) {
            console.warn('⚠️  Failed to get business name:', error.message);
            return null;
        }
    }
}

module.exports = ToursEmailVerificationService;

