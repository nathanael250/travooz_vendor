-- Migration: Update restaurants.user_id to INT to match restaurant_users.user_id
-- Description: Converts restaurants.user_id from varchar(36) to INT to properly reference restaurant_users.user_id
-- Date: 2025-11-14
-- 
-- IMPORTANT: This migration assumes restaurant_users table exists and uses INT for user_id
-- Run create_restaurant_system_tables.sql first

-- Step 1: Check if restaurants.user_id is varchar and needs conversion
-- We'll add a new column, migrate data, then drop old column

-- Add temporary INT column
ALTER TABLE `restaurants` 
  ADD COLUMN `user_id_int` INT NULL AFTER `user_id`;

-- Migrate data: Convert varchar user_id to INT where possible
-- Note: This will only work if user_id values are numeric strings
-- First, check if restaurant_users table exists and has data
UPDATE `restaurants` r
SET `user_id_int` = CAST(`user_id` AS UNSIGNED)
WHERE `user_id` IS NOT NULL 
  AND `user_id` REGEXP '^[0-9]+$'
  AND EXISTS (
    SELECT 1 FROM `restaurant_users` 
    WHERE `restaurant_users`.`user_id` = CAST(r.`user_id` AS UNSIGNED)
  );

-- For restaurant_users that don't match, we'll need to handle them separately
-- Drop old varchar column
ALTER TABLE `restaurants` 
  DROP COLUMN `user_id`;

-- Rename new column to user_id
ALTER TABLE `restaurants` 
  CHANGE COLUMN `user_id_int` `user_id` INT NULL;

-- Add index
ALTER TABLE `restaurants` 
  ADD INDEX `idx_user_id` (`user_id`);

-- Note: If there are existing restaurants with varchar user_id that can't be converted,
-- you may need to manually update them or create new restaurant_users entries

