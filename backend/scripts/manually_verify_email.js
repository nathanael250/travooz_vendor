/**
 * Script to manually verify a user's email
 * Usage: node scripts/manually_verify_email.js <userId>
 * Example: node scripts/manually_verify_email.js 3
 */

const { executeQuery } = require('../config/database');

async function manuallyVerifyEmail(userId) {
    try {
        const userIdInt = parseInt(userId, 10);
        
        if (isNaN(userIdInt)) {
            console.error('Invalid user ID. Please provide a valid integer.');
            process.exit(1);
        }

        console.log(`🔍 Checking user_id: ${userIdInt}...`);

        // Check if user exists
        const userResult = await executeQuery(
            `SELECT user_id, email, email_verified FROM restaurant_users WHERE user_id = ?`,
            [userIdInt]
        );

        if (!userResult || userResult.length === 0) {
            console.error(`❌ User with ID ${userIdInt} not found.`);
            process.exit(1);
        }

        const user = userResult[0];
        console.log(`📧 Current status for user_id ${userIdInt}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Email Verified: ${user.email_verified === 1 ? 'YES' : 'NO'} (value: ${user.email_verified})`);

        if (user.email_verified === 1) {
            console.log(`✅ Email is already verified.`);
            process.exit(0);
        }

        // Update email_verified status
        const updateResult = await executeQuery(
            `UPDATE restaurant_users SET email_verified = 1 WHERE user_id = ?`,
            [userIdInt]
        );

        // Verify the update
        const verifyResult = await executeQuery(
            `SELECT email_verified FROM restaurant_users WHERE user_id = ?`,
            [userIdInt]
        );

        if (verifyResult && verifyResult[0] && verifyResult[0].email_verified === 1) {
            console.log(`✅ Email verified successfully for user_id: ${userIdInt}`);
            console.log(`   Email: ${user.email}`);
        } else {
            console.error(`❌ Failed to verify email. Current value: ${verifyResult?.[0]?.email_verified}`);
            process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Get userId from command line arguments
const userId = process.argv[2];

if (!userId) {
    console.error('Usage: node scripts/manually_verify_email.js <userId>');
    console.error('Example: node scripts/manually_verify_email.js 3');
    process.exit(1);
}

manuallyVerifyEmail(userId);

