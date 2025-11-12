-- ============================================
-- MIGRATION: Update photo_url column to LONGTEXT
-- ============================================
-- This migration updates the photo_url column in tours_package_photos
-- from VARCHAR(500) to LONGTEXT to accommodate base64-encoded images
-- which can be several megabytes in size.

ALTER TABLE tours_package_photos 
MODIFY COLUMN photo_url LONGTEXT NOT NULL;

-- Verify the change
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'travoozapp_db'
  AND TABLE_NAME = 'tours_package_photos'
  AND COLUMN_NAME = 'photo_url';

