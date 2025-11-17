-- Migration: Complete Restaurant System Setup
-- Description: Creates all restaurant system tables with proper structure matching other services
-- Date: 2025-11-14
-- 
-- This migration creates:
-- 1. restaurant_users (matches tours_users structure)
-- 2. delivery_boys
-- 3. delivery_boy_cash_collection
-- 4. restaurant_orders
-- 5. restaurant_order_items
-- 6. restaurant_table_bookings
--
-- IMPORTANT: Run cleanup_restaurant_tables.sql first if you want to start fresh

-- ============================================
-- Table: restaurant_users
-- Primary user table for restaurant vendors
-- Structure matches tours_users exactly
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_users` (
  `user_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role` enum('admin','vendor','client') NOT NULL DEFAULT 'vendor',
  `name` varchar(100) NOT NULL,
  `email` varchar(100) UNIQUE NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `password_hash` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_logins` int DEFAULT '0',
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Note: Delivery boys are managed via external API
-- We don't create delivery_boys or delivery_boy_cash_collection tables
-- The restaurant_orders table stores delivery_boy_id as INT (from external API)
-- Delivery boy operations are proxied to external API
-- ============================================

-- ============================================
-- Table: restaurant_orders
-- Stores food orders from restaurants
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_orders` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `booking_id` int DEFAULT NULL COMMENT 'Reference to main bookings table',
  `restaurant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID (from restaurant_users or profiles)',
  `order_type` enum('delivery','dine_in','pickup') NOT NULL DEFAULT 'delivery',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `delivery_address` text DEFAULT NULL COMMENT 'Required for delivery orders',
  `delivery_latitude` decimal(10,8) DEFAULT NULL,
  `delivery_longitude` decimal(11,8) DEFAULT NULL,
  `table_booking_id` int DEFAULT NULL COMMENT 'Reference to restaurant_table_bookings for dine-in orders',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('card','cash','mobile_money','bank_transfer') DEFAULT 'card',
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `order_status` enum('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  `delivery_boy_id` int DEFAULT NULL COMMENT 'Assigned delivery boy ID from external API (no foreign key)',
  `special_instructions` text DEFAULT NULL,
  `estimated_delivery_time` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_restaurant_id` (`restaurant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_delivery_boy_id` (`delivery_boy_id`),
  KEY `idx_table_booking_id` (`table_booking_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: restaurant_order_items
-- Stores individual items in each order
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_order_items` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `order_id` varchar(36) NOT NULL,
  `menu_item_id` varchar(36) NOT NULL,
  `item_name` varchar(255) NOT NULL COMMENT 'Snapshot of item name at time of order',
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL COMMENT 'Snapshot of price at time of order',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'quantity * unit_price',
  `addons` text DEFAULT NULL COMMENT 'JSON array of selected addons',
  `customizations` text DEFAULT NULL COMMENT 'JSON array of customizations',
  `special_instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_order_id` (`order_id`),
  KEY `idx_menu_item_id` (`menu_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: restaurant_table_bookings
-- Stores table reservations for dine-in orders
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_table_bookings` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `booking_id` int DEFAULT NULL COMMENT 'Reference to main bookings table',
  `restaurant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID (from restaurant_users or profiles)',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `number_of_guests` int NOT NULL DEFAULT 1,
  `table_number` varchar(20) DEFAULT NULL COMMENT 'Assigned table number if available',
  `status` enum('pending','confirmed','seated','completed','cancelled','no_show') DEFAULT 'pending',
  `special_requests` text DEFAULT NULL,
  `arrived_at` timestamp NULL DEFAULT NULL,
  `seated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_restaurant_id` (`restaurant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_booking_date` (`booking_date`),
  KEY `idx_status` (`status`),
  KEY `idx_booking_datetime` (`booking_date`, `booking_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Add Foreign Key Constraints
-- ============================================

-- Foreign keys for restaurant_orders
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_orders` ADD CONSTRAINT `restaurant_orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: delivery_boy_id in restaurant_orders references external API, no foreign key constraint

SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_3'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_orders` ADD CONSTRAINT `restaurant_orders_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE SET NULL',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign keys for restaurant_order_items
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_order_items'
    AND CONSTRAINT_NAME = 'restaurant_order_items_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_order_items` ADD CONSTRAINT `restaurant_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `restaurant_orders`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_order_items'
    AND CONSTRAINT_NAME = 'restaurant_order_items_ibfk_2'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_order_items` ADD CONSTRAINT `restaurant_order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign keys for restaurant_table_bookings
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_table_bookings'
    AND CONSTRAINT_NAME = 'restaurant_table_bookings_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_table_bookings` ADD CONSTRAINT `restaurant_table_bookings_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_table_bookings'
    AND CONSTRAINT_NAME = 'restaurant_table_bookings_ibfk_2'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_table_bookings` ADD CONSTRAINT `restaurant_table_bookings_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE SET NULL',
  'SELECT "Constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Note about restaurants.user_id
-- ============================================
-- The restaurants table currently has user_id as varchar(36)
-- This can reference either:
-- 1. restaurant_users.user_id (INT) - for new restaurant vendors
-- 2. profiles.id (varchar) - for backward compatibility
-- 
-- The application code handles both cases.
-- If you want to convert restaurants.user_id to INT, run:
-- migrations/update_restaurants_user_id_to_int.sql

