-- Migration: Create Unified Users Table
-- Description: Creates a unified users table with service scoping to eliminate cross-service user conflicts
-- Date: 2025-01-XX
-- 
-- This is the FIRST APPROACH solution: Unified Identity + Service Profiles
-- 
-- IMPORTANT: This migration creates the new structure. Data migration happens in 002_migrate_to_unified_users.sql

-- ============================================
-- UNIFIED USERS TABLE
-- Core identity table - one user per (service, email) combination
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  `service` VARCHAR(50) NOT NULL COMMENT 'Service identifier: admin, restaurant, car_rental, tours, stays',
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  
  `role` ENUM('admin', 'vendor', 'client') NOT NULL DEFAULT 'vendor',
  
  `is_active` TINYINT(1) DEFAULT 1,
  `email_verified` TINYINT(1) DEFAULT 0,
  
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `failed_logins` INT DEFAULT 0,
  
  `password_reset_token` VARCHAR(255) DEFAULT NULL,
  `password_reset_expires` TIMESTAMP NULL DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Critical: Enforce uniqueness per service
  UNIQUE KEY `unique_service_email` (`service`, `email`),
  
  -- Indexes for performance
  INDEX `idx_service` (`service`),
  INDEX `idx_email` (`email`),
  INDEX `idx_service_email` (`service`, `email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Unified user identity table - one user per (service, email)';





