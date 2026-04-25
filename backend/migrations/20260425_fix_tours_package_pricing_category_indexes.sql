-- Allow multiple pricing category rows per schedule for age-based pricing.
-- The existing unique constraint on schedule_id prevents storing Adult/Child/Senior rows.

SET @db := DATABASE();

SET @unique_index_name := (
  SELECT INDEX_NAME
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'schedule_id'
    AND NON_UNIQUE = 0
    AND INDEX_NAME <> 'PRIMARY'
  LIMIT 1
);

SET @sql := IF(
  @unique_index_name IS NOT NULL,
  CONCAT('ALTER TABLE tours_package_pricing_categories DROP INDEX ', @unique_index_name),
  'SELECT "No unique schedule_id index to drop"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @non_unique_index_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND INDEX_NAME = 'idx_pricing_categories_schedule_id'
);

SET @sql := IF(
  @non_unique_index_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD INDEX idx_pricing_categories_schedule_id (schedule_id)',
  'SELECT "idx_pricing_categories_schedule_id already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
