-- Migration: Add rejection tracking columns to stays_properties table
-- This allows tracking when and why a property was rejected

ALTER TABLE `stays_properties`
ADD COLUMN `rejected_at` TIMESTAMP NULL DEFAULT NULL AFTER `approved_by`,
ADD COLUMN `rejected_by` INT NULL DEFAULT NULL AFTER `rejected_at`,
ADD COLUMN `rejection_reason` TEXT NULL DEFAULT NULL AFTER `rejected_by`;



















