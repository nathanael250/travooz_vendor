-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 08, 2025 at 03:41 PM
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
('3876583b-0dee-458e-a78a-c41cdcd78c2f', 'restaurant', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '/uploads/restaurants/logo-1762563946796-132038697.jpg', 'logo', 0, 1, '2025-11-08 01:05:46'),
('86dd006e-d70f-4ea6-a5fd-82e0ff0542f5', 'restaurant', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '/uploads/restaurants/galleryImages-1762563946800-233092879.jpg', 'gallery', 1, 0, '2025-11-08 01:05:46'),
('93c224c1-160a-4841-8ce6-5f64e48d99f5', 'restaurant', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '/uploads/restaurants/galleryImages-1762563946800-814000266.jpg', 'gallery', 0, 0, '2025-11-08 01:05:46'),
('d2b2ef0e-f037-4793-befe-b63daa058b8f', 'restaurant', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '/uploads/restaurants/galleryImages-1762563946803-339408843.png', 'gallery', 2, 0, '2025-11-08 01:05:46'),
('d6303258-3dbe-42b4-b2f3-1d0c65d23e85', 'restaurant', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '/uploads/restaurants/galleryImages-1762563946805-644221519.png', 'gallery', 3, 0, '2025-11-08 01:05:46');

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

--
-- Dumping data for table `menu_categories`
--

INSERT INTO `menu_categories` (`id`, `restaurant_id`, `name`, `display_order`, `created_at`, `updated_at`) VALUES
('00124a8c-095e-4661-a26f-b1785c4e6e41', '200b8023-f3b7-41f4-bffd-dcce76d57f27', 'Desserts', 2, '2025-11-08 01:14:11', '2025-11-08 01:14:11'),
('327349d7-520b-475e-b281-a8aff0042f41', '200b8023-f3b7-41f4-bffd-dcce76d57f27', 'Starters', 0, '2025-11-08 01:14:11', '2025-11-08 01:14:11'),
('9fb7af23-209a-43da-993b-d4e9d06ada11', '200b8023-f3b7-41f4-bffd-dcce76d57f27', 'Main Courses', 1, '2025-11-08 01:14:11', '2025-11-08 01:14:11');

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

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `restaurant_id`, `category_id`, `name`, `description`, `price`, `discount`, `availability`, `preparation_time`, `portion_size`, `image_url`, `available`, `created_at`, `updated_at`) VALUES
('3072051b-74c3-4a76-b1e7-a134446c6c83', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '327349d7-520b-475e-b281-a8aff0042f41', 'Garlic Bread', 'Freshly baked bread with garlic butter and herbs', '35000.00', '0.00', 'available', '15-20 minutes', 'medium', '/uploads/restaurants/menuItemImage_item_0-1762564451408-815621919.png', 1, '2025-11-08 01:14:11', '2025-11-08 01:42:45');

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

--
-- Dumping data for table `menu_item_addons`
--

INSERT INTO `menu_item_addons` (`id`, `menu_item_id`, `name`, `price`, `display_order`, `created_at`, `updated_at`) VALUES
('485a415a-a5ea-4338-a687-39ddd7a334f2', '3072051b-74c3-4a76-b1e7-a134446c6c83', 'Extra Butter', '500.00', 1, '2025-11-08 01:14:11', '2025-11-08 01:14:11'),
('77e13c2f-203e-45b3-b400-9f9001e375db', '3072051b-74c3-4a76-b1e7-a134446c6c83', 'Extra Cheese', '500.00', 0, '2025-11-08 01:14:11', '2025-11-08 01:14:11');

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

--
-- Dumping data for table `menu_item_customizations`
--

