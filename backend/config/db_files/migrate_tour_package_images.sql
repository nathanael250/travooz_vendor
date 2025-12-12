-- ============================================
-- Migration: Move data from tour_package_images to tours_package_photos
-- ============================================
-- This migration moves existing photo data from tour_package_images 
-- to tours_package_photos table to fix the table name mismatch issue
-- ============================================

-- Step 1: Check if tour_package_images table exists and has data
SET @dbname = DATABASE();
SET @old_table = 'tour_package_images';
SET @new_table = 'tours_package_photos';

SET @old_table_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @old_table
);

SET @new_table_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @new_table
);

-- Step 2: Migrate data if old table exists
SET @migration_query = (SELECT IF(
    @old_table_exists > 0,
    CONCAT(
        'INSERT INTO ', @new_table, 
        ' (package_id, photo_url, photo_name, photo_size, photo_type, display_order, is_primary, created_at) ',
        'SELECT package_id, image_url, image_name, image_size, image_type, display_order, is_primary, created_at ',
        'FROM ', @old_table, ' ',
        'WHERE NOT EXISTS (',
        '  SELECT 1 FROM ', @new_table, ' n ',
        '  WHERE n.package_id = ', @old_table, '.package_id ',
        '  AND n.photo_url = ', @old_table, '.image_url',
        ')'
    ),
    'SELECT "No migration needed - tour_package_images table does not exist" AS message'
));

PREPARE migrate_data FROM @migration_query;
EXECUTE migrate_data;
DEALLOCATE PREPARE migrate_data;

-- Step 3: Show migration summary
SELECT 
    (SELECT COUNT(*) FROM tours_package_photos) AS total_photos_in_new_table,
    (SELECT COUNT(*) FROM tour_package_images) AS total_photos_in_old_table,
    CASE 
        WHEN @old_table_exists > 0 AND @new_table_exists > 0 THEN 'Migration completed. You can drop tour_package_images table if all data was migrated.'
        WHEN @old_table_exists = 0 THEN 'No old table found - migration not needed'
        ELSE 'New table does not exist - please create it first'
    END AS migration_status;

-- ============================================
-- Note: After verifying the migration, you can drop the old table:
-- DROP TABLE IF EXISTS tour_package_images;
-- ============================================



