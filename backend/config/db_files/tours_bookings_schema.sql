-- ============================================
-- TOUR BOOKINGS DATABASE SCHEMA
-- Database: travoozapp_db (shared database)
-- All tables use 'tours_' prefix
-- ============================================
-- IMPORTANT: Make sure you are connected to travoozapp_db before running this script
-- USE travoozapp_db;
-- ============================================

-- ============================================
-- TOUR BOOKINGS TABLE
-- Stores customer bookings for tour packages
-- ============================================
CREATE TABLE IF NOT EXISTS tours_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    tour_business_id INT NOT NULL,
    customer_id INT DEFAULT NULL, -- Reference to customer/user who made the booking
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(35) DEFAULT NULL,
    customer_country_code VARCHAR(10) DEFAULT NULL,
    
    -- Booking Details
    booking_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    tour_date DATE NOT NULL,
    tour_time TIME DEFAULT NULL,
    number_of_participants INT NOT NULL DEFAULT 1,
    
    -- Pricing
    base_price DECIMAL(10, 2) DEFAULT NULL,
    addon_price DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT NULL,
    commission_amount DECIMAL(10, 2) DEFAULT NULL,
    vendor_payout DECIMAL(10, 2) DEFAULT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    
    -- Status
    status ENUM('pending', 'pending_payment', 'confirmed', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_transaction_id VARCHAR(255) DEFAULT NULL,
    
    -- Additional Information
    special_requests TEXT DEFAULT NULL,
    cancellation_reason TEXT DEFAULT NULL,
    cancellation_date TIMESTAMP NULL DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_tour_date (tour_date),
    INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR BOOKING PARTICIPANTS TABLE
-- Stores individual participant details for each booking
-- ============================================
CREATE TABLE IF NOT EXISTS tours_booking_participants (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) DEFAULT NULL,
    participant_phone VARCHAR(35) DEFAULT NULL,
    participant_age INT DEFAULT NULL,
    participant_gender ENUM('male', 'female', 'other') DEFAULT NULL,
    emergency_contact_name VARCHAR(255) DEFAULT NULL,
    emergency_contact_phone VARCHAR(35) DEFAULT NULL,
    dietary_restrictions TEXT DEFAULT NULL,
    special_needs TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES tours_bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR BOOKING ADD-ONS TABLE
-- Stores add-ons selected for each booking
-- ============================================
CREATE TABLE IF NOT EXISTS tours_booking_addons (
    booking_addon_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    addon_id INT NOT NULL, -- Reference to tours_package_addons
    addon_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES tours_bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_addon_id (addon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

