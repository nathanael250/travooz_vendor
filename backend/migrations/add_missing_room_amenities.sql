-- Migration: Add missing room amenities columns to stays_room_amenities table
-- These amenities are used in the frontend but were missing from the database

SET @db_name = DATABASE();
SET @table_name = 'stays_room_amenities';

-- Add kitchen_facilities column (JSON) if it doesn't exist
SET @column_name = 'kitchen_facilities';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column kitchen_facilities already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` json DEFAULT NULL AFTER `has_kitchen`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add room_layout column (JSON) if it doesn't exist
SET @column_name = 'room_layout';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column room_layout already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` json DEFAULT NULL AFTER `has_patio`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add additional_amenities column (JSON) if it doesn't exist
SET @column_name = 'additional_amenities';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column additional_amenities already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` json DEFAULT NULL AFTER `room_layout`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add has_heating column if it doesn't exist (should already exist, but check just in case)
SET @column_name = 'has_heating';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column has_heating already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `has_air_conditioning`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add air_conditioning_type column (varchar for AC type like 'in-room', 'central', etc.)
SET @column_name = 'air_conditioning_type';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column air_conditioning_type already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(100) DEFAULT NULL AFTER `has_air_conditioning`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add desk column (boolean for desk availability)
SET @column_name = 'desk';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column desk already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `has_patio`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add separate_sitting_area column (boolean)
SET @column_name = 'separate_sitting_area';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column separate_sitting_area already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `desk`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add private_spa_tub column (boolean)
SET @column_name = 'private_spa_tub';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column private_spa_tub already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `separate_sitting_area`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add laptop_friendly_workspace column (boolean)
SET @column_name = 'laptop_friendly_workspace';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column laptop_friendly_workspace already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `private_spa_tub`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add separate_dining_area column (boolean)
SET @column_name = 'separate_dining_area';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column separate_dining_area already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `laptop_friendly_workspace`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add private_pool column (boolean)
SET @column_name = 'private_pool';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column private_pool already exists. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` tinyint(1) DEFAULT 0 AFTER `separate_dining_area`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed: Added missing room amenities columns.';
SELECT 'Columns that may have been added: kitchen_facilities, room_layout, additional_amenities, has_heating, air_conditioning_type, desk, separate_sitting_area, private_spa_tub, laptop_friendly_workspace, separate_dining_area, private_pool';

