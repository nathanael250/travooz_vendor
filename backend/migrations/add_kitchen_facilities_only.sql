-- Add kitchen_facilities column to stays_room_amenities table
USE travoozapp_db;

-- Check if column exists, if not add it
SET @db_name = DATABASE();
SET @table_name = 'stays_room_amenities';
SET @column_name = 'kitchen_facilities';

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column kitchen_facilities already exists. Skipping.' as result;",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` json DEFAULT NULL AFTER `has_kitchen`;')
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column was added
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'travoozapp_db' 
AND TABLE_NAME = 'stays_room_amenities' 
AND COLUMN_NAME = 'kitchen_facilities';