INSERT INTO `menu_item_customizations` (`id`, `menu_item_id`, `name`, `options`, `display_order`, `created_at`, `updated_at`) VALUES
('0482cd11-005c-49cb-9428-5095bfe6a156', '3072051b-74c3-4a76-b1e7-a134446c6c83', 'Add Garlic', '[\"Yes\",\"No\"]', 1, '2025-11-08 01:14:11', '2025-11-08 01:14:11'),
('e652d85a-9053-48ac-9dcd-c858d5ed5761', '3072051b-74c3-4a76-b1e7-a134446c6c83', 'Spicy Level', '[\"Mild\",\"Medium\",\"Hot\"]', 0, '2025-11-08 01:14:11', '2025-11-08 01:14:11');

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

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `email`, `password`, `full_name`, `role`, `created_at`, `updated_at`) VALUES
('0b917457-8c34-410d-ba48-3fa57c23ee04', 'nadevasolutions@gmail.com', '$2a$10$UcLTa7L8wzeIQFVV94uz1uls12xhrwlyegQkQPqpNq6m3p4Ep7Fi2', 'NADEVA Restaurant', 'vendor', '2025-11-08 01:00:26', '2025-11-08 01:00:26');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `user_id`, `name`, `description`, `business_registration_number`, `contact_number`, `phone`, `email_address`, `website`, `social_media_links`, `is_24_hours`, `opening_time`, `closing_time`, `restaurant_type`, `subcategory_id`, `currency`, `average_price_range`, `address`, `latitude`, `longitude`, `capacity`, `available_seats`, `status`, `setup_completed`, `agreement_accepted`, `agreement_signed_at`, `created_at`, `updated_at`) VALUES
('200b8023-f3b7-41f4-bffd-dcce76d57f27', '0b917457-8c34-410d-ba48-3fa57c23ee04', 'TOMATO Restaurant', 'This is tomato restaurant', 'TOMATO Ltd', '+250781796824', NULL, 'nadevasolutions@gmail.com', 'https://www.tomatorestaurant.com', NULL, 1, NULL, NULL, 'Fine Dining', 1, 'RWF', 'budget', NULL, NULL, NULL, 30, 30, 'active', 1, 1, '2025-11-08 01:14:24', '2025-11-08 01:00:26', '2025-11-08 01:45:36');

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

--
-- Dumping data for table `restaurant_documents`
--

INSERT INTO `restaurant_documents` (`id`, `restaurant_id`, `document_type`, `document_name`, `file_path`, `file_size`, `mime_type`, `created_at`) VALUES
('9a6e753b-1c3f-48aa-9d26-91b0762dc572', '200b8023-f3b7-41f4-bffd-dcce76d57f27', 'business_license', 'document (1).pdf', '/uploads/restaurants/businessLicenseFile-1762564015678-899277697.pdf', 309860, 'application/pdf', '2025-11-08 01:06:55'),
('b050d295-1a49-46e2-9a00-d1c0f778f2d1', '200b8023-f3b7-41f4-bffd-dcce76d57f27', 'tax_certificate', 'document.pdf', '/uploads/restaurants/taxRegistrationCertificateFile-1762564015683-722247955.pdf', 308801, 'application/pdf', '2025-11-08 01:06:55');

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

--
-- Dumping data for table `restaurant_tax_legal`
--

INSERT INTO `restaurant_tax_legal` (`id`, `restaurant_id`, `tax_identification_number`, `registered_business_name`, `business_license_number`, `tax_type`, `vat_tax_rate`, `prices_vat_inclusive`, `created_at`, `updated_at`) VALUES
('4ca9cef3-5afc-4da7-b4ca-dd01baad91ea', '200b8023-f3b7-41f4-bffd-dcce76d57f27', '908182921', 'TOMATO Ltd', '2345423', 'vat', '12.00', 'inclusive', '2025-11-08 01:06:55', '2025-11-08 01:06:55');

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

--
-- Dumping data for table `stays_email_verifications`
--

