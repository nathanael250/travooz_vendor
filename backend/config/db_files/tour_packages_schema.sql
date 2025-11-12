-- ============================================
-- TOUR PACKAGES DATABASE SCHEMA
-- Database: travoozapp_db (shared database)
-- All tables use 'tours_' prefix
-- ============================================
-- IMPORTANT: Make sure you are connected to travoozapp_db before running this script
-- USE travoozapp_db;
--
-- This schema stores ALL data from the complete tour package creation flow:
-- Step 1: Basic Informations (Title, Category, Description, Highlights, Locations, Tags)
-- Step 2: Inclusions (What's included, Guide info, Food & drinks, Transportation)
-- Step 3: Extra Information (Not suitable for, Not allowed, Pet policy, Mandatory items, etc.)
-- Step 4: Photos
-- Step 5: Options (Option setup, Meeting point, Availability & Pricing with 5 tabs)
--
-- Total: 23 tables covering all form fields and relationships
-- See TOUR_PACKAGES_DATA_FLOW.md for complete field mapping
-- ============================================

-- ============================================
-- MAIN TOUR PACKAGES TABLE
-- Stores basic tour package information (Step 1: Basic Informations)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_business_id INT NOT NULL,
    -- Step 1: Basic Informations
    name VARCHAR(60) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    short_description VARCHAR(200) DEFAULT NULL,
    full_description TEXT DEFAULT NULL,
    -- Step 2: Inclusions
    whats_included TEXT DEFAULT NULL,
    whats_not_included TEXT DEFAULT NULL,
    guide_type ENUM('self-guided', 'tour-guide', 'host-greeter', 'instructor', 'driver') DEFAULT NULL,
    guide_language VARCHAR(100) DEFAULT NULL,
    food_included TINYINT(1) DEFAULT '0',
    drinks_included TINYINT(1) DEFAULT '0',
    show_dietary_restrictions TINYINT(1) DEFAULT '0',
    transportation_used TINYINT(1) DEFAULT '0',
    travel_to_different_city TINYINT(1) DEFAULT '0',
    -- Step 3: Extra Information
    pet_policy TINYINT(1) DEFAULT '0',
    pet_policy_details TEXT DEFAULT NULL,
    know_before_you_go TEXT DEFAULT NULL,
    emergency_contact VARCHAR(255) DEFAULT NULL,
    emergency_country_code VARCHAR(10) DEFAULT NULL,
    emergency_phone VARCHAR(35) DEFAULT NULL,
    voucher_information TEXT DEFAULT NULL,
    -- Step 5: Options - Option setup
    option_reference_code VARCHAR(20) DEFAULT NULL,
    max_group_size INT DEFAULT NULL,
    guide_materials TINYINT(1) DEFAULT '0',
    is_private_activity TINYINT(1) DEFAULT '0',
    skip_the_line TINYINT(1) DEFAULT '0',
    skip_the_line_type VARCHAR(100) DEFAULT NULL,
    wheelchair_accessible TINYINT(1) DEFAULT '0',
    duration_type ENUM('duration', 'validity') DEFAULT NULL,
    duration_value VARCHAR(50) DEFAULT NULL,
    -- Step 5: Options - Meeting point
    customer_arrival_type ENUM('self', 'pickup') DEFAULT NULL,
    pickup_type ENUM('any-address', 'defined-locations') DEFAULT NULL,
    pickup_timing ENUM('same-time', 'before-activity') DEFAULT NULL,
    pickup_confirmation ENUM('day-before', 'after-selection') DEFAULT NULL,
    pickup_time VARCHAR(50) DEFAULT NULL,
    pickup_description TEXT DEFAULT NULL,
    drop_off_type ENUM('same-place', 'different-place', 'no-dropoff') DEFAULT NULL,
    pickup_transportation VARCHAR(100) DEFAULT NULL,
    -- Step 5: Options - Availability & Pricing
    availability_type ENUM('time-slots', 'opening-hours') DEFAULT NULL,
    pricing_type ENUM('per-person', 'per-group') DEFAULT NULL,
    -- Status and metadata
    status ENUM('draft', 'pending', 'active', 'inactive') DEFAULT 'draft',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_business_id) REFERENCES tours_businesses(tour_business_id) ON DELETE CASCADE,
    INDEX idx_tour_business_id (tour_business_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE LOCATIONS TABLE
-- Stores locations visited during the tour (Step 1: Substep 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    formatted_address VARCHAR(500) DEFAULT NULL,
    place_id VARCHAR(255) DEFAULT NULL,
    latitude DECIMAL(10, 7) DEFAULT NULL,
    longitude DECIMAL(10, 7) DEFAULT NULL,
    address_components JSON DEFAULT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    INDEX idx_place_id (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE TAGS TABLE
-- Stores keywords/tags for the package (Step 1: Substep 4)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    INDEX idx_tag_name (tag_name),
    UNIQUE KEY unique_package_tag (package_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE HIGHLIGHTS TABLE
-- Stores highlights for the package (Step 1: Substep 2)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_highlights (
    highlight_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    highlight_text VARCHAR(80) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE MEALS TABLE
-- Stores meal information (Step 2: Substep 3 - Food)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_meals (
    meal_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack', 'brunch', 'tea', 'coffee') DEFAULT NULL,
    meal_format ENUM('food-tasting', 'buffet', 'set-menu', 'a-la-carte', 'picnic', 'street-food', 'cooking-class') DEFAULT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE DIETARY RESTRICTIONS TABLE
-- Stores dietary restrictions that can be accommodated (Step 2: Substep 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_dietary_restrictions (
    restriction_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    restriction_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_restriction (package_id, restriction_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE TRANSPORTATION TYPES TABLE
-- Stores transportation types used during activity (Step 2: Substep 4)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_transportation_types (
    transportation_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    transportation_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_transportation (package_id, transportation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE NOT SUITABLE FOR TABLE
-- Stores restrictions on who can participate (Step 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_not_suitable (
    not_suitable_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    restriction_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_not_suitable (package_id, restriction_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE NOT ALLOWED TABLE
-- Stores items/actions not allowed (Step 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_not_allowed (
    not_allowed_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_not_allowed (package_id, item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE MANDATORY ITEMS TABLE
-- Stores mandatory items customers must bring (Step 3)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_mandatory_items (
    mandatory_item_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_mandatory_item (package_id, item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE PHOTOS TABLE
-- Stores photos for the package (Step 4)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_photos (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    photo_url LONGTEXT NOT NULL,
    photo_name VARCHAR(255) DEFAULT NULL,
    photo_size INT DEFAULT NULL,
    photo_type VARCHAR(100) DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_primary TINYINT(1) DEFAULT '0',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    INDEX idx_display_order (display_order),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE LANGUAGES TABLE
-- Stores languages offered (Step 5: Option setup)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_languages (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    UNIQUE KEY unique_package_language (package_id, language_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE GUIDE MATERIALS TABLE
-- Stores guide materials information (Step 5: Option setup)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_guide_materials (
    guide_material_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    material_type ENUM('audio-guides', 'information-booklets') DEFAULT NULL,
    language_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE SCHEDULES TABLE
-- Stores schedule information (Step 5: Availability & Pricing - Schedule)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    schedule_name VARCHAR(255) DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    has_end_date TINYINT(1) DEFAULT '0',
    end_date DATE DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tours_packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE WEEKLY SCHEDULE TABLE
-- Stores weekly time slots (Step 5: Availability & Pricing - Schedule)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_weekly_schedule (
    weekly_schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_hour VARCHAR(2) DEFAULT '08',
    start_minute VARCHAR(2) DEFAULT '00',
    end_hour VARCHAR(2) DEFAULT '18',
    end_minute VARCHAR(2) DEFAULT '00',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE SCHEDULE EXCEPTIONS TABLE
-- Stores exception dates with alternative hours (Step 5: Availability & Pricing - Schedule)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_schedule_exceptions (
    exception_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    exception_date DATE NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_exception_date (exception_date),
    UNIQUE KEY unique_schedule_exception (schedule_id, exception_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE EXCEPTION TIME SLOTS TABLE
-- Stores time slots for exception dates
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_exception_time_slots (
    time_slot_id INT AUTO_INCREMENT PRIMARY KEY,
    exception_id INT NOT NULL,
    start_hour VARCHAR(2) DEFAULT '08',
    start_minute VARCHAR(2) DEFAULT '00',
    end_hour VARCHAR(2) DEFAULT '18',
    end_minute VARCHAR(2) DEFAULT '00',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exception_id) REFERENCES tours_package_schedule_exceptions(exception_id) ON DELETE CASCADE,
    INDEX idx_exception_id (exception_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE PRICING CATEGORIES TABLE
-- Stores pricing category information (Step 5: Availability & Pricing - Pricing Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_pricing_categories (
    pricing_category_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    category_type ENUM('same-price', 'age-based') DEFAULT 'same-price',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule_category (schedule_id),
    INDEX idx_schedule_id (schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE PRICING TIERS TABLE
-- Stores pricing tiers (Step 5: Availability & Pricing - Price)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_pricing_tiers (
    tier_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    participant_range VARCHAR(50) DEFAULT NULL, -- e.g., "1 to 5", "6 to 20", "Adults", "Children"
    min_participants INT DEFAULT NULL, -- For range calculations
    max_participants INT DEFAULT NULL, -- For range calculations
    customer_pays DECIMAL(10, 2) DEFAULT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT NULL,
    price_per_participant DECIMAL(10, 2) DEFAULT NULL, -- Calculated field: customer_pays * (1 - commission_percentage/100)
    currency VARCHAR(3) DEFAULT 'RWF',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE CAPACITY TABLE
-- Stores capacity information (Step 5: Availability & Pricing - Capacity)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_capacity (
    capacity_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    min_participants INT DEFAULT NULL,
    max_participants INT DEFAULT NULL,
    exceptions_share_capacity TINYINT(1) DEFAULT '1',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule_capacity (schedule_id),
    INDEX idx_schedule_id (schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE EXCEPTION CAPACITY TABLE
-- Stores capacity for exception dates
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_exception_capacity (
    exception_capacity_id INT AUTO_INCREMENT PRIMARY KEY,
    exception_id INT NOT NULL,
    max_participants INT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exception_id) REFERENCES tours_package_schedule_exceptions(exception_id) ON DELETE CASCADE,
    INDEX idx_exception_id (exception_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE ADD-ONS TABLE
-- Stores add-on services/items (Step 5: Availability & Pricing - Add-ons)
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_addons (
    addon_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    addon_name VARCHAR(255) NOT NULL,
    addon_type VARCHAR(100) DEFAULT NULL, -- Type/category of add-on
    description TEXT DEFAULT NULL,
    quantity_range VARCHAR(50) DEFAULT NULL, -- e.g., "1 to 12"
    min_quantity INT DEFAULT NULL,
    max_quantity INT DEFAULT NULL,
    customer_pays DECIMAL(10, 2) DEFAULT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT NULL,
    payout DECIMAL(10, 2) DEFAULT NULL, -- Calculated field: customer_pays * (1 - commission_percentage/100)
    currency VARCHAR(3) DEFAULT 'RWF',
    is_required TINYINT(1) DEFAULT '0',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES tours_package_schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOUR PACKAGE ADD-ON PRICING TIERS TABLE
-- Stores pricing tiers for add-ons
-- ============================================
CREATE TABLE IF NOT EXISTS tours_package_addon_tiers (
    tier_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_id INT NOT NULL,
    quantity_range VARCHAR(50) DEFAULT NULL,
    min_quantity INT DEFAULT NULL,
    max_quantity INT DEFAULT NULL,
    customer_pays DECIMAL(10, 2) DEFAULT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT NULL,
    payout DECIMAL(10, 2) DEFAULT NULL, -- Calculated field: customer_pays * (1 - commission_percentage/100)
    currency VARCHAR(3) DEFAULT 'RWF',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (addon_id) REFERENCES tours_package_addons(addon_id) ON DELETE CASCADE,
    INDEX idx_addon_id (addon_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TOURS GLOBAL COMMISSION TABLE
-- Stores platform-wide commission settings for ALL tour bookings
-- This commission applies to ALL tour packages when customers book and pay
-- NO package_id - applies globally to all tours
-- ============================================
CREATE TABLE IF NOT EXISTS tours_global_commission (
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
    -- Constraints (NO foreign keys - this is global, not package-specific)
    UNIQUE KEY unique_active_commission (is_active, effective_from, effective_to),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTES:
-- ============================================
-- 1. All tables use 'tours_' prefix to avoid conflicts
-- 2. Foreign keys reference tours_packages or tours_package_schedules
-- 3. Many-to-many relationships are handled with separate junction tables
-- 4. JSON fields allow flexible data storage where needed
-- 5. Display order fields allow custom sorting
-- 6. All timestamps use CURRENT_TIMESTAMP for created_at
-- 7. updated_at auto-updates on record modification
-- 8. Status field in tours_packages tracks package lifecycle
-- 9. Schedule-based pricing allows multiple pricing models per package
-- 10. Exception dates allow special pricing/hours for holidays, etc.
-- ============================================

