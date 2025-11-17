-- Cleanup: Drop restaurant system tables
-- Description: Removes all restaurant-related tables we created
-- Date: 2025-11-14
-- 
-- WARNING: This will delete all data in these tables!
-- Only run this if you want to start fresh

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS `restaurant_table_bookings`;
DROP TABLE IF EXISTS `restaurant_order_items`;
DROP TABLE IF EXISTS `restaurant_orders`;
DROP TABLE IF EXISTS `restaurant_users`;

-- Also drop delivery boy tables if they exist (they should be managed via external API)
-- First drop foreign key constraint if it exists
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME LIKE '%delivery_boy%'
);

SET @sql = IF(@constraint_exists > 0,
  'ALTER TABLE `restaurant_orders` DROP FOREIGN KEY `restaurant_orders_ibfk_2`',
  'SELECT "No delivery boy constraint to drop" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS `delivery_boy_cash_collection`;
DROP TABLE IF EXISTS `delivery_boys`;

-- Note: We're NOT dropping the restaurants table itself as it may have existing data
-- If you need to reset restaurants table, do it manually:
-- TRUNCATE TABLE `restaurants`; (or DROP TABLE `restaurants`; if you want to recreate it)

