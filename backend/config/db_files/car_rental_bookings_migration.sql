-- ============================================
-- Car Rental Bookings Table Migration
-- ============================================
-- This migration updates the car_rental_bookings table to:
-- 1. Remove driver_id and driver license related fields
-- 2. Add driver_option field (self-drive or with-driver)
-- 3. Add pickup_time and return_time fields
-- 4. Change customer fields structure
-- 5. Change dropoff_date to return_date
-- ============================================

-- Step 1: Add new columns if they don't exist
ALTER TABLE car_rental_bookings 
ADD COLUMN IF NOT EXISTS pickup_time TIME NULL AFTER pickup_date,
ADD COLUMN IF NOT EXISTS return_time TIME NULL AFTER return_date,
ADD COLUMN IF NOT EXISTS driver_option ENUM('self-drive', 'with-driver') DEFAULT 'self-drive' AFTER dropoff_location;

-- Step 2: Rename dropoff_date to return_date if it exists and return_date doesn't
SET @dbname = DATABASE();
SET @tablename = 'car_rental_bookings';
SET @has_return_date = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'return_date'
);
SET @has_dropoff_date = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'dropoff_date'
);

SET @preparedStatement = (SELECT IF(
    @has_return_date = 0 AND @has_dropoff_date > 0,
    CONCAT('ALTER TABLE ', @tablename, ' CHANGE COLUMN dropoff_date return_date DATE NOT NULL'),
    'SELECT 1'
));
PREPARE alterIfNeeded FROM @preparedStatement;
EXECUTE alterIfNeeded;
DEALLOCATE PREPARE alterIfNeeded;

-- Step 3: Change pickup_date from DATETIME to DATE if needed
-- (Keep as DATE, time will be in separate pickup_time column)

-- Step 4: Rename customer_name to customer_first_name if needed
SET @has_customer_first_name = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'customer_first_name'
);
SET @has_customer_name = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'customer_name'
);

SET @preparedStatement = (SELECT IF(
    @has_customer_first_name = 0 AND @has_customer_name > 0,
    CONCAT('ALTER TABLE ', @tablename, ' CHANGE COLUMN customer_name customer_first_name VARCHAR(255) NOT NULL'),
    'SELECT 1'
));
PREPARE alterIfNeeded2 FROM @preparedStatement;
EXECUTE alterIfNeeded2;
DEALLOCATE PREPARE alterIfNeeded2;

-- Step 5: Change car_id to VARCHAR if it's currently INT
-- (This allows for string IDs like "CAR-000123")
SET @preparedStatement = (SELECT IF(
    (
        SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = 'car_id'
    ) = 'int',
    CONCAT('ALTER TABLE ', @tablename, ' MODIFY COLUMN car_id VARCHAR(50) NOT NULL'),
    'SELECT 1'
));
PREPARE alterIfNeeded3 FROM @preparedStatement;
EXECUTE alterIfNeeded3;
DEALLOCATE PREPARE alterIfNeeded3;

-- Step 6: Remove driver_id column and its index if they exist
SET @has_driver_id = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'driver_id'
);

SET @preparedStatement = (SELECT IF(
    @has_driver_id > 0,
    CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN driver_id, DROP INDEX IF EXISTS idx_driver_id'),
    'SELECT 1'
));
PREPARE alterIfNeeded4 FROM @preparedStatement;
EXECUTE alterIfNeeded4;
DEALLOCATE PREPARE alterIfNeeded4;

-- Step 7: Update existing records to set default values
UPDATE car_rental_bookings 
SET driver_option = 'self-drive' 
WHERE driver_option IS NULL;

-- Step 8: Set pickup_time and return_time defaults if NULL
-- (You may want to set these based on existing pickup_date/dropoff_date times)
UPDATE car_rental_bookings 
SET pickup_time = '09:00:00' 
WHERE pickup_time IS NULL AND pickup_date IS NOT NULL;

UPDATE car_rental_bookings 
SET return_time = '17:00:00' 
WHERE return_time IS NULL AND return_date IS NOT NULL;

-- ============================================
-- Migration Complete
-- ============================================
SELECT 'Car rental bookings table migration completed successfully!' AS message;








