-- Update default values for stays_onboarding_progress_track table
-- Change from 'contract' to 'policies' since contract step was removed

ALTER TABLE `stays_onboarding_progress_track` 
  MODIFY COLUMN `current_step` varchar(100) NOT NULL DEFAULT 'policies',
  MODIFY COLUMN `step_name` varchar(255) NOT NULL DEFAULT 'Policies & Settings';

-- Update any existing records that have 'contract' as current_step to 'policies'
UPDATE `stays_onboarding_progress_track` 
SET `current_step` = 'policies', 
    `step_name` = 'Policies & Settings',
    `step_number` = 4
WHERE `current_step` = 'contract';