INSERT INTO `stays_email_verifications` (`verification_id`, `user_id`, `email`, `code`, `code_hash`, `expires_at`, `is_used`, `verified_at`, `created_at`) VALUES
(1, 1, 'nathanaelniyogushimwa@gmail.com', '602250', 'ce4c44c58eeb9561e065df4368098ab1601435c46fd7d52687da1102a8c0b300', '2025-11-06 23:57:37', 1, '2025-11-06 23:54:44', '2025-11-06 23:52:37'),
(2, 1, 'nathanaelniyogushimwa@gmail.com', '112820', 'eb0336dd1586f9d72136aabc20c729c8243998586e5cced7aa9755650b4f653e', '2025-11-07 00:20:30', 1, '2025-11-07 00:15:46', '2025-11-07 00:15:30'),
(3, 2, 'niyo.nathan00@gmail.com', '307015', 'cc5bcd4c71c14fa1337b3e275d05423d8ee5459d0f16576e18d8dbfb9e1736fe', '2025-11-07 12:27:43', 1, '2025-11-07 12:23:45', '2025-11-07 12:22:42'),
(5, 5, 'nadevasolutions@gmail.com', '595526', 'c4bb3eb1baf3c8f9146ddfea2402b7e9f5a9eb5cbbfdbe0106fb22e3166b8b9e', '2025-11-08 11:35:23', 1, '2025-11-08 11:30:39', '2025-11-08 11:30:23');

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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_properties`
--

INSERT INTO `stays_properties` (`property_id`, `user_id`, `location`, `location_data`, `property_name`, `property_type`, `number_of_rooms`, `legal_name`, `currency`, `channel_manager`, `part_of_chain`, `booking_com_url`, `status`, `is_live`, `approved_at`, `approved_by`, `setup_complete`, `contract_accepted`, `contract_accepted_at`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'NADEVA Hotel', 'hotel', 20, 'NADEVA Hotel', 'RWF', 'no', 'no', NULL, 'pending', 0, NULL, NULL, 1, 1, '2025-11-07 00:15:51', '2025-11-07 01:25:46', '2025-11-07 00:15:30', '2025-11-07 01:25:46'),
(2, 2, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'Galaxy hotel', 'hotel', 10, 'Galaxy hotel', 'RWF', 'no', 'no', NULL, 'pending', 0, NULL, NULL, 0, 1, '2025-11-08 09:00:43', NULL, '2025-11-07 12:22:42', '2025-11-08 09:00:43'),
(4, 5, 'Kigali, Rwanda', '{\"lat\": -1.9441, \"lng\": 30.0619, \"name\": \"Kigali, Rwanda\", \"place_id\": \"demo_kigali_rwanda\", \"formatted_address\": \"Kigali, Rwanda\", \"address_components\": [{\"types\": [\"locality\", \"political\"], \"long_name\": \"Kigali\", \"short_name\": \"Kigali\"}, {\"types\": [\"country\", \"political\"], \"long_name\": \"Rwanda\", \"short_name\": \"RW\"}]}', 'Mariot Hotel', 'hotel', 100, 'Mariot hotel', 'RWF', 'no', 'no', NULL, 'pending', 0, NULL, NULL, 1, 1, '2025-11-08 11:32:33', '2025-11-08 11:42:30', '2025-11-08 11:30:23', '2025-11-08 11:42:30');

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
  `has_front_desk` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `front_desk_schedule` enum('everyday','weekdays','weekends') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `front_desk_24_hours` tinyint(1) DEFAULT '0',
  `desk_opens` time DEFAULT NULL,
  `desk_closes` time DEFAULT NULL,
  `self_check_in_available` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `guest_access_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_available` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `late_check_in_cost` enum('free','surcharge') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_charge_type` enum('percentage','amount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_check_in_amount` decimal(10,2) DEFAULT NULL,
  `advance_notice_required` tinyint(1) DEFAULT '0',
  `advance_notice_hours` int DEFAULT NULL,
  `late_check_in_different_location` tinyint(1) DEFAULT '0',
  `late_check_in_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `offer_breakfast` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `breakfast_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `offer_internet` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `wifi_in_guestrooms` tinyint(1) DEFAULT '0',
  `wifi_guestrooms_min_speed` int DEFAULT NULL,
  `wifi_in_public_areas` tinyint(1) DEFAULT '0',
  `wired_internet` tinyint(1) DEFAULT '0',
  `wired_internet_in_guestrooms` tinyint(1) DEFAULT '0',
  `offer_parking` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `self_parking` tinyint(1) DEFAULT '0',
  `valet_parking` tinyint(1) DEFAULT '0',
  `electric_car_charging` tinyint(1) DEFAULT '0',
  `parking_fee` decimal(10,2) DEFAULT NULL,
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
  `has_pet_surcharge` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `pet_surcharge_amount` decimal(10,2) DEFAULT NULL,
  `pet_surcharge_currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `pet_surcharge_unit` enum('per_pet','per_stay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'per_pet',
  `pet_surcharge_period` enum('per_night','per_stay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'per_night',
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
(1, 1, NULL, NULL, NULL, '00:00:00', 'yes', 'everyday', 1, NULL, NULL, 'no', NULL, 'yes', 'free', 'amount', NULL, 0, NULL, 0, NULL, 'yes', NULL, 'yes', 1, 7, 1, 0, 0, 'yes', 1, 1, 0, NULL, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 'no', 'no', NULL, 'USD', 'per_pet', 'per_night', 0, NULL, 0, '[]', '[]', '2025-11-07 00:21:28', '2025-11-07 00:51:45'),
(2, 4, NULL, NULL, NULL, '00:00:00', 'yes', 'everyday', 1, NULL, NULL, 'no', NULL, 'no', 'surcharge', 'amount', NULL, 0, NULL, 0, NULL, 'yes', NULL, 'yes', 1, 15, 1, 0, 0, 'yes', 1, 1, 0, NULL, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 'no', 'no', NULL, 'USD', 'per_pet', 'per_night', 0, NULL, 0, '[]', '[]', '2025-11-08 11:39:45', '2025-11-08 11:39:45');

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
  `accept_cash` tinyint(1) DEFAULT '0',
  `accept_credit_debit_cards` tinyint(1) DEFAULT '0',
  `card_types` json DEFAULT NULL,
  `installments_at_front_desk` tinyint(1) DEFAULT '0',
  `require_deposits` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `deposit_types` json DEFAULT NULL,
  `incidentals_payment_form` enum('cash_only','credit_card_only','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cash_only',
  `property_time_zone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_window` enum('24_hour','48_hour','72_hour','non_refundable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '24_hour',
  `cancellation_fee` enum('first_night_plus_tax','first_night','full_amount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'first_night_plus_tax',
  `cut_off_time` time DEFAULT '18:00:00',
  `vat_percentage` decimal(5,2) DEFAULT NULL,
  `tourism_tax_percentage` decimal(5,2) DEFAULT NULL,
  `taxes_included_in_rate` tinyint(1) DEFAULT '1',
  `request_tax_team_assistance` tinyint(1) DEFAULT '0',
  `billing_currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stays_property_policies`
--

INSERT INTO `stays_property_policies` (`policy_id`, `property_id`, `languages`, `accept_cash`, `accept_credit_debit_cards`, `card_types`, `installments_at_front_desk`, `require_deposits`, `deposit_types`, `incidentals_payment_form`, `property_time_zone`, `cancellation_window`, `cancellation_fee`, `cut_off_time`, `vat_percentage`, `tourism_tax_percentage`, `taxes_included_in_rate`, `request_tax_team_assistance`, `billing_currency`, `created_at`, `updated_at`) VALUES
(1, 1, '[\"English\", \"French\", \"Kinyarwanda\", \"Swahili\"]', 1, 1, '[\"debitCards\", \"jcb\", \"visa\"]', 1, 'no', '[]', 'cash_only', '(GMT+03:00) Nairobi', '24_hour', 'first_night_plus_tax', '18:00:00', '18.00', '3.00', 0, 1, 'RWF', '2025-11-07 00:17:07', '2025-11-07 00:51:02'),
(2, 4, '[\"English\", \"French\", \"Kinyarwanda\"]', 1, 1, '[\"visa\", \"mastercard\", \"americanExpress\"]', 0, 'no', '[]', 'cash_only', '(GMT+03:00) Nairobi', '24_hour', 'full_amount', '18:00:00', '18.00', '3.00', 1, 1, 'RWF', '2025-11-08 11:38:15', '2025-11-08 11:38:15');

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

--
-- Dumping data for table `stays_property_tax_details`
--

INSERT INTO `stays_property_tax_details` (`tax_detail_id`, `property_id`, `legal_name`, `vat_registered`, `vat_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'NADEVA Hotel', 'no', NULL, '2025-11-07 00:29:56', '2025-11-07 01:25:40'),
(2, 4, 'Mariot hotel', 'no', NULL, '2025-11-08 11:42:23', '2025-11-08 11:42:23');

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

