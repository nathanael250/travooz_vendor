-- Create table to track stays vendor onboarding progress
-- This tracks progress after the first 3 steps (address, basic info, create account) are complete

CREATE TABLE IF NOT EXISTS `stays_onboarding_progress_track` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `property_id` varchar(36) DEFAULT NULL,
  `current_step` varchar(100) NOT NULL DEFAULT 'policies',
  `step_name` varchar(255) NOT NULL DEFAULT 'Policies & Settings',
  `step_number` int NOT NULL DEFAULT 4,
  `is_complete` tinyint(1) DEFAULT 0,
  `completed_steps` JSON DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_progress` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_property_id` (`property_id`),
  KEY `idx_current_step` (`current_step`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step mapping reference:
-- Step 1: Address/Location (ListYourProperty) - Not tracked
-- Step 2: Basic Info (ListYourPropertyStep2) - Not tracked
-- Step 3: Create Account (ListYourPropertyStep3) - Not tracked
-- Step 4: Policies & Settings (PoliciesAndSettingsStep) - Tracked from here
-- Step 5: Property Amenities (PropertyAmenitiesStep)
-- Step 6: Rooms & Rates (RoomsAndRatesStep / SetUpRoomStep)
-- Step 7: Images (ImageManagementStep)
-- Step 8: Taxes (TaxesStep)
-- Step 9: Connectivity Settings (ConnectivitySettingsStep)
-- Step 10: Review Listing (ReviewListingStep)
-- Step 11: Submit Listing (SubmitListingStep)
-- Step 12: Setup Complete (SetupComplete)

