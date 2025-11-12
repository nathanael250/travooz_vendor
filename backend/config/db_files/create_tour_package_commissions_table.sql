-- ============================================
-- TOUR PACKAGE COMMISSIONS TABLE
-- Stores commission percentage that platform takes when customers book and pay
-- Simple percentage-based commission model
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_commissions (
    commission_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    -- Commission percentage that platform takes (0-100)
    -- Example: 15.00 means platform takes 15% of booking payment
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    -- Currency for commission calculation
    currency VARCHAR(3) DEFAULT 'USD',
    -- Status
    is_active TINYINT(1) DEFAULT '1',
    -- Notes/description (optional)
    notes TEXT DEFAULT NULL,
    -- Metadata
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Foreign keys
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_commission (package_id), -- One commission per package
    INDEX idx_package_id (package_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMMENTS
-- ============================================
-- commission_type:
--   - 'default': Default commission for the entire package
--   - 'tier': Commission specific to a pricing tier (reference_id = tier_id)
--   - 'addon': Commission specific to an add-on (reference_id = addon_id)
--
-- commission_structure:
--   - 'percentage': Commission calculated as percentage of customer_pays
--   - 'fixed': Fixed commission amount regardless of price
--   - 'hybrid': Combination of fixed + percentage
--
-- calculation_method:
--   - 'customer_pays': Commission deducted from what customer pays
--   - 'vendor_pays': Commission added to what vendor receives
--   - 'split': Commission split between customer and vendor
--
-- Example usage:
--   1. Package default: commission_type='default', reference_id=NULL, commission_percentage=15.00
--   2. Tier override: commission_type='tier', reference_id=123 (tier_id), commission_percentage=20.00
--   3. Add-on override: commission_type='addon', reference_id=456 (addon_id), commission_percentage=10.00

