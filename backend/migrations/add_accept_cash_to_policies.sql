-- Migration: Add accept_cash column to stays_property_policies table if it doesn't exist
-- Description: Adds the accept_cash column that was missing from the database
-- Date: 2025-01-XX

-- Check if column exists and add it if it doesn't (works on all MySQL versions)
SET @dbname = DATABASE();
SET @tablename = "stays_property_policies";
SET @columnname = "accept_cash";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column accept_cash already exists.' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " tinyint(1) DEFAULT '0' AFTER languages;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

