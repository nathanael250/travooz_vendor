-- Comprehensive verification script for tour packages data
-- This script checks all tour package related tables and shows what data exists

-- 1. Main packages table
SELECT '=== MAIN PACKAGES ===' as section;
SELECT 
    package_id,
    tour_business_id,
    name,
    category,
    status,
    created_at,
    updated_at
FROM tours_packages
ORDER BY package_id DESC
LIMIT 10;

-- 2. Step 1: Basic Informations
SELECT '=== STEP 1: BASIC INFORMATIONS ===' as section;

-- Highlights
SELECT 'Highlights' as table_name, COUNT(*) as count FROM tours_package_highlights;
SELECT package_id, highlight_text, display_order 
FROM tours_package_highlights 
ORDER BY package_id DESC, display_order 
LIMIT 10;

-- Locations
SELECT 'Locations' as table_name, COUNT(*) as count FROM tours_package_locations;
SELECT package_id, location_name, formatted_address, latitude, longitude
FROM tours_package_locations 
ORDER BY package_id DESC, display_order 
LIMIT 10;

-- Tags
SELECT 'Tags' as table_name, COUNT(*) as count FROM tours_package_tags;
SELECT package_id, tag_name, display_order 
FROM tours_package_tags 
ORDER BY package_id DESC, display_order 
LIMIT 10;

-- 3. Step 2: Inclusions
SELECT '=== STEP 2: INCLUSIONS ===' as section;

-- Meals
SELECT 'Meals' as table_name, COUNT(*) as count FROM tours_package_meals;
SELECT package_id, meal_type, meal_format, display_order 
FROM tours_package_meals 
ORDER BY package_id DESC, display_order 
LIMIT 10;

-- Dietary Restrictions
SELECT 'Dietary Restrictions' as table_name, COUNT(*) as count FROM tours_package_dietary_restrictions;
SELECT package_id, restriction_name 
FROM tours_package_dietary_restrictions 
ORDER BY package_id DESC 
LIMIT 10;

-- Transportation Types
SELECT 'Transportation Types' as table_name, COUNT(*) as count FROM tours_package_transportation_types;
SELECT package_id, transportation_type 
FROM tours_package_transportation_types 
ORDER BY package_id DESC 
LIMIT 10;

-- 4. Step 3: Extra Information
SELECT '=== STEP 3: EXTRA INFORMATION ===' as section;

-- Not Suitable For
SELECT 'Not Suitable For' as table_name, COUNT(*) as count FROM tours_package_not_suitable;
SELECT package_id, restriction_name 
FROM tours_package_not_suitable 
ORDER BY package_id DESC 
LIMIT 10;

-- Not Allowed
SELECT 'Not Allowed' as table_name, COUNT(*) as count FROM tours_package_not_allowed;
SELECT package_id, item_name 
FROM tours_package_not_allowed 
ORDER BY package_id DESC 
LIMIT 10;

-- Mandatory Items
SELECT 'Mandatory Items' as table_name, COUNT(*) as count FROM tours_package_mandatory_items;
SELECT package_id, item_name 
FROM tours_package_mandatory_items 
ORDER BY package_id DESC 
LIMIT 10;

-- Languages
SELECT 'Languages' as table_name, COUNT(*) as count FROM tours_package_languages;
SELECT package_id, language_name 
FROM tours_package_languages 
ORDER BY package_id DESC 
LIMIT 10;

-- Guide Materials
SELECT 'Guide Materials' as table_name, COUNT(*) as count FROM tours_package_guide_materials;
SELECT package_id, material_type, language_name 
FROM tours_package_guide_materials 
ORDER BY package_id DESC 
LIMIT 10;

-- 5. Step 4: Photos
SELECT '=== STEP 4: PHOTOS ===' as section;
SELECT 'Photos' as table_name, COUNT(*) as count FROM tours_package_photos;
SELECT package_id, photo_url, photo_name, is_primary, display_order 
FROM tours_package_photos 
ORDER BY package_id DESC, display_order 
LIMIT 10;

-- 6. Step 5: Options - Schedules
SELECT '=== STEP 5: SCHEDULES ===' as section;
SELECT 'Schedules' as table_name, COUNT(*) as count FROM tours_package_schedules;
SELECT package_id, schedule_id, schedule_name, start_date, has_end_date, end_date
FROM tours_package_schedules 
ORDER BY package_id DESC, schedule_id 
LIMIT 10;

