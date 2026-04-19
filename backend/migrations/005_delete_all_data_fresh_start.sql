-- ============================================
-- DELETE ALL DATA - FRESH START
-- ============================================
-- This script deletes ALL data from the database
-- and prepares it for a fresh start with unified users
-- 
-- WARNING: This will permanently delete ALL data!
-- EXCEPT: users and admin_profiles tables (preserved)
-- ============================================

USE travoozapp_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS delete_all_if_exists;
DELIMITER $$
CREATE PROCEDURE delete_all_if_exists(IN table_name_param VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = table_name_param
    ) THEN
        SET @sql = CONCAT('DELETE FROM `', REPLACE(table_name_param, '`', '``'), '` WHERE 1=1');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- ============================================
-- 1. DELETE SERVICE PROFILES (except admin_profiles)
-- ============================================

-- Delete service profiles first (they reference users)
-- NOTE: admin_profiles and users are PRESERVED
DELETE FROM `stay_profiles` WHERE 1=1;
DELETE FROM `tour_profiles` WHERE 1=1;
DELETE FROM `car_rental_profiles` WHERE 1=1;
DELETE FROM `restaurant_profiles` WHERE 1=1;

-- ============================================
-- 2. DELETE SERVICE-SPECIFIC DATA
-- ============================================

-- STAYS SERVICE
-- Delete stays-related data in dependency order (child tables first)
DELETE FROM `stays_bookings` WHERE 1=1;
DELETE FROM `stays_room_rate_plans` WHERE 1=1;
DELETE FROM `stays_room_images` WHERE 1=1;
DELETE FROM `stays_room_beds` WHERE 1=1;
DELETE FROM `stays_room_amenities` WHERE 1=1;
DELETE FROM `stays_rooms` WHERE 1=1;
DELETE FROM `stays_property_promotions` WHERE 1=1;
DELETE FROM `stays_property_tax_details` WHERE 1=1;
DELETE FROM `stays_property_connectivity` WHERE 1=1;
DELETE FROM `stays_property_images` WHERE 1=1;
DELETE FROM `stays_property_amenities` WHERE 1=1;
DELETE FROM `stays_property_policies` WHERE 1=1;
DELETE FROM `stays_onboarding_progress_track` WHERE 1=1;
DELETE FROM `stays_email_verifications` WHERE 1=1;
DELETE FROM `stays_properties` WHERE 1=1;

-- TOURS SERVICE
-- Delete tours-related data in dependency order (child tables first)
DELETE FROM `tours_booking_addons` WHERE 1=1;
DELETE FROM `tours_booking_participants` WHERE 1=1;
DELETE FROM `tours_bookings` WHERE 1=1;
DELETE FROM `tours_review_images` WHERE 1=1;
DELETE FROM `tours_reviews` WHERE 1=1;
DELETE FROM `tours_package_exception_time_slots` WHERE 1=1;
DELETE FROM `tours_package_exception_capacity` WHERE 1=1;
DELETE FROM `tours_package_schedule_exceptions` WHERE 1=1;
DELETE FROM `tours_package_weekly_schedule` WHERE 1=1;
DELETE FROM `tours_package_pricing_tiers` WHERE 1=1;
DELETE FROM `tours_package_pricing_categories` WHERE 1=1;
DELETE FROM `tours_package_capacity` WHERE 1=1;
DELETE FROM `tours_package_schedules` WHERE 1=1;
DELETE FROM `tours_package_addon_tiers` WHERE 1=1;
DELETE FROM `tours_package_addons` WHERE 1=1;
DELETE FROM `tours_package_photos` WHERE 1=1;
DELETE FROM `tours_package_guide_materials` WHERE 1=1;
DELETE FROM `tours_package_languages` WHERE 1=1;
DELETE FROM `tours_package_mandatory_items` WHERE 1=1;
DELETE FROM `tours_package_not_allowed` WHERE 1=1;
DELETE FROM `tours_package_not_suitable` WHERE 1=1;
DELETE FROM `tours_package_transportation_types` WHERE 1=1;
DELETE FROM `tours_package_dietary_restrictions` WHERE 1=1;
DELETE FROM `tours_package_meals` WHERE 1=1;
DELETE FROM `tours_package_tags` WHERE 1=1;
DELETE FROM `tours_package_locations` WHERE 1=1;
DELETE FROM `tours_package_highlights` WHERE 1=1;
DELETE FROM `tours_packages` WHERE 1=1;
DELETE FROM `tours_setup_submissions` WHERE 1=1;
DELETE FROM `tours_setup_progress` WHERE 1=1;
DELETE FROM `tours_business_proof` WHERE 1=1;
DELETE FROM `tours_identity_proof` WHERE 1=1;
DELETE FROM `tours_business_owner_info` WHERE 1=1;
DELETE FROM `tours_email_verifications` WHERE 1=1;
DELETE FROM `tours_global_commission` WHERE 1=1;
DELETE FROM `tours_businesses` WHERE 1=1;

