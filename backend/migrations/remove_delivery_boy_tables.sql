-- Migration: Remove delivery boy tables
-- Description: Removes delivery_boys and delivery_boy_cash_collection tables
--              since delivery boys are managed via external API
-- Date: 2025-11-14
-- 
-- WARNING: This will delete all data in these tables!
-- Only run this if you want to remove local delivery boy tables

-- Drop foreign key constraints first (if they exist)
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_2'
);

SET @sql = IF(@constraint_exists > 0,
  'ALTER TABLE `restaurant_orders` DROP FOREIGN KEY `restaurant_orders_ibfk_2`',
  'SELECT "No constraint to drop" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop delivery boy tables
DROP TABLE IF EXISTS `delivery_boy_cash_collection`;
DROP TABLE IF EXISTS `delivery_boys`;

-- Note: restaurant_orders.delivery_boy_id column remains but without foreign key constraint
-- It will store delivery boy IDs from the external API

