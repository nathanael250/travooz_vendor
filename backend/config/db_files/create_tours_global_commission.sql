-- ============================================
-- TOURS GLOBAL COMMISSION TABLE
-- Stores platform-wide commission settings for all tour bookings
-- This commission applies to ALL tour packages when customers book and pay
-- Only one active commission record should exist at a time
-- ============================================
DROP TABLE IF EXISTS tours_global_commission;

CREATE TABLE tours_global_commission (
    commission_id INT AUTO_INCREMENT PRIMARY KEY,
    -- Commission structure
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- Platform commission percentage (0-100)
    fixed_commission DECIMAL(10, 2) DEFAULT NULL, -- Fixed commission amount per booking (optional)
    commission_structure ENUM('percentage', 'fixed', 'hybrid') DEFAULT 'percentage',
    -- Minimum and maximum commission limits per booking
    min_commission_per_booking DECIMAL(10, 2) DEFAULT NULL, -- Minimum commission per booking
    max_commission_per_booking DECIMAL(10, 2) DEFAULT NULL, -- Maximum commission per booking
    -- Currency
    currency VARCHAR(3) DEFAULT 'RWF',
    -- Commission calculation method
    calculation_method ENUM('customer_pays', 'vendor_pays', 'split') DEFAULT 'customer_pays',
    -- Effective dates (for commission changes over time)
    effective_from DATE NOT NULL DEFAULT (CURDATE()), -- When this commission rate becomes effective
    effective_to DATE DEFAULT NULL, -- When this commission rate expires (NULL = ongoing)
    -- Status
    is_active TINYINT(1) DEFAULT '1',
    -- Description/notes
    description TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    -- Metadata
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL, -- Admin user who created/updated this commission
    -- Constraints
    UNIQUE KEY unique_active_commission (is_active, effective_from, effective_to),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT COMMISSION
-- ============================================
-- Insert a default 15% commission for all tour bookings
INSERT INTO tours_global_commission (
    commission_percentage,
    commission_structure,
    calculation_method,
    currency,
    effective_from,
    is_active,
    description
) VALUES (
    15.00, -- 15% commission
    'percentage',
    'customer_pays',
    'RWF', -- Rwandan Franc
    CURDATE(),
    1,
    'Default platform commission for all tour bookings'
);

-- ============================================
-- COMMENTS
-- ============================================
-- This table stores the platform-wide commission that applies to ALL tour bookings
-- 
-- When a customer books and pays for any tour package:
--   - Platform commission = booking_amount * (commission_percentage / 100)
--   - Vendor payout = booking_amount - platform_commission
--
-- Example:
--   Customer pays: $100
--   Commission (15%): $15
--   Vendor receives: $85
--
-- The commission is calculated automatically when a booking is created and payment is processed.
-- Only one commission record should be active at a time (is_active = 1).

