-- Migration: Create Service-Specific Profile Tables
-- Description: Creates profile tables for each service to store service-specific user data
-- Date: 2025-01-XX
-- 
-- These tables store service-specific data, while identity lives in the unified `users` table

-- ============================================
-- RESTAURANT PROFILES
-- Service-specific data for restaurant vendors
-- ============================================
CREATE TABLE IF NOT EXISTS `restaurant_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  
  `restaurant_id` VARCHAR(36) DEFAULT NULL COMMENT 'Reference to restaurants table',
  `status` ENUM('pending', 'approved', 'rejected', 'draft') DEFAULT 'draft',
  
  `name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `address` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_restaurant_id` (`restaurant_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Restaurant service-specific user profiles';

-- ============================================
-- CAR RENTAL PROFILES
-- Service-specific data for car rental vendors
-- ============================================
CREATE TABLE IF NOT EXISTS `car_rental_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  
  `car_rental_business_id` INT DEFAULT NULL COMMENT 'Reference to car_rental_businesses table',
  `status` ENUM('pending', 'approved', 'rejected', 'draft') DEFAULT 'draft',
  
  `name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_car_rental_business_id` (`car_rental_business_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Car rental service-specific user profiles';

-- ============================================
-- TOURS PROFILES
-- Service-specific data for tour vendors
-- ============================================
CREATE TABLE IF NOT EXISTS `tour_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  
  `tour_business_id` INT DEFAULT NULL COMMENT 'Reference to tours_businesses table',
  `status` ENUM('pending', 'approved', 'rejected', 'draft') DEFAULT 'draft',
  
  `name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `address` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_tour_business_id` (`tour_business_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tour service-specific user profiles';

-- ============================================
-- STAYS PROFILES
-- Service-specific data for stays vendors
-- ============================================
CREATE TABLE IF NOT EXISTS `stay_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  
  `property_id` INT DEFAULT NULL COMMENT 'Reference to stays_properties table',
  `status` ENUM('pending', 'approved', 'rejected', 'draft') DEFAULT 'draft',
  
  `name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `address` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  
  `host_type` ENUM('individual', 'company') DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_property_id` (`property_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stays service-specific user profiles';

-- ============================================
-- ADMIN PROFILES
-- Service-specific data for admin users
-- ============================================
CREATE TABLE IF NOT EXISTS `admin_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  
  `profile_image` VARCHAR(255) DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Admin service-specific user profiles';





