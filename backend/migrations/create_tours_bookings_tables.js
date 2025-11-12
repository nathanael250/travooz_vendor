#!/usr/bin/env node

/**
 * Migration Script: Create Tour Bookings Tables
 * 
 * This script creates the tours_bookings, tours_booking_participants, and tours_booking_addons tables
 * if they don't already exist in the database.
 * 
 * Usage: node migrations/create_tours_bookings_tables.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
    let connection;
    try {
        console.log('🔄 Starting tour bookings tables migration...\n');
        
        // Read the migration SQL file
        const migrationFile = path.join(__dirname, '../config/db_files/tours_bookings_schema.sql');
        if (!fs.existsSync(migrationFile)) {
            console.error(`❌ Migration file not found: ${migrationFile}`);
            process.exit(1);
        }
        
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        // Get database connection
        connection = await pool.getConnection();
        console.log('✅ Connected to database\n');
        
        // Remove comments and split by semicolons
        let cleanSql = sql
            .replace(/--[^\n]*/g, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
        
        // Split by semicolon and filter empty statements
        const statements = cleanSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.match(/^(USE|SET)/i)); // Filter out USE and SET statements
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    // Execute each statement individually
                    await connection.execute(statement);
                    const preview = statement.substring(0, 60).replace(/\s+/g, ' ').trim();
                    console.log(`✅ [${i + 1}/${statements.length}] Executed: ${preview}...`);
                } catch (error) {
                    // Ignore errors for "table already exists", "duplicate key", or "key/constraint already exists"
                    const skipErrors = [
                        'ER_TABLE_EXISTS_ERROR',
                        'ER_DUP_ENTRY',
                        'ER_DUP_KEYNAME',
                        'ER_CANT_DROP_FIELD_OR_KEY',
                        'ER_DUP_FIELDNAME'
                    ];
                    const skipMessages = [
                        'Duplicate entry',
                        'already exists',
                        'Duplicate key name',
                        'Key already exists',
                        'Constraint already exists'
                    ];
                    
                    if (skipErrors.includes(error.code) || 
                        skipMessages.some(msg => error.message.includes(msg))) {
                        const preview = statement.substring(0, 60).replace(/\s+/g, ' ').trim();
                        console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
                    } else {
                        const preview = statement.substring(0, 100).replace(/\s+/g, ' ').trim();
                        console.error(`❌ [${i + 1}/${statements.length}] Error in: ${preview}...`);
                        console.error(`   Error: ${error.message}`);
                        throw error;
                    }
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📋 Created tables:');
        console.log('   - tours_bookings');
        console.log('   - tours_booking_participants');
        console.log('   - tours_booking_addons');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
        process.exit(0);
    }
}

// Run the migration
runMigration();

