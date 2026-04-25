-- Add age-based pricing support to tours_package_pricing_categories
-- This makes age-band pricing persist reliably instead of depending on runtime ALTERs.

SET @db := DATABASE();

SET @participant_label_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'participant_label'
);
SET @sql := IF(
  @participant_label_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD COLUMN participant_label VARCHAR(100) NULL AFTER category_type',
  'SELECT "participant_label already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @min_age_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'min_age'
);
SET @sql := IF(
  @min_age_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD COLUMN min_age INT NULL AFTER participant_label',
  'SELECT "min_age already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @max_age_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'max_age'
);
SET @sql := IF(
  @max_age_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD COLUMN max_age INT NULL AFTER min_age',
  'SELECT "max_age already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @customer_pays_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'customer_pays'
);
SET @sql := IF(
  @customer_pays_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD COLUMN customer_pays DECIMAL(10,2) NULL AFTER max_age',
  'SELECT "customer_pays already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @display_order_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'tours_package_pricing_categories'
    AND COLUMN_NAME = 'display_order'
);
SET @sql := IF(
  @display_order_exists = 0,
  'ALTER TABLE tours_package_pricing_categories ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER customer_pays',
  'SELECT "display_order already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
