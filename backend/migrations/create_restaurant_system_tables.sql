-- Migration: Create restaurant system tables
-- Description: Creates tables for restaurant users, delivery boys, orders, and table bookings
-- Date: 2025-11-14

-- ============================================
-- Table: restaurant_users
-- Primary user table for restaurant vendors and staff
-- This is where restaurant vendors register and login
-- Structure matches tours_users and other service user tables
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
-- Update restaurants table to reference restaurant_users
-- ============================================
-- Note: restaurants.user_id is currently varchar(36) but restaurant_users.user_id is INT
-- We need to either:
-- 1. Change restaurants.user_id to INT to match restaurant_users.user_id
-- 2. Or keep it as varchar and store the user_id as string
-- For now, we'll add a note that restaurants.user_id should reference restaurant_users.user_id
-- The application code will handle the relationship

-- Add index on restaurants.user_id if it doesn't exist (for performance)
-- Note: If restaurants.user_id is varchar(36), we may need to convert it to INT
-- ALTER TABLE `restaurants` ADD INDEX IF NOT EXISTS `idx_user_id` (`user_id`);

-- ============================================
-- Table: delivery_boys
-- Stores delivery personnel information
-- ============================================
CREATE TABLE IF NOT EXISTS `delivery_boys` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `bonus_type` enum('fixed_amount_per_order','percentage_per_order') DEFAULT 'fixed_amount_per_order',
  `bonus_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Fixed amount per order if bonus_type is fixed_amount_per_order',
  `bonus_percentage` decimal(5,2) DEFAULT 0.00 COMMENT 'Percentage per order if bonus_type is percentage_per_order',
  `is_active` tinyint(1) DEFAULT 1,
  `total_orders` int DEFAULT 0 COMMENT 'Total number of orders delivered',
  `total_earnings` decimal(10,2) DEFAULT 0.00 COMMENT 'Total earnings from deliveries',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_mobile` (`mobile`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: delivery_boy_cash_collection
-- Tracks cash collection transactions for delivery boys
-- ============================================
CREATE TABLE IF NOT EXISTS `delivery_boy_cash_collection` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `delivery_boy_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('delivery_boy_cash','delivery_boy_cash_collection') DEFAULT 'delivery_boy_cash' COMMENT 'delivery_boy_cash = delivery boy collected, delivery_boy_cash_collection = admin collected',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_delivery_boy_id` (`delivery_boy_id`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_date` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: restaurant_orders
-- Stores food orders from restaurants
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_orders` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `booking_id` int DEFAULT NULL COMMENT 'Reference to main bookings table',
  `restaurant_id` varchar(36) NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID',
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
  `delivery_boy_id` int DEFAULT NULL COMMENT 'Assigned delivery boy for delivery orders',
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
  `restaurant_id` varchar(36) NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID',
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

-- Add foreign key for delivery_boy_cash_collection (only if it doesn't exist)
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'delivery_boy_cash_collection'
    AND CONSTRAINT_NAME = 'delivery_boy_cash_collection_ibfk_1'
);

SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `delivery_boy_cash_collection` 
   ADD CONSTRAINT `delivery_boy_cash_collection_ibfk_1` 
   FOREIGN KEY (`delivery_boy_id`) REFERENCES `delivery_boys`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign keys for restaurant_orders (only if they don't exist)
-- Constraint 1: restaurant_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_orders` ADD CONSTRAINT `restaurant_orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint restaurant_orders_ibfk_1 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Constraint 2: delivery_boy_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_2'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_orders` ADD CONSTRAINT `restaurant_orders_ibfk_2` FOREIGN KEY (`delivery_boy_id`) REFERENCES `delivery_boys`(`id`) ON DELETE SET NULL',
  'SELECT "Constraint restaurant_orders_ibfk_2 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Constraint 3: booking_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_orders'
    AND CONSTRAINT_NAME = 'restaurant_orders_ibfk_3'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_orders` ADD CONSTRAINT `restaurant_orders_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE SET NULL',
  'SELECT "Constraint restaurant_orders_ibfk_3 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign keys for restaurant_order_items (only if they don't exist)
-- Constraint 1: order_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_order_items'
    AND CONSTRAINT_NAME = 'restaurant_order_items_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_order_items` ADD CONSTRAINT `restaurant_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `restaurant_orders`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint restaurant_order_items_ibfk_1 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Constraint 2: menu_item_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_order_items'
    AND CONSTRAINT_NAME = 'restaurant_order_items_ibfk_2'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_order_items` ADD CONSTRAINT `restaurant_order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT',
  'SELECT "Constraint restaurant_order_items_ibfk_2 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign keys for restaurant_table_bookings (only if they don't exist)
-- Constraint 1: restaurant_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_table_bookings'
    AND CONSTRAINT_NAME = 'restaurant_table_bookings_ibfk_1'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_table_bookings` ADD CONSTRAINT `restaurant_table_bookings_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE',
  'SELECT "Constraint restaurant_table_bookings_ibfk_1 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Constraint 2: booking_id
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'restaurant_table_bookings'
    AND CONSTRAINT_NAME = 'restaurant_table_bookings_ibfk_2'
);
SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE `restaurant_table_bookings` ADD CONSTRAINT `restaurant_table_bookings_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE SET NULL',
  'SELECT "Constraint restaurant_table_bookings_ibfk_2 already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

