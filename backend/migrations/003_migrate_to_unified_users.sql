-- Migration: Migrate Data to Unified Users Table
-- Description: Safely migrates data from service-specific user tables to unified users table
-- Date: 2025-01-XX
-- 
-- IMPORTANT: 
-- 1. Run this AFTER creating the unified users table and profile tables
-- 2. Backup your database before running this migration
-- 3. This migration preserves all existing data and relationships
-- 4. Old tables are kept for rollback purposes (can be dropped later)

-- ============================================
-- STEP 1: Migrate Restaurant Users
-- ============================================
INSERT INTO `users` (
  `service`, `email`, `password_hash`, `role`, 
  `is_active`, `email_verified`, `last_login`, 
  `failed_logins`, `password_reset_token`, `password_reset_expires`,
  `created_at`, `updated_at`
)
SELECT 
  'restaurant' AS `service`,
  `email`,
  `password_hash`,
  `role`,
  `is_active`,
  `email_verified`,
  `last_login`,
  `failed_logins`,
  `password_reset_token`,
  `password_reset_expires`,
  `created_at`,
  `updated_at`
FROM `restaurant_users`
WHERE NOT EXISTS (
  SELECT 1 FROM `users` u 
  WHERE u.service = 'restaurant' AND u.email COLLATE utf8mb4_unicode_ci = restaurant_users.email COLLATE utf8mb4_unicode_ci
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `updated_at` = VALUES(`updated_at`);

-- Create restaurant profiles
INSERT INTO `restaurant_profiles` (
  `user_id`, `restaurant_id`, `status`,
  `name`, `phone`, `phone_verified`, `address`, `gender`,
  `profile_image`, `cover_image`,
  `created_at`, `updated_at`
)
SELECT 
  u.`id` AS `user_id`,
  r.`id` AS `restaurant_id`,
  COALESCE(r.`status`, 'draft') AS `status`,
  ru.`name`,
  ru.`phone`,
  ru.`phone_verified`,
  ru.`address`,
  ru.`gender`,
  ru.`profile_image`,
  ru.`cover_image`,
  ru.`created_at`,
  ru.`updated_at`
FROM `restaurant_users` ru
INNER JOIN `users` u ON u.`service` = 'restaurant' AND u.`email` COLLATE utf8mb4_unicode_ci = ru.`email` COLLATE utf8mb4_unicode_ci
LEFT JOIN `restaurants` r ON (
  r.`user_id` = ru.`user_id` 
  OR CAST(r.`user_id` AS CHAR) = CAST(ru.`user_id` AS CHAR)
  OR CAST(r.`user_id` AS UNSIGNED) = ru.`user_id`
)
WHERE NOT EXISTS (
  SELECT 1 FROM `restaurant_profiles` rp WHERE rp.`user_id` = u.`id`
);

-- ============================================
-- STEP 2: Migrate Car Rental Users
-- ============================================
INSERT INTO `users` (
  `service`, `email`, `password_hash`, `role`, 
  `is_active`, `email_verified`, `last_login`,
  `created_at`, `updated_at`
)
SELECT 
  'car_rental' AS `service`,
  `email`,
  `password_hash`,
  COALESCE(`role`, 'vendor') AS `role`,
  1 AS `is_active`,
  COALESCE(`email_verified`, 0) AS `email_verified`,
  NULL AS `last_login`,
  `created_at`,
  `created_at` AS `updated_at`
FROM `car_rental_users`
WHERE NOT EXISTS (
  SELECT 1 FROM `users` u 
  WHERE u.service = 'car_rental' AND u.email COLLATE utf8mb4_unicode_ci = car_rental_users.email COLLATE utf8mb4_unicode_ci
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `updated_at` = VALUES(`updated_at`);

-- Create car rental profiles
INSERT INTO `car_rental_profiles` (
  `user_id`, `car_rental_business_id`, `status`,
  `name`, `phone`,
  `created_at`, `updated_at`
)
SELECT 
  u.`id` AS `user_id`,
  crb.`car_rental_business_id`,
  COALESCE(crb.`status`, 'draft') AS `status`,
  cru.`name`,
  cru.`phone`,
  cru.`created_at`,
  cru.`created_at` AS `updated_at`
FROM `car_rental_users` cru
INNER JOIN `users` u ON u.`service` = 'car_rental' AND u.`email` COLLATE utf8mb4_unicode_ci = cru.`email` COLLATE utf8mb4_unicode_ci
LEFT JOIN `car_rental_businesses` crb ON crb.`user_id` = cru.`user_id`
WHERE NOT EXISTS (
  SELECT 1 FROM `car_rental_profiles` crp WHERE crp.`user_id` = u.`id`
);

-- ============================================
-- STEP 3: Migrate Tours Users
-- ============================================
INSERT INTO `users` (
  `service`, `email`, `password_hash`, `role`, 
  `is_active`, `email_verified`, `last_login`, 
  `failed_logins`, `password_reset_token`, `password_reset_expires`,
  `created_at`, `updated_at`
)
SELECT 
  'tours' AS `service`,
  `email`,
  `password_hash`,
  `role`,
  `is_active`,
  `email_verified`,
  `last_login`,
  `failed_logins`,
  `password_reset_token`,
  `password_reset_expires`,
  `created_at`,
  `updated_at`
FROM `tours_users`
WHERE NOT EXISTS (
  SELECT 1 FROM `users` u 
  WHERE u.service = 'tours' AND u.email COLLATE utf8mb4_unicode_ci = tours_users.email COLLATE utf8mb4_unicode_ci
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `updated_at` = VALUES(`updated_at`);

-- Create tour profiles
INSERT INTO `tour_profiles` (
  `user_id`, `tour_business_id`, `status`,
  `name`, `phone`, `phone_verified`, `address`, `gender`,
  `profile_image`, `cover_image`,
  `created_at`, `updated_at`
)
SELECT 
  u.`id` AS `user_id`,
  tb.`tour_business_id`,
  COALESCE(tb.`status`, 'draft') AS `status`,
  tu.`name`,
  tu.`phone`,
  tu.`phone_verified`,
  tu.`address`,
  tu.`gender`,
  tu.`profile_image`,
  tu.`cover_image`,
  tu.`created_at`,
  tu.`updated_at`
FROM `tours_users` tu
INNER JOIN `users` u ON u.`service` = 'tours' AND u.`email` COLLATE utf8mb4_unicode_ci = tu.`email` COLLATE utf8mb4_unicode_ci
LEFT JOIN `tours_businesses` tb ON tb.`user_id` = tu.`user_id`
WHERE NOT EXISTS (
  SELECT 1 FROM `tour_profiles` tp WHERE tp.`user_id` = u.`id`
);

-- ============================================
-- STEP 4: Migrate Stays Users
-- ============================================
INSERT INTO `users` (
  `service`, `email`, `password_hash`, `role`, 
  `is_active`, `email_verified`, `last_login`, 
  `failed_logins`, `password_reset_token`, `password_reset_expires`,
  `created_at`, `updated_at`
)
SELECT 
  'stays' AS `service`,
  `email`,
  `password_hash`,
  `role`,
  `is_active`,
  `email_verified`,
  `last_login`,
  `failed_logins`,
  `password_reset_token`,
  `password_reset_expires`,
  `created_at`,
  `updated_at`
FROM `stays_users`
WHERE NOT EXISTS (
  SELECT 1 FROM `users` u 
  WHERE u.service = 'stays' AND u.email COLLATE utf8mb4_unicode_ci = stays_users.email COLLATE utf8mb4_unicode_ci
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `updated_at` = VALUES(`updated_at`);

-- Create stay profiles
INSERT INTO `stay_profiles` (
  `user_id`, `property_id`, `status`,
  `name`, `phone`, `phone_verified`, `address`, `gender`,
  `profile_image`, `cover_image`,
  `host_type`, `location`,
  `created_at`, `updated_at`
)
SELECT 
  u.`id` AS `user_id`,
  sp.`property_id`,
  COALESCE(sp.`status`, 'draft') AS `status`,
  su.`name`,
  su.`phone`,
  su.`phone_verified`,
  su.`address`,
  su.`gender`,
  su.`profile_image`,
  su.`cover_image`,
  NULL AS `host_type`,
  NULL AS `location`,
  su.`created_at`,
  su.`updated_at`
FROM `stays_users` su
INNER JOIN `users` u ON u.`service` = 'stays' AND u.`email` COLLATE utf8mb4_unicode_ci = su.`email` COLLATE utf8mb4_unicode_ci
LEFT JOIN `stays_properties` sp ON sp.`user_id` = su.`user_id`
WHERE NOT EXISTS (
  SELECT 1 FROM `stay_profiles` stp WHERE stp.`user_id` = u.`id`
);

-- ============================================
-- STEP 5: Create User ID Mapping Table (for foreign key updates)
-- ============================================
-- This table helps map old user_id values to new unified user IDs
CREATE TABLE IF NOT EXISTS `user_id_mapping` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `service` VARCHAR(50) NOT NULL,
  `old_user_id` INT NOT NULL,
  `new_user_id` BIGINT UNSIGNED NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_service_old_id` (`service`, `old_user_id`),
  INDEX `idx_new_user_id` (`new_user_id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mapping table for old user_id to new unified user id';

-- Populate mapping for restaurant users
INSERT INTO `user_id_mapping` (`service`, `old_user_id`, `new_user_id`, `email`)
SELECT 
  'restaurant',
  ru.`user_id`,
  u.`id`,
  ru.`email`
FROM `restaurant_users` ru
INNER JOIN `users` u ON u.`service` = 'restaurant' AND u.`email` COLLATE utf8mb4_unicode_ci = ru.`email` COLLATE utf8mb4_unicode_ci
ON DUPLICATE KEY UPDATE `new_user_id` = VALUES(`new_user_id`);

-- Populate mapping for car rental users
INSERT INTO `user_id_mapping` (`service`, `old_user_id`, `new_user_id`, `email`)
SELECT 
  'car_rental',
  cru.`user_id`,
  u.`id`,
  cru.`email`
FROM `car_rental_users` cru
INNER JOIN `users` u ON u.`service` = 'car_rental' AND u.`email` COLLATE utf8mb4_unicode_ci = cru.`email` COLLATE utf8mb4_unicode_ci
ON DUPLICATE KEY UPDATE `new_user_id` = VALUES(`new_user_id`);

-- Populate mapping for tours users
INSERT INTO `user_id_mapping` (`service`, `old_user_id`, `new_user_id`, `email`)
SELECT 
  'tours',
  tu.`user_id`,
  u.`id`,
  tu.`email`
FROM `tours_users` tu
INNER JOIN `users` u ON u.`service` = 'tours' AND u.`email` COLLATE utf8mb4_unicode_ci = tu.`email` COLLATE utf8mb4_unicode_ci
ON DUPLICATE KEY UPDATE `new_user_id` = VALUES(`new_user_id`);

-- Populate mapping for stays users
INSERT INTO `user_id_mapping` (`service`, `old_user_id`, `new_user_id`, `email`)
SELECT 
  'stays',
  su.`user_id`,
  u.`id`,
  su.`email`
FROM `stays_users` su
INNER JOIN `users` u ON u.`service` = 'stays' AND u.`email` COLLATE utf8mb4_unicode_ci = su.`email` COLLATE utf8mb4_unicode_ci
ON DUPLICATE KEY UPDATE `new_user_id` = VALUES(`new_user_id`);

