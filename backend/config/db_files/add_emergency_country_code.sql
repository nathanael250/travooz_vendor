-- Migration: Add emergency_country_code column to tours_packages table
-- Run this SQL script to add the missing column

ALTER TABLE tours_packages 
ADD COLUMN emergency_country_code VARCHAR(10) DEFAULT NULL 
AFTER emergency_contact;

-- Verify the column was added
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'tours_packages' AND COLUMN_NAME = 'emergency_country_code';

