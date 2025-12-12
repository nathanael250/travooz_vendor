/**
 * Diagnostic script to check tour package images in the database
 * Run with: node scripts/check_tour_images.js
 */

const { executeQuery } = require('../config/database');

async function checkTourImages() {
  try {
    console.log('🔍 Checking tour package images in database...\n');

    // Check if tours_package_photos table exists
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('tours_package_photos', 'tour_package_images')
    `);
    
    console.log('📋 Found tables:', tables.map(t => t.TABLE_NAME));
    console.log('');

    // Check tours_package_photos table structure
    if (tables.some(t => t.TABLE_NAME === 'tours_package_photos')) {
      const structure = await executeQuery(`
        DESCRIBE tours_package_photos
      `);
      console.log('📊 tours_package_photos table structure:');
      console.table(structure);
      console.log('');

      // Count total photos
      const totalCount = await executeQuery(`
        SELECT COUNT(*) as total FROM tours_package_photos
      `);
      console.log(`📸 Total photos in tours_package_photos: ${totalCount[0].total}`);
      console.log('');

      // Check photos for specific packages
      const packagePhotos = await executeQuery(`
        SELECT package_id, COUNT(*) as photo_count 
        FROM tours_package_photos 
        WHERE package_id IN (1, 2, 3)
        GROUP BY package_id
      `);
      console.log('📦 Photos for packages 1, 2, 3:');
      console.table(packagePhotos);
      console.log('');

      // Get sample photos
      const samplePhotos = await executeQuery(`
        SELECT package_id, photo_id, photo_url, display_order, is_primary
        FROM tours_package_photos 
        WHERE package_id IN (1, 2, 3)
        ORDER BY package_id, display_order, is_primary DESC
        LIMIT 10
      `);
      console.log('🖼️  Sample photos:');
      if (samplePhotos.length > 0) {
        samplePhotos.forEach(photo => {
          console.log(`  Package ${photo.package_id}: ${photo.photo_url.substring(0, 80)}...`);
        });
      } else {
        console.log('  No photos found for packages 1, 2, 3');
      }
      console.log('');
    }

    // Check tour_package_images table (old table)
    if (tables.some(t => t.TABLE_NAME === 'tour_package_images')) {
      const oldCount = await executeQuery(`
        SELECT COUNT(*) as total FROM tour_package_images
      `);
      console.log(`📸 Total photos in tour_package_images (old table): ${oldCount[0].total}`);
      
      const oldPackagePhotos = await executeQuery(`
        SELECT package_id, COUNT(*) as photo_count 
        FROM tour_package_images 
        WHERE package_id IN (1, 2, 3)
        GROUP BY package_id
      `);
      if (oldPackagePhotos.length > 0) {
        console.log('⚠️  Found photos in old table tour_package_images:');
        console.table(oldPackagePhotos);
      }
      console.log('');
    }

    // Test the actual query used in the service
    console.log('🧪 Testing queries used in service:');
    for (const packageId of [1, 2, 3]) {
      try {
        const result = await executeQuery(
          `SELECT photo_url FROM tours_package_photos WHERE package_id = ? ORDER BY display_order, is_primary DESC`,
          [packageId]
        );
        console.log(`  Package ${packageId}: Found ${result.length} images`);
        if (result.length > 0) {
          result.forEach((img, idx) => {
            console.log(`    [${idx + 1}] ${img.photo_url.substring(0, 60)}...`);
          });
        }
      } catch (error) {
        console.error(`  Package ${packageId}: Query failed - ${error.message}`);
      }
    }

    console.log('\n✅ Diagnostic complete!');
  } catch (error) {
    console.error('❌ Error running diagnostic:', error);
  }
  process.exit(0);
}

checkTourImages();


