-- Create travooz_user table for admin and travooz platform users
CREATE TABLE IF NOT EXISTS `travooz_user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role` enum('admin','super_admin','support') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - CHANGE THIS IN PRODUCTION!)
-- Password hash for 'admin123' using bcrypt with 10 rounds
INSERT INTO `travooz_user` (`role`, `name`, `email`, `phone`, `password_hash`, `is_active`) 
VALUES ('super_admin', 'Travooz Admin', 'admin@travooz.com', NULL, '$2a$10$UEKdZFWJ5ifbR78sWspNtuc9k8/xrhpOMkBKow0lfOZxBmNTS5uUm', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

