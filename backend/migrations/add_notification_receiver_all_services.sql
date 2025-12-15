USE travoozapp_db;

SET @db_name = DATABASE();

-- Add notification receiver columns to all service tables
-- This migration adds wants_notifications and notification_receiver columns to:
-- 1. stays_properties
-- 2. restaurants
-- 3. tours_businesses
-- 4. car_rental_businesses

-- ============================================
-- 1. STAYS PROPERTIES
-- ============================================
SET @table_name = 'stays_properties';

-- Add wants_notifications column
SET @column_name = 'wants_notifications';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column wants_notifications already exists in stays_properties. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(10) DEFAULT \'no\';')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notification_receiver column
SET @column_name = 'notification_receiver';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column notification_receiver already exists in stays_properties. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(255) DEFAULT NULL AFTER `wants_notifications`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. RESTAURANTS
-- ============================================
SET @table_name = 'restaurants';

-- Add wants_notifications column
SET @column_name = 'wants_notifications';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column wants_notifications already exists in restaurants. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(10) DEFAULT \'no\';')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notification_receiver column
SET @column_name = 'notification_receiver';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column notification_receiver already exists in restaurants. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(255) DEFAULT NULL AFTER `wants_notifications`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. TOURS BUSINESSES
-- ============================================
SET @table_name = 'tours_businesses';

-- Add wants_notifications column
SET @column_name = 'wants_notifications';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column wants_notifications already exists in tours_businesses. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(10) DEFAULT \'no\';')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notification_receiver column
SET @column_name = 'notification_receiver';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column notification_receiver already exists in tours_businesses. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(255) DEFAULT NULL AFTER `wants_notifications`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. CAR RENTAL BUSINESSES
-- ============================================
SET @table_name = 'car_rental_businesses';

-- Add wants_notifications column
SET @column_name = 'wants_notifications';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column wants_notifications already exists in car_rental_businesses. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(10) DEFAULT \'no\';')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notification_receiver column
SET @column_name = 'notification_receiver';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column notification_receiver already exists in car_rental_businesses. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(255) DEFAULT NULL AFTER `wants_notifications`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed: Added notification receiver columns to all service tables (stays_properties, restaurants, tours_businesses, car_rental_businesses).';

