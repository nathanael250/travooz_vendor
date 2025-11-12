-- ============================================
-- DELETE ALL TOUR PACKAGE DATA
-- ============================================
-- This script deletes all data from tour-related tables
-- Run this to start fresh with tour package setup
-- ============================================

USE travoozapp_db;

-- Disable foreign key checks temporarily to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Delete from child tables first (tables with foreign keys)
DELETE FROM tours_setup_submissions;
DELETE FROM tours_setup_progress;
DELETE FROM tours_business_proof;
DELETE FROM tours_identity_proof;
DELETE FROM tours_business_owner_info;
DELETE FROM tours_email_verifications;

-- Delete from main business table
DELETE FROM tours_businesses;

-- Delete from users table (only tour users)
DELETE FROM tours_users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters (optional - uncomment if you want to reset IDs)
-- ALTER TABLE tours_users AUTO_INCREMENT = 1;
-- ALTER TABLE tours_businesses AUTO_INCREMENT = 1;
-- ALTER TABLE tours_email_verifications AUTO_INCREMENT = 1;
-- ALTER TABLE tours_business_owner_info AUTO_INCREMENT = 1;
-- ALTER TABLE tours_identity_proof AUTO_INCREMENT = 1;
-- ALTER TABLE tours_business_proof AUTO_INCREMENT = 1;
-- ALTER TABLE tours_setup_progress AUTO_INCREMENT = 1;
-- ALTER TABLE tours_setup_submissions AUTO_INCREMENT = 1;

SELECT 'All tour package data has been deleted successfully!' AS message;

