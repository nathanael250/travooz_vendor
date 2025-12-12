/**
 * Migration script to move images from tour_package_images to tours_package_photos
 * Run with: node scripts/migrate_images_to_new_table.js
 */

const { executeQuery } = require('../config/database');

async function migrateImages() {
  try {
    console.log('🔄 Starting migration of images from tour_package_images to tours_package_photos...\n');

    // Check if old table has data
    const oldCount = await executeQuery(`
      SELECT COUNT(*) as total FROM tour_package_images
    `);
    console.log(`📊 Found ${oldCount[0].total} images in tour_package_images\n`);

    if (oldCount[0].total === 0) {
      console.log('✅ No images to migrate. Migration complete!');
      process.exit(0);
    }

    // Get all images from old table
    const oldImages = await executeQuery(`
      SELECT package_id, image_url, image_name, image_size, image_type, display_order, is_primary, created_at
      FROM tour_package_images
      ORDER BY package_id, display_order, is_primary DESC
    `);

    console.log(`📦 Migrating ${oldImages.length} images...\n`);

    let migrated = 0;
    let skipped = 0;

    for (const image of oldImages) {
      try {
        // Check if image already exists in new table
        const existing = await executeQuery(
          `SELECT photo_id FROM tours_package_photos 
           WHERE package_id = ? AND photo_url = ?`,
          [image.package_id, image.image_url]
        );

        if (existing.length > 0) {
          console.log(`⏭️  Skipping duplicate: Package ${image.package_id} - ${image.image_url.substring(0, 50)}...`);
          skipped++;
          continue;
        }

        // Insert into new table
        await executeQuery(
          `INSERT INTO tours_package_photos 
           (package_id, photo_url, photo_name, photo_size, photo_type, display_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            image.package_id,
            image.image_url,
            image.image_name,
            image.image_size,
            image.image_type,
            image.display_order,
            image.is_primary,
            image.created_at
          ]
        );

        migrated++;
        console.log(`✅ Migrated: Package ${image.package_id} - ${image.image_url.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error migrating image for package ${image.package_id}:`, error.message);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migrated} images`);
    console.log(`   Skipped: ${skipped} duplicates`);
    console.log(`\n💡 You can now verify the migration and optionally drop the old table:`);
    console.log(`   DROP TABLE IF EXISTS tour_package_images;`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  process.exit(0);
}

migrateImages();







