-- ============================================
-- Restaurant Setup Progress Table
-- ============================================
-- This table tracks the progress of restaurant setup flow
-- Created after Step 3 (Account Creation + Email Verification)
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_setup_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    -- Step completion flags (Steps 1-3 are completed together after account creation)
    step_1_3_complete TINYINT(1) DEFAULT '0', -- Location + Basic Info + Account Creation + Email Verification
    step_4_complete TINYINT(1) DEFAULT '0', -- Business Details
    step_5_complete TINYINT(1) DEFAULT '0', -- Media
    step_6_complete TINYINT(1) DEFAULT '0', -- Payments & Pricing
    step_7_complete TINYINT(1) DEFAULT '0', -- Capacity
    step_8_complete TINYINT(1) DEFAULT '0', -- Tax & Legal
    step_9_complete TINYINT(1) DEFAULT '0', -- Menu
    step_10_complete TINYINT(1) DEFAULT '0', -- Review
    step_11_complete TINYINT(1) DEFAULT '0', -- Agreement
    current_step INT DEFAULT 4, -- Start at step 4 (Business Details) after Step 1-3
    last_updated_step INT DEFAULT NULL,
    -- Store step data as JSON for restoration
    step_data JSON DEFAULT NULL, -- Stores all form data for each step
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_current_step (current_step),
    UNIQUE KEY unique_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

