const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addKitchenAmenitiesColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'admin',
      password: 'admin',
      database: 'travoozapp_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'travoozapp_db' 
      AND TABLE_NAME = 'stays_room_amenities' 
      AND COLUMN_NAME = 'kitchen_facilities'
    `);

    if (columns.length > 0) {
      console.log('✅ Column kitchen_facilities already exists');
    } else {
      console.log('📝 Adding kitchen_facilities column...');
      await connection.execute(`
        ALTER TABLE stays_room_amenities 
        ADD COLUMN kitchen_facilities json DEFAULT NULL AFTER has_kitchen
      `);
      console.log('✅ Column kitchen_facilities added successfully');
    }

    // Verify
    const [verify] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'travoozapp_db' 
      AND TABLE_NAME = 'stays_room_amenities' 
      AND COLUMN_NAME = 'kitchen_facilities'
    `);

    if (verify.length > 0) {
      console.log(`✅ Verified: kitchen_facilities exists (type: ${verify[0].DATA_TYPE})`);
    } else {
      console.log('❌ Column was not added');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addKitchenAmenitiesColumn();



