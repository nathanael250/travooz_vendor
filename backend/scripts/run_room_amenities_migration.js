const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'admin',
      password: 'admin',
      database: 'travoozapp_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/add_missing_room_amenities.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration...');
    
    // Execute migration
    await connection.query(migrationSQL);
    
    console.log('✅ Migration executed successfully!');

    // Verify columns were added
    console.log('\n🔍 Verifying columns...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'travoozapp_db' 
      AND TABLE_NAME = 'stays_room_amenities'
      AND COLUMN_NAME IN (
        'kitchen_facilities', 
        'room_layout', 
        'additional_amenities',
        'air_conditioning_type',
        'desk',
        'separate_sitting_area',
        'private_spa_tub',
        'laptop_friendly_workspace',
        'separate_dining_area',
        'private_pool'
      )
      ORDER BY COLUMN_NAME
    `);

    if (columns.length > 0) {
      console.log('\n✅ Found columns:');
      columns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('\n⚠️  No new columns found. They may already exist or migration failed.');
    }

    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

runMigration();



