USE travoozapp_db;

SET @db_name = DATABASE();

-- Add notification receiver columns to tours_businesses table
SET @table_name = 'tours_businesses';

-- Add wants_notifications column (varchar) if it doesn't exist
SET @column_name = 'wants_notifications';
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = @table_name 
   AND COLUMN_NAME = @column_name) > 0,
  "SELECT 'Column wants_notifications already exists in tours_businesses. Skipping.';",
  CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN `', @column_name, '` varchar(10) DEFAULT \'no\' AFTER `status`;')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notification_receiver column (varchar) if it doesn't exist
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

SELECT 'Migration completed: Added notification receiver columns to tours_businesses.';



