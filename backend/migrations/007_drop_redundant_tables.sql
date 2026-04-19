-- ============================================
-- DROP REDUNDANT TABLES
-- ============================================
-- This script drops tables that are confirmed to be redundant
-- and not being used by the current system
-- 
-- WARNING: This will permanently delete these tables!
-- Review the analysis first: 006_identify_redundant_tables.sql
-- ============================================

USE travoozapp_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- REDUNDANT USER/PROFILE TABLES
-- ============================================
-- These are replaced by unified users + service_profiles
DROP TABLE IF EXISTS `profiles`;

-- ============================================
-- MENU TABLES - KEEP THESE!
-- ============================================
-- DO NOT DROP - These tables are actively being used!
-- menu_categories - Used by menuItems.routes.js, restaurant.routes.js
-- menu_items - Used extensively throughout the codebase
-- menu_item_addons - Used by restaurant.routes.js
-- menu_item_customizations - Used by restaurant.routes.js
-- DROP TABLE IF EXISTS `menu_item_customizations`;  -- KEEP - IN USE
-- DROP TABLE IF EXISTS `menu_item_addons`;  -- KEEP - IN USE
-- DROP TABLE IF EXISTS `menu_items`;  -- KEEP - IN USE
-- DROP TABLE IF EXISTS `menu_categories`;  -- KEEP - IN USE

-- ============================================
-- ORDER TABLES - CHECK BEFORE DROPPING
-- ============================================
-- These have references in codebase (9 files found)
-- Review if these are old or new references before dropping
-- DROP TABLE IF EXISTS `order_items`;  -- KEEP - Has references
-- DROP TABLE IF EXISTS `orders`;  -- KEEP - Has references

-- ============================================
-- REDUNDANT CAR TABLES (OLD STRUCTURE)
-- ============================================
-- These might be replaced by car_rental_* tables
-- NOTE: These have data! Review before dropping:
--   cars: 4 records
--   car_images: 9 records
-- Uncomment these lines after reviewing the data:
-- DROP TABLE IF EXISTS `car_images`;  -- Has foreign key to cars
-- DROP TABLE IF EXISTS `cars`;

-- ============================================
-- UNUSED TABLES
-- ============================================
-- These tables are empty or not being used
DROP TABLE IF EXISTS `delivery_persons`;
DROP TABLE IF EXISTS `floors`;

-- These have data - review before dropping:
--   clients: 1 record
--   drivers: 2 records
-- Uncomment after reviewing:
-- DROP TABLE IF EXISTS `clients`;
-- DROP TABLE IF EXISTS `drivers`;

-- ============================================
-- GENERIC/CHECK TABLES
-- ============================================
-- tour_package_images - 0 records, replaced by tours_package_photos
DROP TABLE IF EXISTS `tour_package_images`;

-- Generic images table - 76 records, check if still used
-- Generic bookings table - 35 records, check if still used
-- payment_transactions - 10 records, might be used for payments
-- Uncomment after reviewing codebase usage:
-- DROP TABLE IF EXISTS `images`;
-- DROP TABLE IF EXISTS `bookings`;
-- DROP TABLE IF EXISTS `payment_transactions`;

-- ============================================
-- TABLES TO KEEP
-- ============================================
-- travooz_user - KEEP (used for admin authentication)
-- payment_transactions - KEEP (might be used for payment processing)

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Redundant tables have been dropped successfully!' AS message;
SELECT 'Review any commented-out tables before dropping them' AS note;