--
-- Dumping data for table `stays_rooms`
--

INSERT INTO `stays_rooms` (`room_id`, `property_id`, `room_name`, `room_type`, `room_class`, `smoking_policy`, `number_of_rooms`, `recommended_occupancy`, `pricing_model`, `base_rate`, `people_included`, `room_status`, `created_at`, `updated_at`) VALUES
(7, 1, 'Single Room, Garden view, Standard', 'Single Room', 'Standard', 'non-smoking', 10, 1, 'per-day', '300000.00', 2, 'active', '2025-11-07 01:25:32', '2025-11-07 01:25:32'),
(8, 4, 'Double or Twin Room, Garden view, Standard', 'Double or Twin Room', 'Standard', 'non-smoking', 30, 2, 'per-day', '300000.00', 2, 'active', '2025-11-08 11:41:25', '2025-11-08 11:41:25');

-- --------------------------------------------------------

--
-- Table structure for table `stays_room_amenities`
--

CREATE TABLE `stays_room_amenities` (
  `room_amenity_id` int NOT NULL,
  `room_id` int NOT NULL,
  `bathroom_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number_of_bathrooms` int DEFAULT '1',
  `bathroom_amenities` json DEFAULT NULL,
  `has_kitchen` tinyint(1) DEFAULT '0',
  `kitchen_facilities` json DEFAULT NULL,
  `has_air_conditioning` tinyint(1) DEFAULT '0',
  `has_heating` tinyint(1) DEFAULT '0',
  `has_view` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `room_view` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
(7, 7, 'private', 1, '[]', 0, '[]', 0, 0, 'no', NULL, NULL, NULL, 0, 0, 0, '[]', '[]', '2025-11-07 01:25:32', '2025-11-07 01:25:32'),
(8, 8, 'private', 1, '[]', 0, '[]', 0, 0, 'no', NULL, NULL, NULL, 0, 0, 0, '[]', '[]', '2025-11-08 11:41:25', '2025-11-08 11:41:25');

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

--
-- Dumping data for table `stays_room_beds`
--

INSERT INTO `stays_room_beds` (`bed_id`, `room_id`, `bed_type`, `quantity`, `created_at`) VALUES
(7, 7, 'Single bed', 1, '2025-11-07 01:25:32'),
(8, 8, 'Single bed', 2, '2025-11-08 11:41:25');

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

--
-- Dumping data for table `stays_room_rate_plans`
--

INSERT INTO `stays_room_rate_plans` (`rate_plan_id`, `room_id`, `plan_type`, `rate_type`, `discount_type`, `amount`, `discount_value`, `final_rate`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 7, 'breakfast', 'increase', NULL, '20000.00', NULL, NULL, '', 1, '2025-11-07 01:25:32', '2025-11-07 01:25:32'),
(2, 8, 'breakfast', 'increase', NULL, '20000.00', NULL, NULL, '', 1, '2025-11-08 11:41:25', '2025-11-08 11:41:25');

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

--
-- Dumping data for table `stays_users`
--

INSERT INTO `stays_users` (`user_id`, `role`, `name`, `email`, `phone`, `phone_verified`, `password_hash`, `address`, `gender`, `profile_image`, `cover_image`, `is_active`, `email_verified`, `last_login`, `failed_logins`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'vendor', 'NIYO Nathanael', 'nathanaelniyogushimwa@gmail.com', '+250781796824', 0, '$2a$10$2Fmno6jwnyiRYumV9kcJFu/AMiVpnMnuUFY28U8Ej.vk30THYC6Le', NULL, NULL, NULL, NULL, 1, 1, NULL, 0, NULL, NULL, '2025-11-07 00:15:30', '2025-11-08 09:11:37'),
(2, 'vendor', 'NIYO Nathan', 'niyo.nathan00@gmail.com', '+250781796824', 0, '$2a$10$2Fmno6jwnyiRYumV9kcJFu/AMiVpnMnuUFY28U8Ej.vk30THYC6Le', NULL, NULL, NULL, NULL, 1, 1, NULL, 0, NULL, NULL, '2025-11-07 12:22:42', '2025-11-07 12:23:45'),
(5, 'vendor', 'NKUNDA John', 'nadevasolutions@gmail.com', '+250781796824', 0, '$2a$10$hFCMvmysjxf4M17S3iFaQeNgpCvq1xns8W9xlSdBBQL1ymOfW5e06', NULL, NULL, NULL, NULL, 1, 1, NULL, 0, NULL, NULL, '2025-11-08 11:30:23', '2025-11-08 11:30:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `delivery_persons`
--
ALTER TABLE `delivery_persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`);

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
-- Indexes for table `restaurant_tax_legal`
--
ALTER TABLE `restaurant_tax_legal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_tax_identification_number` (`tax_identification_number`);

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
  MODIFY `verification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stays_properties`
--
ALTER TABLE `stays_properties`
  MODIFY `property_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stays_property_amenities`
--
ALTER TABLE `stays_property_amenities`
  MODIFY `amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `policy_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stays_property_promotions`
--
ALTER TABLE `stays_property_promotions`
  MODIFY `promotion_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_property_tax_details`
--
ALTER TABLE `stays_property_tax_details`
  MODIFY `tax_detail_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stays_rooms`
--
ALTER TABLE `stays_rooms`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stays_room_amenities`
--
ALTER TABLE `stays_room_amenities`
  MODIFY `room_amenity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stays_room_beds`
--
ALTER TABLE `stays_room_beds`
  MODIFY `bed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stays_room_images`
--
ALTER TABLE `stays_room_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stays_room_rate_plans`
--
ALTER TABLE `stays_room_rate_plans`
  MODIFY `rate_plan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stays_users`
--
ALTER TABLE `stays_users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `restaurant_documents`
--
ALTER TABLE `restaurant_documents`
  ADD CONSTRAINT `restaurant_documents_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