-- RESTAURANT SERVICE
-- Delete restaurant-related data in dependency order (child tables first)
DELETE FROM `restaurant_order_items` WHERE 1=1;
DELETE FROM `restaurant_orders` WHERE 1=1;
DELETE FROM `restaurant_table_bookings` WHERE 1=1;
DELETE FROM `restaurant_schedule_exceptions` WHERE 1=1;
DELETE FROM `restaurant_schedules` WHERE 1=1;
DELETE FROM `restaurant_tax_legal` WHERE 1=1;
DELETE FROM `restaurant_documents` WHERE 1=1;
DELETE FROM `restaurant_setup_progress` WHERE 1=1;
DELETE FROM `restaurant_onboarding_progress_track` WHERE 1=1;
DELETE FROM `restaurant_email_verifications` WHERE 1=1;
DELETE FROM `restaurants` WHERE 1=1;

-- CAR RENTAL SERVICE
-- Delete car rental-related data in dependency order (child tables first)
DELETE FROM `car_rental_bookings` WHERE 1=1;
DELETE FROM `car_rental_listings` WHERE 1=1;
DELETE FROM `car_rental_setup_submissions` WHERE 1=1;
DELETE FROM `car_rental_setup_progress` WHERE 1=1;
DELETE FROM `car_rental_tax_info` WHERE 1=1;
DELETE FROM `car_rental_onboarding_progress_track` WHERE 1=1;
DELETE FROM `car_rental_email_verifications` WHERE 1=1;
DELETE FROM `car_rental_businesses` WHERE 1=1;
DELETE FROM `car_images` WHERE 1=1;
DELETE FROM `cars` WHERE 1=1;

-- OLD/LEGACY TABLES (if they exist)
CALL delete_all_if_exists('travooz_user');
CALL delete_all_if_exists('bookings');
CALL delete_all_if_exists('clients');
CALL delete_all_if_exists('delivery_persons');
CALL delete_all_if_exists('drivers');
CALL delete_all_if_exists('floors');
CALL delete_all_if_exists('images');
CALL delete_all_if_exists('menu_categories');
CALL delete_all_if_exists('menu_item_addons');
CALL delete_all_if_exists('menu_item_customizations');
CALL delete_all_if_exists('menu_items');
CALL delete_all_if_exists('order_items');
CALL delete_all_if_exists('orders');
CALL delete_all_if_exists('payment_transactions');
CALL delete_all_if_exists('profiles');
CALL delete_all_if_exists('tour_package_images');

-- ============================================
-- 3. RESET AUTO-INCREMENT COUNTERS
-- ============================================

-- NOTE: users and admin_profiles auto-increment are NOT reset (data preserved)

-- Service profiles (empty now)
ALTER TABLE `stay_profiles` AUTO_INCREMENT = 1;
ALTER TABLE `tour_profiles` AUTO_INCREMENT = 1;
ALTER TABLE `car_rental_profiles` AUTO_INCREMENT = 1;
ALTER TABLE `restaurant_profiles` AUTO_INCREMENT = 1;

-- Stays
ALTER TABLE `stays_properties` AUTO_INCREMENT = 1;
ALTER TABLE `stays_rooms` AUTO_INCREMENT = 1;
ALTER TABLE `stays_bookings` AUTO_INCREMENT = 1;

-- Tours
ALTER TABLE `tours_businesses` AUTO_INCREMENT = 1;
ALTER TABLE `tours_packages` AUTO_INCREMENT = 1;
ALTER TABLE `tours_setup_submissions` AUTO_INCREMENT = 1;

-- Restaurant
ALTER TABLE `restaurants` AUTO_INCREMENT = 1;

-- Car Rental
ALTER TABLE `car_rental_businesses` AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
DROP PROCEDURE IF EXISTS delete_all_if_exists;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'All data has been deleted successfully!' AS message;
SELECT 'Database is now ready for fresh start' AS status;

-- Show table counts (should all be 0 except users and admin_profiles)
SELECT 
    'users' as table_name, COUNT(*) as record_count, 'PRESERVED' as status FROM users
UNION ALL
SELECT 'admin_profiles', COUNT(*), 'PRESERVED' FROM admin_profiles
UNION ALL
SELECT 'stay_profiles', COUNT(*), 'DELETED' FROM stay_profiles
UNION ALL
SELECT 'tour_profiles', COUNT(*), 'DELETED' FROM tour_profiles
UNION ALL
SELECT 'car_rental_profiles', COUNT(*), 'DELETED' FROM car_rental_profiles
UNION ALL
SELECT 'restaurant_profiles', COUNT(*), 'DELETED' FROM restaurant_profiles
UNION ALL
SELECT 'stays_properties', COUNT(*), 'DELETED' FROM stays_properties
UNION ALL
SELECT 'tours_businesses', COUNT(*), 'DELETED' FROM tours_businesses
UNION ALL
SELECT 'restaurants', COUNT(*), 'DELETED' FROM restaurants
UNION ALL
SELECT 'car_rental_businesses', COUNT(*), 'DELETED' FROM car_rental_businesses
UNION ALL
SELECT 'bookings', COUNT(*), 'DELETED' FROM bookings;
