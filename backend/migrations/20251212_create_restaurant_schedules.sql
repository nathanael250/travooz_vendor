-- Migration: create restaurant schedule tables
-- Adds per-weekday schedule and date-specific exceptions

CREATE TABLE IF NOT EXISTS restaurant_schedules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Sunday .. 6=Saturday',
  opens TIME DEFAULT NULL,
  closes TIME DEFAULT NULL,
  is_closed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurant_day (restaurant_id, day_of_week),
  INDEX idx_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_schedule_exceptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  opens TIME DEFAULT NULL,
  closes TIME DEFAULT NULL,
  is_closed TINYINT(1) DEFAULT 0,
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_restaurant_date (restaurant_id, `date`),
  INDEX idx_restaurant_exception (restaurant_id, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
