-- Migration: Migrate Admin Users from travooz_user to Unified Users Table
-- Description: Migrates admin users from travooz_user table to unified users table with admin_profiles
-- Date: 2025-01-XX
-- 
-- IMPORTANT: 
-- 1. Run this AFTER creating the unified users table and admin_profiles table
-- 2. Backup your database before running this migration
-- 3. This migration maps travooz_user roles (super_admin, support) to 'admin' role in users table

-- ============================================
-- STEP 1: Migrate Admin Users to users table
-- ============================================
INSERT INTO `users` (
  `service`, `email`, `password_hash`, `role`, 
  `is_active`, `email_verified`, `last_login`, 
  `created_at`, `updated_at`
)
SELECT 
  'admin' AS `service`,
  `email`,
  `password_hash`,
  'admin' AS `role`, -- Map all travooz_user roles (admin, super_admin, support) to 'admin'
  `is_active`,
  1 AS `email_verified`, -- Assume admin emails are verified
  `last_login`,
  `created_at`,
  `updated_at`
FROM `travooz_user`
WHERE NOT EXISTS (
  SELECT 1 FROM `users` u 
  WHERE u.service = 'admin' AND u.email COLLATE utf8mb4_unicode_ci = travooz_user.email COLLATE utf8mb4_unicode_ci
)
ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `last_login` = VALUES(`last_login`),
  `updated_at` = VALUES(`updated_at`);

-- ============================================
-- STEP 2: Create Admin Profiles
-- ============================================
INSERT INTO `admin_profiles` (
  `user_id`, `name`, `phone`, `phone_verified`,
  `created_at`, `updated_at`
)
SELECT 
  u.`id` AS `user_id`,
  tu.`name`,
  tu.`phone`,
  0 AS `phone_verified`, -- Default to not verified
  tu.`created_at`,
  tu.`updated_at`
FROM `travooz_user` tu
INNER JOIN `users` u ON u.`service` = 'admin' AND u.`email` COLLATE utf8mb4_unicode_ci = tu.`email` COLLATE utf8mb4_unicode_ci
WHERE NOT EXISTS (
  SELECT 1 FROM `admin_profiles` ap WHERE ap.`user_id` = u.`id`
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check migration success
SELECT 
  'travooz_user count' AS source, COUNT(*) AS count FROM travooz_user
UNION ALL
SELECT 'admin users in users table', COUNT(*) FROM users WHERE service = 'admin'
UNION ALL
SELECT 'admin_profiles count', COUNT(*) FROM admin_profiles;

-- Show migrated admin users
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_active,
  ap.name,
  ap.phone
FROM users u
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.service = 'admin';