-- Weekly Schedule
SELECT 'Weekly Schedule' as table_name, COUNT(*) as count FROM tours_package_weekly_schedule;
SELECT schedule_id, day_of_week, start_hour, start_minute, end_hour, end_minute
FROM tours_package_weekly_schedule 
ORDER BY schedule_id, day_of_week 
LIMIT 10;

-- Schedule Exceptions
SELECT 'Schedule Exceptions' as table_name, COUNT(*) as count FROM tours_package_schedule_exceptions;
SELECT exception_id, schedule_id, exception_date, is_available
FROM tours_package_schedule_exceptions 
ORDER BY schedule_id, exception_date 
LIMIT 10;

-- Exception Time Slots
SELECT 'Exception Time Slots' as table_name, COUNT(*) as count FROM tours_package_exception_time_slots;
SELECT exception_id, start_time, end_time
FROM tours_package_exception_time_slots 
ORDER BY exception_id 
LIMIT 10;

-- 7. Step 5: Pricing
SELECT '=== STEP 5: PRICING ===' as section;

-- Pricing Categories
SELECT 'Pricing Categories' as table_name, COUNT(*) as count FROM tours_package_pricing_categories;
SELECT category_id, package_id, category_name, min_participants, max_participants
FROM tours_package_pricing_categories 
ORDER BY package_id DESC, category_id 
LIMIT 10;

-- Pricing Tiers
SELECT 'Pricing Tiers' as table_name, COUNT(*) as count FROM tours_package_pricing_tiers;
SELECT tier_id, category_id, price_per_person, currency, valid_from, valid_to
FROM tours_package_pricing_tiers 
ORDER BY category_id, tier_id 
LIMIT 10;

-- Capacity
SELECT 'Capacity' as table_name, COUNT(*) as count FROM tours_package_capacity;
SELECT capacity_id, package_id, schedule_id, date, max_capacity, available_capacity
FROM tours_package_capacity 
ORDER BY package_id DESC, date 
LIMIT 10;

-- Exception Capacity
SELECT 'Exception Capacity' as table_name, COUNT(*) as count FROM tours_package_exception_capacity;
SELECT exception_id, capacity_id, max_capacity, available_capacity
FROM tours_package_exception_capacity 
ORDER BY exception_id 
LIMIT 10;

-- 8. Step 5: Add-ons
SELECT '=== STEP 5: ADD-ONS ===' as section;
SELECT 'Add-ons' as table_name, COUNT(*) as count FROM tours_package_addons;
SELECT addon_id, package_id, addon_name, addon_type, is_required
FROM tours_package_addons 
ORDER BY package_id DESC, addon_id 
LIMIT 10;

-- Add-on Tiers
SELECT 'Add-on Tiers' as table_name, COUNT(*) as count FROM tours_package_addon_tiers;
SELECT tier_id, addon_id, price, currency, description
FROM tours_package_addon_tiers 
ORDER BY addon_id, tier_id 
LIMIT 10;

-- 9. Summary by Package
SELECT '=== SUMMARY BY PACKAGE ===' as section;
SELECT 
    p.package_id,
    p.name,
    p.status,
    (SELECT COUNT(*) FROM tours_package_highlights WHERE package_id = p.package_id) as highlights_count,
    (SELECT COUNT(*) FROM tours_package_locations WHERE package_id = p.package_id) as locations_count,
    (SELECT COUNT(*) FROM tours_package_tags WHERE package_id = p.package_id) as tags_count,
    (SELECT COUNT(*) FROM tours_package_meals WHERE package_id = p.package_id) as meals_count,
    (SELECT COUNT(*) FROM tours_package_photos WHERE package_id = p.package_id) as photos_count,
    (SELECT COUNT(*) FROM tours_package_schedules WHERE package_id = p.package_id) as schedules_count,
    (SELECT COUNT(*) FROM tours_package_pricing_categories WHERE package_id = p.package_id) as pricing_categories_count,
    (SELECT COUNT(*) FROM tours_package_addons WHERE package_id = p.package_id) as addons_count
FROM tours_packages p
ORDER BY p.package_id DESC
LIMIT 10;

