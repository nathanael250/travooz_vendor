/**
 * Debug Login Issues
 * Run this script to check if a user exists and if password is correct
 * 
 * Usage: node debug_login.js email@example.com password123
 */

const { executeQuery } = require('./config/database');
const bcrypt = require('bcryptjs');

async function debugLogin(email, password) {
    console.log('\n🔍 Debugging Login for:', email);
    console.log('━'.repeat(60));

    try {
        // 1. Check if user exists
        console.log('\n1️⃣  Checking if user exists...');
        const users = await executeQuery(
            `SELECT user_id, email, name, is_active, password_hash, created_at 
             FROM stays_users 
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User NOT found in database');
            console.log('\n💡 Solutions:');
            console.log('   - Check if the email is correct');
            console.log('   - User might need to register first');
            console.log('   - Check if user exists in a different table');
            return;
        }

        const user = users[0];
        console.log('✅ User found!');
        console.log('   User ID:', user.user_id);
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Is Active:', user.is_active ? '✅ Yes' : '❌ No (INACTIVE)');
        console.log('   Created:', user.created_at);

        // 2. Check if user is active
        if (!user.is_active) {
            console.log('\n❌ User account is INACTIVE');
            console.log('\n💡 Solution:');
            console.log('   Run this SQL to activate:');
            console.log(`   UPDATE stays_users SET is_active = 1 WHERE email = '${email}';`);
            return;
        }

        // 3. Check password
        console.log('\n2️⃣  Checking password...');
        
        if (!user.password_hash) {
            console.log('❌ No password hash found in database!');
            console.log('\n💡 Solution:');
            console.log('   User needs to reset password or password was not set during registration');
            return;
        }

        console.log('   Password hash exists:', user.password_hash.substring(0, 20) + '...');

        // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
        if (!user.password_hash.startsWith('$2')) {
            console.log('⚠️  Password is NOT hashed! (stored as plaintext)');
            console.log('\n💡 Solution:');
            console.log('   Password needs to be hashed. Run this:');
            const hashedPassword = await bcrypt.hash(user.password_hash, 10);
            console.log(`   UPDATE stays_users SET password_hash = '${hashedPassword}' WHERE email = '${email}';`);
            return;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (isPasswordValid) {
            console.log('✅ Password is CORRECT!');
            console.log('\n🎉 Login should work!');
            console.log('\n💡 If login still fails, check:');
            console.log('   - Frontend is sending correct email/password');
            console.log('   - API endpoint is correct (/api/v1/stays/auth/login)');
            console.log('   - Backend server is running');
            console.log('   - CORS is configured properly');
        } else {
            console.log('❌ Password is INCORRECT!');
            console.log('\n💡 Solutions:');
            console.log('   - User needs to use correct password');
            console.log('   - User can reset password via forgot password');
            console.log('   - Check if password was changed recently');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }

    console.log('\n' + '━'.repeat(60));
    process.exit(0);
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('\n❌ Usage: node debug_login.js email@example.com password123\n');
    process.exit(1);
}

debugLogin(email, password);


