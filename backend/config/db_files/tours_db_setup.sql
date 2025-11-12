-- Travooz Tours Database Setup Script
-- This script creates all tour package tables in the existing travoozapp_db database
-- Safe to run multiple times - won't duplicate tables
-- 
-- IMPORTANT: Make sure you are connected to travoozapp_db database before running this script
-- USE travoozapp_db;
--
-- Or run: mysql -u username -p travoozapp_db < tours_db_setup.sql

-- ============================================
-- TOURS USERS TABLE
-- Stores user accounts for tour businesses
-- Created when user registers during tour business setup (Step 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'vendor', 'client') NOT NULL DEFAULT 'vendor',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    phone_verified TINYINT(1) DEFAULT '0',
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT '1',
    email_verified TINYINT(1) DEFAULT '0',
    last_login TIMESTAMP NULL DEFAULT NULL,
    failed_logins INT DEFAULT '0',
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR BUSINESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_businesses (
    tour_business_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    location_data JSON DEFAULT NULL,
    tour_business_name VARCHAR(255) NOT NULL,
    tour_type VARCHAR(100) DEFAULT NULL,
    tour_type_name VARCHAR(255) DEFAULT NULL,
    subcategory_id INT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    country_code VARCHAR(10) DEFAULT '+250',
    currency VARCHAR(3) DEFAULT 'RWF',
    status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'draft',
    is_live TINYINT(1) DEFAULT '0',
    approved_at TIMESTAMP NULL DEFAULT NULL,
    approved_by INT NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    setup_complete TINYINT(1) DEFAULT '0',
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_tour_type (tour_type),
    INDEX idx_setup_complete (setup_complete),
    INDEX idx_is_live (is_live)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS EMAIL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_email_verifications (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used TINYINT(1) DEFAULT '0',
    verified_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_code_hash (code_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS BUSINESS OWNER INFO TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_business_owner_info (
    owner_info_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country_of_residence VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS IDENTITY PROOF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_identity_proof (
    identity_proof_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    user_id INT NOT NULL,
    id_country VARCHAR(100) NOT NULL,
    id_card_photo_url VARCHAR(500) NOT NULL,
    id_card_photo_name VARCHAR(255) DEFAULT NULL,
    id_card_photo_size INT DEFAULT NULL,
    id_card_photo_type VARCHAR(100) DEFAULT NULL,
    verified TINYINT(1) DEFAULT '0',
    verified_at TIMESTAMP NULL DEFAULT NULL,
    verified_by INT NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS BUSINESS PROOF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_business_proof (
    business_proof_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    user_id INT NOT NULL,
    business_legal_name VARCHAR(255) NOT NULL,
    professional_certificate_url VARCHAR(500) NOT NULL,
    professional_certificate_name VARCHAR(255) DEFAULT NULL,
    professional_certificate_size INT DEFAULT NULL,
    professional_certificate_type VARCHAR(100) DEFAULT NULL,
    verified TINYINT(1) DEFAULT '0',
    verified_at TIMESTAMP NULL DEFAULT NULL,
    verified_by INT NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS SETUP SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_setup_submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending_review', 'approved', 'rejected', 'in_progress') DEFAULT 'pending_review',
    submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    approved_by INT NULL DEFAULT NULL,
    rejected_at TIMESTAMP NULL DEFAULT NULL,
    rejected_by INT NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS SETUP PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tours_setup_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    user_id INT NOT NULL,
    step_1_complete TINYINT(1) DEFAULT '0', -- Location + Basic Info + Account Creation + Email Verification
    step_2_complete TINYINT(1) DEFAULT '0', -- Business Owner Information
    step_3_complete TINYINT(1) DEFAULT '0', -- Prove Your Identity
    step_4_complete TINYINT(1) DEFAULT '0', -- Prove Your Business
    step_5_complete TINYINT(1) DEFAULT '0', -- Review & Verify
    step_6_complete TINYINT(1) DEFAULT '0', -- Submit for Verification
    current_step INT DEFAULT 1,
    last_updated_step INT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tour_business (tour_business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_current_step (current_step)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Tour package database setup completed successfully!' AS message;

