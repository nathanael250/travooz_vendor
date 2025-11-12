-- ============================================
-- DROP TOUR PACKAGES TABLES
-- Drop in correct order (child tables first, then parent tables)
-- ============================================
-- IMPORTANT: This will delete ALL tour package data!
-- Make sure you have backups if needed
-- ============================================

-- Drop child tables first (those with foreign keys)

-- Add-on related tables
DROP TABLE IF EXISTS tours_package_addon_tiers;
DROP TABLE IF EXISTS tours_package_addons;

-- Pricing related tables
DROP TABLE IF EXISTS tours_package_pricing_tiers;
DROP TABLE IF EXISTS tours_package_pricing_categories;

-- Capacity related tables
DROP TABLE IF EXISTS tours_package_exception_capacity;
DROP TABLE IF EXISTS tours_package_capacity;

-- Schedule related tables
DROP TABLE IF EXISTS tours_package_exception_time_slots;
DROP TABLE IF EXISTS tours_package_schedule_exceptions;
DROP TABLE IF EXISTS tours_package_weekly_schedule;
DROP TABLE IF EXISTS tours_package_schedules;

-- Package detail tables
DROP TABLE IF EXISTS tours_package_photos;
DROP TABLE IF EXISTS tours_package_guide_materials;
DROP TABLE IF EXISTS tours_package_languages;
DROP TABLE IF EXISTS tours_package_transportation_types;
DROP TABLE IF EXISTS tours_package_mandatory_items;
DROP TABLE IF EXISTS tours_package_not_allowed;
DROP TABLE IF EXISTS tours_package_not_suitable;
DROP TABLE IF EXISTS tours_package_dietary_restrictions;
DROP TABLE IF EXISTS tours_package_meals;
DROP TABLE IF EXISTS tours_package_tags;
DROP TABLE IF EXISTS tours_package_locations;
DROP TABLE IF EXISTS tours_package_highlights;

-- Main package table (drop last)
DROP TABLE IF EXISTS tours_packages;

-- ============================================
-- Verification: Check remaining tour tables
-- ============================================
-- Run this to see remaining tour-related tables:
-- SHOW TABLES LIKE 'tours_%';
-- ============================================

