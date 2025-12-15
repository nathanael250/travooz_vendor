-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 15, 2025 at 01:32 PM
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
-- Database: `travoozapp_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int NOT NULL,
  `service_type` enum('homestay','restaurant_table','tour_package','food_order','room','car_rental','activity') NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed','active') DEFAULT 'pending',
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `order_status` enum('received','preparing','ready_for_pickup','out_for_delivery','delivered') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `booking_reference` varchar(50) DEFAULT NULL COMMENT 'Unique booking reference code',
  `booking_source` enum('website','mobile_app','phone','email','walk_in','agent','ota') DEFAULT 'website',
  `special_requests` text,
  `cancellation_reason` text,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL COMMENT 'user_id who cancelled',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `service_type`, `user_id`, `total_amount`, `status`, `payment_status`, `order_status`, `created_at`, `updated_at`, `booking_reference`, `booking_source`, `special_requests`, `cancellation_reason`, `cancelled_at`, `cancelled_by`, `confirmed_at`, `completed_at`) VALUES
(1, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-11-14 08:25:32', '2025-11-14 08:25:32', 'CAR-1763108732628-3NY4AD109', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(2, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-11-14 08:26:06', '2025-11-14 08:26:06', 'CAR-1763108766952-OZQ9CW5RK', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(3, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-11-14 08:26:31', '2025-11-14 08:26:31', 'CAR-1763108791697-7GBPL28XS', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(4, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-11-14 08:27:09', '2025-11-14 08:27:09', 'CAR-1763108829384-LD2IJWEQB', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(5, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-11-14 08:27:37', '2025-11-14 08:27:37', 'CAR-1763108857138-FWHWPDN3A', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(7, 'car_rental', NULL, '300000.00', 'confirmed', 'paid', NULL, '2025-11-14 08:38:02', '2025-11-14 08:41:30', 'CAR-1763109482147-XRH2RLVZM', 'website', 'GPS navigation required', NULL, NULL, NULL, '2025-11-14 08:41:30', NULL),
(8, 'tour_package', NULL, '0.00', 'confirmed', 'paid', NULL, '2025-11-14 11:19:22', '2025-11-14 11:53:56', 'TOUR-1763119162035-NAZVWC7ZX', 'website', 'Vegetarian meals', NULL, NULL, NULL, '2025-11-14 11:53:56', NULL),
(9, 'tour_package', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-14 11:44:50', '2025-11-14 11:44:50', 'TOUR-1763120690630-BWTBWSUM1', 'website', 'Vegetarian meals', NULL, NULL, NULL, NULL, NULL),
(10, 'tour_package', NULL, '400000.00', 'pending', 'pending', NULL, '2025-11-14 13:04:00', '2025-11-14 13:04:00', 'TOUR-1763125440497-VPFMKE5VC', 'website', 'Vegetarian meals', NULL, NULL, NULL, NULL, NULL),
(11, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-15 20:55:49', '2025-11-15 20:55:49', 'TABLE-1763240149776-302N05T0W', 'website', 'Window seat preferred', NULL, NULL, NULL, NULL, NULL),
(12, 'food_order', NULL, '8000.00', 'pending', 'pending', 'received', '2025-11-15 20:55:49', '2025-11-15 20:55:49', 'FOOD-1763240149805-7WPG4ONBK', 'website', 'No onions please', NULL, NULL, NULL, NULL, NULL),
(13, 'food_order', NULL, '10000.00', 'pending', 'pending', 'out_for_delivery', '2025-11-15 21:58:29', '2025-11-15 21:58:58', 'FOOD-1763243909182-S91E4T44D', 'website', 'Ring doorbell twice', NULL, NULL, NULL, NULL, NULL),
(14, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-15 22:49:54', '2025-11-15 22:49:54', 'TABLE-1763246994071-RU4I1WVTI', 'website', 'Window seat preferred', NULL, NULL, NULL, NULL, NULL),
(15, 'food_order', NULL, '8000.00', 'pending', 'pending', 'received', '2025-11-15 22:49:54', '2025-11-15 22:49:54', 'FOOD-1763246994094-MA0JIWS0R', 'website', 'No onions please', NULL, NULL, NULL, NULL, NULL),
(16, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-15 22:54:52', '2025-11-15 22:54:52', 'TABLE-1763247292435-LOLKRX4VS', 'website', 'Window seat preferred, quiet area', NULL, NULL, NULL, NULL, NULL),
(17, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-15 22:55:37', '2025-11-15 22:55:37', 'TABLE-1763247337581-7Y75SJ7R3', 'website', 'Window seat preferred, quiet area', NULL, NULL, NULL, NULL, NULL),
(18, 'food_order', NULL, '12000.00', 'pending', 'pending', 'received', '2025-11-15 22:55:37', '2025-11-15 22:55:37', 'FOOD-1763247337597-IV03Y2VM3', 'website', 'No onions please, food allergies: peanuts', NULL, NULL, NULL, NULL, NULL),
(19, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-15 23:02:01', '2025-11-15 23:02:01', 'TABLE-1763247721257-2BYX2S35F', 'website', 'Window seat preferred, quiet area', NULL, NULL, NULL, NULL, NULL),
(20, 'food_order', NULL, '12000.00', 'pending', 'pending', 'received', '2025-11-15 23:02:01', '2025-11-15 23:02:01', 'FOOD-1763247721280-JV8DP4CR5', 'website', 'No onions please, food allergies: peanuts', NULL, NULL, NULL, NULL, NULL),
(21, 'room', NULL, '1500000.00', 'pending', 'pending', NULL, '2025-11-17 23:39:23', '2025-11-17 23:39:23', 'STAY-1763422763778-5MTMJELA1', 'website', 'Late check-in please\nGuest: John Doe, Email: john@example.com, Phone: +250788123456, Adults: 1, Children: 0', NULL, NULL, NULL, NULL, NULL),
(22, 'room', NULL, '1500000.00', 'pending', 'pending', NULL, '2025-11-17 23:41:51', '2025-11-17 23:41:51', 'STAY-1763422911014-4RS760I5F', 'website', 'Late check-in please\nGuest: John Doe, Email: john@example.com, Phone: +250788123456, Adults: 1, Children: 0', NULL, NULL, NULL, NULL, NULL),
(23, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-18 14:35:11', '2025-11-18 14:35:11', 'TABLE-1763476511465-C3N0NS534', 'website', 'Window seat preferred', NULL, NULL, NULL, NULL, NULL),
(24, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-18 14:37:09', '2025-11-18 14:37:09', 'TABLE-1763476629794-WG8CNN3BE', 'website', 'Window seat preferred', NULL, NULL, NULL, NULL, NULL),
(25, 'food_order', NULL, '28000.00', 'pending', 'pending', 'received', '2025-11-18 14:37:09', '2025-11-18 14:37:09', 'FOOD-1763476629810-IS789HNSU', 'website', 'No onions please', NULL, NULL, NULL, NULL, NULL),
(26, 'restaurant_table', NULL, '0.00', 'pending', 'pending', NULL, '2025-11-18 14:43:17', '2025-11-18 14:43:17', 'TABLE-1763476997635-ACW5R0VK2', 'website', 'Window seat preferred', NULL, NULL, NULL, NULL, NULL),
(27, 'food_order', NULL, '28000.00', 'pending', 'pending', 'received', '2025-11-18 14:43:17', '2025-11-18 14:43:17', 'FOOD-1763476997678-13GRYFYXI', 'website', 'No onions please', NULL, NULL, NULL, NULL, NULL),
(28, 'tour_package', NULL, '200000.00', 'pending', 'pending', NULL, '2025-11-20 08:41:49', '2025-11-20 08:41:49', 'TOUR-1763628109892-Y1XSBYBW1', 'website', 'Vegetarian meals', NULL, NULL, NULL, NULL, NULL),
(29, 'room', NULL, '1500000.00', 'pending', 'pending', NULL, '2025-11-20 14:51:34', '2025-11-20 14:51:34', 'STAY-1763650294022-K8X584UJV', 'website', 'High floor, quiet room\nGuest: John Doe, Email: john@example.com, Phone: +250788123456, Adults: 1, Children: 0', NULL, NULL, NULL, NULL, NULL),
(30, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-12-11 11:56:03', '2025-12-11 11:56:03', 'CAR-1765454163957-O8NMIP5XD', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(31, 'car_rental', NULL, '900000.00', 'pending', 'pending', NULL, '2025-12-11 12:04:05', '2025-12-11 12:04:05', 'CAR-1765454645436-XB0MWXUJI', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(32, 'car_rental', NULL, '300000.00', 'pending', 'pending', NULL, '2025-12-11 12:06:37', '2025-12-11 12:06:37', 'CAR-1765454797525-T43BX0AML', 'website', 'GPS navigation required', NULL, NULL, NULL, NULL, NULL),
(33, 'car_rental', NULL, '240000.00', 'pending', 'pending', NULL, '2025-12-12 08:44:57', '2025-12-12 08:44:57', 'CAR-1765529097916-BWW3BQPQS', 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'car_rental', NULL, '240000.00', 'pending', 'pending', NULL, '2025-12-12 08:48:38', '2025-12-12 08:48:38', 'CAR-1765529318070-A6FULYUWG', 'website', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `car_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `subcategory_id` int NOT NULL,
  `brand` varchar(100) NOT NULL COMMENT 'e.g., Toyota, Honda, BMW',
  `model` varchar(100) NOT NULL COMMENT 'e.g., Camry, Civic, X5',
  `year` year NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `seat_capacity` int NOT NULL,
  `transmission` enum('automatic','manual') DEFAULT 'automatic',
  `fuel_type` enum('petrol','diesel','electric','hybrid') DEFAULT 'petrol',
  `mileage` int DEFAULT NULL COMMENT 'Current mileage of the car',
  `daily_rate` decimal(10,2) NOT NULL,
  `weekly_rate` decimal(10,2) DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL,
  `security_deposit` decimal(10,2) DEFAULT '0.00',
  `is_available` tinyint(1) DEFAULT '1',
  `location` varchar(255) DEFAULT NULL COMMENT 'Where the car is located',
  `description` text,
  `features` longtext COMMENT 'JSON array of features: AC, GPS, Bluetooth, etc.',
  `images` longtext COMMENT 'JSON array of image URLs',
  `status` enum('active','maintenance','sold','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`car_id`, `vendor_id`, `subcategory_id`, `brand`, `model`, `year`, `license_plate`, `color`, `seat_capacity`, `transmission`, `fuel_type`, `mileage`, `daily_rate`, `weekly_rate`, `monthly_rate`, `security_deposit`, `is_available`, `location`, `description`, `features`, `images`, `status`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 'TOYOTA', 'Land cruiser', 2025, 'RAA123A', 'Black', 7, 'automatic', 'diesel', 300, '20000.00', '135000.00', '550000.00', '200000.00', 1, 'Kigali', 'The Toyota Land Cruiser is a powerful full-size SUV known for its durability, comfort, and legendary off-road capability. Built with a strong body-on-frame design, it performs reliably in tough terrains while still offering a smooth and refined driving experience on the road. Inside, it provides a spacious cabin with premium materials, modern infotainment features, and advanced safety technology. With its strong engine, impressive towing capacity, and long-lasting build quality, the Land Cruiser is a top choice for adventure, family travel, and professional use.', '\"[]\"', '[{\"id\":0,\"url\":\"/uploads/cars/car-1763108231840-585520597.png\",\"preview\":\"http://localhost:5000/uploads/cars/car-1763108231840-585520597.png\",\"isNew\":false},{\"id\":1,\"url\":\"/uploads/cars/car-1763108231842-944498828.png\",\"preview\":\"http://localhost:5000/uploads/cars/car-1763108231842-944498828.png\",\"isNew\":false},{\"id\":1764763475265,\"file\":{},\"preview\":\"blob:http://localhost:8080/a00db7bf-e478-4449-9073-becb98f34efb\",\"isNew\":true}]', 'active', '2025-11-14 08:17:11', '2025-12-03 12:04:36'),
(3, 2, 1, 'Mercedes-Benz', 'GLC 300', 2021, 'RAD983P', 'Black', 5, 'automatic', 'petrol', 41800, '120000.00', '750000.00', '2800000.00', '300000.00', 1, 'Kigali', '', '\"[]\"', NULL, 'active', '2025-11-19 16:43:04', '2025-11-19 16:43:04'),
(4, 1, 1, 'yotata', 'asfsadf', 2025, '2323p', 'Red', 4, 'manual', 'petrol', 98988, '299.99', '20100.00', '1212.00', '0.00', 1, 'KIgali', 'sjkasjf;sjfadf', '\"[]\"', NULL, 'active', '2025-12-15 11:21:41', '2025-12-15 11:21:53');

-- --------------------------------------------------------

--
-- Table structure for table `car_images`
--

CREATE TABLE `car_images` (
  `image_id` int NOT NULL,
  `car_id` int NOT NULL,
  `image_path` varchar(500) NOT NULL COMMENT 'Path to the uploaded image file',
  `image_type` enum('main','gallery') DEFAULT 'gallery',
  `image_order` int DEFAULT '0' COMMENT 'Order for displaying images',
  `is_primary` tinyint(1) DEFAULT '0' COMMENT '1 if this is the primary/main image',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `car_images`
--

INSERT INTO `car_images` (`image_id`, `car_id`, `image_path`, `image_type`, `image_order`, `is_primary`, `created_at`) VALUES
(3, 3, '/uploads/cars/car-1763570584913-738191778.png', 'main', 0, 1, '2025-11-19 16:43:04'),
(4, 3, '/uploads/cars/car-1763570584929-593626128.png', 'gallery', 1, 0, '2025-11-19 16:43:04'),
(5, 3, '/uploads/cars/car-1763570584939-980446198.png', 'gallery', 2, 0, '2025-11-19 16:43:04'),
(12, 2, '/uploads/travooz/cars/car-1764766446395-370967477.png', 'gallery', 1, 1, '2025-12-03 12:54:06'),
(13, 2, '/uploads/travooz/cars/car-1764766446397-100313764.png', 'gallery', 2, 0, '2025-12-03 12:54:06'),
(14, 2, '/uploads/travooz/cars/car-1764766446399-189206298.png', 'gallery', 3, 0, '2025-12-03 12:54:06'),
(15, 2, '/uploads/travooz/cars/car-1764766446400-282762454.png', 'gallery', 4, 0, '2025-12-03 12:54:06'),
(16, 4, '/uploads/cars/car-1765797701962-644685853.png', 'main', 0, 1, '2025-12-15 11:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_bookings`
--

CREATE TABLE `car_rental_bookings` (
  `booking_id` int NOT NULL,
  `car_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `vendor_id` int NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `pickup_date` datetime NOT NULL,
  `dropoff_date` datetime NOT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `dropoff_location` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT '0.00',
  `payment_status` enum('pending','paid','partial','refunded') DEFAULT 'pending',
  `booking_status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  `special_requests` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `car_rental_bookings`
--

INSERT INTO `car_rental_bookings` (`booking_id`, `car_id`, `driver_id`, `vendor_id`, `customer_name`, `customer_email`, `customer_phone`, `pickup_date`, `dropoff_date`, `pickup_location`, `dropoff_location`, `total_amount`, `deposit_amount`, `payment_status`, `booking_status`, `special_requests`, `notes`, `created_at`, `updated_at`) VALUES
(7, 2, NULL, 1, 'Alice Brown', 'alice@example.com', '+250788111222', '2024-12-25 10:00:00', '2024-12-30 18:00:00', 'Kigali Airport', 'Kigali Airport', '300000.00', '200000.00', 'pending', 'pending', 'GPS navigation required\nDriver License: DL123456', NULL, '2025-11-14 08:38:02', '2025-11-14 08:38:02'),
(31, 3, NULL, 2, 'Alice', 'alice@example.com', '+250788111222', '2025-12-25 09:00:00', '2025-12-30 17:00:00', 'Kigali Airport', 'Kigali Airport', '900000.00', '300000.00', 'pending', 'pending', 'GPS navigation required', NULL, '2025-12-11 12:04:05', '2025-12-11 12:04:05'),
(32, 2, NULL, 1, 'Alice', 'alice@example.com', '+250788111222', '2025-12-25 09:00:00', '2025-12-30 17:00:00', 'Kigali Airport', 'Kigali Airport', '300000.00', '200000.00', 'pending', 'pending', 'GPS navigation required', NULL, '2025-12-11 12:06:37', '2025-12-11 12:06:37'),
(33, 2, NULL, 1, 'Noel', 'noelimanishimwe2002@gmail.com', '+250788123456', '2025-12-20 09:00:00', '2025-12-22 17:00:00', 'Kigali Airport', 'Kigali Downtown', '240000.00', '200000.00', 'pending', 'pending', '', NULL, '2025-12-12 08:44:57', '2025-12-12 08:44:57'),
(34, 2, NULL, 1, 'Noel', 'noelimanishimwe2002@gmail.com', '+250788123456', '2026-01-20 09:00:00', '2026-01-22 17:00:00', 'Kigali Airport', 'Kigali Downtown', '240000.00', '200000.00', 'pending', 'pending', '', NULL, '2025-12-12 08:48:38', '2025-12-12 08:48:38');

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_businesses`
--

CREATE TABLE `car_rental_businesses` (
  `car_rental_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(100) DEFAULT NULL,
  `short_description` text,
  `location` varchar(255) DEFAULT NULL,
  `location_data` longtext,
  `car_type` varchar(100) DEFAULT NULL,
  `car_type_name` varchar(150) DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `description` text,
  `phone` varchar(50) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wants_notifications` varchar(10) DEFAULT 'no',
  `notification_receiver` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_listings`
--

CREATE TABLE `car_rental_listings` (
  `id` int NOT NULL,
  `car_rental_business_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `car_types` longtext,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `availability_start_date` date DEFAULT NULL,
  `availability_end_date` date DEFAULT NULL,
  `features` longtext,
  `cover_photo` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_setup_progress`
--

CREATE TABLE `car_rental_setup_progress` (
  `id` int NOT NULL,
  `car_rental_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `current_step` int DEFAULT '1',
  `status` varchar(50) DEFAULT 'in_progress',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_setup_submissions`
--

CREATE TABLE `car_rental_setup_submissions` (
  `id` int NOT NULL,
  `car_rental_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'pending_review',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `agreement_signed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_tax_info`
--

CREATE TABLE `car_rental_tax_info` (
  `id` int NOT NULL,
  `car_rental_business_id` int NOT NULL,
  `tin` varchar(100) NOT NULL,
  `legal_business_name` varchar(255) NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `documents` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_rental_users`
--

CREATE TABLE `car_rental_users` (
  `user_id` int NOT NULL,
  `role` varchar(50) DEFAULT 'vendor',
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `car_rental_users`
--

INSERT INTO `car_rental_users` (`user_id`, `role`, `name`, `email`, `phone`, `password_hash`, `created_at`) VALUES
(3, 'vendor', 'MUKUNZI jean', 'jean@gmail.com', '781796824', '$2a$10$y5Aml9jGn4e7IK0l0VSwHun./9kQyF9JReCSm3OQL8CHink5ApEpq', '2025-11-19 05:37:42');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_country_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `first_name`, `last_name`, `email`, `phone_country_code`, `phone_number`, `password_hash`, `status`, `email_verified`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Jane', 'Doe', 'jane@example.com', '+250', '789000111', '$2a$10$Iy8Y1qvaYkFG/LYiSV/Qh.EBDWEyUcMiVMNrujBSCL3s5q0E5Y2JC', 'active', 0, NULL, '2025-11-20 09:58:01', '2025-11-20 09:58:01');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_persons`
--

CREATE TABLE `delivery_persons` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `license_number` varchar(100) NOT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `address` text,
  `date_of_birth` date DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `languages` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `profile_photo` longtext,
  `documents` longtext,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `vendor_id`, `name`, `email`, `phone`, `license_number`, `license_expiry_date`, `address`, `date_of_birth`, `emergency_contact_name`, `emergency_contact_phone`, `experience_years`, `languages`, `is_available`, `status`, `profile_photo`, `documents`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'NIYOGUSHIMWA Nathanael', 'nathanaelniyogushimwa@gmail.com', '+250781796824', '2312344', '2025-11-12', 'Kigali\nMusanze, Rwanda', '2025-11-14', 'NIYOGUSHIMWA Natanael', '+250781796824', 10, 'English', 1, 'inactive', 'data:image/png;base64,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', '[]', 'sadf', '2025-11-14 05:03:57', '2025-11-14 05:03:57');

-- --------------------------------------------------------

--
-- Table structure for table `floors`
--

CREATE TABLE `floors` (
  `floor_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `floor_number` int NOT NULL,
  `floor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `total_rooms` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` varchar(36) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `image_url` text NOT NULL,
  `image_type` varchar(50) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `entity_type`, `entity_id`, `image_url`, `image_type`, `display_order`, `is_primary`, `created_at`) VALUES
('05b2ab99-f082-44b1-81c6-fab82232dee6', 'restaurant', '44e337db-0df1-4bab-b5af-96be8e9b752e', '/uploads/restaurants/galleryImages-1765514779992-783315496.png', 'gallery', 0, 1, '2025-12-12 04:46:19'),
('067d6665-447b-4bf2-92bd-b72d018a0b7e', 'restaurant', '48bc83e0-bb18-420c-9f17-c480521d1b73', '/uploads/restaurants/galleryImages-1765784701248-602360365.png', 'gallery', 1, 0, '2025-12-15 07:45:01'),
('077688b8-3ab0-4e6f-9eb7-bbf649e0b8fe', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430882912-288614818.jpeg', 'gallery', 3, 0, '2025-12-11 05:28:02'),
('09aa3bcc-a0e3-4a5c-93aa-62faf2641041', 'restaurant', '835a818c-6558-4376-ae69-b749e7760a0f', '/uploads/restaurants/logo-1765538366238-27486487.png', 'logo', 0, 1, '2025-12-12 11:19:26'),
('0a41154a-8764-455d-8d92-1707f9caad4b', 'restaurant', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', '/uploads/restaurants/galleryImages-1765785695057-331918873.png', 'gallery', 0, 0, '2025-12-15 08:01:35'),
('0a7f4336-8401-4338-937b-f98f0ab7a351', 'restaurant', '49e91646-2f62-4bee-ad33-f2424ad4cfba', '/uploads/restaurants/restaurant-1763708214172-850608235.png', 'logo', 0, 0, '2025-11-21 06:56:54'),
('0abd9dd6-fa92-4d6a-8b12-f22c0c322c22', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430410874-426077540.jpeg', 'gallery', 1, 0, '2025-12-11 05:20:10'),
('105ba910-3695-4488-ac9c-3faa42ae18f5', 'restaurant', '48bc83e0-bb18-420c-9f17-c480521d1b73', '/uploads/restaurants/galleryImages-1765784701252-339652288.png', 'gallery', 3, 0, '2025-12-15 07:45:01'),
('111e5049-c39e-429f-80aa-833f9f49fb96', 'restaurant', '0bb3fafb-0d82-4129-96ae-3f567a51ed73', '/uploads/restaurants/logo-1765429248818-440994299.jpg', 'logo', 0, 1, '2025-12-11 05:00:48'),
('137ba967-1d9d-49f5-a24b-f9fa6fc35abf', 'restaurant', '11c29e6a-6147-4dcd-ad2e-deb6582b8851', '/uploads/restaurants/galleryImages-1765788710128-551475521.png', 'gallery', 0, 0, '2025-12-15 08:51:50'),
('19eaff03-25e0-4e5b-bc2b-4bc578f3c8d6', 'restaurant', '385b15ed-9359-485a-84e7-bf3e5b917d54', '/uploads/restaurants/logo-1765788963157-401474818.png', 'logo', 0, 1, '2025-12-15 08:56:03'),
('1a817a8f-e94e-4a72-87ac-2594519723b3', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430410876-565288520.png', 'gallery', 2, 0, '2025-12-11 05:20:10'),
('1c104232-4280-4695-b95d-f57827d300f2', 'restaurant', '362de113-b6e9-43b3-b2cb-77a8ba10e5c8', '/uploads/restaurants/galleryImages-1765537678619-64007720.jpg', 'gallery', 0, 0, '2025-12-12 11:07:58'),
('2a41a3d7-9e46-44ee-b877-5ec27644cc4a', 'restaurant', '44e337db-0df1-4bab-b5af-96be8e9b752e', '/uploads/restaurants/galleryImages-1765514799328-68761558.png', 'gallery', 0, 0, '2025-12-12 04:46:39'),
('2ba60b2d-640b-4487-bb9e-27687c8c821c', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765429631828-112369667.jpeg', 'gallery', 1, 0, '2025-12-11 05:07:11'),
('334765e3-e4c3-48b8-8cc8-783cb09ac989', 'restaurant', 'aa164c63-cd8a-4a6c-91f8-6e2344a8a8be', '/uploads/restaurants/galleryImages-1765456252378-28371227.png', 'gallery', 2, 0, '2025-12-11 12:30:52'),
('344c9a9b-f1b5-4177-923e-6a4abd20978c', 'restaurant', '6e52a6cf-b70f-4ef9-9489-4a91254eccb7', '/uploads/restaurants/galleryImages-1765790331326-762396990.png', 'gallery', 0, 0, '2025-12-15 09:18:51'),
('3bef2409-8197-416d-a247-710afd89375b', 'restaurant', 'aa164c63-cd8a-4a6c-91f8-6e2344a8a8be', '/uploads/restaurants/galleryImages-1765456252378-446520217.png', 'gallery', 1, 0, '2025-12-11 12:30:52'),
('3f044b3f-2e13-4bf1-945f-6f2820b30b07', 'restaurant', 'fb48a202-1af5-4bc8-8032-9e06533d526c', '/uploads/restaurants/logo-1765527356922-235835586.png', 'logo', 0, 1, '2025-12-12 08:15:56'),
('40aa44e8-2e66-4226-afd2-0d31d1f704df', 'restaurant', '0bb3fafb-0d82-4129-96ae-3f567a51ed73', '/uploads/restaurants/galleryImages-1765429248820-326360239.jpg', 'gallery', 0, 0, '2025-12-11 05:00:48'),
('46e29f17-7d6d-45ed-bb29-6c51951785c3', 'restaurant', '646578a2-8d6d-425a-a8aa-e765303f5405', '/uploads/restaurants/galleryImages-1765431002793-519002228.jpeg', 'gallery', 0, 0, '2025-12-11 05:30:02'),
('47e34e8c-ecb4-4b0c-9f78-50c1d9ba7f39', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430882910-821107776.jpg', 'gallery', 2, 0, '2025-12-11 05:28:02'),
('4dc606b0-b400-4759-a4a5-9fe32b28c9a4', 'restaurant', '49e91646-2f62-4bee-ad33-f2424ad4cfba', '/uploads/restaurants/restaurant-1763708272521-766538263.png', 'gallery', 1, 1, '2025-11-21 06:57:52'),
('4eb92696-48c3-49b3-b619-70b628ba3d1f', 'restaurant', 'a6e3dedd-01f3-49dd-88ef-5d674c772874', '/uploads/restaurants/logo-1765524783435-803470101.png', 'logo', 0, 1, '2025-12-12 07:33:03'),
('53fcb6bd-0ec1-4e49-8ee7-cb84edf37f22', 'restaurant', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', '/uploads/restaurants/logo-1765785695055-740396482.png', 'logo', 0, 1, '2025-12-15 08:01:35'),
('54357f43-d0c3-4ac3-9116-9e83441ff75f', 'restaurant', 'aa164c63-cd8a-4a6c-91f8-6e2344a8a8be', '/uploads/restaurants/galleryImages-1765456252377-435773762.png', 'gallery', 0, 0, '2025-12-11 12:30:52'),
('56d62d3e-740a-4887-88ed-5dfd1e3e53a6', 'restaurant', '49e91646-2f62-4bee-ad33-f2424ad4cfba', '/uploads/restaurants/galleryImages-1763137123497-933714975.jpg', 'gallery', 1, 0, '2025-11-14 16:18:43'),
('645ff193-bd6c-460a-8340-2c08966ebdcf', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430391396-153594867.jpeg', 'gallery', 1, 0, '2025-12-11 05:19:51'),
('666013cf-d36f-408d-aedc-6c9dfb40d897', 'restaurant', 'c0940d1d-5ac6-4d3a-824f-36733417f299', '/uploads/restaurants/galleryImages-1765783632115-579695263.png', 'gallery', 2, 0, '2025-12-15 07:27:12'),
('6cb7e7fd-b96d-475a-9efc-9a5ef3fc8c60', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/logo-1765430882903-268697229.jpg', 'logo', 0, 1, '2025-12-11 05:28:02'),
('6d47de6e-c43f-4515-ae1c-e5d772d2715d', 'restaurant', '11c29e6a-6147-4dcd-ad2e-deb6582b8851', '/uploads/restaurants/logo-1765788710127-147237218.png', 'logo', 0, 1, '2025-12-15 08:51:50'),
('6e18de7a-ba04-4bcc-b074-0215c1528f82', 'restaurant', '305b5726-c652-4345-ae2b-1b83ff4056bb', '/uploads/restaurants/galleryImages-1765787544869-211315229.png', 'gallery', 1, 0, '2025-12-15 08:32:24'),
('6ec82aaf-4da3-48eb-87ae-f3519d3b0585', 'restaurant', '44e337db-0df1-4bab-b5af-96be8e9b752e', '/uploads/restaurants/logo-1765514799327-100682359.png', 'logo', 0, 0, '2025-12-12 04:46:39'),
('70ae3d87-d922-4126-9e62-5cf16f52cb9c', 'restaurant', '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', '/uploads/restaurants/galleryImages-1765791482152-130239412.png', 'gallery', 2, 0, '2025-12-15 09:38:02'),
('761307f6-aafb-4215-96f3-0766593910e7', 'restaurant', '0bb3fafb-0d82-4129-96ae-3f567a51ed73', '/uploads/restaurants/galleryImages-1765429248823-950155594.jpeg', 'gallery', 1, 0, '2025-12-11 05:00:48'),
('7e1150ae-8793-4319-aa76-210025efe4e7', 'restaurant', '96820e96-e6eb-4fbd-94b2-09cbb3f259a5', '/uploads/restaurants/galleryImages-1765476091617-796406089.png', 'gallery', 0, 0, '2025-12-11 18:01:31'),
('8329313a-6f7f-4474-94ea-6bc5e01853a3', 'restaurant', '305b5726-c652-4345-ae2b-1b83ff4056bb', '/uploads/restaurants/galleryImages-1765787544872-26705244.png', 'gallery', 2, 0, '2025-12-15 08:32:24'),
('8566017c-41c6-44d8-8432-a35a377fb730', 'restaurant', '305b5726-c652-4345-ae2b-1b83ff4056bb', '/uploads/restaurants/galleryImages-1765787544873-396414081.png', 'gallery', 3, 0, '2025-12-15 08:32:24'),
('85d8f167-24f2-4db3-b357-5cae474b81bd', 'restaurant', 'c0940d1d-5ac6-4d3a-824f-36733417f299', '/uploads/restaurants/galleryImages-1765783632114-310942449.png', 'gallery', 1, 0, '2025-12-15 07:27:12'),
('86a8f806-0370-4b2d-9e33-9e0adf2359d1', 'restaurant', '96820e96-e6eb-4fbd-94b2-09cbb3f259a5', '/uploads/restaurants/logo-1765476091615-765673862.png', 'logo', 0, 1, '2025-12-11 18:01:31'),
('86dd35e7-1550-466e-87b3-3a35638173e9', 'restaurant', '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', '/uploads/restaurants/galleryImages-1765791482152-697444214.png', 'gallery', 1, 0, '2025-12-15 09:38:02'),
('89c5fe06-9a53-4e69-bb36-32091d0dd622', 'restaurant', '48bc83e0-bb18-420c-9f17-c480521d1b73', '/uploads/restaurants/galleryImages-1765784701250-162805962.png', 'gallery', 2, 0, '2025-12-15 07:45:01'),
('8fd31e0c-017e-45df-97f1-f30f3a372647', 'restaurant', '305b5726-c652-4345-ae2b-1b83ff4056bb', '/uploads/restaurants/galleryImages-1765787544867-887708276.png', 'gallery', 0, 0, '2025-12-15 08:32:24'),
('95ceebcc-9974-413d-845a-ad4c59950f2b', 'restaurant', 'b4f9dce0-5782-4589-8767-c8837dba40af', '/uploads/restaurants/galleryImages-1765789403340-751155194.png', 'gallery', 0, 0, '2025-12-15 09:03:23'),
('9628e90c-b7e7-4156-aa4f-eb4a77f74f48', 'restaurant', '96820e96-e6eb-4fbd-94b2-09cbb3f259a5', '/uploads/restaurants/galleryImages-1765475727039-450817649.png', 'gallery', 0, 0, '2025-12-11 17:55:27'),
('9c4ba56b-fdbf-4b11-a45a-2f7f91705f0c', 'restaurant', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', '/uploads/restaurants/galleryImages-1765785695058-183513019.png', 'gallery', 1, 0, '2025-12-15 08:01:35'),
('9d1d97db-c2a9-4517-86fb-de20387078c8', 'restaurant', '305b5726-c652-4345-ae2b-1b83ff4056bb', '/uploads/restaurants/logo-1765787544864-296500736.png', 'logo', 0, 1, '2025-12-15 08:32:24'),
('a3c3950e-eb6d-4024-9c3b-4a50baffdc01', 'restaurant', '385b15ed-9359-485a-84e7-bf3e5b917d54', '/uploads/restaurants/galleryImages-1765788963158-470945977.png', 'gallery', 0, 0, '2025-12-15 08:56:03'),
('a4de04a6-6ee4-4b92-ac6f-dd832bf5423c', 'restaurant', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', '/uploads/restaurants/galleryImages-1765785695061-83316140.png', 'gallery', 2, 0, '2025-12-15 08:01:35'),
('a83a6e6e-a3fe-4b8c-a3ef-73c4c0d5bb16', 'restaurant', '48bc83e0-bb18-420c-9f17-c480521d1b73', '/uploads/restaurants/galleryImages-1765784701247-839547982.png', 'gallery', 0, 0, '2025-12-15 07:45:01'),
('aad12d8b-f090-41a4-902f-fd50f619f462', 'restaurant', 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', '/uploads/restaurants/galleryImages-1765664809108-995412866.png', 'gallery', 0, 0, '2025-12-13 22:26:49'),
('abafaa98-aa74-4b5d-9007-b1f762ea737c', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430882910-35592417.png', 'gallery', 1, 0, '2025-12-11 05:28:02'),
('ae913579-cbd3-4263-b5af-25f90d46270a', 'restaurant', 'fb48a202-1af5-4bc8-8032-9e06533d526c', '/uploads/restaurants/galleryImages-1765527356923-533164319.png', 'gallery', 0, 0, '2025-12-12 08:15:56'),
('b0cdd9d8-dfe3-4888-8235-43abb3ec8070', 'restaurant', 'a6e3dedd-01f3-49dd-88ef-5d674c772874', '/uploads/restaurants/galleryImages-1765524783437-96943391.png', 'gallery', 0, 0, '2025-12-12 07:33:03'),
('b5e3ce60-a5af-44bc-90ea-7b989fe21f0c', 'restaurant', '362de113-b6e9-43b3-b2cb-77a8ba10e5c8', '/uploads/restaurants/logo-1765537678618-987682492.jpg', 'logo', 0, 1, '2025-12-12 11:07:58'),
('baa14445-9c55-4eec-bd5a-af0e9c59a706', 'restaurant', '646578a2-8d6d-425a-a8aa-e765303f5405', '/uploads/restaurants/galleryImages-1765431135329-283582050.jpeg', 'gallery', 0, 0, '2025-12-11 05:32:15'),
('baf8fc07-fd93-4958-aac8-0753f0a5baf2', 'restaurant', 'b4f9dce0-5782-4589-8767-c8837dba40af', '/uploads/restaurants/logo-1765789420130-813284517.png', 'logo', 0, 1, '2025-12-15 09:03:40'),
('bcb28ee1-4152-4650-bc5f-21639868ee0f', 'restaurant', 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', '/uploads/restaurants/galleryImages-1765664809108-527382441.png', 'gallery', 1, 0, '2025-12-13 22:26:49'),
('c047cd72-dd84-40a1-8a99-14b6c6c4dabd', 'restaurant', '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', '/uploads/restaurants/galleryImages-1765791482152-800875621.png', 'gallery', 0, 0, '2025-12-15 09:38:02'),
('c476ced6-17d9-41c9-8e51-167287695d9a', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765429631823-666060214.jpg', 'gallery', 0, 0, '2025-12-11 05:07:11'),
('ce17763b-adbe-468a-bc01-fe97e0447ba9', 'restaurant', '11c29e6a-6147-4dcd-ad2e-deb6582b8851', '/uploads/restaurants/galleryImages-1765788010865-277045018.png', 'gallery', 0, 0, '2025-12-15 08:40:10'),
('ce691c2e-dc2d-486c-8f76-b8544bba2b21', 'restaurant', '835a818c-6558-4376-ae69-b749e7760a0f', '/uploads/restaurants/galleryImages-1765538366240-151762194.jpg', 'gallery', 0, 0, '2025-12-12 11:19:26'),
('ceec09d8-2ead-4ffb-8014-fef8567dad52', 'restaurant', 'c0940d1d-5ac6-4d3a-824f-36733417f299', '/uploads/restaurants/galleryImages-1765783632112-542033170.png', 'gallery', 0, 0, '2025-12-15 07:27:12'),
('d3c8018b-1c68-4961-9f7e-5b5362757139', 'restaurant', '6e52a6cf-b70f-4ef9-9489-4a91254eccb7', '/uploads/restaurants/logo-1765790449744-813687918.png', 'logo', 0, 1, '2025-12-15 09:20:49'),
('d7b938ef-016c-421c-aba2-73a8e940c4a4', 'restaurant', '646578a2-8d6d-425a-a8aa-e765303f5405', '/uploads/restaurants/galleryImages-1765431762899-502985818.png', 'gallery', 0, 0, '2025-12-11 05:42:42'),
('d7c3ae0c-7523-4ee0-9cfd-7fc0e3415eb7', 'restaurant', '646578a2-8d6d-425a-a8aa-e765303f5405', '/uploads/restaurants/galleryImages-1765430947147-570453994.jpeg', 'gallery', 0, 0, '2025-12-11 05:29:07'),
('ddd0388a-5db2-435c-98ac-20659d69eea9', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430391394-990951179.jpg', 'gallery', 0, 0, '2025-12-11 05:19:51'),
('dfea7ebf-0627-43fd-ae37-3064e68b3cc7', 'restaurant', '646578a2-8d6d-425a-a8aa-e765303f5405', '/uploads/restaurants/logo-1765431762897-79271759.png', 'logo', 0, 1, '2025-12-11 05:42:42'),
('e0eafda9-cc02-490e-8bae-7aaee3ee917f', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430882904-600103653.png', 'gallery', 0, 0, '2025-12-11 05:28:02'),
('e257c868-e2a9-48c2-b951-10108e62b5b9', 'restaurant', '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', '/uploads/restaurants/logo-1765791823355-17290383.png', 'logo', 0, 1, '2025-12-15 09:43:43'),
('e37535e5-5cdb-4dab-af8f-c6406ce61bb7', 'restaurant', 'aa155543-3100-4018-8354-7eea7b0cbdea', '/uploads/restaurants/galleryImages-1765430410873-193648964.jpg', 'gallery', 0, 0, '2025-12-11 05:20:10'),
('e707085b-6eb5-486e-9645-3c9bdb0a1ca2', 'restaurant', '48bc83e0-bb18-420c-9f17-c480521d1b73', '/uploads/restaurants/logo-1765784926989-534473177.png', 'logo', 0, 1, '2025-12-15 07:48:46'),
('e7b2ba32-d18a-47df-8ebc-1f30525c2347', 'restaurant', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', '/uploads/restaurants/galleryImages-1765785695063-145932689.png', 'gallery', 3, 0, '2025-12-15 08:01:35'),
('f068bec6-9ea6-4eb1-b8ea-5e3a7a19948c', 'restaurant', 'aa164c63-cd8a-4a6c-91f8-6e2344a8a8be', '/uploads/restaurants/logo-1765456252376-52156433.png', 'logo', 0, 1, '2025-12-11 12:30:52'),
('fd23a97a-3adc-433c-a314-ae8f1250df59', 'restaurant', 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', '/uploads/restaurants/logo-1765664809104-909233700.png', 'logo', 0, 1, '2025-12-13 22:26:49'),
('fd60b602-e1fa-4c18-bd79-c2c873211411', 'restaurant', 'c0940d1d-5ac6-4d3a-824f-36733417f299', '/uploads/restaurants/logo-1765783632110-585688094.png', 'logo', 0, 1, '2025-12-15 07:27:12');

-- --------------------------------------------------------

--
-- Table structure for table `menu_categories`
--

CREATE TABLE `menu_categories` (
  `id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `availability` varchar(50) DEFAULT 'available',
  `preparation_time` varchar(50) DEFAULT NULL,
  `portion_size` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_item_addons`
--

CREATE TABLE `menu_item_addons` (
  `id` varchar(36) NOT NULL,
  `menu_item_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_item_customizations`
--

CREATE TABLE `menu_item_customizations` (
  `id` varchar(36) NOT NULL,
  `menu_item_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `options` text,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `order_type` varchar(50) NOT NULL,
  `customer_count` int NOT NULL DEFAULT '1',
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `delivery_address` text,
  `status` varchar(50) DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `menu_item_id` varchar(36) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `addons` text,
  `customizations` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `transaction_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) DEFAULT 'RWF',
  `payment_method` enum('card','paypal','stripe','bank_transfer','cash','mobile_money','other') NOT NULL DEFAULT 'card',
  `status` enum('pending','processing','completed','failed','refunded') DEFAULT 'pending',
  `payment_gateway_id` varchar(255) DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`transaction_id`, `booking_id`, `amount`, `currency`, `payment_method`, `status`, `payment_gateway_id`, `gateway_response`, `created_at`, `updated_at`) VALUES
(1, 7, '300000.00', 'RWF', 'card', 'completed', 'gateway_123456', '{\"status\": \"success\", \"payment_method\": \"card\", \"transaction_id\": \"gateway_txn_123\"}', '2025-11-14 08:38:02', '2025-11-14 08:42:52'),
(2, 8, '0.00', 'RWF', 'card', 'completed', 'gateway_123456', '{\"status\": \"success\", \"payment_method\": \"card\", \"transaction_id\": \"gateway_txn_123\"}', '2025-11-14 11:19:22', '2025-11-14 11:53:55'),
(3, 9, '0.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-14 11:44:50', '2025-11-14 11:44:50'),
(4, 10, '400000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-14 13:04:00', '2025-11-14 13:04:00'),
(5, 21, '1500000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-17 23:39:23', '2025-11-17 23:39:23'),
(6, 22, '1500000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-17 23:41:51', '2025-11-17 23:41:51'),
(7, 28, '200000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-20 08:41:49', '2025-11-20 08:41:49'),
(8, 29, '1500000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-11-20 14:51:34', '2025-11-20 14:51:34'),
(9, 30, '300000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-12-11 11:56:03', '2025-12-11 11:56:03'),
(10, 31, '900000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-12-11 12:04:05', '2025-12-11 12:04:05'),
(11, 32, '300000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-12-11 12:06:37', '2025-12-11 12:06:37'),
(12, 33, '240000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-12-12 08:44:57', '2025-12-12 08:44:57'),
(13, 34, '240000.00', 'RWF', 'card', 'pending', NULL, NULL, '2025-12-12 08:48:38', '2025-12-12 08:48:38');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_id_int` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `business_registration_number` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_media_links` text,
  `is_24_hours` tinyint(1) DEFAULT '0',
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `restaurant_type` varchar(100) DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `average_price_range` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `capacity` int NOT NULL DEFAULT '0',
  `available_seats` int NOT NULL DEFAULT '0',
  `status` varchar(50) DEFAULT 'pending',
  `setup_completed` tinyint(1) DEFAULT '0',
  `agreement_accepted` tinyint(1) DEFAULT '0',
  `agreement_signed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wants_notifications` varchar(10) DEFAULT 'no',
  `notification_receiver` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_documents`
--

CREATE TABLE `restaurant_documents` (
  `id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_email_verifications`
--

CREATE TABLE `restaurant_email_verifications` (
  `verification_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `code_hash` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurant_email_verifications`
--

INSERT INTO `restaurant_email_verifications` (`verification_id`, `user_id`, `email`, `code`, `code_hash`, `expires_at`, `is_used`, `verified_at`, `created_at`) VALUES
(1, '3', 'nadevasolutions@gmail.com', '798820', '9b1fb13e320ad259c97b607eefae032c9323f819c5999e37945c5ac2eb89c645', '2025-12-11 19:09:03', 1, '2025-12-11 19:04:42', '2025-12-11 17:04:03'),
(2, '4', 'nadevasolutions@gmail.com', '548432', 'd11cb501a9c21496478ed689a83bb4f6a042dc8fcd30ad28277d5625b8e65f17', '2025-12-12 06:42:49', 1, '2025-12-12 06:38:01', '2025-12-12 04:37:48'),
(3, '5', 'nadevasolutions@gmail.com', '490813', '6a0e9d180006b1fb84e5419dd7c5398a9b6368058e888284344db024a2eb2aa7', '2025-12-12 06:50:48', 1, '2025-12-12 06:46:01', '2025-12-12 04:45:47'),
(4, '5', 'nathanaelniyogushimwa@gmail.com', '558637', 'c91a7f9a2124e3c69f732ad3ea5770229862df9bb06c04dfa73da45d8dd1a452', '2025-12-12 09:34:31', 1, '2025-12-12 09:29:50', '2025-12-12 07:29:30'),
(5, '6', 'nathanaelniyogushimwa@gmail.com', '822266', '8361bf2d1b0a1f4135f816c346aadd9616df8fe071a6a80f7d633e501e7cadff', '2025-12-12 10:19:53', 1, '2025-12-12 10:15:38', '2025-12-12 08:14:52'),
(6, '6', 'niyo.nathan00@gmail.com', '304716', 'f2f9a1a9dba7f102acb0908e4ae42e4508c1a375960b1ae72604b7e9c9a3a0cb', '2025-12-12 12:53:05', 1, NULL, '2025-12-12 10:48:04'),
(7, '6', 'nadevasolutions@gmail.com', '699749', '37cc64961ae562a5fd297355978c76382866d3ed4eb311268f0b82ca099a7333', '2025-12-12 13:11:31', 0, NULL, '2025-12-12 11:06:31'),
(8, '6', 'niyo.nathan00@gmail.com', '982689', 'aecca9923a37b18546ad1f8e7fed9eb27ed625a5e935d6a1dde0d3c85e01a5dd', '2025-12-12 13:11:56', 1, NULL, '2025-12-12 11:06:55'),
(9, '6', 'niyo.nathan00@gmail.com', '351492', 'a2d53b5ad75e687d19d7a2846d795aca4b96dc683d00de4ac50b3692c243db07', '2025-12-12 13:12:00', 1, '2025-12-12 13:07:23', '2025-12-12 11:06:59'),
(10, '7', 'niyo.nathan00@gmail.com', '708049', '037f74577cc66198a07cc61fc9d53e3fc0da647d6380ec64e4b0dfe1a4dda090', '2025-12-12 13:23:39', 1, '2025-12-12 13:18:53', '2025-12-12 11:18:39'),
(11, '8', 'nathanaelniyogushimwa@gmail.com', '757293', '19ad6d2ca8b3cf93c954668a749f8323dde688a3ca75c0b7c9619822dc15d113', '2025-12-12 13:28:50', 1, '2025-12-12 13:24:15', '2025-12-12 11:23:49'),
(12, '9', 'niyo.nathan00@gmail.com', '229307', 'da447624e80175524a46a9355d22b142568e8a1e754e9d76983dc71b4500f721', '2025-12-12 13:31:33', 1, '2025-12-12 13:26:40', '2025-12-12 11:26:32'),
(13, '10', 'niyo.nathan00@gmail.com', '335654', '72994c940d75a8b71905c87bdc3a0b4529c290d9363766e9ba69b15aa65ea5c1', '2025-12-14 00:30:43', 1, '2025-12-14 00:25:59', '2025-12-13 22:25:43'),
(14, '11', 'nathanaelniyogushimwa@gmail.com', '328877', 'b1fcac37f80b7954b37dd529eefbe13ea98bf5d5be9a248788f349abf2ba1825', '2025-12-15 09:15:17', 1, '2025-12-15 09:10:34', '2025-12-15 07:10:17'),
(15, '12', 'nathanaelniyogushimwa@gmail.com', '849268', 'e32b4253bd5562d3e8df6e7deec2fb11aefa84715f98a64c1dcffc7fff09085d', '2025-12-15 09:31:02', 1, '2025-12-15 09:26:17', '2025-12-15 07:26:01'),
(16, '13', 'nadevasolutions@gmail.com', '591310', '33da7e5642189a68f3273b8030a756c092e67434c4f0813dc80c13c24b84a106', '2025-12-15 09:45:36', 1, '2025-12-15 09:40:46', '2025-12-15 07:40:36'),
(17, '14', 'nathanaelniyogushimwa@gmail.com', '686326', 'c2be8e9345b0c354298d4a36ce77ff169c6ed3852d5e5caa29886e5df292eee6', '2025-12-15 10:05:54', 1, '2025-12-15 10:01:09', '2025-12-15 08:00:54'),
(18, '15', 'nathanaelniyogushimwa@gmail.com', '182683', 'dee40a95d74138434469afa88a0dbf97add6260fd570a9ec79b847ff74587e19', '2025-12-15 10:36:44', 1, '2025-12-15 10:32:02', '2025-12-15 08:31:44'),
(19, '16', 'nathanaelniyogushimwa@gmail.com', '118486', '392a7ede35786bf9df143ae2e3e07df72e4f7a91f0a29d0497a552db733d2894', '2025-12-15 10:42:31', 1, '2025-12-15 10:37:39', '2025-12-15 08:37:30'),
(20, '17', 'nathanaelniyogushimwa@gmail.com', '264936', '3ce0d366f78446f17859bd6611f9489ce3a50540182b3047734161112f2ab389', '2025-12-15 11:00:25', 1, '2025-12-15 10:55:35', '2025-12-15 08:55:25'),
(21, '18', 'nathanaelniyogushimwa@gmail.com', '685541', '7a8d3b2bd60b16df4b5abf70f03b217b10485612a866ce5c6aef9d1642e7f322', '2025-12-15 11:07:01', 1, '2025-12-15 11:02:09', '2025-12-15 09:02:01'),
(22, '19', 'nathanaelniyogushimwa@gmail.com', '951104', '163bf8ae2348bdef963b4f8447ffc1340736bfe7ff8bb65556b3d2bcfb155032', '2025-12-15 11:23:19', 1, '2025-12-15 11:18:27', '2025-12-15 09:18:19'),
(23, '20', 'nathanaelniyogushimwa@gmail.com', '321402', '3277743ea0dd929f63c1348cd7fc1d4c6a109a94bb2f7a6c6fd304a807224667', '2025-12-15 11:37:32', 1, '2025-12-15 11:32:40', '2025-12-15 09:32:31');

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_onboarding_progress_track`
--

CREATE TABLE `restaurant_onboarding_progress_track` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) DEFAULT NULL,
  `current_step` varchar(100) NOT NULL DEFAULT 'business-details',
  `step_name` varchar(255) NOT NULL DEFAULT 'Business Details',
  `step_number` int NOT NULL DEFAULT '4',
  `is_complete` tinyint(1) DEFAULT '0',
  `completed_steps` json DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurant_onboarding_progress_track`
--

INSERT INTO `restaurant_onboarding_progress_track` (`id`, `user_id`, `restaurant_id`, `current_step`, `step_name`, `step_number`, `is_complete`, `completed_steps`, `last_updated`, `created_at`) VALUES
('134850aa-d523-415f-91bd-efd095b2932f', '19', '6e52a6cf-b70f-4ef9-9489-4a91254eccb7', 'complete', 'Setup Complete', 10, 1, '[\"business-details\", \"media\", \"capacity\", \"tax-legal\", \"menu\", \"review\", \"complete\"]', '2025-12-15 09:21:31', '2025-12-15 09:18:19'),
('14908676-b0a6-4d6e-8e57-4f24f1d5842e', '20', '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 'complete', 'Setup Complete', 10, 1, '[\"business-details\", \"media\", \"capacity\", \"tax-legal\", \"menu\", \"review\", \"complete\"]', '2025-12-15 09:57:59', '2025-12-15 09:31:10'),
('381a36f3-3ac9-4848-816c-8fc5f750c9c7', '14', 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 'complete', 'Setup Complete', 11, 1, '[\"business-details\", \"media\", \"capacity\", \"tax-legal\", \"menu\", \"review\", \"complete\"]', '2025-12-15 08:02:27', '2025-12-15 08:00:54'),
('393b6de2-ffd1-4832-9443-aec7fb4b0f56', '17', '385b15ed-9359-485a-84e7-bf3e5b917d54', 'tax-legal', 'Tax & Legal', 8, 0, '[\"business-details\", \"media\", \"capacity\"]', '2025-12-15 08:56:05', '2025-12-15 08:55:25'),
('615297e0-2837-4a25-9d62-411daa840a8d', '15', '305b5726-c652-4345-ae2b-1b83ff4056bb', 'payments-pricing', 'Payments & Pricing', 6, 0, '[\"business-details\", \"media\"]', '2025-12-15 08:32:24', '2025-12-15 08:31:43'),
('66c73aaa-8196-4d4c-9f34-138a8445585c', '13', '48bc83e0-bb18-420c-9f17-c480521d1b73', 'complete', 'Setup Complete', 11, 1, '[\"business-details\", \"media\", \"capacity\", \"tax-legal\", \"menu\", \"review\", \"complete\"]', '2025-12-15 07:58:28', '2025-12-15 07:40:36'),
('b7d5521e-c886-4c1e-95a1-7fd17c8cd837', '12', 'c0940d1d-5ac6-4d3a-824f-36733417f299', 'payments-pricing', 'Payments & Pricing', 6, 0, '[\"business-details\", \"media\"]', '2025-12-15 07:27:12', '2025-12-15 07:26:01'),
('c4bd9fac-a65d-4332-8708-911420691859', '16', '11c29e6a-6147-4dcd-ad2e-deb6582b8851', 'menu', 'Menu Setup', 9, 0, '[\"business-details\", \"media\", \"capacity\", \"tax-legal\"]', '2025-12-15 08:51:59', '2025-12-15 08:37:30'),
('ee119ea2-d92d-44a5-832c-55d64dfc2b59', '18', 'b4f9dce0-5782-4589-8767-c8837dba40af', 'media', 'Media', 5, 0, '[\"business-details\", \"media\"]', '2025-12-15 09:07:49', '2025-12-15 09:02:01');

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_orders`
--

CREATE TABLE `restaurant_orders` (
  `id` varchar(36) NOT NULL,
  `booking_id` int DEFAULT NULL COMMENT 'Reference to main bookings table',
  `restaurant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID (from restaurant_users or profiles)',
  `order_type` enum('delivery','dine_in','pickup') NOT NULL DEFAULT 'delivery',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `delivery_address` text COMMENT 'Required for delivery orders',
  `delivery_latitude` decimal(10,8) DEFAULT NULL,
  `delivery_longitude` decimal(11,8) DEFAULT NULL,
  `table_booking_id` int DEFAULT NULL COMMENT 'Reference to restaurant_table_bookings for dine-in orders',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('card','cash','mobile_money','bank_transfer') DEFAULT 'card',
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `order_status` enum('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  `delivery_boy_id` int DEFAULT NULL COMMENT 'Assigned delivery boy ID from external API (no foreign key)',
  `special_instructions` text,
  `estimated_delivery_time` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_order_items`
--

CREATE TABLE `restaurant_order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `menu_item_id` varchar(36) NOT NULL,
  `item_name` varchar(255) NOT NULL COMMENT 'Snapshot of item name at time of order',
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL COMMENT 'Snapshot of price at time of order',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'quantity * unit_price',
  `addons` text COMMENT 'JSON array of selected addons',
  `customizations` text COMMENT 'JSON array of customizations',
  `special_instructions` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_schedules`
--

CREATE TABLE `restaurant_schedules` (
  `id` int UNSIGNED NOT NULL,
  `restaurant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day_of_week` tinyint NOT NULL COMMENT '0=Sunday .. 6=Saturday',
  `opens` time DEFAULT NULL,
  `closes` time DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `restaurant_schedules`
--

INSERT INTO `restaurant_schedules` (`id`, `restaurant_id`, `day_of_week`, `opens`, `closes`, `is_closed`, `created_at`, `updated_at`) VALUES
(8, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 1, '09:00:00', '22:00:00', 0, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(9, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 2, '09:00:00', '22:00:00', 0, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(10, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 3, '09:00:00', '22:00:00', 0, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(11, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 4, '09:00:00', '22:00:00', 0, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(12, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 5, '09:00:00', '23:00:00', 0, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(13, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 6, '09:00:00', '23:00:00', 1, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(14, 'f2f5a302-d481-40bb-b51b-8f8bc26b86f2', 0, '10:00:00', '21:00:00', 1, '2025-12-13 22:26:32', '2025-12-13 22:26:32'),
(15, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 1, '09:00:00', '22:00:00', 0, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(16, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 2, '09:00:00', '22:00:00', 0, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(17, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 3, '09:00:00', '22:00:00', 0, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(18, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 4, '09:00:00', '22:00:00', 0, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(19, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 5, '09:00:00', '23:00:00', 0, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(20, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 6, '09:00:00', '23:00:00', 1, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(21, 'a61941ea-c13a-4c31-812d-323f0761cc2a', 0, '10:00:00', '21:00:00', 1, '2025-12-15 07:10:54', '2025-12-15 07:10:54'),
(22, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 1, '09:00:00', '22:00:00', 0, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(23, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 2, '09:00:00', '22:00:00', 0, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(24, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 3, '09:00:00', '22:00:00', 0, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(25, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 4, '09:00:00', '22:00:00', 0, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(26, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 5, '09:00:00', '23:00:00', 0, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(27, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 6, '09:00:00', '23:00:00', 1, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(28, 'c0940d1d-5ac6-4d3a-824f-36733417f299', 0, '10:00:00', '21:00:00', 1, '2025-12-15 07:26:32', '2025-12-15 07:26:32'),
(36, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 1, '09:00:00', '22:00:00', 0, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(37, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 2, '09:00:00', '22:00:00', 0, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(38, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 3, '09:00:00', '22:00:00', 0, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(39, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 4, '09:00:00', '22:00:00', 0, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(40, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 5, '09:00:00', '23:00:00', 0, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(41, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 6, '09:00:00', '23:00:00', 1, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(42, 'a006f7d3-0c3b-4a22-9d46-c33282b41a6d', 0, '10:00:00', '21:00:00', 1, '2025-12-15 08:01:23', '2025-12-15 08:01:23'),
(43, '305b5726-c652-4345-ae2b-1b83ff4056bb', 1, '09:00:00', '22:00:00', 0, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(44, '305b5726-c652-4345-ae2b-1b83ff4056bb', 2, '09:00:00', '22:00:00', 0, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(45, '305b5726-c652-4345-ae2b-1b83ff4056bb', 3, '09:00:00', '22:00:00', 0, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(46, '305b5726-c652-4345-ae2b-1b83ff4056bb', 4, '09:00:00', '22:00:00', 0, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(47, '305b5726-c652-4345-ae2b-1b83ff4056bb', 5, '09:00:00', '23:00:00', 0, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(48, '305b5726-c652-4345-ae2b-1b83ff4056bb', 6, '09:00:00', '23:00:00', 1, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(49, '305b5726-c652-4345-ae2b-1b83ff4056bb', 0, '10:00:00', '21:00:00', 1, '2025-12-15 08:32:13', '2025-12-15 08:32:13'),
(57, '385b15ed-9359-485a-84e7-bf3e5b917d54', 1, '09:00:00', '22:00:00', 0, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(58, '385b15ed-9359-485a-84e7-bf3e5b917d54', 2, '09:00:00', '22:00:00', 0, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(59, '385b15ed-9359-485a-84e7-bf3e5b917d54', 3, '09:00:00', '22:00:00', 0, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(60, '385b15ed-9359-485a-84e7-bf3e5b917d54', 4, '09:00:00', '22:00:00', 0, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(61, '385b15ed-9359-485a-84e7-bf3e5b917d54', 5, '09:00:00', '23:00:00', 0, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(62, '385b15ed-9359-485a-84e7-bf3e5b917d54', 6, '09:00:00', '23:00:00', 1, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(63, '385b15ed-9359-485a-84e7-bf3e5b917d54', 0, '10:00:00', '21:00:00', 1, '2025-12-15 08:55:57', '2025-12-15 08:55:57'),
(113, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 0, '10:00:00', '21:00:00', 0, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(114, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 1, '09:00:00', '22:00:00', 0, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(115, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 2, '09:00:00', '22:00:00', 0, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(116, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 3, '09:00:00', '22:00:00', 0, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(117, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 4, '09:00:00', '22:00:00', 0, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(118, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 5, '09:00:00', '23:00:00', 1, '2025-12-15 09:47:55', '2025-12-15 09:47:55'),
(119, '2e63c9de-cf40-42c9-8474-bbf03a12d3fb', 6, '09:00:00', '23:00:00', 1, '2025-12-15 09:47:55', '2025-12-15 09:47:55');

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_schedule_exceptions`
--

CREATE TABLE `restaurant_schedule_exceptions` (
  `id` int UNSIGNED NOT NULL,
  `restaurant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `opens` time DEFAULT NULL,
  `closes` time DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT '0',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_setup_progress`
--

CREATE TABLE `restaurant_setup_progress` (
  `progress_id` int NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `step_1_3_complete` tinyint(1) DEFAULT '0',
  `step_4_complete` tinyint(1) DEFAULT '0',
  `step_5_complete` tinyint(1) DEFAULT '0',
  `step_6_complete` tinyint(1) DEFAULT '0',
  `step_7_complete` tinyint(1) DEFAULT '0',
  `step_8_complete` tinyint(1) DEFAULT '0',
  `step_9_complete` tinyint(1) DEFAULT '0',
  `step_10_complete` tinyint(1) DEFAULT '0',
  `step_11_complete` tinyint(1) DEFAULT '0',
  `current_step` int DEFAULT '4',
  `last_updated_step` int DEFAULT NULL,
  `step_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_table_bookings`
--

CREATE TABLE `restaurant_table_bookings` (
  `id` int NOT NULL,
  `booking_id` int DEFAULT NULL COMMENT 'Reference to main bookings table',
  `restaurant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Customer user ID (from restaurant_users or profiles)',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `number_of_guests` int NOT NULL DEFAULT '1',
  `table_number` varchar(20) DEFAULT NULL COMMENT 'Assigned table number if available',
  `status` enum('pending','confirmed','seated','completed','cancelled','no_show') DEFAULT 'pending',
  `special_requests` text,
  `arrived_at` timestamp NULL DEFAULT NULL,
  `seated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_tax_legal`
--

CREATE TABLE `restaurant_tax_legal` (
  `id` varchar(36) NOT NULL,
  `restaurant_id` varchar(36) NOT NULL,
  `tax_identification_number` varchar(100) DEFAULT NULL,
  `registered_business_name` varchar(255) DEFAULT NULL,
  `business_license_number` varchar(100) DEFAULT NULL,
  `tax_type` varchar(50) DEFAULT NULL,
  `vat_tax_rate` decimal(5,2) DEFAULT NULL,
  `prices_vat_inclusive` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_users`
--

CREATE TABLE `restaurant_users` (
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
  `status` enum('pending','confirmed','cancelled','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_onboarding_progress_track`
--

CREATE TABLE `stays_onboarding_progress_track` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `property_id` varchar(36) DEFAULT NULL,
  `current_step` varchar(100) NOT NULL DEFAULT 'policies',
  `step_name` varchar(255) NOT NULL DEFAULT 'Policies & Settings',
  `step_number` int NOT NULL DEFAULT '4',
  `is_complete` tinyint(1) DEFAULT '0',
  `completed_steps` json DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stays_onboarding_progress_track`
--

INSERT INTO `stays_onboarding_progress_track` (`id`, `user_id`, `property_id`, `current_step`, `step_name`, `step_number`, `is_complete`, `completed_steps`, `last_updated`, `created_at`) VALUES
('2d508cab-cc2f-4974-9524-9e68624c3fc0', '22', '17', 'connectivity', 'Connectivity Settings', 9, 0, '[\"policies\", \"amenities\", \"taxes\"]', '2025-12-15 06:51:57', '2025-12-15 06:26:01'),
('3d81af08-db1f-4d52-90c8-df38c5d2865c', '19', '14', 'policies', 'Policies & Settings', 4, 0, '[]', '2025-12-15 05:48:43', '2025-12-15 05:48:43'),
('5bebe267-395f-4259-803f-9b22d3508987', '21', '16', 'complete', 'Setup Complete', 12, 1, '[\"policies\", \"amenities\", \"taxes\", \"submit\", \"complete\"]', '2025-12-15 06:21:14', '2025-12-15 06:14:15'),
('9a6036f6-4544-42db-b349-e7e9bd020d50', '23', '18', 'amenities', 'Property Amenities', 5, 0, '[\"policies\"]', '2025-12-15 06:32:07', '2025-12-15 06:31:53'),
('d1abc38e-311d-47ff-99cd-2a8a2e9a0e8f', '20', '15', 'rooms', 'Rooms & Rates', 6, 0, '[\"policies\", \"amenities\"]', '2025-12-15 06:06:49', '2025-12-15 05:57:57');

-- --------------------------------------------------------

--
-- Table structure for table `stays_properties`
--

CREATE TABLE `stays_properties` (
  `property_id` int NOT NULL,
  `user_id` int NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `property_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `property_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number_of_rooms` int DEFAULT NULL,
  `legal_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel_manager` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `part_of_chain` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `booking_com_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `is_live` tinyint(1) DEFAULT '0',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `setup_complete` tinyint(1) DEFAULT '0',
  `contract_accepted` tinyint(1) DEFAULT '0',
  `contract_accepted_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wants_notifications` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `notification_receiver` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `has_front_desk` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `offer_breakfast` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `breakfast_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `offer_internet` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `offer_parking` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `has_pool` tinyint(1) DEFAULT '0',
  `pool_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_spa` tinyint(1) DEFAULT '0',
  `has_fitness_center` tinyint(1) DEFAULT '0',
  `has_restaurant` tinyint(1) DEFAULT '0',
  `has_bar` tinyint(1) DEFAULT '0',
  `has_concierge` tinyint(1) DEFAULT '0',
  `has_laundry` tinyint(1) DEFAULT '0',
  `has_business_center` tinyint(1) DEFAULT '0',
  `pets_allowed` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `themes` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_connectivity`
--

CREATE TABLE `stays_property_connectivity` (
  `connectivity_id` int NOT NULL,
  `property_id` int NOT NULL,
  `add_connectivity_provider` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `connectivity_provider_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectivity_provider_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `accept_credit_debit_cards` tinyint(1) DEFAULT '0',
  `accept_travooz_card` tinyint(1) DEFAULT '0',
  `accept_mobile_money` tinyint(1) DEFAULT '0',
  `accept_airtel_money` tinyint(1) DEFAULT '0',
  `require_deposits` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `cancellation_window` enum('24_hour','48_hour','72_hour','non_refundable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '24_hour',
  `cancellation_fee` enum('first_night_plus_tax','first_night','full_amount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'first_night_plus_tax',
  `vat_percentage` decimal(5,2) DEFAULT NULL,
  `tourism_tax_percentage` decimal(5,2) DEFAULT NULL,
  `taxes_included_in_rate` tinyint(1) DEFAULT '1',
  `request_tax_team_assistance` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_property_promotions`
--

CREATE TABLE `stays_property_promotions` (
  `promotion_id` int NOT NULL,
  `property_id` int NOT NULL,
  `promotion_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `legal_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vat_registered` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `vat_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_rooms`
--

CREATE TABLE `stays_rooms` (
  `room_id` int NOT NULL,
  `property_id` int NOT NULL,
  `room_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smoking_policy` enum('non-smoking','smoking','smoking_and_non_smoking') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'non-smoking',
  `number_of_rooms` int DEFAULT '1',
  `recommended_occupancy` int DEFAULT NULL,
  `pricing_model` enum('per-day','occupancy-based') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'per-day',
  `base_rate` decimal(10,2) DEFAULT NULL,
  `people_included` int DEFAULT '2',
  `room_status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_amenities`
--

CREATE TABLE `stays_room_amenities` (
  `room_amenity_id` int NOT NULL,
  `room_id` int NOT NULL,
  `has_kitchen` tinyint(1) DEFAULT '0',
  `kitchen_facilities` json DEFAULT NULL,
  `has_air_conditioning` tinyint(1) DEFAULT '0',
  `air_conditioning_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_view` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `room_view` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_size_sqm` decimal(10,2) DEFAULT NULL,
  `room_size_sqft` decimal(10,2) DEFAULT NULL,
  `has_balcony` tinyint(1) DEFAULT '0',
  `has_terrace` tinyint(1) DEFAULT '0',
  `has_patio` tinyint(1) DEFAULT '0',
  `desk` tinyint(1) DEFAULT '0',
  `separate_sitting_area` tinyint(1) DEFAULT '0',
  `private_spa_tub` tinyint(1) DEFAULT '0',
  `laptop_friendly_workspace` tinyint(1) DEFAULT '0',
  `separate_dining_area` tinyint(1) DEFAULT '0',
  `private_pool` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_beds`
--

CREATE TABLE `stays_room_beds` (
  `bed_id` int NOT NULL,
  `room_id` int NOT NULL,
  `bed_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_images`
--

CREATE TABLE `stays_room_images` (
  `image_id` int NOT NULL,
  `room_id` int NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `plan_type` enum('breakfast','non-refundable','package','mobile','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'breakfast',
  `rate_type` enum('increase','discount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `final_rate` decimal(10,2) DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stays_users`
--

CREATE TABLE `stays_users` (
  `user_id` int NOT NULL,
  `role` enum('admin','vendor','client') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vendor',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_logins` int DEFAULT '0',
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_bookings`
--

CREATE TABLE `tours_bookings` (
  `booking_id` int NOT NULL,
  `package_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(35) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_country_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tour_date` date NOT NULL,
  `tour_time` time DEFAULT NULL,
  `number_of_participants` int NOT NULL DEFAULT '1',
  `base_price` decimal(10,2) DEFAULT NULL,
  `addon_price` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `commission_percentage` decimal(5,2) DEFAULT NULL,
  `commission_amount` decimal(10,2) DEFAULT NULL,
  `vendor_payout` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `status` enum('pending','pending_payment','confirmed','completed','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancellation_date` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_booking_addons`
--

CREATE TABLE `tours_booking_addons` (
  `booking_addon_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `addon_id` int NOT NULL,
  `addon_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_booking_participants`
--

CREATE TABLE `tours_booking_participants` (
  `participant_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `participant_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participant_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `participant_phone` varchar(35) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `participant_age` int DEFAULT NULL,
  `participant_gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(35) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dietary_restrictions` text COLLATE utf8mb4_unicode_ci,
  `special_needs` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_businesses`
--

CREATE TABLE `tours_businesses` (
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `tour_business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tour_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_type_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_type_ids` json DEFAULT NULL,
  `tour_type_names` json DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '+250',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `status` enum('draft','pending_review','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `is_live` tinyint(1) DEFAULT '0',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `setup_complete` tinyint(1) DEFAULT '0',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wants_notifications` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `notification_receiver` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_businesses`
--

INSERT INTO `tours_businesses` (`tour_business_id`, `user_id`, `location`, `location_data`, `tour_business_name`, `tour_type`, `tour_type_name`, `tour_type_ids`, `tour_type_names`, `subcategory_id`, `description`, `phone`, `country_code`, `currency`, `status`, `is_live`, `approved_at`, `approved_by`, `rejection_reason`, `setup_complete`, `submitted_at`, `created_at`, `updated_at`, `wants_notifications`, `notification_receiver`) VALUES
(1, 1, 'kigali', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'Trust tour', '1', 'Adventure Tours', NULL, NULL, 1, 'This is our company.', '+250781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-11-14 09:55:07', '2025-11-14 09:55:07', 'no', NULL),
(3, 2, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'kadgroup.com', '4', 'City Tours', NULL, NULL, 4, 'This is inganji tour', '+250 781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-11-21 08:10:16', '2025-11-21 08:10:16', 'no', NULL),
(4, 2, 'kigali', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'INGANJI Tour', '1', 'Adventure Tours', NULL, NULL, 1, 'This is ingaji tour', '+250 781796824', '+250', 'RWF', 'approved', 1, NULL, NULL, NULL, 0, NULL, '2025-11-21 08:20:38', '2025-11-21 08:21:56', 'no', NULL),
(5, 1, 'Kigali Heights', '{\"lat\": -1.952861, \"lng\": 30.0926808, \"name\": \"Kigali Heights\", \"place_id\": \"ChIJc9PXpvOm3BkRRsL-qzwrbNo\", \"formatted_address\": \"KG 7 Ave, Kigali, Rwanda\", \"address_components\": [{\"types\": [\"route\"], \"long_name\": \"KG 7 Avenue\", \"short_name\": \"KG 7 Ave\"}, {\"types\": [\"political\", \"sublocality\", \"sublocality_level_1\"], \"long_name\": \"Nyenyeri\", \"short_name\": \"Nyenyeri\"}, {\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"administrative_area_level_2\", \"political\"], \"long_name\": \"Gasabo\", \"short_name\": \"Gasabo\"}, {\"types\": [\"administrative_area_level_1\", \"political\"], \"long_name\": \"Kigali City\", \"short_name\": \"Kigali City\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'kad', '1', 'Adventure Tours', NULL, NULL, 1, 'This is kad', '+250 781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-11-21 08:40:00', '2025-11-21 08:40:00', 'no', NULL),
(7, 3, 'Kigali Heights', '{\"lat\": -1.952861, \"lng\": 30.0926808, \"name\": \"Kigali Heights\", \"place_id\": \"ChIJc9PXpvOm3BkRRsL-qzwrbNo\", \"formatted_address\": \"KG 7 Ave, Kigali, Rwanda\", \"address_components\": [{\"types\": [\"route\"], \"long_name\": \"KG 7 Avenue\", \"short_name\": \"KG 7 Ave\"}, {\"types\": [\"political\", \"sublocality\", \"sublocality_level_1\"], \"long_name\": \"Nyenyeri\", \"short_name\": \"Nyenyeri\"}, {\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"administrative_area_level_2\", \"political\"], \"long_name\": \"Gasabo\", \"short_name\": \"Gasabo\"}, {\"types\": [\"administrative_area_level_1\", \"political\"], \"long_name\": \"Kigali City\", \"short_name\": \"Kigali City\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'NADEVA', '1', 'Adventure Tours', NULL, NULL, 1, 'This is NADEVA TOUR', '+250781796824', '+250', 'RWF', 'approved', 1, NULL, NULL, NULL, 0, NULL, '2025-11-21 09:36:22', '2025-11-21 09:38:21', 'no', NULL),
(11, 6, 'Nyarumana, Nyarugenge District, Kigali City, Rwanda', '{\"lat\": -2.0288161247628818, \"lng\": 30.058739441444267, \"name\": \"Nyarumana, Nyarugenge District, Kigali City, Rwanda\", \"place_id\": \"manual_-2.0288161247628818_30.058739441444267\", \"fallback_provider\": \"nominatim\", \"formatted_address\": \"Nyarumana, Nyarugenge District, Kigali City, Rwanda\", \"address_components\": [{\"types\": [\"village\"], \"long_name\": \"Nyarumana\", \"short_name\": \"Nyarumana\"}, {\"types\": [\"county\"], \"long_name\": \"Nyarugenge District\", \"short_name\": \"Nyarugenge District\"}, {\"types\": [\"state\"], \"long_name\": \"Kigali City\", \"short_name\": \"Kigali City\"}, {\"types\": [\"ISO3166-2-lvl4\"], \"long_name\": \"RW-01\", \"short_name\": \"RW-01\"}, {\"types\": [\"country\"], \"long_name\": \"Rwanda\", \"short_name\": \"Rwanda\"}, {\"types\": [\"country_code\"], \"long_name\": \"rw\", \"short_name\": \"rw\"}]}', 'INGANJI TOUR', '1', 'Adventure Tours', '[1, 3, 4, 2, 6, 5, 8, 7]', '[\"Adventure Tours\", \"Safari Tours\", \"City Tours\", \"Cultural Tours\", \"Wildlife Tours\", \"Nature Tours\", \"Multi-Day Tours\", \"Historical Tours\"]', 1, 'This is inganji tour', '+250781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-12-02 05:51:19', '2025-12-02 05:51:19', 'no', NULL),
(12, 6, 'DR78, Butamwa, Nyarugenge District, Kigali City, Rwanda', '{\"lat\": -1.985960743982192, \"lng\": 30.003232019974465, \"name\": \"DR78, Butamwa, Nyarugenge District, Kigali City, Rwanda\", \"place_id\": \"manual_-1.985960743982192_30.003232019974465\", \"fallback_provider\": \"nominatim\", \"formatted_address\": \"DR78, Butamwa, Nyarugenge District, Kigali City, Rwanda\", \"address_components\": [{\"types\": [\"road\"], \"long_name\": \"DR78\", \"short_name\": \"DR78\"}, {\"types\": [\"town\"], \"long_name\": \"Butamwa\", \"short_name\": \"Butamwa\"}, {\"types\": [\"county\"], \"long_name\": \"Nyarugenge District\", \"short_name\": \"Nyarugenge District\"}, {\"types\": [\"state\"], \"long_name\": \"Kigali City\", \"short_name\": \"Kigali City\"}, {\"types\": [\"ISO3166-2-lvl4\"], \"long_name\": \"RW-01\", \"short_name\": \"RW-01\"}, {\"types\": [\"country\"], \"long_name\": \"Rwanda\", \"short_name\": \"Rwanda\"}, {\"types\": [\"country_code\"], \"long_name\": \"rw\", \"short_name\": \"rw\"}]}', 'UMUTAMENWA Tour', '1', 'Adventure Tours', '[1, 3, 4, 2, 5, 6, 7, 8]', '[\"Adventure Tours\", \"Safari Tours\", \"City Tours\", \"Cultural Tours\", \"Nature Tours\", \"Wildlife Tours\", \"Historical Tours\", \"Multi-Day Tours\"]', 1, 'This is umutamwnwa  tour', '+250781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-12-02 06:13:57', '2025-12-02 06:13:57', 'no', NULL),
(13, 2, 'Nyamirambo, Kigali, Nyarugenge District, Kigali City, Rwanda', '{\"lat\": -1.9645875417615888, \"lng\": 30.048720052774573, \"name\": \"Nyamirambo, Kigali, Nyarugenge District, Kigali City, Rwanda\", \"place_id\": \"manual_-1.9645875417615886_30.048720052774573\", \"fallback_provider\": \"nominatim\", \"formatted_address\": \"Nyamirambo, Kigali, Nyarugenge District, Kigali City, Rwanda\", \"address_components\": [{\"types\": [\"suburb\"], \"long_name\": \"Nyamirambo\", \"short_name\": \"Nyamirambo\"}, {\"types\": [\"city\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"county\"], \"long_name\": \"Nyarugenge District\", \"short_name\": \"Nyarugenge District\"}, {\"types\": [\"state\"], \"long_name\": \"Kigali City\", \"short_name\": \"Kigali City\"}, {\"types\": [\"ISO3166-2-lvl4\"], \"long_name\": \"RW-01\", \"short_name\": \"RW-01\"}, {\"types\": [\"country\"], \"long_name\": \"Rwanda\", \"short_name\": \"Rwanda\"}, {\"types\": [\"country_code\"], \"long_name\": \"rw\", \"short_name\": \"rw\"}]}', 'UMUMENA Tour', '3', 'Safari Tours', '[3, 1, 2, 4, 6, 5, 8, 7, 9]', '[\"Safari Tours\", \"Adventure Tours\", \"Cultural Tours\", \"City Tours\", \"Wildlife Tours\", \"Nature Tours\", \"Multi-Day Tours\", \"Historical Tours\", \"village visit\"]', 3, 'This is umumena tour', '+250781796824', '+250', 'RWF', 'draft', 0, NULL, NULL, NULL, 0, NULL, '2025-12-09 01:23:20', '2025-12-09 01:23:20', 'no', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tours_business_owner_info`
--

CREATE TABLE `tours_business_owner_info` (
  `owner_info_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_of_residence` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_business_owner_info`
--

INSERT INTO `tours_business_owner_info` (`owner_info_id`, `tour_business_id`, `user_id`, `first_name`, `last_name`, `country_of_residence`, `email`, `created_at`, `updated_at`) VALUES
(2, 3, 2, 'NIYOGUSHIMWA', 'Natanael', 'Rwanda', 'niyo.nathan00@gmail.com', '2025-11-21 08:17:30', '2025-11-21 08:17:30'),
(3, 4, 2, 'NIYOGUSHIMWA', 'Natanael', 'Rwanda', 'niyo.nathan00@gmail.com', '2025-11-21 08:20:41', '2025-11-21 08:20:41'),
(5, 7, 3, 'NADEVA', 'Solutions', 'Rwanda', 'nadevasolutions@gmail.com', '2025-11-21 09:37:11', '2025-11-21 09:37:11'),
(9, 11, 6, 'NIYOGUSHIMWA', 'Natanael', 'Rwanda', 'nishimwedeborah07@gmail.com', '2025-12-02 05:52:04', '2025-12-02 05:52:04'),
(11, 13, 2, 'NIYOGUSHIMWA', 'Natanael', 'Rwanda', 'nathanaelniyogushimwa@gmail.com', '2025-12-09 01:42:24', '2025-12-09 01:43:07');

-- --------------------------------------------------------

--
-- Table structure for table `tours_business_proof`
--

CREATE TABLE `tours_business_proof` (
  `business_proof_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `business_legal_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `professional_certificate_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `professional_certificate_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `professional_certificate_size` int DEFAULT NULL,
  `professional_certificate_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_business_proof`
--

INSERT INTO `tours_business_proof` (`business_proof_id`, `tour_business_id`, `user_id`, `business_legal_name`, `professional_certificate_url`, `professional_certificate_name`, `professional_certificate_size`, `professional_certificate_type`, `verified`, `verified_at`, `verified_by`, `created_at`, `updated_at`) VALUES
(2, 3, 2, 'INGANJI Tour', '/uploads/tours/certificate-1763713107970-606512796.pdf', 'certificate.pdf', 1655909, 'application/pdf', 0, NULL, NULL, '2025-11-21 08:18:12', '2025-11-21 08:18:27'),
(3, 4, 2, 'INGANJI Tour', '/uploads/tours/certificate-1763713261970-621016201.pdf', 'certificate.pdf', 1655909, 'application/pdf', 0, NULL, NULL, '2025-11-21 08:21:01', '2025-11-21 08:21:01'),
(5, 7, 3, 'NADEVA', '/uploads/tours/certificate-1763717859972-567684997.pdf', 'certificate.pdf', 1655909, 'application/pdf', 0, NULL, NULL, '2025-11-21 09:37:39', '2025-11-21 09:37:39'),
(10, 13, 2, 'UMUMENA Tour', '/uploads/tours/certificate-1765246262405-82017636.pdf', 'certificate.pdf', 1655909, 'application/pdf', 0, NULL, NULL, '2025-12-09 01:42:48', '2025-12-09 02:11:02');

-- --------------------------------------------------------

--
-- Table structure for table `tours_email_verifications`
--

CREATE TABLE `tours_email_verifications` (
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
-- Dumping data for table `tours_email_verifications`
--

INSERT INTO `tours_email_verifications` (`verification_id`, `user_id`, `email`, `code`, `code_hash`, `expires_at`, `is_used`, `verified_at`, `created_at`) VALUES
(1, 1, 'nathanaelniyogushimwa@gmail.com', '799158', '3cbb4192d060251000a14e5823a7383b4ac38ca8f8342d5e807fec7d670a63fd', '2025-11-14 10:00:07', 1, NULL, '2025-11-14 09:55:07'),
(2, 1, 'nathanaelniyogushimwa@gmail.com', '963920', '3aab88ce93af1aa6a402493c221d21bd6c6d1a25c8ad043d53c8afa04fab152f', '2025-11-14 10:00:07', 1, NULL, '2025-11-14 09:55:07'),
(3, 1, 'nathanaelniyogushimwa@gmail.com', '570335', '6f9cf3ae0c6b26d098fff75bad51d9176a2ad844ccf41a9897525cfe35cf5a76', '2025-11-14 10:03:41', 1, NULL, '2025-11-14 09:58:40'),
(4, 1, 'nathanaelniyogushimwa@gmail.com', '964880', '4b59331efe19783ca02315cf4d9b556d96a6a0e8a056aabdf5c428f64c06984e', '2025-11-14 10:08:03', 1, NULL, '2025-11-14 10:03:02'),
(5, 1, 'nathanaelniyogushimwa@gmail.com', '991916', '4850702a299c9d36acba68752c178a2b0d7b0b38c561d3c1a4f13155e1b2cbaf', '2025-11-14 10:09:50', 1, NULL, '2025-11-14 10:04:49'),
(6, 1, 'nathanaelniyogushimwa@gmail.com', '162924', '7b033e45a5fa6ebefcb3aedf5702f18b25bd259e0841f1650c502c6c18079774', '2025-11-14 10:09:50', 1, NULL, '2025-11-14 10:04:49'),
(7, 2, 'niyo.nathan00@gmail.com', '144339', 'b582b9ab1eead11e769397321ea7d95d2edc36a9f7899f63406330b7a2c80c77', '2025-11-21 08:15:17', 1, NULL, '2025-11-21 08:10:17'),
(8, 2, 'niyo.nathan00@gmail.com', '544432', '251eaa6e41d906b69d85295b6595c9ad86249ccd4f73e493487b4d2237a95331', '2025-11-21 08:21:26', 1, '2025-11-21 08:17:02', '2025-11-21 08:16:26'),
(9, 1, 'nathanaelniyogushimwa@gmail.com', '111158', 'ac460f27626ae432e642344c77f17664d166f995b2a51287a2077ca67ee92fb7', '2025-11-21 08:45:00', 0, NULL, '2025-11-21 08:40:00'),
(11, 3, 'nadevasolutions@gmail.com', '890734', '312666b5ce7ac59151151b9e5746bab51f3f6668424d8674bc7cafa63c6eb38d', '2025-11-21 09:41:23', 1, '2025-11-21 09:36:57', '2025-11-21 09:36:22'),
(12, 3, 'nadevasolutions@gmail.com', '887969', 'defd9b2946996d528236b13b2af1fd458d97ff8265f04d3aecd30e8ad2842e4f', '2025-11-26 08:53:01', 1, '2025-11-26 08:48:50', '2025-11-26 08:48:01'),
(13, 4, 'nadevasolutions@gmail.com', '388255', '42c5a4c51ba8a8e4b5b2e15ddd96a7f912b2ce8473b604bde1e1746e3dcf2699', '2025-11-26 12:34:05', 1, '2025-11-26 12:29:38', '2025-11-26 12:29:04'),
(14, 5, 'nadevasolutions@gmail.com', '958911', 'f7374d9320ff90fb3cbad9c6ce353cbf0b78ec285153de834d3b01e547620bd6', '2025-11-26 12:55:01', 1, '2025-11-26 12:50:28', '2025-11-26 12:50:01'),
(15, 6, 'nishimwedeborah07@gmail.com', '179804', '590269a2ea8a3cf888183b3bbfdf74baa4f5beb45300783e0837339222ea5eb1', '2025-12-02 05:56:19', 1, '2025-12-02 05:51:55', '2025-12-02 05:51:19'),
(16, 2, 'niyo.nathan00@gmail.com', '627884', '1c398fd5e69ce767deda8ed2a6ea78cb0ab486bd033e0d9e030dc8884592d53c', '2025-12-09 01:28:20', 1, '2025-12-09 01:24:09', '2025-12-09 01:23:20');

-- --------------------------------------------------------

--
-- Table structure for table `tours_global_commission`
--

CREATE TABLE `tours_global_commission` (
  `commission_id` int NOT NULL,
  `commission_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fixed_commission` decimal(10,2) DEFAULT NULL,
  `commission_structure` enum('percentage','fixed','hybrid') COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
  `min_commission_per_booking` decimal(10,2) DEFAULT NULL,
  `max_commission_per_booking` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `calculation_method` enum('customer_pays','vendor_pays','split') COLLATE utf8mb4_unicode_ci DEFAULT 'customer_pays',
  `effective_from` date NOT NULL DEFAULT (curdate()),
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_identity_proof`
--

CREATE TABLE `tours_identity_proof` (
  `identity_proof_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `id_country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card_photo_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_photo_size` int DEFAULT NULL,
  `id_card_photo_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_identity_proof`
--

INSERT INTO `tours_identity_proof` (`identity_proof_id`, `tour_business_id`, `user_id`, `id_country`, `id_card_photo_url`, `id_card_photo_name`, `id_card_photo_size`, `id_card_photo_type`, `verified`, `verified_at`, `verified_by`, `created_at`, `updated_at`) VALUES
(2, 3, 2, 'Rwanda', '/uploads/tours/id-card-1763713081406-802202575.jpg', 'hq720.jpg', 43000, 'image/jpeg', 0, NULL, NULL, '2025-11-21 08:18:01', '2025-11-21 08:18:01'),
(3, 4, 2, 'Rwanda', '/uploads/tours/id-card-1763713253312-888930571.png', 'Screenshot from 2025-11-20 15-52-41.png', 583365, 'image/png', 0, NULL, NULL, '2025-11-21 08:20:53', '2025-11-21 08:20:53'),
(5, 7, 3, 'Rwanda', '/uploads/tours/id-card-1763717851585-596369690.png', 'Screenshot from 2025-11-20 15-40-26.png', 10888, 'image/png', 0, NULL, NULL, '2025-11-21 09:37:31', '2025-11-21 09:37:31'),
(10, 13, 2, 'Tanzania', '/uploads/tours/id-card-1765245668413-544365592.png', 'Screenshot from 2025-12-08 22-52-50.png', 581374, 'image/png', 0, NULL, NULL, '2025-12-09 01:42:37', '2025-12-09 02:01:08');

-- --------------------------------------------------------

--
-- Table structure for table `tours_packages`
--

CREATE TABLE `tours_packages` (
  `package_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_description` text COLLATE utf8mb4_unicode_ci,
  `whats_included` text COLLATE utf8mb4_unicode_ci,
  `whats_not_included` text COLLATE utf8mb4_unicode_ci,
  `guide_type` enum('self-guided','tour-guide','host-greeter','instructor','driver') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guide_language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `food_included` tinyint(1) DEFAULT '0',
  `drinks_included` tinyint(1) DEFAULT '0',
  `show_dietary_restrictions` tinyint(1) DEFAULT '0',
  `transportation_used` tinyint(1) DEFAULT '0',
  `travel_to_different_city` tinyint(1) DEFAULT '0',
  `pet_policy` tinyint(1) DEFAULT '0',
  `pet_policy_details` text COLLATE utf8mb4_unicode_ci,
  `know_before_you_go` text COLLATE utf8mb4_unicode_ci,
  `emergency_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_country_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(35) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voucher_information` text COLLATE utf8mb4_unicode_ci,
  `option_reference_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_group_size` int DEFAULT NULL,
  `guide_materials` tinyint(1) DEFAULT '0',
  `is_private_activity` tinyint(1) DEFAULT '0',
  `skip_the_line` tinyint(1) DEFAULT '0',
  `skip_the_line_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wheelchair_accessible` tinyint(1) DEFAULT '0',
  `duration_type` enum('duration','validity') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_value` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_arrival_type` enum('self','pickup') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_type` enum('any-address','defined-locations') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_timing` enum('same-time','before-activity') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_confirmation` enum('day-before','after-selection') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_description` text COLLATE utf8mb4_unicode_ci,
  `drop_off_type` enum('same-place','different-place','no-dropoff') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_transportation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability_type` enum('time-slots','opening-hours') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pricing_type` enum('per-person','per-group') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_per_person` decimal(10,2) DEFAULT NULL,
  `status` enum('draft','pending','active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_addons`
--

CREATE TABLE `tours_package_addons` (
  `addon_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `addon_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `addon_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity_range` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_quantity` int DEFAULT NULL,
  `max_quantity` int DEFAULT NULL,
  `customer_pays` decimal(10,2) DEFAULT NULL,
  `commission_percentage` decimal(5,2) DEFAULT NULL,
  `payout` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `is_required` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_addon_tiers`
--

CREATE TABLE `tours_package_addon_tiers` (
  `tier_id` int NOT NULL,
  `addon_id` int NOT NULL,
  `quantity_range` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_quantity` int DEFAULT NULL,
  `max_quantity` int DEFAULT NULL,
  `customer_pays` decimal(10,2) DEFAULT NULL,
  `commission_percentage` decimal(5,2) DEFAULT NULL,
  `payout` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_capacity`
--

CREATE TABLE `tours_package_capacity` (
  `capacity_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `min_participants` int DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `exceptions_share_capacity` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_dietary_restrictions`
--

CREATE TABLE `tours_package_dietary_restrictions` (
  `restriction_id` int NOT NULL,
  `package_id` int NOT NULL,
  `restriction_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_exception_capacity`
--

CREATE TABLE `tours_package_exception_capacity` (
  `exception_capacity_id` int NOT NULL,
  `exception_id` int NOT NULL,
  `max_participants` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_exception_time_slots`
--

CREATE TABLE `tours_package_exception_time_slots` (
  `time_slot_id` int NOT NULL,
  `exception_id` int NOT NULL,
  `start_hour` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '08',
  `start_minute` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '00',
  `end_hour` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '18',
  `end_minute` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '00',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_guide_materials`
--

CREATE TABLE `tours_package_guide_materials` (
  `guide_material_id` int NOT NULL,
  `package_id` int NOT NULL,
  `material_type` enum('audio-guides','information-booklets') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_highlights`
--

CREATE TABLE `tours_package_highlights` (
  `highlight_id` int NOT NULL,
  `package_id` int NOT NULL,
  `highlight_text` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_languages`
--

CREATE TABLE `tours_package_languages` (
  `language_id` int NOT NULL,
  `package_id` int NOT NULL,
  `language_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_locations`
--

CREATE TABLE `tours_package_locations` (
  `location_id` int NOT NULL,
  `package_id` int NOT NULL,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formatted_address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `address_components` json DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_mandatory_items`
--

CREATE TABLE `tours_package_mandatory_items` (
  `mandatory_item_id` int NOT NULL,
  `package_id` int NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_meals`
--

CREATE TABLE `tours_package_meals` (
  `meal_id` int NOT NULL,
  `package_id` int NOT NULL,
  `meal_type` enum('breakfast','lunch','dinner','snack','brunch','tea','coffee') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meal_format` enum('food-tasting','buffet','set-menu','a-la-carte','picnic','street-food','cooking-class') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_not_allowed`
--

CREATE TABLE `tours_package_not_allowed` (
  `not_allowed_id` int NOT NULL,
  `package_id` int NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_not_suitable`
--

CREATE TABLE `tours_package_not_suitable` (
  `not_suitable_id` int NOT NULL,
  `package_id` int NOT NULL,
  `restriction_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_photos`
--

CREATE TABLE `tours_package_photos` (
  `photo_id` int NOT NULL,
  `package_id` int NOT NULL,
  `photo_url` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_size` int DEFAULT NULL,
  `photo_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_pricing_categories`
--

CREATE TABLE `tours_package_pricing_categories` (
  `pricing_category_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `category_type` enum('same-price','age-based') COLLATE utf8mb4_unicode_ci DEFAULT 'same-price',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_pricing_tiers`
--

CREATE TABLE `tours_package_pricing_tiers` (
  `tier_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `participant_range` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_participants` int DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `customer_pays` decimal(10,2) DEFAULT NULL,
  `commission_percentage` decimal(5,2) DEFAULT NULL,
  `price_per_participant` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_schedules`
--

CREATE TABLE `tours_package_schedules` (
  `schedule_id` int NOT NULL,
  `package_id` int NOT NULL,
  `schedule_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `has_end_date` tinyint(1) DEFAULT '0',
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_schedule_exceptions`
--

CREATE TABLE `tours_package_schedule_exceptions` (
  `exception_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `exception_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_tags`
--

CREATE TABLE `tours_package_tags` (
  `tag_id` int NOT NULL,
  `package_id` int NOT NULL,
  `tag_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_transportation_types`
--

CREATE TABLE `tours_package_transportation_types` (
  `transportation_id` int NOT NULL,
  `package_id` int NOT NULL,
  `transportation_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_package_weekly_schedule`
--

CREATE TABLE `tours_package_weekly_schedule` (
  `weekly_schedule_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_hour` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '08',
  `start_minute` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '00',
  `end_hour` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '18',
  `end_minute` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '00',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_reviews`
--

CREATE TABLE `tours_reviews` (
  `review_id` int NOT NULL,
  `booking_id` int DEFAULT NULL,
  `package_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `guide_rating` int DEFAULT NULL,
  `value_rating` int DEFAULT NULL,
  `experience_rating` int DEFAULT NULL,
  `verified_booking` tinyint(1) DEFAULT '1',
  `would_recommend` tinyint(1) DEFAULT NULL,
  `helpful_count` int DEFAULT '0',
  `not_helpful_count` int DEFAULT '0',
  `vendor_response` text COLLATE utf8mb4_unicode_ci,
  `vendor_responded_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected','flagged') COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `tours_review_images`
--

CREATE TABLE `tours_review_images` (
  `image_id` int NOT NULL,
  `review_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tours_setup_progress`
--

CREATE TABLE `tours_setup_progress` (
  `progress_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `step_1_complete` tinyint(1) DEFAULT '0',
  `step_2_complete` tinyint(1) DEFAULT '0',
  `step_3_complete` tinyint(1) DEFAULT '0',
  `step_4_complete` tinyint(1) DEFAULT '0',
  `step_5_complete` tinyint(1) DEFAULT '0',
  `step_6_complete` tinyint(1) DEFAULT '0',
  `current_step` int DEFAULT '1',
  `last_updated_step` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_setup_progress`
--

INSERT INTO `tours_setup_progress` (`progress_id`, `tour_business_id`, `user_id`, `step_1_complete`, `step_2_complete`, `step_3_complete`, `step_4_complete`, `step_5_complete`, `step_6_complete`, `current_step`, `last_updated_step`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 0, 0, 0, 0, 0, 0, 1, NULL, '2025-11-14 09:55:07', '2025-11-14 09:55:07'),
(3, 3, 2, 1, 1, 1, 1, 0, 0, 4, 4, '2025-11-21 08:10:17', '2025-11-21 08:18:27'),
(4, 4, 2, 0, 1, 1, 1, 0, 1, 6, 6, '2025-11-21 08:20:38', '2025-11-21 08:21:07'),
(5, 5, 1, 0, 0, 0, 0, 0, 0, 1, NULL, '2025-11-21 08:40:00', '2025-11-21 08:40:00'),
(7, 7, 3, 1, 1, 1, 1, 0, 1, 6, 6, '2025-11-21 09:36:22', '2025-11-21 09:37:44'),
(11, 11, 6, 1, 1, 0, 0, 0, 0, 2, 2, '2025-12-02 05:51:19', '2025-12-02 05:52:04'),
(13, 13, 2, 1, 1, 1, 1, 0, 0, 4, 4, '2025-12-09 01:23:20', '2025-12-09 02:11:02');

-- --------------------------------------------------------

--
-- Table structure for table `tours_setup_submissions`
--

CREATE TABLE `tours_setup_submissions` (
  `submission_id` int NOT NULL,
  `tour_business_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending_review','approved','rejected','in_progress') COLLATE utf8mb4_unicode_ci DEFAULT 'pending_review',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours_setup_submissions`
--

INSERT INTO `tours_setup_submissions` (`submission_id`, `tour_business_id`, `user_id`, `status`, `submitted_at`, `approved_at`, `approved_by`, `rejected_at`, `rejected_by`, `rejection_reason`, `notes`, `created_at`, `updated_at`) VALUES
(2, 4, 2, 'approved', '2025-11-21 08:21:07', '2025-11-21 08:21:56', 1, NULL, NULL, NULL, 'Feel free to proceed', '2025-11-21 08:21:07', '2025-11-21 08:21:56'),
(4, 7, 3, 'approved', '2025-11-21 09:37:44', '2025-11-21 09:38:21', 1, NULL, NULL, NULL, 'fell free to proceed', '2025-11-21 09:37:44', '2025-11-21 09:38:21');

-- --------------------------------------------------------

--
-- Table structure for table `tours_users`
--

CREATE TABLE `tours_users` (
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
-- Dumping data for table `tours_users`
--

INSERT INTO `tours_users` (`user_id`, `role`, `name`, `email`, `phone`, `phone_verified`, `password_hash`, `address`, `gender`, `profile_image`, `cover_image`, `is_active`, `email_verified`, `last_login`, `failed_logins`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(6, 'vendor', 'NISHIMWE Deborah', 'nishimwedeborah07@gmail.com', '+250781796824', 0, '$2a$10$2zQo7dsOKP8WNkFjq.xHtOuleHNi8b4sTB1mvC6w/DVqWEwvZxf3C', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 06:46:56', 0, NULL, NULL, '2025-12-02 05:51:19', '2025-12-02 06:46:56');

-- --------------------------------------------------------

--
-- Table structure for table `tour_package_images`
--

CREATE TABLE `tour_package_images` (
  `image_id` int NOT NULL,
  `package_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_size` int DEFAULT NULL,
  `image_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `travooz_user`
--

CREATE TABLE `travooz_user` (
  `user_id` int NOT NULL,
  `role` enum('admin','super_admin','support') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `travooz_user`
--

INSERT INTO `travooz_user` (`user_id`, `role`, `name`, `email`, `phone`, `password_hash`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', 'Travooz Admin', 'admin@travooz.com', NULL, '$2a$10$UEKdZFWJ5ifbR78sWspNtuc9k8/xrhpOMkBKow0lfOZxBmNTS5uUm', 1, '2025-12-15 11:29:59', '2025-11-13 14:39:30', '2025-12-15 11:29:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_service_type` (`service_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_booking_reference` (`booking_reference`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`car_id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `idx_vendor_id` (`vendor_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `car_images`
--
ALTER TABLE `car_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_car_id` (`car_id`),
  ADD KEY `idx_is_primary` (`is_primary`);

--
-- Indexes for table `car_rental_bookings`
--
ALTER TABLE `car_rental_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_car_id` (`car_id`),
  ADD KEY `idx_driver_id` (`driver_id`),
  ADD KEY `idx_vendor_id` (`vendor_id`),
  ADD KEY `idx_booking_status` (`booking_status`),
  ADD KEY `idx_pickup_date` (`pickup_date`);

--
-- Indexes for table `car_rental_businesses`
--
ALTER TABLE `car_rental_businesses`
  ADD PRIMARY KEY (`car_rental_business_id`),
  ADD KEY `fk_car_rental_business_user` (`user_id`);

--
-- Indexes for table `car_rental_listings`
--
ALTER TABLE `car_rental_listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_car_rental_listing_business` (`car_rental_business_id`);

--
-- Indexes for table `car_rental_setup_progress`
--
ALTER TABLE `car_rental_setup_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_car_rental_progress` (`car_rental_business_id`),
  ADD KEY `fk_car_rental_progress_user` (`user_id`);

--
-- Indexes for table `car_rental_setup_submissions`
--
ALTER TABLE `car_rental_setup_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_car_rental_submission` (`car_rental_business_id`),
  ADD KEY `fk_car_rental_submission_user` (`user_id`);

--
-- Indexes for table `car_rental_tax_info`
--
ALTER TABLE `car_rental_tax_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_car_rental_tax_info` (`car_rental_business_id`);

--
-- Indexes for table `car_rental_users`
--
ALTER TABLE `car_rental_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_clients_email` (`email`),
  ADD KEY `idx_clients_phone` (`phone_country_code`,`phone_number`);

--
-- Indexes for table `delivery_persons`
--
ALTER TABLE `delivery_persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD KEY `idx_vendor_id` (`vendor_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `floors`
--
ALTER TABLE `floors`
  ADD PRIMARY KEY (`floor_id`),
  ADD UNIQUE KEY `unique_homestay_floor` (`homestay_id`,`floor_number`),
  ADD KEY `idx_homestay_id` (`homestay_id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_image_type` (`image_type`);

--
-- Indexes for table `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_availability` (`availability`);

--
-- Indexes for table `menu_item_addons`
--
ALTER TABLE `menu_item_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_item_id` (`menu_item_id`);

--
-- Indexes for table `menu_item_customizations`
--
ALTER TABLE `menu_item_customizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_item_id` (`menu_item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_restaurant` (`restaurant_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_created_at` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_menu_item_id` (`menu_item_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_subcategory_id` (`subcategory_id`);

--
-- Indexes for table `restaurant_documents`
--
ALTER TABLE `restaurant_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_document_type` (`document_type`);

--
-- Indexes for table `restaurant_email_verifications`
--
ALTER TABLE `restaurant_email_verifications`
  ADD PRIMARY KEY (`verification_id`),
  ADD KEY `idx_user_email` (`user_id`,`email`),
  ADD KEY `idx_code_hash` (`code_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `restaurant_onboarding_progress_track`
--
ALTER TABLE `restaurant_onboarding_progress_track`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_progress` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_current_step` (`current_step`);

--
-- Indexes for table `restaurant_orders`
--
ALTER TABLE `restaurant_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_order_status` (`order_status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_delivery_boy_id` (`delivery_boy_id`),
  ADD KEY `idx_table_booking_id` (`table_booking_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `restaurant_order_items`
--
ALTER TABLE `restaurant_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_menu_item_id` (`menu_item_id`);

--
-- Indexes for table `restaurant_schedules`
--
ALTER TABLE `restaurant_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_day` (`restaurant_id`,`day_of_week`),
  ADD KEY `idx_restaurant` (`restaurant_id`);

--
-- Indexes for table `restaurant_schedule_exceptions`
--
ALTER TABLE `restaurant_schedule_exceptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_restaurant_date` (`restaurant_id`,`date`),
  ADD KEY `idx_restaurant_exception` (`restaurant_id`,`date`);

--
-- Indexes for table `restaurant_setup_progress`
--
ALTER TABLE `restaurant_setup_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD UNIQUE KEY `unique_restaurant` (`restaurant_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_current_step` (`current_step`);

--
-- Indexes for table `restaurant_table_bookings`
--
ALTER TABLE `restaurant_table_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_booking_date` (`booking_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_booking_datetime` (`booking_date`,`booking_time`);

--
-- Indexes for table `restaurant_tax_legal`
--
ALTER TABLE `restaurant_tax_legal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_tax_identification_number` (`tax_identification_number`);

--
-- Indexes for table `restaurant_users`
--
ALTER TABLE `restaurant_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

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
-- Indexes for table `stays_onboarding_progress_track`
--
ALTER TABLE `stays_onboarding_progress_track`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_progress` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_current_step` (`current_step`);

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
-- Indexes for table `tours_bookings`
--
ALTER TABLE `tours_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tour_date` (`tour_date`),
  ADD KEY `idx_booking_date` (`booking_date`);

--
-- Indexes for table `tours_booking_addons`
--
ALTER TABLE `tours_booking_addons`
  ADD PRIMARY KEY (`booking_addon_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_addon_id` (`addon_id`);

--
-- Indexes for table `tours_booking_participants`
--
ALTER TABLE `tours_booking_participants`
  ADD PRIMARY KEY (`participant_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Indexes for table `tours_businesses`
--
ALTER TABLE `tours_businesses`
  ADD PRIMARY KEY (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tour_type` (`tour_type`),
  ADD KEY `idx_setup_complete` (`setup_complete`),
  ADD KEY `idx_is_live` (`is_live`);

--
-- Indexes for table `tours_business_owner_info`
--
ALTER TABLE `tours_business_owner_info`
  ADD PRIMARY KEY (`owner_info_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `tours_business_proof`
--
ALTER TABLE `tours_business_proof`
  ADD PRIMARY KEY (`business_proof_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_verified` (`verified`);

--
-- Indexes for table `tours_email_verifications`
--
ALTER TABLE `tours_email_verifications`
  ADD PRIMARY KEY (`verification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_code_hash` (`code_hash`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_is_used` (`is_used`);

--
-- Indexes for table `tours_global_commission`
--
ALTER TABLE `tours_global_commission`
  ADD PRIMARY KEY (`commission_id`),
  ADD UNIQUE KEY `unique_active_commission` (`is_active`,`effective_from`,`effective_to`),
  ADD KEY `idx_effective_dates` (`effective_from`,`effective_to`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `tours_identity_proof`
--
ALTER TABLE `tours_identity_proof`
  ADD PRIMARY KEY (`identity_proof_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_verified` (`verified`);

--
-- Indexes for table `tours_packages`
--
ALTER TABLE `tours_packages`
  ADD PRIMARY KEY (`package_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `tours_package_addons`
--
ALTER TABLE `tours_package_addons`
  ADD PRIMARY KEY (`addon_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `tours_package_addon_tiers`
--
ALTER TABLE `tours_package_addon_tiers`
  ADD PRIMARY KEY (`tier_id`),
  ADD KEY `idx_addon_id` (`addon_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `tours_package_capacity`
--
ALTER TABLE `tours_package_capacity`
  ADD PRIMARY KEY (`capacity_id`),
  ADD UNIQUE KEY `unique_schedule_capacity` (`schedule_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`);

--
-- Indexes for table `tours_package_dietary_restrictions`
--
ALTER TABLE `tours_package_dietary_restrictions`
  ADD PRIMARY KEY (`restriction_id`),
  ADD UNIQUE KEY `unique_package_restriction` (`package_id`,`restriction_name`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_exception_capacity`
--
ALTER TABLE `tours_package_exception_capacity`
  ADD PRIMARY KEY (`exception_capacity_id`),
  ADD KEY `idx_exception_id` (`exception_id`);

--
-- Indexes for table `tours_package_exception_time_slots`
--
ALTER TABLE `tours_package_exception_time_slots`
  ADD PRIMARY KEY (`time_slot_id`),
  ADD KEY `idx_exception_id` (`exception_id`);

--
-- Indexes for table `tours_package_guide_materials`
--
ALTER TABLE `tours_package_guide_materials`
  ADD PRIMARY KEY (`guide_material_id`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_highlights`
--
ALTER TABLE `tours_package_highlights`
  ADD PRIMARY KEY (`highlight_id`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_languages`
--
ALTER TABLE `tours_package_languages`
  ADD PRIMARY KEY (`language_id`),
  ADD UNIQUE KEY `unique_package_language` (`package_id`,`language_name`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_locations`
--
ALTER TABLE `tours_package_locations`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_place_id` (`place_id`);

--
-- Indexes for table `tours_package_mandatory_items`
--
ALTER TABLE `tours_package_mandatory_items`
  ADD PRIMARY KEY (`mandatory_item_id`),
  ADD UNIQUE KEY `unique_package_mandatory_item` (`package_id`,`item_name`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_meals`
--
ALTER TABLE `tours_package_meals`
  ADD PRIMARY KEY (`meal_id`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_not_allowed`
--
ALTER TABLE `tours_package_not_allowed`
  ADD PRIMARY KEY (`not_allowed_id`),
  ADD UNIQUE KEY `unique_package_not_allowed` (`package_id`,`item_name`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_not_suitable`
--
ALTER TABLE `tours_package_not_suitable`
  ADD PRIMARY KEY (`not_suitable_id`),
  ADD UNIQUE KEY `unique_package_not_suitable` (`package_id`,`restriction_name`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_photos`
--
ALTER TABLE `tours_package_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_is_primary` (`is_primary`);

--
-- Indexes for table `tours_package_pricing_categories`
--
ALTER TABLE `tours_package_pricing_categories`
  ADD PRIMARY KEY (`pricing_category_id`),
  ADD UNIQUE KEY `unique_schedule_category` (`schedule_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`);

--
-- Indexes for table `tours_package_pricing_tiers`
--
ALTER TABLE `tours_package_pricing_tiers`
  ADD PRIMARY KEY (`tier_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `tours_package_schedules`
--
ALTER TABLE `tours_package_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`);

--
-- Indexes for table `tours_package_schedule_exceptions`
--
ALTER TABLE `tours_package_schedule_exceptions`
  ADD PRIMARY KEY (`exception_id`),
  ADD UNIQUE KEY `unique_schedule_exception` (`schedule_id`,`exception_date`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_exception_date` (`exception_date`);

--
-- Indexes for table `tours_package_tags`
--
ALTER TABLE `tours_package_tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `unique_package_tag` (`package_id`,`tag_name`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_tag_name` (`tag_name`);

--
-- Indexes for table `tours_package_transportation_types`
--
ALTER TABLE `tours_package_transportation_types`
  ADD PRIMARY KEY (`transportation_id`),
  ADD UNIQUE KEY `unique_package_transportation` (`package_id`,`transportation_type`),
  ADD KEY `idx_package_id` (`package_id`);

--
-- Indexes for table `tours_package_weekly_schedule`
--
ALTER TABLE `tours_package_weekly_schedule`
  ADD PRIMARY KEY (`weekly_schedule_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_day_of_week` (`day_of_week`);

--
-- Indexes for table `tours_reviews`
--
ALTER TABLE `tours_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `tours_review_images`
--
ALTER TABLE `tours_review_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_review_id` (`review_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `tours_setup_progress`
--
ALTER TABLE `tours_setup_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD UNIQUE KEY `unique_tour_business` (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_current_step` (`current_step`);

--
-- Indexes for table `tours_setup_submissions`
--
ALTER TABLE `tours_setup_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `idx_tour_business_id` (`tour_business_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_submitted_at` (`submitted_at`);

--
-- Indexes for table `tours_users`
--
ALTER TABLE `tours_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `tour_package_images`
--
ALTER TABLE `tour_package_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_package_id` (`package_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `travooz_user`
--
ALTER TABLE `travooz_user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `car_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `car_images`
--
ALTER TABLE `car_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `car_rental_bookings`
--
ALTER TABLE `car_rental_bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `car_rental_businesses`
--
ALTER TABLE `car_rental_businesses`
  MODIFY `car_rental_business_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `car_rental_listings`
--
ALTER TABLE `car_rental_listings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `car_rental_setup_progress`
--
ALTER TABLE `car_rental_setup_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `car_rental_setup_submissions`
--
ALTER TABLE `car_rental_setup_submissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `car_rental_tax_info`
--
ALTER TABLE `car_rental_tax_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `car_rental_users`
--
ALTER TABLE `car_rental_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `floors`
--
ALTER TABLE `floors`
  MODIFY `floor_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `transaction_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `restaurant_email_verifications`
--
ALTER TABLE `restaurant_email_verifications`
  MODIFY `verification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `restaurant_schedules`
--
ALTER TABLE `restaurant_schedules`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `restaurant_schedule_exceptions`
--
ALTER TABLE `restaurant_schedule_exceptions`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurant_setup_progress`
--
ALTER TABLE `restaurant_setup_progress`
  MODIFY `progress_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `restaurant_table_bookings`
--
ALTER TABLE `restaurant_table_bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `restaurant_users`
--
ALTER TABLE `restaurant_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `stays_bookings`
--
ALTER TABLE `stays_bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `stays_email_verifications`
--
ALTER TABLE `stays_email_verifications`
  MODIFY `verification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `stays_properties`
--
ALTER TABLE `stays_properties`
  MODIFY `property_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `stays_property_amenities`
--
ALTER TABLE `stays_property_amenities`
  MODIFY `amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `stays_property_connectivity`
--
ALTER TABLE `stays_property_connectivity`
  MODIFY `connectivity_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_images`
--
ALTER TABLE `stays_property_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `stays_property_policies`
--
ALTER TABLE `stays_property_policies`
  MODIFY `policy_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `stays_property_promotions`
--
ALTER TABLE `stays_property_promotions`
  MODIFY `promotion_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_tax_details`
--
ALTER TABLE `stays_property_tax_details`
  MODIFY `tax_detail_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stays_rooms`
--
ALTER TABLE `stays_rooms`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `stays_room_amenities`
--
ALTER TABLE `stays_room_amenities`
  MODIFY `room_amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `stays_room_beds`
--
ALTER TABLE `stays_room_beds`
  MODIFY `bed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `stays_room_images`
--
ALTER TABLE `stays_room_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `stays_room_rate_plans`
--
ALTER TABLE `stays_room_rate_plans`
  MODIFY `rate_plan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stays_users`
--
ALTER TABLE `stays_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `tours_bookings`
--
ALTER TABLE `tours_bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `tours_booking_addons`
--
ALTER TABLE `tours_booking_addons`
  MODIFY `booking_addon_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_booking_participants`
--
ALTER TABLE `tours_booking_participants`
  MODIFY `participant_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_businesses`
--
ALTER TABLE `tours_businesses`
  MODIFY `tour_business_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tours_business_owner_info`
--
ALTER TABLE `tours_business_owner_info`
  MODIFY `owner_info_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tours_business_proof`
--
ALTER TABLE `tours_business_proof`
  MODIFY `business_proof_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tours_email_verifications`
--
ALTER TABLE `tours_email_verifications`
  MODIFY `verification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tours_global_commission`
--
ALTER TABLE `tours_global_commission`
  MODIFY `commission_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_identity_proof`
--
ALTER TABLE `tours_identity_proof`
  MODIFY `identity_proof_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tours_packages`
--
ALTER TABLE `tours_packages`
  MODIFY `package_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tours_package_addons`
--
ALTER TABLE `tours_package_addons`
  MODIFY `addon_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_addon_tiers`
--
ALTER TABLE `tours_package_addon_tiers`
  MODIFY `tier_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_capacity`
--
ALTER TABLE `tours_package_capacity`
  MODIFY `capacity_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_dietary_restrictions`
--
ALTER TABLE `tours_package_dietary_restrictions`
  MODIFY `restriction_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1218;

--
-- AUTO_INCREMENT for table `tours_package_exception_capacity`
--
ALTER TABLE `tours_package_exception_capacity`
  MODIFY `exception_capacity_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_exception_time_slots`
--
ALTER TABLE `tours_package_exception_time_slots`
  MODIFY `time_slot_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_guide_materials`
--
ALTER TABLE `tours_package_guide_materials`
  MODIFY `guide_material_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_highlights`
--
ALTER TABLE `tours_package_highlights`
  MODIFY `highlight_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=999;

--
-- AUTO_INCREMENT for table `tours_package_languages`
--
ALTER TABLE `tours_package_languages`
  MODIFY `language_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=299;

--
-- AUTO_INCREMENT for table `tours_package_locations`
--
ALTER TABLE `tours_package_locations`
  MODIFY `location_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1308;

--
-- AUTO_INCREMENT for table `tours_package_mandatory_items`
--
ALTER TABLE `tours_package_mandatory_items`
  MODIFY `mandatory_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `tours_package_meals`
--
ALTER TABLE `tours_package_meals`
  MODIFY `meal_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=341;

--
-- AUTO_INCREMENT for table `tours_package_not_allowed`
--
ALTER TABLE `tours_package_not_allowed`
  MODIFY `not_allowed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=159;

--
-- AUTO_INCREMENT for table `tours_package_not_suitable`
--
ALTER TABLE `tours_package_not_suitable`
  MODIFY `not_suitable_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=346;

--
-- AUTO_INCREMENT for table `tours_package_photos`
--
ALTER TABLE `tours_package_photos`
  MODIFY `photo_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT for table `tours_package_pricing_categories`
--
ALTER TABLE `tours_package_pricing_categories`
  MODIFY `pricing_category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=456;

--
-- AUTO_INCREMENT for table `tours_package_pricing_tiers`
--
ALTER TABLE `tours_package_pricing_tiers`
  MODIFY `tier_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_schedules`
--
ALTER TABLE `tours_package_schedules`
  MODIFY `schedule_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tours_package_schedule_exceptions`
--
ALTER TABLE `tours_package_schedule_exceptions`
  MODIFY `exception_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_package_tags`
--
ALTER TABLE `tours_package_tags`
  MODIFY `tag_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2762;

--
-- AUTO_INCREMENT for table `tours_package_transportation_types`
--
ALTER TABLE `tours_package_transportation_types`
  MODIFY `transportation_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=285;

--
-- AUTO_INCREMENT for table `tours_package_weekly_schedule`
--
ALTER TABLE `tours_package_weekly_schedule`
  MODIFY `weekly_schedule_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_reviews`
--
ALTER TABLE `tours_reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_review_images`
--
ALTER TABLE `tours_review_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tours_setup_progress`
--
ALTER TABLE `tours_setup_progress`
  MODIFY `progress_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tours_setup_submissions`
--
ALTER TABLE `tours_setup_submissions`
  MODIFY `submission_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tours_users`
--
ALTER TABLE `tours_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tour_package_images`
--
ALTER TABLE `tour_package_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1341;

--
-- AUTO_INCREMENT for table `travooz_user`
--
ALTER TABLE `travooz_user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car_images`
--
ALTER TABLE `car_images`
  ADD CONSTRAINT `car_images_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_rental_businesses`
--
ALTER TABLE `car_rental_businesses`
  ADD CONSTRAINT `fk_car_rental_business_user` FOREIGN KEY (`user_id`) REFERENCES `car_rental_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_rental_listings`
--
ALTER TABLE `car_rental_listings`
  ADD CONSTRAINT `fk_car_rental_listing_business` FOREIGN KEY (`car_rental_business_id`) REFERENCES `car_rental_businesses` (`car_rental_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_rental_setup_progress`
--
ALTER TABLE `car_rental_setup_progress`
  ADD CONSTRAINT `fk_car_rental_progress_business` FOREIGN KEY (`car_rental_business_id`) REFERENCES `car_rental_businesses` (`car_rental_business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_car_rental_progress_user` FOREIGN KEY (`user_id`) REFERENCES `car_rental_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_rental_setup_submissions`
--
ALTER TABLE `car_rental_setup_submissions`
  ADD CONSTRAINT `fk_car_rental_submission_business` FOREIGN KEY (`car_rental_business_id`) REFERENCES `car_rental_businesses` (`car_rental_business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_car_rental_submission_user` FOREIGN KEY (`user_id`) REFERENCES `car_rental_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_rental_tax_info`
--
ALTER TABLE `car_rental_tax_info`
  ADD CONSTRAINT `fk_car_rental_tax_info_business` FOREIGN KEY (`car_rental_business_id`) REFERENCES `car_rental_businesses` (`car_rental_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD CONSTRAINT `menu_categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `menu_item_addons`
--
ALTER TABLE `menu_item_addons`
  ADD CONSTRAINT `menu_item_addons_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_item_customizations`
--
ALTER TABLE `menu_item_customizations`
  ADD CONSTRAINT `menu_item_customizations_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurant_documents`
--
ALTER TABLE `restaurant_documents`
  ADD CONSTRAINT `restaurant_documents_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurant_orders`
--
ALTER TABLE `restaurant_orders`
  ADD CONSTRAINT `restaurant_orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `restaurant_orders_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE SET NULL;

--
-- Constraints for table `restaurant_order_items`
--
ALTER TABLE `restaurant_order_items`
  ADD CONSTRAINT `restaurant_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `restaurant_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `restaurant_order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `restaurant_setup_progress`
--
ALTER TABLE `restaurant_setup_progress`
  ADD CONSTRAINT `restaurant_setup_progress_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurant_table_bookings`
--
ALTER TABLE `restaurant_table_bookings`
  ADD CONSTRAINT `restaurant_table_bookings_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `restaurant_table_bookings_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE SET NULL;

--
-- Constraints for table `restaurant_tax_legal`
--
ALTER TABLE `restaurant_tax_legal`
  ADD CONSTRAINT `restaurant_tax_legal_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `tours_bookings`
--
ALTER TABLE `tours_bookings`
  ADD CONSTRAINT `tours_bookings_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tours_bookings_ibfk_2` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_booking_addons`
--
ALTER TABLE `tours_booking_addons`
  ADD CONSTRAINT `tours_booking_addons_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `tours_bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_booking_participants`
--
ALTER TABLE `tours_booking_participants`
  ADD CONSTRAINT `tours_booking_participants_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `tours_bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_business_owner_info`
--
ALTER TABLE `tours_business_owner_info`
  ADD CONSTRAINT `tours_business_owner_info_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_business_proof`
--
ALTER TABLE `tours_business_proof`
  ADD CONSTRAINT `tours_business_proof_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_identity_proof`
--
ALTER TABLE `tours_identity_proof`
  ADD CONSTRAINT `tours_identity_proof_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_packages`
--
ALTER TABLE `tours_packages`
  ADD CONSTRAINT `tours_packages_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_addons`
--
ALTER TABLE `tours_package_addons`
  ADD CONSTRAINT `tours_package_addons_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_addon_tiers`
--
ALTER TABLE `tours_package_addon_tiers`
  ADD CONSTRAINT `tours_package_addon_tiers_ibfk_1` FOREIGN KEY (`addon_id`) REFERENCES `tours_package_addons` (`addon_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_capacity`
--
ALTER TABLE `tours_package_capacity`
  ADD CONSTRAINT `tours_package_capacity_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_dietary_restrictions`
--
ALTER TABLE `tours_package_dietary_restrictions`
  ADD CONSTRAINT `tours_package_dietary_restrictions_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_exception_capacity`
--
ALTER TABLE `tours_package_exception_capacity`
  ADD CONSTRAINT `tours_package_exception_capacity_ibfk_1` FOREIGN KEY (`exception_id`) REFERENCES `tours_package_schedule_exceptions` (`exception_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_exception_time_slots`
--
ALTER TABLE `tours_package_exception_time_slots`
  ADD CONSTRAINT `tours_package_exception_time_slots_ibfk_1` FOREIGN KEY (`exception_id`) REFERENCES `tours_package_schedule_exceptions` (`exception_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_guide_materials`
--
ALTER TABLE `tours_package_guide_materials`
  ADD CONSTRAINT `tours_package_guide_materials_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_highlights`
--
ALTER TABLE `tours_package_highlights`
  ADD CONSTRAINT `tours_package_highlights_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_languages`
--
ALTER TABLE `tours_package_languages`
  ADD CONSTRAINT `tours_package_languages_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_locations`
--
ALTER TABLE `tours_package_locations`
  ADD CONSTRAINT `tours_package_locations_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_mandatory_items`
--
ALTER TABLE `tours_package_mandatory_items`
  ADD CONSTRAINT `tours_package_mandatory_items_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_meals`
--
ALTER TABLE `tours_package_meals`
  ADD CONSTRAINT `tours_package_meals_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_not_allowed`
--
ALTER TABLE `tours_package_not_allowed`
  ADD CONSTRAINT `tours_package_not_allowed_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_not_suitable`
--
ALTER TABLE `tours_package_not_suitable`
  ADD CONSTRAINT `tours_package_not_suitable_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_photos`
--
ALTER TABLE `tours_package_photos`
  ADD CONSTRAINT `tours_package_photos_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_pricing_categories`
--
ALTER TABLE `tours_package_pricing_categories`
  ADD CONSTRAINT `tours_package_pricing_categories_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_pricing_tiers`
--
ALTER TABLE `tours_package_pricing_tiers`
  ADD CONSTRAINT `tours_package_pricing_tiers_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_schedules`
--
ALTER TABLE `tours_package_schedules`
  ADD CONSTRAINT `tours_package_schedules_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_schedule_exceptions`
--
ALTER TABLE `tours_package_schedule_exceptions`
  ADD CONSTRAINT `tours_package_schedule_exceptions_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_tags`
--
ALTER TABLE `tours_package_tags`
  ADD CONSTRAINT `tours_package_tags_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_transportation_types`
--
ALTER TABLE `tours_package_transportation_types`
  ADD CONSTRAINT `tours_package_transportation_types_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_package_weekly_schedule`
--
ALTER TABLE `tours_package_weekly_schedule`
  ADD CONSTRAINT `tours_package_weekly_schedule_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tours_package_schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_reviews`
--
ALTER TABLE `tours_reviews`
  ADD CONSTRAINT `tours_reviews_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tours_reviews_ibfk_2` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tours_reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `tours_bookings` (`booking_id`) ON DELETE SET NULL;

--
-- Constraints for table `tours_review_images`
--
ALTER TABLE `tours_review_images`
  ADD CONSTRAINT `tours_review_images_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `tours_reviews` (`review_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_setup_progress`
--
ALTER TABLE `tours_setup_progress`
  ADD CONSTRAINT `tours_setup_progress_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours_setup_submissions`
--
ALTER TABLE `tours_setup_submissions`
  ADD CONSTRAINT `tours_setup_submissions_ibfk_1` FOREIGN KEY (`tour_business_id`) REFERENCES `tours_businesses` (`tour_business_id`) ON DELETE CASCADE;

--
-- Constraints for table `tour_package_images`
--
ALTER TABLE `tour_package_images`
  ADD CONSTRAINT `tour_package_images_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tours_packages` (`package_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
