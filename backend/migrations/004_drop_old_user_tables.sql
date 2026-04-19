-- Migration: Drop Old Separated User Tables
-- Description: Removes old service-specific user tables after migration to unified users structure
-- Date: 2025-01-XX
-- 
-- IMPORTANT: This script should only be run AFTER:
-- 1. Data migration is complete (003_migrate_to_unified_users.sql)
-- 2. All code has been updated to use unified users table
-- 3. Testing confirms everything works with unified structure
--
-- This script:
-- 1. Drops foreign key constraints that reference old user tables
-- 2. Drops the old user tables:
--    - restaurant_users
--    - car_rental_users
--    - tours_users
--    - stays_users

-- ============================================
-- STEP 1: DROP FOREIGN KEY CONSTRAINTS
-- ============================================
-- Drop foreign keys that reference old user tables
-- Note: MySQL doesn't support IF EXISTS for DROP FOREIGN KEY, so errors are expected if constraints don't exist

-- Drop foreign keys from car_rental tables
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'car_rental_businesses' 
     AND CONSTRAINT_NAME = 'fk_car_rental_business_user') > 0,
    'ALTER TABLE car_rental_businesses DROP FOREIGN KEY fk_car_rental_business_user',
    'SELECT "Foreign key fk_car_rental_business_user does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'car_rental_setup_progress' 
     AND CONSTRAINT_NAME = 'fk_car_rental_progress_user') > 0,
    'ALTER TABLE car_rental_setup_progress DROP FOREIGN KEY fk_car_rental_progress_user',
    'SELECT "Foreign key fk_car_rental_progress_user does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'car_rental_setup_submissions' 
     AND CONSTRAINT_NAME = 'fk_car_rental_submission_user') > 0,
    'ALTER TABLE car_rental_setup_submissions DROP FOREIGN KEY fk_car_rental_submission_user',
    'SELECT "Foreign key fk_car_rental_submission_user does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'car_rental_onboarding_progress_track' 
     AND CONSTRAINT_NAME = 'fk_car_rental_onboarding_user') > 0,
    'ALTER TABLE car_rental_onboarding_progress_track DROP FOREIGN KEY fk_car_rental_onboarding_user',
    'SELECT "Foreign key fk_car_rental_onboarding_user does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from stays tables
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'stays_email_verifications' 
     AND CONSTRAINT_NAME = 'stays_email_verifications_ibfk_1') > 0,
    'ALTER TABLE stays_email_verifications DROP FOREIGN KEY stays_email_verifications_ibfk_1',
    'SELECT "Foreign key stays_email_verifications_ibfk_1 does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'stays_properties' 
     AND CONSTRAINT_NAME = 'stays_properties_ibfk_1') > 0,
    'ALTER TABLE stays_properties DROP FOREIGN KEY stays_properties_ibfk_1',
    'SELECT "Foreign key stays_properties_ibfk_1 does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: If other tables have foreign keys, add them here
-- You can find them with:
-- SELECT TABLE_NAME, CONSTRAINT_NAME 
-- FROM information_schema.TABLE_CONSTRAINTS 
-- WHERE CONSTRAINT_SCHEMA = DATABASE() 
-- AND REFERENCED_TABLE_NAME IN ('restaurant_users', 'car_rental_users', 'tours_users', 'stays_users')
-- AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ============================================
-- STEP 2: DROP OLD USER TABLES
-- ============================================

-- Drop restaurant_users table
DROP TABLE IF EXISTS `restaurant_users`;

-- Drop car_rental_users table
DROP TABLE IF EXISTS `car_rental_users`;

-- Drop tours_users table
DROP TABLE IF EXISTS `tours_users`;

-- Drop stays_users table
DROP TABLE IF EXISTS `stays_users`;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify:
-- 1. All old user tables are gone
-- 2. Unified users table exists and has data
-- 3. All services can still authenticate users
-- 4. All registration flows work correctly

SELECT 'Old user tables dropped successfully!' as status;
