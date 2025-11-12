-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 08, 2025 at 12:55 PM
-- Server version: 8.0.43-0ubuntu0.22.04.2
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travooz_stays`
--

-- --------------------------------------------------------

--
-- Table structure for table `stays_bookings`
--

CREATE TABLE `stays_bookings` (
  `booking_id` int NOT NULL,
  `property_id` int NOT NULL,
  `room_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `guests` int DEFAULT '1',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_email_verifications`
--

CREATE TABLE `stays_email_verifications` (
  `verification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_email_verifications`
--

INSERT INTO `stays_email_verifications` (`verification_id`, `user_id`, `email`, `code`, `code_hash`, `expires_at`, `is_used`, `verified_at`, `created_at`) VALUES
(1, 1, 'nathanaelniyogushimwa@gmail.com', '602250', 'ce4c44c58eeb9561e065df4368098ab1601435c46fd7d52687da1102a8c0b300', '2025-11-06 23:57:37', 1, '2025-11-06 23:54:44', '2025-11-06 23:52:37'),
(2, 1, 'nathanaelniyogushimwa@gmail.com', '112820', 'eb0336dd1586f9d72136aabc20c729c8243998586e5cced7aa9755650b4f653e', '2025-11-07 00:20:30', 1, '2025-11-07 00:15:46', '2025-11-07 00:15:30'),
(3, 2, 'niyo.nathan00@gmail.com', '307015', 'cc5bcd4c71c14fa1337b3e275d05423d8ee5459d0f16576e18d8dbfb9e1736fe', '2025-11-07 12:27:43', 1, '2025-11-07 12:23:45', '2025-11-07 12:22:42');

-- --------------------------------------------------------

--
-- Table structure for table `stays_properties`
--

CREATE TABLE `stays_properties` (
  `property_id` int NOT NULL,
  `user_id` int NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `property_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `property_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number_of_rooms` int DEFAULT NULL,
  `legal_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel_manager` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `part_of_chain` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `booking_com_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `is_live` tinyint(1) DEFAULT '0',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `setup_complete` tinyint(1) DEFAULT '0',
  `contract_accepted` tinyint(1) DEFAULT '0',
  `contract_accepted_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_properties`
--

INSERT INTO `stays_properties` (`property_id`, `user_id`, `location`, `location_data`, `property_name`, `property_type`, `number_of_rooms`, `legal_name`, `currency`, `channel_manager`, `part_of_chain`, `booking_com_url`, `status`, `is_live`, `approved_at`, `approved_by`, `setup_complete`, `contract_accepted`, `contract_accepted_at`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'NADEVA Hotel', 'hotel', 20, 'NADEVA Hotel', 'RWF', 'no', 'no', NULL, 'pending', 0, NULL, NULL, 1, 1, '2025-11-07 00:15:51', '2025-11-07 01:25:46', '2025-11-07 00:15:30', '2025-11-07 01:25:46'),
(2, 2, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'Galaxy hotel', 'hotel', 10, 'Galaxy hotel', 'RWF', 'no', 'no', NULL, 'pending', 0, NULL, NULL, 0, 1, '2025-11-08 09:00:43', NULL, '2025-11-07 12:22:42', '2025-11-08 09:00:43');

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_amenities`
--

