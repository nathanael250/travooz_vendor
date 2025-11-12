-- Delete all tour package data
-- Run this script to delete all tour package related data and start fresh
-- WARNING: This will permanently delete all tour package data!

-- Delete in reverse order of dependencies (child tables first, then parent tables)

-- Step 5: Schedules and Pricing related data
DELETE FROM tours_package_exception_time_slots;
DELETE FROM tours_package_exception_capacity;
DELETE FROM tours_package_schedule_exceptions;
DELETE FROM tours_package_weekly_schedule;
DELETE FROM tours_package_pricing_tiers;
DELETE FROM tours_package_pricing_categories;
DELETE FROM tours_package_capacity;
DELETE FROM tours_package_schedules;

-- Step 5: Add-ons
DELETE FROM tours_package_addon_tiers;
DELETE FROM tours_package_addons;

-- Step 4: Photos
DELETE FROM tours_package_photos;

-- Step 5: Languages and Guide Materials
DELETE FROM tours_package_guide_materials;
DELETE FROM tours_package_languages;

-- Step 3: Extra Information
DELETE FROM tours_package_mandatory_items;
DELETE FROM tours_package_not_allowed;
DELETE FROM tours_package_not_suitable;

-- Step 2: Inclusions
DELETE FROM tours_package_transportation_types;
DELETE FROM tours_package_dietary_restrictions;
DELETE FROM tours_package_meals;

-- Step 1: Basic Information
DELETE FROM tours_package_tags;
DELETE FROM tours_package_locations;
DELETE FROM tours_package_highlights;

-- Finally, delete the main packages
DELETE FROM tours_packages;

-- Verify deletion (should return 0 for all)
SELECT 
    'tours_packages' as table_name, COUNT(*) as remaining_records FROM tours_packages
UNION ALL
SELECT 'tours_package_highlights', COUNT(*) FROM tours_package_highlights
UNION ALL
SELECT 'tours_package_locations', COUNT(*) FROM tours_package_locations
UNION ALL
SELECT 'tours_package_tags', COUNT(*) FROM tours_package_tags
UNION ALL
SELECT 'tours_package_meals', COUNT(*) FROM tours_package_meals
UNION ALL
SELECT 'tours_package_dietary_restrictions', COUNT(*) FROM tours_package_dietary_restrictions
UNION ALL
SELECT 'tours_package_mandatory_items', COUNT(*) FROM tours_package_mandatory_items
UNION ALL
SELECT 'tours_package_schedules', COUNT(*) FROM tours_package_schedules;

