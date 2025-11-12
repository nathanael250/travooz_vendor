const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travoozapp_db',
};

async function addEmergencyCountryCodeColumn() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check if column already exists
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'tours_packages' 
             AND COLUMN_NAME = 'emergency_country_code'`,
            [dbConfig.database]
        );

        if (columns.length > 0) {
            console.log('ℹ️  Column "emergency_country_code" already exists. Skipping migration.');
            return;
        }

        // Add the column
        console.log('📝 Adding emergency_country_code column...');
        await connection.execute(
            `ALTER TABLE tours_packages 
             ADD COLUMN emergency_country_code VARCHAR(10) DEFAULT NULL 
             AFTER emergency_contact`
        );

        console.log('✅ Successfully added emergency_country_code column to tours_packages table!');
        
        // Verify the column was added
        const [verify] = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'tours_packages' 
             AND COLUMN_NAME = 'emergency_country_code'`,
            [dbConfig.database]
        );

        if (verify.length > 0) {
            console.log('✅ Verification successful:');
            console.log('   Column:', verify[0].COLUMN_NAME);
            console.log('   Type:', verify[0].DATA_TYPE);
            console.log('   Nullable:', verify[0].IS_NULLABLE);
            console.log('   Default:', verify[0].COLUMN_DEFAULT);
        }

    } catch (error) {
        console.error('❌ Error running migration:', error.message);
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Column already exists. This is okay.');
        } else {
            process.exit(1);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the migration
addEmergencyCountryCodeColumn();

