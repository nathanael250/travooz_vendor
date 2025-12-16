const { executeQuery } = require('../../../config/database');
const crypto = require('crypto');
const EmailService = require('../../utils/email.service');

class CarRentalEmailVerificationService {
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
            // Convert userId to string for consistent storage (user_id is VARCHAR in car_rental_email_verifications)
            const userIdStr = String(userId);
            
            // Hash the code before storing
            const codeHash = crypto.createHash('sha256').update(code).digest('hex');
            
            // Set expiry time (5 minutes from now)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            console.log(`📝 Storing verification code for user_id: ${userIdStr}, email: ${email}, expires_at: ${expiresAt}`);

            // Check if car_rental_email_verifications table exists, if not create it
            try {
                await executeQuery(`
                    CREATE TABLE IF NOT EXISTS car_rental_email_verifications (
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

            // Invalidate any existing unused codes for this user (use string format)
            await executeQuery(
                `UPDATE car_rental_email_verifications 
                 SET is_used = 1 
                 WHERE user_id = ? AND email = ? AND is_used = 0`,
                [userIdStr, email]
            );

            // Insert new verification code (use string format for userId)
            const result = await executeQuery(
                `INSERT INTO car_rental_email_verifications (user_id, email, code, code_hash, expires_at, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [userIdStr, email, code, codeHash, expiresAt]
            );

            console.log(`✅ Verification code stored successfully. Verification ID: ${result.insertId}`);
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
            // Convert userId to string for car_rental_email_verifications (VARCHAR) and integer for car_rental_users (INT)
            const userIdStr = String(userId);
            const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            if (isNaN(userIdInt)) {
                console.error('Invalid userId format in email verification:', userId);
                throw new Error('Invalid user ID format');
            }
            
            console.log(`🔍 Verifying email for user_id: ${userIdInt} (string: ${userIdStr}), email: ${email}`);

            // Hash the provided code
            const codeHash = crypto.createHash('sha256').update(code).digest('hex');

            // Find matching code (use userIdStr because car_rental_email_verifications.user_id is VARCHAR)
            const result = await executeQuery(
                `SELECT * FROM car_rental_email_verifications 
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
                console.log(`❌ No valid verification code found for user_id: ${userIdStr}, email: ${email}, code_hash: ${codeHash.substring(0, 10)}...`);
                
                // Debug: Check what codes exist for this user/email
                const debugResult = await executeQuery(
                    `SELECT verification_id, user_id, email, code, is_used, expires_at, created_at, NOW() as current_time
                     FROM car_rental_email_verifications 
                     WHERE user_id = ? AND email = ?
                     ORDER BY created_at DESC
                     LIMIT 5`,
                    [userIdStr, email]
                );
                console.log(`🔍 Debug: Found ${debugResult.length} verification records for user_id: ${userIdStr}, email: ${email}`);
                if (debugResult.length > 0) {
                    debugResult.forEach((record, index) => {
                        console.log(`  Record ${index + 1}: verification_id=${record.verification_id}, user_id=${record.user_id}, is_used=${record.is_used}, expires_at=${record.expires_at}, current_time=${record.current_time}`);
                    });
                }
                
                // Also try with integer format in case it was stored differently
                const resultInt = await executeQuery(
                    `SELECT * FROM car_rental_email_verifications 
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
                    console.log(`❌ Also no match found with integer user_id format: ${userIdInt}`);
                    return false;
                }
                console.log(`✅ Found match with integer user_id format: ${userIdInt}`);
                // Use the integer result
                result[0] = resultInt[0];
            }

            console.log(`✅ Found verification code for user_id: ${userIdInt}`);

            // Mark code as used
            await executeQuery(
                `UPDATE car_rental_email_verifications 
                 SET is_used = 1, verified_at = NOW() 
                 WHERE verification_id = ?`,
                [result[0].verification_id]
            );

            // Ensure email_verified column exists in car_rental_users table
            // Note: This is handled in carRentalSetup.service.js ensureTables()
            // But we check here as a fallback
            let columnExists = false;
            try {
                const columns = await executeQuery(`
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'car_rental_users' 
                    AND COLUMN_NAME = 'email_verified'
                `);
                
                columnExists = columns && columns.length > 0;
                
                if (!columnExists) {
                    console.log('📝 email_verified column does not exist, adding it...');
                    try {
                        await executeQuery(`
                            ALTER TABLE car_rental_users 
                            ADD COLUMN email_verified TINYINT(1) DEFAULT 0 
                            AFTER password_hash
                        `);
                        console.log('✅ Added email_verified column to car_rental_users table');
                        columnExists = true;
                    } catch (addError) {
                        if (addError.code === 'ER_DUP_FIELDNAME') {
                            console.log('ℹ️  email_verified column already exists (duplicate field error)');
                            columnExists = true;
                        } else {
                            console.error('❌ Could not add email_verified column:', addError.message);
                            throw new Error(`Failed to add email_verified column: ${addError.message}`);
                        }
                    }
                } else {
                    console.log('ℹ️  email_verified column already exists');
                }
            } catch (checkError) {
                console.error('❌ Error checking email_verified column:', checkError.message);
                // If we can't check, try to add it anyway (might already exist)
                try {
                    await executeQuery(`
                        ALTER TABLE car_rental_users 
                        ADD COLUMN email_verified TINYINT(1) DEFAULT 0 
                        AFTER password_hash
                    `);
                    columnExists = true;
                    console.log('✅ Added email_verified column to car_rental_users table (after check error)');
                } catch (addError) {
                    if (addError.code === 'ER_DUP_FIELDNAME') {
                        columnExists = true;
                        console.log('ℹ️  email_verified column already exists');
                    } else {
                        throw new Error(`Failed to ensure email_verified column exists: ${addError.message}`);
                    }
                }
            }

            if (!columnExists) {
                throw new Error('email_verified column does not exist and could not be created');
            }

            // Update user email_verified status in car_rental_users table (use userIdInt because user_id is INT)
            const updateResult = await executeQuery(
                `UPDATE car_rental_users SET email_verified = 1 WHERE user_id = ?`,
                [userIdInt]
            );
            
            // Check if update affected any rows (user exists)
            if (!updateResult || (updateResult.affectedRows !== undefined && updateResult.affectedRows === 0)) {
                console.error(`❌ User not found in car_rental_users table: user_id ${userIdInt}`);
                throw new Error('User not found in car_rental_users table');
            }
            
            console.log(`📝 Update query executed. Rows affected: ${updateResult.affectedRows || 'unknown'}`);
            
            // Verify the update was successful by querying the updated value
            const verifyResult = await executeQuery(
                `SELECT email_verified FROM car_rental_users WHERE user_id = ?`,
                [userIdInt]
            );
            
            // executeQuery returns an array of rows, so verifyResult[0] is the first row
            if (verifyResult && verifyResult.length > 0 && verifyResult[0].email_verified === 1) {
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
     * Simple implementation matching restaurant service
     */
    static async generateAndSendCode(userId, email, userName) {
        try {
            // Generate code
            const code = this.generateCode();

            // Store code in database
            await this.storeVerificationCode(userId, email, code);

            // Send email - if sending fails, in development return the code so the flow can continue
            try {
                await this.sendVerificationCode(email, code, userName);
            } catch (emailErr) {
                console.error('Warning: failed to send verification email:', emailErr.message || emailErr);
                // In development return the code so frontend can proceed using the code shown in server logs
                if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
                    return {
                        message: 'Verification code generated (email sending failed in development)',
                        expiresIn: 300,
                        code: code
                    };
                }
                // In production rethrow
                throw emailErr;
            }

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
     * Check rate limit (max 20 requests per hour per email)
     * Less restrictive to allow for testing and multiple devices
     */
    static async checkRateLimit(email) {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            const result = await executeQuery(
                `SELECT COUNT(*) as count FROM car_rental_email_verifications 
                 WHERE email = ? AND created_at > ?`,
                [email, oneHourAgo]
            );

            const count = result[0]?.count || 0;
            const maxRequests = 20; // Increased from 5 to 20 for less restrictive limit
            
            if (count >= maxRequests) {
                console.log(`⚠️  Rate limit reached for email ${email}: ${count} requests in the last hour (limit: ${maxRequests})`);
            }
            
            return count >= maxRequests;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false; // Don't block on error
        }
    }
}

module.exports = CarRentalEmailVerificationService;

