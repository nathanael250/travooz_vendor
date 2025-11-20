

SET @user_id = 2; -- REPLACE WITH ACTUAL USER_ID


SELECT 
    'stays_users' as table_name,
    COUNT(*) as record_count
FROM stays_users 
WHERE user_id = @user_id

UNION ALL

SELECT 
    'stays_properties' as table_name,
    COUNT(*) as record_count
FROM stays_properties 
WHERE user_id = @user_id

UNION ALL

SELECT 
    'stays_property_images' as table_name,
    COUNT(*) as record_count
FROM stays_property_images spi
INNER JOIN stays_properties sp ON spi.property_id = sp.property_id
WHERE sp.user_id = @user_id

UNION ALL

SELECT 
    'stays_rooms' as table_name,
    COUNT(*) as record_count
FROM stays_rooms sr
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id

UNION ALL

SELECT 
    'stays_room_images' as table_name,
    COUNT(*) as record_count
FROM stays_room_images sri
INNER JOIN stays_rooms sr ON sri.room_id = sr.room_id
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id

UNION ALL

SELECT 
    'stays_bookings' as table_name,
    COUNT(*) as record_count
FROM stays_bookings sb
INNER JOIN stays_properties sp ON sb.property_id = sp.property_id
WHERE sp.user_id = @user_id

UNION ALL

SELECT 
    'stays_email_verifications' as table_name,
    COUNT(*) as record_count
FROM stays_email_verifications
WHERE user_id = @user_id;

-- =====================================================
-- DELETION QUERIES (Execute in order)
-- =====================================================

-- Step 1: Delete room-related data (child tables of stays_rooms)
DELETE sri FROM stays_room_images sri
INNER JOIN stays_rooms sr ON sri.room_id = sr.room_id
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE sra FROM stays_room_amenities sra
INNER JOIN stays_rooms sr ON sra.room_id = sr.room_id
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE srb FROM stays_room_beds srb
INNER JOIN stays_rooms sr ON srb.room_id = sr.room_id
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE srrp FROM stays_room_rate_plans srrp
INNER JOIN stays_rooms sr ON srrp.room_id = sr.room_id
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id;

-- Step 2: Delete rooms
DELETE sr FROM stays_rooms sr
INNER JOIN stays_properties sp ON sr.property_id = sp.property_id
WHERE sp.user_id = @user_id;

-- Step 3: Delete property-related data (child tables of stays_properties)
DELETE spi FROM stays_property_images spi
INNER JOIN stays_properties sp ON spi.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE spa FROM stays_property_amenities spa
INNER JOIN stays_properties sp ON spa.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE spc FROM stays_property_connectivity spc
INNER JOIN stays_properties sp ON spc.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE spp FROM stays_property_policies spp
INNER JOIN stays_properties sp ON spp.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE spp FROM stays_property_promotions spp
INNER JOIN stays_properties sp ON spp.property_id = sp.property_id
WHERE sp.user_id = @user_id;

DELETE sptd FROM stays_property_tax_details sptd
INNER JOIN stays_properties sp ON sptd.property_id = sp.property_id
WHERE sp.user_id = @user_id;

-- Step 4: Delete bookings (if any exist)
DELETE sb FROM stays_bookings sb
INNER JOIN stays_properties sp ON sb.property_id = sp.property_id
WHERE sp.user_id = @user_id;

-- Step 5: Delete properties
DELETE FROM stays_properties WHERE user_id = @user_id;

-- Step 6: Delete email verifications
DELETE FROM stays_email_verifications WHERE user_id = @user_id;

-- Step 7: Delete user account (LAST - after all related data is deleted)
DELETE FROM stays_users WHERE user_id = @user_id;

-- =====================================================
-- VERIFICATION: Confirm deletion
-- =====================================================
-- Run this after deletion to confirm everything is deleted:

SELECT 
    'stays_users' as table_name,
    COUNT(*) as remaining_records
FROM stays_users 
WHERE user_id = @user_id

UNION ALL

SELECT 
    'stays_properties' as table_name,
    COUNT(*) as remaining_records
FROM stays_properties 
WHERE user_id = @user_id;

-- Should return 0 for both if deletion was successful

-- =====================================================
-- ALTERNATIVE: Delete by EMAIL (Complete Script)
-- =====================================================
-- If you prefer to delete by email, use this version:

/*
-- Set the email
SET @user_email = 'user@example.com';

-- Get user_id from email
SET @user_id = (SELECT user_id FROM stays_users WHERE email = @user_email);

-- Check if user exists
SELECT 
    CASE 
        WHEN @user_id IS NULL THEN 'User not found!'
        ELSE CONCAT('User found with ID: ', @user_id)
    END as status;

-- If user exists, proceed with deletion using the queries above
-- (All the DELETE queries will work with @user_id set from email)
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This script deletes in the correct order to respect foreign key constraints
-- 2. If foreign keys have ON DELETE CASCADE, some deletions may happen automatically
-- 3. Always run the verification query first to see what will be deleted
-- 4. Consider backing up data before running deletion queries
-- 5. This does NOT delete from the main users table (if stays_users is separate)
--    You may need to delete from the main users table separately if needed
-- =====================================================

