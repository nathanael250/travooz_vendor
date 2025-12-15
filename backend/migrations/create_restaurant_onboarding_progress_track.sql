-- Create table to track restaurant vendor onboarding progress
-- This tracks progress after the first 3 steps (address, basic info, create account) are complete

CREATE TABLE IF NOT EXISTS `restaurant_onboarding_progress_track` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) DEFAULT NULL,
  `current_step` varchar(100) NOT NULL DEFAULT 'business-details',
  `step_name` varchar(255) NOT NULL DEFAULT 'Business Details',
  `step_number` int NOT NULL DEFAULT 4,
  `is_complete` tinyint(1) DEFAULT 0,
  `completed_steps` JSON DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_progress` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_restaurant_id` (`restaurant_id`),
  KEY `idx_current_step` (`current_step`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step mapping reference:
-- Step 1: Address/Location (ListYourRestaurant) - Not tracked
-- Step 2: Basic Info (ListYourRestaurantStep2) - Not tracked
-- Step 3: Create Account (ListYourRestaurantStep3) - Not tracked
-- Step 4: Business Details (BusinessDetailsStep) - Tracked from here
-- Step 5: Media (MediaStep)
-- Step 6: Payments & Pricing (PaymentsPricingStep)
-- Step 7: Capacity (CapacityStep)
-- Step 8: Tax & Legal (TaxLegalStep)
-- Step 9: Menu Setup (MenuSetupStep)
-- Step 10: Review (ReviewRestaurantStep)
-- Step 11: Agreement (AgreementStep)
-- Step 12: Setup Complete (SetupComplete)

