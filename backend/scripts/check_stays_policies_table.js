/**
 * Script to check the actual structure of stays_property_policies table
 * and compare with expected structure
 * Run with: node scripts/check_stays_policies_table.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: 'admin',
    password: 'admin',
    database: 'travoozapp_db',
};

async function checkTableStructure() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database travoozapp_db\n');

        // Get table structure
        console.log('📊 Checking stays_property_policies table structure...\n');
        const [columns] = await connection.execute(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                COLUMN_TYPE,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'stays_property_policies'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('='.repeat(100));
        console.log('ACTUAL TABLE STRUCTURE:');
        console.log('='.repeat(100));
        console.table(columns);

        // Check for specific columns
        const columnNames = columns.map(col => col.COLUMN_NAME);
        console.log('\n📋 Column Check:');
        console.log(`  - accept_cash: ${columnNames.includes('accept_cash') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - other_payment_types: ${columnNames.includes('other_payment_types') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - accept_credit_debit_cards: ${columnNames.includes('accept_credit_debit_cards') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - card_types: ${columnNames.includes('card_types') ? '✅ EXISTS' : '❌ MISSING'}`);

        // Get detailed info for key columns
        console.log('\n🔍 Key Column Details:');
        const keyColumns = ['accept_cash', 'other_payment_types', 'accept_credit_debit_cards', 'card_types'];
        keyColumns.forEach(colName => {
            const col = columns.find(c => c.COLUMN_NAME === colName);
            if (col) {
                console.log(`\n  ${colName}:`);
                console.log(`    Type: ${col.COLUMN_TYPE}`);
                console.log(`    Nullable: ${col.IS_NULLABLE}`);
                console.log(`    Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
            }
        });

        // Compare with expected structure
        console.log('\n' + '='.repeat(100));
        console.log('COMPARISON WITH EXPECTED STRUCTURE:');
        console.log('='.repeat(100));
        
        const expectedColumns = [
            'policy_id',
            'property_id',
            'languages',
            'accept_cash',
            'accept_credit_debit_cards',
            'card_types',
            'installments_at_front_desk',
            'require_deposits',
            'deposit_types',
            'incidentals_payment_form',
            'property_time_zone',
            'cancellation_window',
            'cancellation_fee',
            'cut_off_time',
            'vat_percentage',
            'tourism_tax_percentage',
            'taxes_included_in_rate',
            'request_tax_team_assistance',
            'billing_currency',
            'created_at',
            'updated_at'
        ];

        console.log('\nExpected columns vs Actual columns:');
        expectedColumns.forEach(expectedCol => {
            const exists = columnNames.includes(expectedCol);
            const status = exists ? '✅' : '❌';
            console.log(`  ${status} ${expectedCol}`);
        });

        // Check for unexpected columns
        const unexpectedColumns = columnNames.filter(col => !expectedColumns.includes(col));
        if (unexpectedColumns.length > 0) {
            console.log('\n⚠️  Unexpected columns found:');
            unexpectedColumns.forEach(col => {
                console.log(`  - ${col}`);
            });
        }

        // Check if other_payment_types exists (from migration)
        if (columnNames.includes('other_payment_types')) {
            console.log('\n✅ other_payment_types column exists (migration was applied)');
        } else {
            console.log('\nℹ️  other_payment_types column does NOT exist (this is expected if migration not run)');
        }

        console.log('\n' + '='.repeat(100));
        console.log('✅ Table structure check complete!');
        console.log('='.repeat(100));

    } catch (error) {
        console.error('❌ Error checking table structure:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Authentication failed. Please check:');
            console.error('   - Username: admin');
            console.error('   - Password: admin');
            console.error('   - Database: travoozapp_db');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 Database not found. Please check database name: travoozapp_db');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the check
checkTableStructure();



