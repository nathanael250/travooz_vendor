/**
 * Check all users in stays_users table
 * Run this to see what users exist
 * 
 * Usage: node check_users.js
 */

const { executeQuery } = require('./config/database');

async function checkUsers() {
    console.log('\n👥 Checking all users in stays_users table...');
    console.log('━'.repeat(80));

    try {
        const users = await executeQuery(
            `SELECT user_id, email, name, is_active, 
                    CASE 
                        WHEN password_hash IS NULL THEN 'NO PASSWORD'
                        WHEN password_hash LIKE '$2%' THEN 'HASHED'
                        ELSE 'PLAINTEXT'
                    END as password_status,
                    created_at 
             FROM stays_users 
             ORDER BY created_at DESC
             LIMIT 20`
        );

        if (users.length === 0) {
            console.log('\n❌ No users found in stays_users table');
            console.log('\n💡 Users need to register first via:');
            console.log('   - /stays/list-your-property flow');
            console.log('   - Or direct registration endpoint');
            return;
        }

        console.log(`\n✅ Found ${users.length} users:\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Name: ${user.name || 'N/A'}`);
            console.log(`   Active: ${user.is_active ? '✅ Yes' : '❌ No'}`);
            console.log(`   Password: ${user.password_status}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('');
        });

        // Count by status
        const activeCount = users.filter(u => u.is_active).length;
        const inactiveCount = users.filter(u => !u.is_active).length;
        const noPasswordCount = users.filter(u => u.password_status === 'NO PASSWORD').length;
        const plaintextCount = users.filter(u => u.password_status === 'PLAINTEXT').length;

        console.log('━'.repeat(80));
        console.log('\n📊 Summary:');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Active: ${activeCount}`);
        console.log(`   Inactive: ${inactiveCount}`);
        console.log(`   No password: ${noPasswordCount}`);
        console.log(`   Plaintext password: ${plaintextCount}`);

        if (inactiveCount > 0) {
            console.log('\n⚠️  Some users are inactive. To activate all:');
            console.log('   UPDATE stays_users SET is_active = 1;');
        }

        if (plaintextCount > 0) {
            console.log('\n⚠️  Some passwords are not hashed! This is a security issue.');
            console.log('   Users need to reset their passwords.');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }

    console.log('\n' + '━'.repeat(80));
    process.exit(0);
}

checkUsers();



