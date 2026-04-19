-- Cleanup Script: Remove Unified Users Tables
-- Description: Drops all unified users tables to start fresh
-- Date: 2025-01-XX
-- 
-- WARNING: This will delete all data in unified users tables!
-- Only run this if you want to start completely fresh.

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Drop tables in reverse order (respecting foreign keys)
-- ============================================

-- Drop admin profiles first because it references users
DROP TABLE IF EXISTS `admin_profiles`;

-- Drop user_id_mapping table first (no foreign keys)
DROP TABLE IF EXISTS `user_id_mapping`;

-- Drop service profile tables (they reference users table)
DROP TABLE IF EXISTS `stay_profiles`;
DROP TABLE IF EXISTS `tour_profiles`;
DROP TABLE IF EXISTS `car_rental_profiles`;
DROP TABLE IF EXISTS `restaurant_profiles`;

-- Drop unified users table last
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Verification
-- ============================================
-- After running this, you can verify with:
-- SHOW TABLES LIKE '%users%';
-- SHOW TABLES LIKE '%profiles%';




