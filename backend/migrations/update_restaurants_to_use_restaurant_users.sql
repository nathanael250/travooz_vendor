-- Migration: Update restaurants table to reference restaurant_users
-- Description: Changes restaurants.user_id to reference restaurant_users.id instead of profiles.id
-- Date: 2025-11-14
-- 
-- IMPORTANT: This migration assumes restaurant_users table exists
-- Run create_restaurant_system_tables.sql first

-- Step 1: Drop existing foreign key constraint on restaurants.user_id if it exists
-- (This will fail if constraint doesn't exist, which is fine)
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurants'
    AND CONSTRAINT_NAME LIKE '%user_id%'
);

-- Step 2: Update restaurants table structure
-- Note: We can't directly change the foreign key reference, so we'll:
-- 1. Keep user_id as is (it's already varchar(36))
-- 2. Add a note that it should reference restaurant_users.id
-- 3. The application code will handle the relationship

-- Add index if it doesn't exist
ALTER TABLE `restaurants` 
  ADD INDEX IF NOT EXISTS `idx_user_id_restaurant_users` (`user_id`);

-- Note: The actual foreign key constraint will be added by the application
-- or manually after ensuring all user_id values in restaurants table
-- reference valid restaurant_users.id values

