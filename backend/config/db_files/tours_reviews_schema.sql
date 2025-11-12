-- ============================================
-- TOUR REVIEWS & RATINGS DATABASE SCHEMA
-- Database: travoozapp_db (shared database)
-- All tables use 'tours_' prefix
-- ============================================
-- IMPORTANT: Make sure you are connected to travoozapp_db before running this script
-- USE travoozapp_db;
-- ============================================

-- ============================================
-- TOUR REVIEWS TABLE
-- Stores customer reviews and ratings for tour packages
-- ============================================
CREATE TABLE IF NOT EXISTS tours_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT DEFAULT NULL, -- Reference to tours_bookings
    package_id INT NOT NULL,
    tour_business_id INT NOT NULL,
    customer_id INT DEFAULT NULL, -- Reference to customer/user who made the review
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) DEFAULT NULL,
    
    -- Rating (1-5 stars)
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review Content
    title VARCHAR(255) DEFAULT NULL,
    comment TEXT DEFAULT NULL,
    
    -- Detailed Ratings (optional)
    guide_rating INT DEFAULT NULL CHECK (guide_rating >= 1 AND guide_rating <= 5),
    value_rating INT DEFAULT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
    experience_rating INT DEFAULT NULL CHECK (experience_rating >= 1 AND experience_rating <= 5),
    
    -- Review Metadata
    verified_booking TINYINT(1) DEFAULT '1', -- Whether the reviewer actually booked
    would_recommend TINYINT(1) DEFAULT NULL,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    
    -- Vendor Response
    vendor_response TEXT DEFAULT NULL,
    vendor_responded_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Status
    status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'approved',
    
    -- Timestamps
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES tours_bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_package_id (package_id),
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR REVIEW IMAGES TABLE
-- Stores images attached to reviews
-- ============================================
CREATE TABLE IF NOT EXISTS tours_review_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255) DEFAULT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES tours_reviews(review_id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