CREATE TABLE `stays_property_amenities` (
  `amenity_id` int NOT NULL,
  `property_id` int NOT NULL,
  `min_check_in_age` int DEFAULT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_in_ends` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `has_front_desk` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `front_desk_schedule` enum('everyday','weekdays','weekends') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `front_desk_24_hours` tinyint(1) DEFAULT '0',
  `desk_opens` time DEFAULT NULL,
  `desk_closes` time DEFAULT NULL,
  `self_check_in_available` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `guest_access_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_available` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `late_check_in_cost` enum('free','surcharge') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_charge_type` enum('percentage','amount') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_amount` decimal(10,2) DEFAULT NULL,
  `advance_notice_required` tinyint(1) DEFAULT '0',
  `advance_notice_hours` int DEFAULT NULL,
  `late_check_in_different_location` tinyint(1) DEFAULT '0',
  `late_check_in_address` text COLLATE utf8mb4_unicode_ci,
  `offer_breakfast` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `breakfast_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `offer_internet` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `wifi_in_guestrooms` tinyint(1) DEFAULT '0',
  `wifi_guestrooms_min_speed` int DEFAULT NULL,
  `wifi_in_public_areas` tinyint(1) DEFAULT '0',
  `wired_internet` tinyint(1) DEFAULT '0',
  `wired_internet_in_guestrooms` tinyint(1) DEFAULT '0',
  `offer_parking` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `self_parking` tinyint(1) DEFAULT '0',
  `valet_parking` tinyint(1) DEFAULT '0',
  `electric_car_charging` tinyint(1) DEFAULT '0',
  `parking_fee` decimal(10,2) DEFAULT NULL,
  `has_pool` tinyint(1) DEFAULT '0',
  `pool_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_spa` tinyint(1) DEFAULT '0',
  `has_fitness_center` tinyint(1) DEFAULT '0',
  `has_restaurant` tinyint(1) DEFAULT '0',
  `has_bar` tinyint(1) DEFAULT '0',
  `has_concierge` tinyint(1) DEFAULT '0',
  `has_laundry` tinyint(1) DEFAULT '0',
  `has_business_center` tinyint(1) DEFAULT '0',
  `pets_allowed` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `has_pet_surcharge` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `pet_surcharge_amount` decimal(10,2) DEFAULT NULL,
  `pet_surcharge_currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `pet_surcharge_unit` enum('per_pet','per_stay') COLLATE utf8mb4_unicode_ci DEFAULT 'per_pet',
  `pet_surcharge_period` enum('per_night','per_stay') COLLATE utf8mb4_unicode_ci DEFAULT 'per_night',
  `pet_surcharge_max_fee_per_stay` tinyint(1) DEFAULT '0',
  `pet_surcharge_max_fee_amount` decimal(10,2) DEFAULT NULL,
  `pet_fee_varies_by_stay_length` tinyint(1) DEFAULT '0',
  `additional_amenities` json DEFAULT NULL,
  `themes` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_property_amenities`
--

INSERT INTO `stays_property_amenities` (`amenity_id`, `property_id`, `min_check_in_age`, `check_in_time`, `check_in_ends`, `check_out_time`, `has_front_desk`, `front_desk_schedule`, `front_desk_24_hours`, `desk_opens`, `desk_closes`, `self_check_in_available`, `guest_access_method`, `late_check_in_available`, `late_check_in_cost`, `late_check_in_charge_type`, `late_check_in_amount`, `advance_notice_required`, `advance_notice_hours`, `late_check_in_different_location`, `late_check_in_address`, `offer_breakfast`, `breakfast_type`, `offer_internet`, `wifi_in_guestrooms`, `wifi_guestrooms_min_speed`, `wifi_in_public_areas`, `wired_internet`, `wired_internet_in_guestrooms`, `offer_parking`, `self_parking`, `valet_parking`, `electric_car_charging`, `parking_fee`, `has_pool`, `pool_type`, `has_spa`, `has_fitness_center`, `has_restaurant`, `has_bar`, `has_concierge`, `has_laundry`, `has_business_center`, `pets_allowed`, `has_pet_surcharge`, `pet_surcharge_amount`, `pet_surcharge_currency`, `pet_surcharge_unit`, `pet_surcharge_period`, `pet_surcharge_max_fee_per_stay`, `pet_surcharge_max_fee_amount`, `pet_fee_varies_by_stay_length`, `additional_amenities`, `themes`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, '00:00:00', 'yes', 'everyday', 1, NULL, NULL, 'no', NULL, 'yes', 'free', 'amount', NULL, 0, NULL, 0, NULL, 'yes', NULL, 'yes', 1, 7, 1, 0, 0, 'yes', 1, 1, 0, NULL, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 'no', 'no', NULL, 'USD', 'per_pet', 'per_night', 0, NULL, 0, '[]', '[]', '2025-11-07 00:21:28', '2025-11-07 00:51:45');

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_connectivity`
--

CREATE TABLE `stays_property_connectivity` (
  `connectivity_id` int NOT NULL,
  `property_id` int NOT NULL,
  `add_connectivity_provider` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `connectivity_provider_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectivity_provider_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_connected` tinyint(1) DEFAULT '0',
  `connected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_images`
--

CREATE TABLE `stays_property_images` (
  `image_id` int NOT NULL,
  `property_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_policies`
--

CREATE TABLE `stays_property_policies` (
  `policy_id` int NOT NULL,
  `property_id` int NOT NULL,
  `languages` json DEFAULT NULL,
  `accept_cash` tinyint(1) DEFAULT '0',
  `accept_credit_debit_cards` tinyint(1) DEFAULT '0',
  `card_types` json DEFAULT NULL,
  `installments_at_front_desk` tinyint(1) DEFAULT '0',
  `require_deposits` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `deposit_types` json DEFAULT NULL,
  `incidentals_payment_form` enum('cash_only','credit_card_only','both') COLLATE utf8mb4_unicode_ci DEFAULT 'cash_only',
  `property_time_zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_window` enum('24_hour','48_hour','72_hour','non_refundable') COLLATE utf8mb4_unicode_ci DEFAULT '24_hour',
  `cancellation_fee` enum('first_night_plus_tax','first_night','full_amount') COLLATE utf8mb4_unicode_ci DEFAULT 'first_night_plus_tax',
  `cut_off_time` time DEFAULT '18:00:00',
  `vat_percentage` decimal(5,2) DEFAULT NULL,
  `tourism_tax_percentage` decimal(5,2) DEFAULT NULL,
  `taxes_included_in_rate` tinyint(1) DEFAULT '1',
  `request_tax_team_assistance` tinyint(1) DEFAULT '0',
  `billing_currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_property_policies`
--

INSERT INTO `stays_property_policies` (`policy_id`, `property_id`, `languages`, `accept_cash`, `accept_credit_debit_cards`, `card_types`, `installments_at_front_desk`, `require_deposits`, `deposit_types`, `incidentals_payment_form`, `property_time_zone`, `cancellation_window`, `cancellation_fee`, `cut_off_time`, `vat_percentage`, `tourism_tax_percentage`, `taxes_included_in_rate`, `request_tax_team_assistance`, `billing_currency`, `created_at`, `updated_at`) VALUES
(1, 1, '[\"English\", \"French\", \"Kinyarwanda\", \"Swahili\"]', 1, 1, '[\"debitCards\", \"jcb\", \"visa\"]', 1, 'no', '[]', 'cash_only', '(GMT+03:00) Nairobi', '24_hour', 'first_night_plus_tax', '18:00:00', '18.00', '3.00', 0, 1, 'RWF', '2025-11-07 00:17:07', '2025-11-07 00:51:02');

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_promotions`
--

CREATE TABLE `stays_property_promotions` (
  `promotion_id` int NOT NULL,
  `property_id` int NOT NULL,
  `promotion_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_tax_details`
--

CREATE TABLE `stays_property_tax_details` (
  `tax_detail_id` int NOT NULL,
  `property_id` int NOT NULL,
  `legal_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vat_registered` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `vat_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_property_tax_details`
--

INSERT INTO `stays_property_tax_details` (`tax_detail_id`, `property_id`, `legal_name`, `vat_registered`, `vat_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'NADEVA Hotel', 'no', NULL, '2025-11-07 00:29:56', '2025-11-07 01:25:40');

-- --------------------------------------------------------

--
-- Table structure for table `stays_rooms`
--

CREATE TABLE `stays_rooms` (
  `room_id` int NOT NULL,
  `property_id` int NOT NULL,
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_class` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smoking_policy` enum('non-smoking','smoking','smoking_and_non_smoking') COLLATE utf8mb4_unicode_ci DEFAULT 'non-smoking',
  `number_of_rooms` int DEFAULT '1',
  `recommended_occupancy` int DEFAULT NULL,
  `pricing_model` enum('per-day','occupancy-based') COLLATE utf8mb4_unicode_ci DEFAULT 'per-day',
  `base_rate` decimal(10,2) DEFAULT NULL,
  `people_included` int DEFAULT '2',
  `room_status` enum('draft','active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_rooms`
--

INSERT INTO `stays_rooms` (`room_id`, `property_id`, `room_name`, `room_type`, `room_class`, `smoking_policy`, `number_of_rooms`, `recommended_occupancy`, `pricing_model`, `base_rate`, `people_included`, `room_status`, `created_at`, `updated_at`) VALUES
(7, 1, 'Single Room, Garden view, Standard', 'Single Room', 'Standard', 'non-smoking', 10, 1, 'per-day', '300000.00', 2, 'active', '2025-11-07 01:25:32', '2025-11-07 01:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_amenities`
--

CREATE TABLE `stays_room_amenities` (
  `room_amenity_id` int NOT NULL,
  `room_id` int NOT NULL,
  `bathroom_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number_of_bathrooms` int DEFAULT '1',
  `bathroom_amenities` json DEFAULT NULL,
  `has_kitchen` tinyint(1) DEFAULT '0',
  `kitchen_facilities` json DEFAULT NULL,
  `has_air_conditioning` tinyint(1) DEFAULT '0',
  `has_heating` tinyint(1) DEFAULT '0',
  `has_view` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `room_view` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_size_sqm` decimal(10,2) DEFAULT NULL,
  `room_size_sqft` decimal(10,2) DEFAULT NULL,
  `has_balcony` tinyint(1) DEFAULT '0',
  `has_terrace` tinyint(1) DEFAULT '0',
  `has_patio` tinyint(1) DEFAULT '0',
  `room_layout` json DEFAULT NULL,
  `additional_amenities` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_room_amenities`
--

INSERT INTO `stays_room_amenities` (`room_amenity_id`, `room_id`, `bathroom_type`, `number_of_bathrooms`, `bathroom_amenities`, `has_kitchen`, `kitchen_facilities`, `has_air_conditioning`, `has_heating`, `has_view`, `room_view`, `room_size_sqm`, `room_size_sqft`, `has_balcony`, `has_terrace`, `has_patio`, `room_layout`, `additional_amenities`, `created_at`, `updated_at`) VALUES
(7, 7, 'private', 1, '[]', 0, '[]', 0, 0, 'no', NULL, NULL, NULL, 0, 0, 0, '[]', '[]', '2025-11-07 01:25:32', '2025-11-07 01:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_beds`
--

CREATE TABLE `stays_room_beds` (
  `bed_id` int NOT NULL,
  `room_id` int NOT NULL,
  `bed_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_room_beds`
--

INSERT INTO `stays_room_beds` (`bed_id`, `room_id`, `bed_type`, `quantity`, `created_at`) VALUES
(7, 7, 'Single bed', 1, '2025-11-07 01:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_images`
--

CREATE TABLE `stays_room_images` (
  `image_id` int NOT NULL,
  `room_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_rate_plans`
--

CREATE TABLE `stays_room_rate_plans` (
  `rate_plan_id` int NOT NULL,
  `room_id` int NOT NULL,
  `plan_type` enum('breakfast','non-refundable','package','mobile','member') COLLATE utf8mb4_unicode_ci DEFAULT 'breakfast',
  `rate_type` enum('increase','discount') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `final_rate` decimal(10,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_room_rate_plans`
--

INSERT INTO `stays_room_rate_plans` (`rate_plan_id`, `room_id`, `plan_type`, `rate_type`, `discount_type`, `amount`, `discount_value`, `final_rate`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 7, 'breakfast', 'increase', NULL, '20000.00', NULL, NULL, '', 1, '2025-11-07 01:25:32', '2025-11-07 01:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `stays_users`
--

CREATE TABLE `stays_users` (
  `user_id` int NOT NULL,
  `role` enum('admin','vendor','client') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vendor',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_logins` int DEFAULT '0',
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_users`
--

INSERT INTO `stays_users` (`user_id`, `role`, `name`, `email`, `phone`, `phone_verified`, `password_hash`, `address`, `gender`, `profile_image`, `cover_image`, `is_active`, `email_verified`, `last_login`, `failed_logins`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'vendor', 'NIYO Nathanael', 'nathanaelniyogushimwa@gmail.com', '+250781796824', 0, '$2a$10$2Fmno6jwnyiRYumV9kcJFu/AMiVpnMnuUFY28U8Ej.vk30THYC6Le', NULL, NULL, NULL, NULL, 1, 1, NULL, 0, NULL, NULL, '2025-11-07 00:15:30', '2025-11-08 09:11:37'),
(2, 'vendor', 'NIYO Nathan', 'niyo.nathan00@gmail.com', '+250781796824', 0, '$2a$10$2Fmno6jwnyiRYumV9kcJFu/AMiVpnMnuUFY28U8Ej.vk30THYC6Le', NULL, NULL, NULL, NULL, 1, 1, NULL, 0, NULL, NULL, '2025-11-07 12:22:42', '2025-11-07 12:23:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `stays_bookings`
--
ALTER TABLE `stays_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_check_in_date` (`check_in_date`);

--
-- Indexes for table `stays_email_verifications`
--
ALTER TABLE `stays_email_verifications`
  ADD PRIMARY KEY (`verification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_code_hash` (`code_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `stays_properties`
--
ALTER TABLE `stays_properties`
  ADD PRIMARY KEY (`property_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_property_type` (`property_type`),
  ADD KEY `idx_setup_complete` (`setup_complete`),
  ADD KEY `idx_is_live` (`is_live`);

--
-- Indexes for table `stays_property_amenities`
--
ALTER TABLE `stays_property_amenities`
  ADD PRIMARY KEY (`amenity_id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `stays_property_connectivity`
--
ALTER TABLE `stays_property_connectivity`
  ADD PRIMARY KEY (`connectivity_id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `stays_property_images`
--
ALTER TABLE `stays_property_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_image_order` (`image_order`);

--
-- Indexes for table `stays_property_policies`
--
ALTER TABLE `stays_property_policies`
  ADD PRIMARY KEY (`policy_id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `stays_property_promotions`
--
ALTER TABLE `stays_property_promotions`
  ADD PRIMARY KEY (`promotion_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `stays_property_tax_details`
--
ALTER TABLE `stays_property_tax_details`
  ADD PRIMARY KEY (`tax_detail_id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `stays_rooms`
--
ALTER TABLE `stays_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_room_status` (`room_status`);

--
-- Indexes for table `stays_room_amenities`
--
ALTER TABLE `stays_room_amenities`
  ADD PRIMARY KEY (`room_amenity_id`),
  ADD KEY `idx_room_id` (`room_id`);

--
-- Indexes for table `stays_room_beds`
--
ALTER TABLE `stays_room_beds`
  ADD PRIMARY KEY (`bed_id`),
  ADD KEY `idx_room_id` (`room_id`);

--
-- Indexes for table `stays_room_images`
--
ALTER TABLE `stays_room_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_room_id` (`room_id`),
  ADD KEY `idx_image_order` (`image_order`);

--
-- Indexes for table `stays_room_rate_plans`
--
ALTER TABLE `stays_room_rate_plans`
  ADD PRIMARY KEY (`rate_plan_id`),
  ADD KEY `idx_room_id` (`room_id`),
  ADD KEY `idx_plan_type` (`plan_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `stays_users`
--
ALTER TABLE `stays_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `stays_bookings`
--
ALTER TABLE `stays_bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_email_verifications`
--
ALTER TABLE `stays_email_verifications`
  MODIFY `verification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stays_properties`
--
ALTER TABLE `stays_properties`
  MODIFY `property_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stays_property_amenities`
--
ALTER TABLE `stays_property_amenities`
  MODIFY `amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stays_property_connectivity`
--
ALTER TABLE `stays_property_connectivity`
  MODIFY `connectivity_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_images`
--
ALTER TABLE `stays_property_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_policies`
--
ALTER TABLE `stays_property_policies`
  MODIFY `policy_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stays_property_promotions`
--
ALTER TABLE `stays_property_promotions`
  MODIFY `promotion_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_tax_details`
--
ALTER TABLE `stays_property_tax_details`
  MODIFY `tax_detail_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stays_rooms`
--
ALTER TABLE `stays_rooms`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stays_room_amenities`
--
ALTER TABLE `stays_room_amenities`
  MODIFY `room_amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stays_room_beds`
--
ALTER TABLE `stays_room_beds`
  MODIFY `bed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stays_room_images`
--
ALTER TABLE `stays_room_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_room_rate_plans`
--
ALTER TABLE `stays_room_rate_plans`
  MODIFY `rate_plan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stays_users`
--
ALTER TABLE `stays_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `stays_bookings`
--
ALTER TABLE `stays_bookings`
  ADD CONSTRAINT `stays_bookings_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stays_bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `stays_rooms` (`room_id`) ON DELETE SET NULL;

--
-- Constraints for table `stays_email_verifications`
--
ALTER TABLE `stays_email_verifications`
  ADD CONSTRAINT `stays_email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `stays_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_properties`
--
ALTER TABLE `stays_properties`
  ADD CONSTRAINT `stays_properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `stays_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_amenities`
--
ALTER TABLE `stays_property_amenities`
  ADD CONSTRAINT `stays_property_amenities_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_connectivity`
--
ALTER TABLE `stays_property_connectivity`
  ADD CONSTRAINT `stays_property_connectivity_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_images`
--
ALTER TABLE `stays_property_images`
  ADD CONSTRAINT `stays_property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_policies`
--
ALTER TABLE `stays_property_policies`
  ADD CONSTRAINT `stays_property_policies_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_promotions`
--
ALTER TABLE `stays_property_promotions`
  ADD CONSTRAINT `stays_property_promotions_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_property_tax_details`
--
ALTER TABLE `stays_property_tax_details`
  ADD CONSTRAINT `stays_property_tax_details_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_rooms`
--
ALTER TABLE `stays_rooms`
  ADD CONSTRAINT `stays_rooms_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `stays_properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_room_amenities`
--
ALTER TABLE `stays_room_amenities`
  ADD CONSTRAINT `stays_room_amenities_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stays_rooms` (`room_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_room_beds`
--
ALTER TABLE `stays_room_beds`
  ADD CONSTRAINT `stays_room_beds_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stays_rooms` (`room_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_room_images`
--
ALTER TABLE `stays_room_images`
  ADD CONSTRAINT `stays_room_images_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stays_rooms` (`room_id`) ON DELETE CASCADE;

--
-- Constraints for table `stays_room_rate_plans`
--
ALTER TABLE `stays_room_rate_plans`
  ADD CONSTRAINT `stays_room_rate_plans_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stays_rooms` (`room_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
