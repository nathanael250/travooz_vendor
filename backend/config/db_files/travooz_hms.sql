-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 10, 2025 at 05:45 AM
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
-- Database: `travooz_hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 6, 'CHECK_OUT', 'bookings', 1, '{\"status\": \"completed\"}', '{\"status\": \"checked_out\", \"checked_out_by\": 6, \"deposit_returned\": 0, \"additional_charges\": 0}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-22 07:48:55'),
(2, 6, 'CHECK_OUT', 'bookings', 3, '{\"status\": \"completed\"}', '{\"status\": \"checked_out\", \"checked_out_by\": 6, \"deposit_returned\": 0, \"additional_charges\": 0}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-22 07:51:23'),
(3, 6, 'CHECK_OUT', 'bookings', 2, '{\"status\": \"completed\"}', '{\"status\": \"checked_out\", \"checked_out_by\": 6, \"deposit_returned\": 0, \"additional_charges\": 0}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-23 08:42:42'),
(4, 6, 'CHECK_IN', 'bookings', 4, '{\"status\": \"confirmed\"}', '{\"status\": \"completed\", \"checked_in_by\": 6}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-23 09:36:52'),
(5, 6, 'CHECK_IN', 'bookings', 5, '{\"status\": \"confirmed\"}', '{\"status\": \"completed\", \"checked_in_by\": 6}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-23 10:07:14'),
(6, 6, 'CHECK_OUT', 'bookings', 4, '{\"status\": \"checked_in\"}', '{\"status\": \"checked_out\", \"checked_out_by\": 6, \"deposit_returned\": 0, \"additional_charges\": 0}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-27 07:23:13'),
(7, 6, 'CHECK_OUT', 'bookings', 5, '{\"status\": \"checked_in\"}', '{\"status\": \"checked_out\", \"checked_out_by\": 6, \"deposit_returned\": 0, \"additional_charges\": 0}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-27 07:42:24'),
(8, 6, 'CHECK_IN', 'bookings', 16, '{\"status\": \"confirmed\"}', '{\"status\": \"completed\", \"checked_in_by\": 6}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-27 08:54:03');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int NOT NULL,
  `service_type` enum('homestay','restaurant_table','tour_package','food_order','room','car_rental','activity') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','confirmed','completed','checked_in','checked_out','cancelled','no_show','pre_registered') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `order_status` enum('received','preparing','ready_for_pickup','out_for_delivery','delivered') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `booking_reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique booking reference code',
  `booking_source` enum('website','mobile_app','phone','email','walk_in','agent','ota') COLLATE utf8mb4_unicode_ci DEFAULT 'website',
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL COMMENT 'user_id who cancelled',
  `confirmed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `service_type`, `user_id`, `total_amount`, `status`, `payment_status`, `order_status`, `created_at`, `updated_at`, `booking_reference`, `booking_source`, `special_requests`, `cancellation_reason`, `cancelled_at`, `cancelled_by`, `confirmed_at`, `completed_at`) VALUES
(1, 'room', NULL, '6642000.00', 'checked_out', 'paid', NULL, '2025-10-21 14:34:48', '2025-10-22 07:48:55', 'TRV-57288029C42S', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-21 21:52:47', '2025-10-21 22:11:31'),
(2, 'room', NULL, '5535000.00', 'checked_out', 'paid', NULL, '2025-10-22 07:01:04', '2025-10-23 08:42:42', 'TRV-16464363SXAO', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-22 07:02:05', '2025-10-22 07:02:52'),
(3, 'room', NULL, '1845000.00', 'checked_out', 'paid', NULL, '2025-10-22 07:14:22', '2025-10-22 07:51:23', 'TRV-17262303WC9P', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-22 07:14:57', '2025-10-22 07:17:31'),
(4, 'room', NULL, '1845000.00', 'checked_out', 'paid', NULL, '2025-10-23 08:44:07', '2025-10-27 07:23:13', 'TRV-090472146F9W', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-23 08:44:45', NULL),
(5, 'room', NULL, '2214000.00', 'checked_out', 'paid', NULL, '2025-10-23 10:05:14', '2025-10-27 07:42:24', 'TRV-13914110GNRU', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-23 10:06:41', NULL),
(6, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 17:10:31', '2025-10-24 17:10:31', 'TRV-258315516QP8', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(7, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:04:16', '2025-10-24 19:04:16', 'TRV-32656801PT1U', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(8, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:09:24', '2025-10-24 19:09:24', 'TRV-32964236SXYW', 'website', 'Test booking 2', NULL, NULL, NULL, NULL, NULL),
(9, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:09:34', '2025-10-24 19:09:34', 'TRV-32974312S177', 'website', 'Test booking 3', NULL, NULL, NULL, NULL, NULL),
(10, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:12:43', '2025-10-24 19:12:43', 'TRV-33163637U6AJ', 'website', 'Final test', NULL, NULL, NULL, NULL, NULL),
(11, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:12:59', '2025-10-24 19:12:59', 'TRV-33179940IL2I', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(12, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:13:07', '2025-10-24 19:13:07', 'TRV-331873959AYU', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(13, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:13:09', '2025-10-24 19:13:09', 'TRV-33189587203B', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(14, 'room', NULL, '1845000.00', 'pending', 'pending', NULL, '2025-10-24 19:13:11', '2025-10-24 19:13:11', 'TRV-331910432UN2', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, NULL, NULL),
(15, 'room', NULL, '1230000.00', 'pending', 'pending', NULL, '2025-10-24 19:15:57', '2025-10-24 19:15:57', 'TRV-33357273H04W', 'website', 'Test available period', NULL, NULL, NULL, NULL, NULL),
(16, 'room', NULL, '1476000.00', 'checked_in', 'paid', NULL, '2025-10-27 08:51:25', '2025-10-27 08:54:03', 'TRV-55085021UW34', 'website', 'Late check-in expected around 10 PM', NULL, NULL, NULL, '2025-10-27 08:53:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_charges`
--

CREATE TABLE `booking_charges` (
  `charge_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `charge_type` enum('room','minibar','room_service','laundry','phone','parking','extra_bed','early_checkin','late_checkout','damage','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `charged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `charged_by` int DEFAULT NULL COMMENT 'staff user_id',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_charges`
--

INSERT INTO `booking_charges` (`charge_id`, `booking_id`, `charge_type`, `description`, `quantity`, `unit_price`, `total_amount`, `tax_amount`, `charged_at`, `charged_by`, `notes`) VALUES
(1, 3, 'room_service', 'HOUSEKEEPING - Test ironing service', 1, '15000.00', '15000.00', '0.00', '2025-10-23 08:23:16', 8, 'Ironing completed successfully'),
(2, 3, 'room_service', 'HOUSEKEEPING - Test laundry service for booking 3', 1, '25000.00', '25000.00', '0.00', '2025-10-23 08:37:41', 8, 'Laundry service completed successfully'),
(3, 3, 'room_service', 'HOUSEKEEPING - cleaning bags', 1, '20000.00', '20000.00', '0.00', '2025-10-23 08:40:23', 8, NULL),
(4, 5, 'room_service', 'HOUSEKEEPING - Ironing 2 shirts', 1, '20000.00', '20000.00', '0.00', '2025-10-23 10:23:56', 8, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_guests`
--

CREATE TABLE `booking_guests` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0' COMMENT 'Primary guest for the booking',
  `room_assignment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Which room unit',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_guests`
--

INSERT INTO `booking_guests` (`id`, `booking_id`, `guest_id`, `is_primary`, `room_assignment`, `created_at`) VALUES
(1, 1, 1, 1, NULL, '2025-10-21 14:34:48'),
(2, 2, 2, 1, NULL, '2025-10-22 07:01:04'),
(3, 3, 2, 1, NULL, '2025-10-22 07:14:22'),
(4, 4, 2, 1, NULL, '2025-10-23 08:44:07'),
(5, 5, 2, 1, NULL, '2025-10-23 10:05:14'),
(6, 6, 2, 1, NULL, '2025-10-24 17:10:31'),
(7, 7, 2, 1, NULL, '2025-10-24 19:04:16'),
(8, 8, 3, 1, NULL, '2025-10-24 19:09:24'),
(9, 9, 4, 1, NULL, '2025-10-24 19:09:34'),
(10, 10, 5, 1, NULL, '2025-10-24 19:12:43'),
(11, 11, 2, 1, NULL, '2025-10-24 19:12:59'),
(12, 12, 2, 1, NULL, '2025-10-24 19:13:07'),
(13, 13, 2, 1, NULL, '2025-10-24 19:13:09'),
(14, 14, 2, 1, NULL, '2025-10-24 19:13:11'),
(15, 15, 6, 1, NULL, '2025-10-24 19:15:57'),
(16, 16, 2, 1, NULL, '2025-10-27 08:51:25');

-- --------------------------------------------------------

--
-- Table structure for table `booking_modifications`
--

CREATE TABLE `booking_modifications` (
  `modification_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `modified_by` int NOT NULL COMMENT 'user_id or staff_id',
  `modification_type` enum('date_change','room_change','guest_change','cancellation','amount_change','status_change','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON of old values',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON of new values',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `check_in_logs`
--

CREATE TABLE `check_in_logs` (
  `check_in_log_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `assignment_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `key_card_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `homestay_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `check_in_logs`
--

INSERT INTO `check_in_logs` (`check_in_log_id`, `booking_id`, `assignment_id`, `inventory_id`, `staff_id`, `guest_name`, `room_number`, `check_in_time`, `key_card_number`, `notes`, `homestay_id`, `created_at`) VALUES
(2, 4, NULL, 29, 6, 'NIYOGUSHIMWA Nathanael', '102', '2025-10-23 09:36:52', NULL, NULL, 2, '2025-10-23 09:36:52'),
(3, 5, NULL, 26, 6, 'NIYOGUSHIMWA Nathanael', '109', '2025-10-23 10:07:14', NULL, NULL, 2, '2025-10-23 10:07:14'),
(4, 16, NULL, 18, 6, 'NIYOGUSHIMWA Nathanael', '101', '2025-10-27 08:54:03', NULL, NULL, 2, '2025-10-27 08:54:03');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_notes`
--

CREATE TABLE `delivery_notes` (
  `delivery_note_id` int NOT NULL,
  `delivery_number` varchar(50) NOT NULL,
  `order_id` int NOT NULL COMMENT 'Reference to stock_orders',
  `supplier_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `delivery_date` date NOT NULL,
  `received_by` int DEFAULT NULL COMMENT 'User who received the delivery',
  `delivery_status` enum('partial','complete','damaged','rejected') DEFAULT 'complete',
  `total_items_received` int DEFAULT '0',
  `total_items_expected` int DEFAULT '0',
  `delivery_notes` text,
  `condition_notes` text COMMENT 'Notes about item condition',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `delivery_notes`
--

INSERT INTO `delivery_notes` (`delivery_note_id`, `delivery_number`, `order_id`, `supplier_id`, `homestay_id`, `delivery_date`, `received_by`, `delivery_status`, `total_items_received`, `total_items_expected`, `delivery_notes`, `condition_notes`, `created_at`, `updated_at`) VALUES
(1, 'DN-1761381442568', 2, 3, 2, '2025-10-25', NULL, 'complete', 300, 200, '', '', '2025-10-25 08:37:22', '2025-10-25 08:37:22'),
(2, 'DN-1761381919531', 2, 3, 2, '2025-10-25', NULL, 'complete', 300, 200, '', '', '2025-10-25 08:45:19', '2025-10-25 08:45:19');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_note_items`
--

CREATE TABLE `delivery_note_items` (
  `delivery_item_id` int NOT NULL,
  `delivery_note_id` int NOT NULL,
  `order_item_id` int NOT NULL COMMENT 'Reference to stock_order_items',
  `item_id` int NOT NULL,
  `quantity_expected` int NOT NULL,
  `quantity_received` int NOT NULL,
  `quantity_damaged` int DEFAULT '0',
  `quantity_missing` int DEFAULT '0' COMMENT 'Calculated as expected - received - damaged',
  `unit_price` decimal(10,2) NOT NULL,
  `condition_status` enum('good','damaged','defective','expired') DEFAULT 'good',
  `condition_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `delivery_note_items`
--

INSERT INTO `delivery_note_items` (`delivery_item_id`, `delivery_note_id`, `order_item_id`, `item_id`, `quantity_expected`, `quantity_received`, `quantity_damaged`, `quantity_missing`, `unit_price`, `condition_status`, `condition_notes`, `created_at`) VALUES
(1, 1, 1, 1, 100, 100, 0, 0, '10000.00', 'good', '', '2025-10-25 08:37:22'),
(2, 1, 1, 1, 100, 200, 0, 0, '10000.00', 'good', '', '2025-10-25 08:37:22'),
(3, 2, 1, 1, 100, 100, 0, 0, '10000.00', 'good', '', '2025-10-25 08:45:19'),
(4, 2, 1, 1, 100, 200, 0, 0, '10000.00', 'good', '', '2025-10-25 08:45:19');

-- --------------------------------------------------------

--
-- Table structure for table `eating_out`
--

CREATE TABLE `eating_out` (
  `eating_out_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `wifi_available` tinyint(1) DEFAULT '0',
  `parking_available` tinyint(1) DEFAULT '0',
  `private_boat` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','pending') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `external_bookings`
--

CREATE TABLE `external_bookings` (
  `external_id` int NOT NULL,
  `booking_reference` varchar(100) DEFAULT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `room_type_id` int DEFAULT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('confirmed','cancelled','completed') DEFAULT 'confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_accounts`
--

CREATE TABLE `financial_accounts` (
  `account_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `account_name` varchar(100) DEFAULT NULL,
  `account_type` enum('bank','cash','mobile_money') DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_reports`
--

CREATE TABLE `financial_reports` (
  `report_id` int NOT NULL,
  `report_type` enum('daily','weekly','monthly','custom') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `data` json DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `front_desk_logs`
--

CREATE TABLE `front_desk_logs` (
  `log_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `action_type` enum('check_in','check_out','no_show','early_checkout','late_checkout','room_change','extend_stay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` int NOT NULL COMMENT 'staff user_id',
  `action_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `room_unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `key_card_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deposit_collected` decimal(10,2) DEFAULT '0.00',
  `deposit_returned` decimal(10,2) DEFAULT '0.00',
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('cash','card','mobile_money','bank_transfer','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `guest_signature` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Base64 encoded signature or file path',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `front_desk_logs`
--

INSERT INTO `front_desk_logs` (`log_id`, `booking_id`, `action_type`, `performed_by`, `action_time`, `room_unit`, `key_card_number`, `deposit_collected`, `deposit_returned`, `additional_charges`, `payment_method`, `notes`, `guest_signature`, `created_at`) VALUES
(1, 1, 'check_out', 6, '2025-10-22 07:48:55', '102', NULL, '0.00', '0.00', '0.00', 'cash', NULL, NULL, '2025-10-22 07:48:55'),
(2, 3, 'check_out', 6, '2025-10-22 07:51:23', '101', NULL, '0.00', '0.00', '0.00', 'cash', NULL, NULL, '2025-10-22 07:51:23'),
(3, 2, 'check_out', 6, '2025-10-23 08:42:42', '101', NULL, '0.00', '0.00', '0.00', NULL, NULL, NULL, '2025-10-23 08:42:42'),
(4, 4, 'check_out', 6, '2025-10-27 07:23:13', '102', NULL, '0.00', '0.00', '0.00', 'cash', NULL, NULL, '2025-10-27 07:23:13'),
(5, 5, 'check_out', 6, '2025-10-27 07:42:24', '109', NULL, '0.00', '0.00', '0.00', 'cash', NULL, NULL, '2025-10-27 07:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `guest_complaints`
--

CREATE TABLE `guest_complaints` (
  `complaint_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `complaint_type` enum('room_condition','service','noise','cleanliness','staff_behavior','amenities','billing','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('minor','moderate','serious','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'moderate',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('reported','investigating','resolved','escalated','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'reported',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id handling complaint',
  `resolution` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `compensation_offered` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compensation_amount` decimal(10,2) DEFAULT '0.00',
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `guest_satisfied` tinyint(1) DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT '0',
  `follow_up_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_profiles`
--

CREATE TABLE `guest_profiles` (
  `guest_id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Link to users table if registered',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_expiry_date` date DEFAULT NULL,
  `passport_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiry_date` date DEFAULT NULL,
  `preferences` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON: room preferences, dietary, etc.',
  `vip_status` tinyint(1) DEFAULT '0',
  `loyalty_points` int DEFAULT '0',
  `total_bookings` int DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  `last_stay_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `blacklisted` tinyint(1) DEFAULT '0',
  `blacklist_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_profiles`
--

INSERT INTO `guest_profiles` (`guest_id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `country`, `city`, `address`, `date_of_birth`, `nationality`, `id_type`, `id_number`, `id_expiry_date`, `passport_number`, `passport_expiry_date`, `preferences`, `vip_status`, `loyalty_points`, `total_bookings`, `total_spent`, `last_stay_date`, `notes`, `blacklisted`, `blacklist_reason`, `created_at`, `updated_at`) VALUES
(1, NULL, 'IMANISHIMWE', 'Noel', 'imanishimwenoel@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 1, '6642000.00', NULL, NULL, 0, NULL, '2025-10-21 14:34:48', '2025-10-21 14:34:48'),
(2, NULL, 'NIYOGUSHIMWA', 'Nathanael', 'nathan@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 11, '23985000.00', NULL, NULL, 0, NULL, '2025-10-22 07:01:04', '2025-10-27 08:51:25'),
(3, NULL, 'Test', 'Guest 2', 'test2@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 1, '1845000.00', NULL, NULL, 0, NULL, '2025-10-24 19:09:24', '2025-10-24 19:09:24'),
(4, NULL, 'Test', 'Guest 3', 'test3@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 1, '1845000.00', NULL, NULL, 0, NULL, '2025-10-24 19:09:34', '2025-10-24 19:09:34'),
(5, NULL, 'Test', 'Guest Final', 'testfinal@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 1, '1845000.00', NULL, NULL, 0, NULL, '2025-10-24 19:12:43', '2025-10-24 19:12:43'),
(6, NULL, 'Test', 'Available Period', 'testavailable@gmail.com', '+250788123456', NULL, NULL, NULL, NULL, NULL, 'passport', 'P123456789', NULL, NULL, NULL, NULL, 0, 0, 1, '1230000.00', NULL, NULL, 0, NULL, '2025-10-24 19:15:57', '2025-10-24 19:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `guest_requests`
--

CREATE TABLE `guest_requests` (
  `request_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `request_type` enum('room_service','housekeeping','maintenance','amenity','wake_up_call','transportation','concierge','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `status` enum('pending','acknowledged','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id',
  `requested_time` datetime DEFAULT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `completed_time` datetime DEFAULT NULL,
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `staff_notes` text COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT NULL COMMENT '1-5 rating',
  `feedback` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_requests`
--

INSERT INTO `guest_requests` (`request_id`, `booking_id`, `guest_id`, `request_type`, `description`, `priority`, `status`, `assigned_to`, `requested_time`, `scheduled_time`, `completed_time`, `additional_charges`, `notes`, `staff_notes`, `rating`, `feedback`) VALUES
(6, 3, 2, 'housekeeping', 'Ironing 2 shirts', 'normal', 'completed', 8, '2025-10-23 08:52:00', NULL, '2025-10-23 06:00:43', '20000.00', NULL, 'Accepted by keeping at 2025-10-23 06:00:37\nCompleted by keeping at 2025-10-23 06:00:43\nNotes: Ironing completed successfully. Shirts delivered to guest room.', 5, 'Guest was very satisfied with the service'),
(7, 3, 2, 'housekeeping', 'Ironing 2 shirts', 'normal', 'completed', 8, '2025-10-23 08:43:00', NULL, '2025-10-23 07:29:21', '20000.00', NULL, 'Accepted by keeping at 2025-10-23 07:19:19\nAccepted by keeping at 2025-10-23 07:21:45\nCompleted by keeping at 2025-10-23 07:29:21\nNotes: i have ironing 2 shirts of client', 4, NULL),
(8, 3, 2, 'housekeeping', 'cleaning shoes', 'normal', 'completed', 8, '2025-10-23 09:42:00', NULL, '2025-10-23 07:43:25', '10000.00', NULL, 'Accepted by keeping at 2025-10-23 07:43:22\nCompleted by keeping at 2025-10-23 07:43:25\nNotes: ', NULL, NULL),
(9, 3, 2, 'housekeeping', 'ironing 2 pents', 'normal', 'completed', 8, '2025-10-23 10:18:00', NULL, '2025-10-23 08:19:58', '10000.00', NULL, 'Accepted by keeping at 2025-10-23 08:19:56\nCompleted by keeping at 2025-10-23 08:19:58\nNotes: ', NULL, NULL),
(10, 3, 2, 'housekeeping', 'Test ironing service', 'normal', 'completed', 8, NULL, NULL, '2025-10-23 08:23:16', '15000.00', 'Test request for booking charges', 'Completed by keeping at 2025-10-23 08:23:16\nNotes: Ironing completed successfully', 5, 'Excellent service'),
(11, 3, 2, 'housekeeping', 'Test laundry service for booking 3', 'normal', 'completed', 8, NULL, NULL, '2025-10-23 08:37:41', '25000.00', 'Test request for booking 3 charges', 'Completed by keeping at 2025-10-23 08:37:41\nNotes: Laundry service completed successfully', 4, 'Good service'),
(12, 3, 2, 'housekeeping', 'cleaning bags', 'normal', 'completed', 8, '2025-10-23 10:39:00', NULL, '2025-10-23 08:40:23', '20000.00', NULL, 'Accepted by keeping at 2025-10-23 08:40:20\nCompleted by keeping at 2025-10-23 08:40:23\nNotes: ', NULL, NULL),
(13, 5, 2, 'housekeeping', 'Ironing 2 shirts', 'normal', 'completed', 8, '2025-10-23 12:22:00', NULL, '2025-10-23 10:23:56', '20000.00', NULL, 'Accepted by keeping at 2025-10-23 10:23:54\nCompleted by keeping at 2025-10-23 10:23:56\nNotes: ', NULL, NULL),
(14, 5, 2, 'maintenance', 'fix the tv', 'high', 'completed', 5, '2025-10-23 13:20:00', NULL, '2025-10-23 11:22:28', '0.00', NULL, 'Accepted by John Maintenance at 2025-10-23 11:22:17\nCompleted by John Maintenance at 2025-10-23 11:22:28\nNotes: ', NULL, NULL),
(15, 5, 2, 'housekeeping', 'Bring toothpaste', 'urgent', 'completed', 8, '2025-10-23 15:54:00', NULL, '2025-10-27 07:37:09', '0.00', NULL, 'Accepted by keeping at 2025-10-23 14:06:23\nCompleted by keeping at 2025-10-27 07:37:09\nNotes: ', NULL, NULL),
(16, 16, 2, 'housekeeping', 'washing cloths', 'high', 'acknowledged', 8, '2025-11-03 11:05:00', NULL, NULL, '100000.00', NULL, 'Assigned to: housekeeping', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `guest_reviews`
--

CREATE TABLE `guest_reviews` (
  `review_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `homestay_id` int NOT NULL,
  `inventory_id` int DEFAULT NULL,
  `overall_rating` int NOT NULL,
  `cleanliness_rating` int DEFAULT NULL,
  `service_rating` int DEFAULT NULL,
  `location_rating` int DEFAULT NULL,
  `value_rating` int DEFAULT NULL,
  `amenities_rating` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `review_text` text,
  `pros` text,
  `cons` text,
  `would_recommend` tinyint(1) DEFAULT '1',
  `stay_type` enum('business','leisure','family','couple','solo','group') DEFAULT NULL,
  `images` text,
  `status` enum('pending','approved','rejected','flagged') DEFAULT 'pending',
  `verified_stay` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `not_helpful_count` int DEFAULT '0',
  `vendor_response` text,
  `vendor_responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_users`
--

CREATE TABLE `hms_users` (
  `hms_user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` text,
  `role` enum('manager','receptionist','housekeeping','maintenance','restaurant','inventory','accountant','delivery') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `assigned_hotel_id` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hms_users`
--

INSERT INTO `hms_users` (`hms_user_id`, `name`, `email`, `phone`, `password_hash`, `role`, `assigned_hotel_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MUKUNZI Jean', 'jean@gmail.com', '0781796824', '$2a$10$PY/w/iUsE163aoQQSatd3O1qaXrEUjP9e72Il7NgJqksWPXcvoaNO', 'receptionist', 2, 'active', '2025-10-21 11:00:20', '2025-10-21 12:41:48'),
(3, 'John Accountant', 'accountant@gmail.com', '0781796826', '$2a$10$eyhd6eFnRvrR375ZAGku1.fWEekOc9YIx1X0KNG6OmmXzC2/s65iG', 'accountant', 2, 'active', '2025-10-21 11:20:40', '2025-10-21 11:20:40'),
(4, 'John HouseKepping', 'housekeeping@gmail.com', '0781796824', '$2a$10$hegJ4opiRaugREoTKWby3u5qX2XqEP.lRMM4RG06q9GKUblRhBtZO', 'receptionist', 2, 'active', '2025-10-21 11:21:42', '2025-10-21 11:21:42'),
(5, 'John Maintenance', 'maintenance@gmail.com', '0781796829', '$2a$10$M/pXTImqpYvCY5rW/uHiHuWjjyDkM8AgKtCuSMkHaqGpxa.VXEeuG', 'maintenance', 2, 'active', '2025-10-21 11:25:49', '2025-10-21 11:25:49'),
(6, 'Front  User', 'front@gmail.com', '0781796828', '$2a$10$VSv30F1IYjllih9u3kskr.QgDJADzyRK8dniO./sXvzdB.VLU9lMu', 'receptionist', 2, 'active', '2025-10-21 12:43:28', '2025-10-21 12:43:28'),
(7, 'Restaurant User', 'restaurant@gmail.com', '0781796822', '$2a$10$ZD6GVRP68ro8dxrFa5NXBOoj2Zx1HuYZv2vD6YOa4VxJGB.CGT3Xy', 'restaurant', 2, 'active', '2025-10-21 13:50:30', '2025-10-21 13:50:30'),
(8, 'keeping', 'keeping@gmail.com', '0781796828', '$2a$10$VSv30F1IYjllih9u3kskr.QgDJADzyRK8dniO./sXvzdB.VLU9lMu', 'housekeeping', 2, 'active', '2025-10-23 05:51:02', '2025-10-23 05:51:02'),
(9, 'Inventory User', 'inventory@gmail.com', '0781796827', '$2a$10$hKde7RwNv92bn.hEplLwauYRd0/VS69Ni1RBOyofxTkgqE44Y4K4i', 'inventory', 2, 'active', '2025-10-24 00:10:19', '2025-10-24 00:10:19'),
(10, 'Delivery User', 'delivery@gmail.com', '0781796820', '$2a$10$tzhU/i4wXkN1sO2VvPcLxu8keWY8qEnU4UvDPnIWwY17S1XyL387u', 'delivery', 2, 'active', '2025-10-26 06:44:57', '2025-10-26 06:44:57');

-- --------------------------------------------------------

--
-- Table structure for table `homestays`
--

CREATE TABLE `homestays` (
  `homestay_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `star_rating` tinyint DEFAULT '3',
  `location_id` int DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `address` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_in_time` time DEFAULT '14:00:00',
  `check_out_time` time DEFAULT '11:00:00',
  `cancellation_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `child_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pet_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `total_rooms` int DEFAULT '0',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `free_wifi` tinyint(1) DEFAULT '0',
  `parking_available` tinyint(1) DEFAULT '0',
  `pet_friendly` tinyint(1) DEFAULT '0',
  `swimming_pool` tinyint(1) DEFAULT '0',
  `spa` tinyint(1) DEFAULT '0',
  `fitness_center` tinyint(1) DEFAULT '0',
  `restaurant` tinyint(1) DEFAULT '0',
  `bar_lounge` tinyint(1) DEFAULT '0',
  `air_conditioning` tinyint(1) DEFAULT '0',
  `room_service` tinyint(1) DEFAULT '0',
  `laundry_service` tinyint(1) DEFAULT '0',
  `airport_shuttle` tinyint(1) DEFAULT '0',
  `family_rooms` tinyint(1) DEFAULT '0',
  `non_smoking_rooms` tinyint(1) DEFAULT '0',
  `breakfast_included` tinyint(1) DEFAULT '0',
  `kitchen_facilities` tinyint(1) DEFAULT '0',
  `balcony` tinyint(1) DEFAULT '0',
  `ocean_view` tinyint(1) DEFAULT '0',
  `garden_view` tinyint(1) DEFAULT '0',
  `wheelchair_accessible` tinyint(1) DEFAULT '0',
  `meeting_rooms` tinyint(1) DEFAULT '0',
  `conference_facilities` tinyint(1) DEFAULT '0',
  `security_24h` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `fresh_discoveries` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homestays`
--

INSERT INTO `homestays` (`homestay_id`, `vendor_id`, `name`, `description`, `star_rating`, `location_id`, `latitude`, `longitude`, `address`, `check_in_time`, `check_out_time`, `cancellation_policy`, `child_policy`, `pet_policy`, `total_rooms`, `phone`, `email`, `free_wifi`, `parking_available`, `pet_friendly`, `swimming_pool`, `spa`, `fitness_center`, `restaurant`, `bar_lounge`, `air_conditioning`, `room_service`, `laundry_service`, `airport_shuttle`, `family_rooms`, `non_smoking_rooms`, `breakfast_included`, `kitchen_facilities`, `balcony`, `ocean_view`, `garden_view`, `wheelchair_accessible`, `meeting_rooms`, `conference_facilities`, `security_24h`, `featured`, `status`, `created_at`, `updated_at`, `fresh_discoveries`) VALUES
(2, 2, 'Galaxy Hotel', 'Galaxy Hotel is a modern, luxurious hotel located in the heart of Kigali, Rwanda, offering guests a blend of comfort, elegance, and exceptional service. The hotel features spacious, well-furnished rooms equipped with contemporary amenities, a fine dining restaurant serving both local and international cuisine, a relaxing swimming pool, and state-of-the-art conference facilities ideal for business and leisure travelers alike. With its warm hospitality, serene atmosphere, and convenient location near major city attractions, Galaxy Hotel provides a perfect retreat for visitors seeking both relaxation and sophistication.', 3, 2, NULL, NULL, '', '14:00:00', '11:00:00', 'Guests can cancel their reservations free of charge up to 24 hours before the scheduled check-in time. Cancellations made after this period may incur a one-night room charge as a penalty.', 'Children under the age of 12 can stay free of charge when sharing a room with their parents or guardians, using the existing bedding. Extra beds or cribs may be provided upon request, subject to availability.', 'Pets are not allowed within the hotel premises to ensure the comfort and safety of all guests. However, service animals assisting guests with disabilities are welcome.', 2, '+250 781796824', 'nathanaelniyogushimwa@gmail.com', 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 'active', '2025-10-21 07:28:39', '2025-10-21 07:28:39', 0);

-- --------------------------------------------------------

--
-- Table structure for table `homestay_bookings`
--

CREATE TABLE `homestay_bookings` (
  `booking_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `check_in_date` date DEFAULT NULL,
  `check_out_date` date DEFAULT NULL,
  `guests` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `homestay_images`
--

CREATE TABLE `homestay_images` (
  `image_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_type` enum('main','gallery') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'gallery',
  `image_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homestay_images`
--

INSERT INTO `homestay_images` (`image_id`, `homestay_id`, `image_path`, `image_type`, `image_order`, `created_at`) VALUES
(1, 1, 'uploads/homestays/homestay_images-1761014109503-61158763.png', 'main', 0, '2025-10-21 02:35:09'),
(2, 1, 'uploads/homestays/homestay_images-1761014109520-188711575.png', 'gallery', 1, '2025-10-21 02:35:09'),
(3, 1, 'uploads/homestays/homestay_images-1761014909762-780631109.png', 'main', 0, '2025-10-21 02:48:29'),
(4, 1, 'uploads/homestays/homestay_images-1761014909770-792698073.png', 'gallery', 1, '2025-10-21 02:48:29'),
(5, 2, 'uploads/homestays/homestay_images-1761031719731-340456800.png', 'main', 0, '2025-10-21 07:28:39'),
(6, 2, 'uploads/homestays/homestay_images-1761031719735-385430155.png', 'gallery', 1, '2025-10-21 07:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `homestay_staff`
--

CREATE TABLE `homestay_staff` (
  `staff_id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Link to users table if they have login',
  `homestay_id` int NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('manager','receptionist','housekeeper','maintenance','supervisor','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_type` enum('full_time','part_time','contract','temporary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full_time',
  `hire_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave','terminated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `emergency_contact_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_kitchen_queue`
--

CREATE TABLE `hotel_kitchen_queue` (
  `queue_id` int NOT NULL,
  `order_id` int NOT NULL,
  `order_item_id` int DEFAULT NULL,
  `priority` int DEFAULT '0',
  `assigned_chef` int DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `completion_time` timestamp NULL DEFAULT NULL,
  `estimated_time` int DEFAULT NULL COMMENT 'Estimated time in minutes',
  `notes` text,
  `item_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','preparing','ready','served') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_kitchen_queue`
--

INSERT INTO `hotel_kitchen_queue` (`queue_id`, `order_id`, `order_item_id`, `priority`, `assigned_chef`, `start_time`, `completion_time`, `estimated_time`, `notes`, `item_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 0, NULL, '2025-10-25 13:06:57', '2025-10-25 13:15:24', 15, NULL, NULL, 'served', '2025-10-25 12:48:39', '2025-10-25 13:19:56'),
(2, 3, 2, 0, NULL, '2025-10-25 13:21:35', '2025-10-25 13:21:37', 15, NULL, NULL, 'served', '2025-10-25 12:51:00', '2025-10-25 13:21:38'),
(3, 3, 3, 0, NULL, '2025-10-25 13:21:36', '2025-10-25 13:21:38', 15, NULL, NULL, 'served', '2025-10-25 12:51:00', '2025-10-25 13:21:39'),
(4, 4, 4, 0, NULL, '2025-10-25 14:30:06', '2025-10-25 14:31:11', 15, NULL, NULL, 'served', '2025-10-25 14:26:54', '2025-10-25 14:31:12'),
(5, 4, 5, 0, NULL, '2025-10-25 14:31:08', '2025-10-25 14:31:13', 15, NULL, NULL, 'served', '2025-10-25 14:26:54', '2025-10-25 14:31:13'),
(6, 5, 6, 0, NULL, '2025-10-25 18:58:04', '2025-10-25 18:58:06', 15, NULL, NULL, 'served', '2025-10-25 18:57:46', '2025-10-25 18:58:07'),
(7, 6, 7, 0, NULL, '2025-10-26 05:20:54', '2025-10-26 05:20:55', 15, NULL, NULL, 'served', '2025-10-26 05:19:15', '2025-10-26 05:20:58'),
(8, 7, 8, 0, NULL, '2025-10-26 07:18:41', '2025-10-26 07:18:43', 15, NULL, NULL, 'served', '2025-10-26 07:18:15', '2025-10-26 07:18:44'),
(9, 8, 9, 0, NULL, '2025-10-26 07:32:04', '2025-10-26 07:32:05', 15, NULL, NULL, 'served', '2025-10-26 07:31:55', '2025-10-26 07:32:07'),
(10, 9, 10, 0, NULL, '2025-10-26 07:44:01', '2025-10-26 07:44:02', 15, NULL, NULL, 'served', '2025-10-26 07:43:49', '2025-10-26 07:44:05'),
(11, 9, 11, 0, NULL, '2025-10-26 07:44:02', '2025-10-26 07:44:03', 15, NULL, NULL, 'served', '2025-10-26 07:43:49', '2025-10-26 07:44:06'),
(12, 10, 12, 0, NULL, NULL, NULL, 15, NULL, NULL, 'pending', '2025-10-26 08:34:32', '2025-10-26 08:34:32'),
(13, 10, 13, 0, NULL, NULL, NULL, 15, NULL, NULL, 'pending', '2025-10-26 08:34:32', '2025-10-26 08:34:32');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_menu`
--

CREATE TABLE `hotel_menu` (
  `menu_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `subcategory_id` int DEFAULT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Main Course'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_menu`
--

INSERT INTO `hotel_menu` (`menu_id`, `restaurant_id`, `subcategory_id`, `name`, `description`, `price`, `image`, `available`, `created_at`, `updated_at`, `category`) VALUES
(1, 1, 2, 'Chicken rise', '', '5000.00', 'uploads/menus/menu_0_images-1761031719741-820286359.png', 1, '2025-10-21 07:28:39', '2025-10-25 18:50:00', 'Main Course'),
(2, 1, 2, 'Beef Rise', '', '55000.00', 'uploads/menus/menu_1_images-1761031719745-66129370.png', 1, '2025-10-21 07:28:39', '2025-10-25 18:50:00', 'Main Course'),
(3, 1, 2, 'Grilled Chicken', 'Tender grilled chicken breast with herbs and spices', '8000.00', '/images/grilled-chicken.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Main Course'),
(4, 1, 2, 'Fish Fillet', 'Fresh fish fillet with lemon butter sauce', '12000.00', '/images/fish-fillet.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Main Course'),
(5, 1, 2, 'Vegetable Stir Fry', 'Mixed vegetables with garlic and soy sauce', '6000.00', '/images/vegetable-stir-fry.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Main Course'),
(6, 1, 2, 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan cheese', '9000.00', '/images/pasta-carbonara.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Main Course'),
(7, 1, 3, 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', '5000.00', '/images/caesar-salad.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Appetizers'),
(8, 1, 3, 'French Fries', 'Crispy golden french fries', '3000.00', '/images/french-fries.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Appetizers'),
(9, 1, 5, 'Fresh Juice', 'Freshly squeezed orange juice', '2000.00', '/images/fresh-juice.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Beverages'),
(10, 1, 4, 'Coffee', 'Freshly brewed coffee', '1500.00', '/images/coffee.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:00', 'Beverages'),
(11, 1, 4, 'Tea', 'Hot tea with milk and sugar', '1000.00', '/images/tea.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:07', 'Beverages'),
(12, 1, 8, 'Ice Cream', 'Vanilla ice cream with chocolate sauce', '2500.00', '/images/ice-cream.jpg', 1, '2025-10-25 11:39:24', '2025-10-25 18:50:07', 'Desserts'),
(13, 1, 2, 'Grilled Chicken', '', '5000.00', '', 1, '2025-10-25 18:22:35', '2025-10-25 18:50:00', 'Main Course');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_menu_categories`
--

CREATE TABLE `hotel_menu_categories` (
  `category_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_menu_categories`
--

INSERT INTO `hotel_menu_categories` (`category_id`, `restaurant_id`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Food', 'Main food categories', 1, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(2, 1, 'Beverages', 'Drinks and beverages', 2, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(3, 1, 'Desserts', 'Sweet treats and desserts', 3, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_menu_subcategories`
--

CREATE TABLE `hotel_menu_subcategories` (
  `subcategory_id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_menu_subcategories`
--

INSERT INTO `hotel_menu_subcategories` (`subcategory_id`, `category_id`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Buffet', 'All-you-can-eat buffet items', 1, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(2, 1, 'A La Carte', 'Individual dishes ordered separately', 2, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(3, 1, 'Appetizers', 'Starter dishes', 3, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(4, 2, 'Hot Drinks', 'Coffee, tea, hot chocolate', 1, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(5, 2, 'Cold Drinks', 'Soft drinks, juices, iced beverages', 2, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(6, 2, 'Alcoholic', 'Beer, wine, cocktails', 3, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(7, 3, 'Cakes', 'Various cake options', 1, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45'),
(8, 3, 'Ice Cream', 'Frozen desserts', 2, 1, '2025-10-25 18:03:45', '2025-10-25 18:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_order_delivery_info`
--

CREATE TABLE `hotel_order_delivery_info` (
  `delivery_info_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `order_type` enum('dine_in','room_service','takeaway','delivery','pickup') COLLATE utf8mb4_unicode_ci DEFAULT 'pickup',
  `delivery_status` enum('pending','in_transit','delivered','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `room_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `table_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `delivery_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `delivered_by` int DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `delivery_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_order_delivery_info`
--

INSERT INTO `hotel_order_delivery_info` (`delivery_info_id`, `order_id`, `booking_id`, `order_type`, `delivery_status`, `room_number`, `table_number`, `delivery_address`, `delivery_instructions`, `delivered_by`, `delivered_at`, `delivery_notes`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'room_service', 'delivered', '101', NULL, NULL, NULL, 10, '2025-10-26 06:52:44', NULL, '2025-10-25 12:48:39', '2025-10-26 06:52:44'),
(2, 3, NULL, 'dine_in', 'delivered', NULL, NULL, NULL, NULL, 10, '2025-10-26 06:52:37', NULL, '2025-10-25 12:51:00', '2025-10-26 06:52:37'),
(3, 4, NULL, 'room_service', 'delivered', '201', NULL, NULL, NULL, 10, '2025-10-26 06:52:30', NULL, '2025-10-25 14:26:54', '2025-10-26 06:52:30'),
(4, 5, NULL, 'room_service', 'delivered', '12', NULL, NULL, NULL, 10, '2025-10-26 06:52:32', NULL, '2025-10-25 18:57:46', '2025-10-26 06:52:32'),
(5, 6, NULL, 'room_service', 'delivered', '109', NULL, NULL, NULL, 10, '2025-10-26 06:52:10', NULL, '2025-10-26 05:19:15', '2025-10-26 06:52:10'),
(6, 7, NULL, 'room_service', 'delivered', '109', NULL, NULL, NULL, 10, '2025-10-26 07:18:52', NULL, '2025-10-26 07:18:15', '2025-10-26 07:18:52'),
(7, 8, NULL, 'dine_in', 'delivered', NULL, '109', NULL, NULL, 10, '2025-10-26 07:33:47', NULL, '2025-10-26 07:31:55', '2025-10-26 07:33:47'),
(8, 9, NULL, 'room_service', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-26 07:43:49', '2025-10-26 07:43:49'),
(9, 10, NULL, 'room_service', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-26 08:34:32', '2025-10-26 08:34:32');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_order_items`
--

CREATE TABLE `hotel_order_items` (
  `order_item_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `menu_id` int DEFAULT NULL,
  `menu_item_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `price_at_time` decimal(10,2) DEFAULT NULL,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','preparing','ready','served','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_order_items`
--

INSERT INTO `hotel_order_items` (`order_item_id`, `order_id`, `booking_id`, `menu_id`, `menu_item_id`, `quantity`, `unit_price`, `total_price`, `price_at_time`, `special_instructions`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-25 12:48:39', '2025-10-25 13:19:56'),
(2, 3, NULL, NULL, 8, 1, '3000.00', '3000.00', NULL, '', 'served', '2025-10-25 12:51:00', '2025-10-25 13:21:38'),
(3, 3, NULL, NULL, 3, 1, '8000.00', '8000.00', NULL, '', 'served', '2025-10-25 12:51:00', '2025-10-25 13:21:39'),
(4, 4, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-25 14:26:54', '2025-10-25 14:31:12'),
(5, 4, NULL, NULL, 7, 1, '5000.00', '5000.00', NULL, '', 'served', '2025-10-25 14:26:54', '2025-10-25 14:31:13'),
(6, 5, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-25 18:57:46', '2025-10-25 18:58:07'),
(7, 6, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-26 05:19:15', '2025-10-26 05:20:58'),
(8, 7, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-26 07:18:15', '2025-10-26 07:18:44'),
(9, 8, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'served', '2025-10-26 07:31:55', '2025-10-26 07:32:07'),
(10, 9, NULL, NULL, 7, 1, '5000.00', '5000.00', NULL, '', 'served', '2025-10-26 07:43:49', '2025-10-26 07:44:05'),
(11, 9, NULL, NULL, 8, 1, '3000.00', '3000.00', NULL, '', 'served', '2025-10-26 07:43:49', '2025-10-26 07:44:06'),
(12, 10, NULL, NULL, 2, 1, '55000.00', '55000.00', NULL, '', 'pending', '2025-10-26 08:34:32', '2025-10-26 08:34:32'),
(13, 10, NULL, NULL, 5, 1, '6000.00', '6000.00', NULL, '', 'pending', '2025-10-26 08:34:32', '2025-10-26 08:34:32');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurants`
--

CREATE TABLE `hotel_restaurants` (
  `restaurant_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cuisine_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_time` time DEFAULT '07:00:00',
  `closing_time` time DEFAULT '23:00:00',
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('open','closed','under_maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_restaurants`
--

INSERT INTO `hotel_restaurants` (`restaurant_id`, `homestay_id`, `name`, `description`, `cuisine_type`, `opening_time`, `closing_time`, `contact_number`, `email`, `menu_image`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Umubano Restourant', 'At umubano restourant you realy feel comfortable and satisfied.', 'Chinese', '07:00:00', '23:00:00', '+250 781796824', 'nathanaelniyogushimwa@gmail.com', NULL, 'open', '2025-10-21 07:28:39', '2025-10-21 07:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurant_images`
--

CREATE TABLE `hotel_restaurant_images` (
  `image_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_type` enum('main','gallery') DEFAULT 'gallery',
  `image_order` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_restaurant_images`
--

INSERT INTO `hotel_restaurant_images` (`image_id`, `restaurant_id`, `image_path`, `image_type`, `image_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'uploads/restaurants/restaurant_images-1761031719740-604220763.png', 'main', 0, '2025-10-21 07:28:39', '2025-10-21 07:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurant_orders`
--

CREATE TABLE `hotel_restaurant_orders` (
  `order_id` int NOT NULL,
  `restaurant_id` int DEFAULT NULL,
  `homestay_id` int NOT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `order_type` enum('dine_in','room_service','takeaway') DEFAULT 'dine_in',
  `booking_id` int DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `status` enum('pending','confirmed','preparing','ready','served','completed','cancelled') DEFAULT 'pending',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `delivery_time` timestamp NULL DEFAULT NULL,
  `special_instructions` text,
  `created_by` int DEFAULT NULL,
  `guest_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_restaurant_orders`
--

INSERT INTO `hotel_restaurant_orders` (`order_id`, `restaurant_id`, `homestay_id`, `order_number`, `order_type`, `booking_id`, `table_id`, `status`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `order_date`, `delivery_time`, `special_instructions`, `created_by`, `guest_id`, `room_id`, `created_at`, `updated_at`) VALUES
(2, NULL, 2, 'ORD-2-1761396519677-1', 'room_service', NULL, NULL, 'served', '55000.00', '0.00', '0.00', '55000.00', '2025-10-25 12:48:39', NULL, '', NULL, NULL, NULL, '2025-10-25 12:48:39', '2025-10-25 13:19:57'),
(3, NULL, 2, 'ORD-2-1761396660609-2', 'dine_in', NULL, 2, 'served', '11000.00', '0.00', '0.00', '11000.00', '2025-10-25 12:51:00', NULL, '', NULL, 2, NULL, '2025-10-25 12:51:00', '2025-10-25 14:35:24'),
(4, NULL, 2, 'ORD-2-1761402414315-3', 'room_service', NULL, NULL, 'served', '60000.00', '0.00', '0.00', '60000.00', '2025-10-25 14:26:54', NULL, '', NULL, NULL, NULL, '2025-10-25 14:26:54', '2025-10-25 14:35:22'),
(5, NULL, 2, 'ORD-2-1761418666294-4', 'room_service', NULL, NULL, 'served', '55000.00', '0.00', '0.00', '55000.00', '2025-10-25 18:57:46', NULL, '', NULL, NULL, NULL, '2025-10-25 18:57:46', '2025-10-25 18:58:09'),
(6, NULL, 2, 'ORD-2-1761455955593-5', 'room_service', NULL, NULL, 'served', '55000.00', '0.00', '0.00', '55000.00', '2025-10-26 05:19:15', NULL, '', NULL, NULL, NULL, '2025-10-26 05:19:15', '2025-10-26 05:20:59'),
(7, NULL, 2, 'ORD-2-1761463095124-6', 'room_service', NULL, NULL, 'served', '55000.00', '0.00', '0.00', '55000.00', '2025-10-26 07:18:15', NULL, '', NULL, NULL, NULL, '2025-10-26 07:18:15', '2025-10-26 07:18:46'),
(8, NULL, 2, 'ORD-2-1761463915701-7', 'dine_in', NULL, NULL, 'served', '55000.00', '0.00', '0.00', '55000.00', '2025-10-26 07:31:55', NULL, '', NULL, NULL, NULL, '2025-10-26 07:31:55', '2025-10-26 07:32:08'),
(9, NULL, 2, 'ORD-2-1761464629206-8', 'room_service', NULL, NULL, 'served', '8000.00', '0.00', '0.00', '8000.00', '2025-10-26 07:43:49', NULL, '', NULL, 2, 26, '2025-10-26 07:43:49', '2025-10-26 07:44:07'),
(10, NULL, 2, 'ORD-2-1761467672113-9', 'room_service', NULL, NULL, 'pending', '61000.00', '0.00', '0.00', '61000.00', '2025-10-26 08:34:32', NULL, '', NULL, 2, 29, '2025-10-26 08:34:32', '2025-10-26 08:34:32');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurant_tables`
--

CREATE TABLE `hotel_restaurant_tables` (
  `table_id` int NOT NULL,
  `restaurant_id` int DEFAULT NULL,
  `homestay_id` int DEFAULT NULL,
  `table_number` varchar(10) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hotel_restaurant_tables`
--

INSERT INTO `hotel_restaurant_tables` (`table_id`, `restaurant_id`, `homestay_id`, `table_number`, `capacity`, `location`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'T1', 2, 'Indoor', 'available', NULL, '2025-10-25 11:39:24', '2025-10-25 11:39:24'),
(2, 1, 2, 'T2', 4, 'Indoor', 'available', NULL, '2025-10-25 11:39:24', '2025-10-25 11:39:24'),
(3, 1, 2, 'T3', 6, 'Indoor', 'available', NULL, '2025-10-25 11:39:24', '2025-10-25 11:39:24'),
(4, 1, 2, 'T4', 2, 'Outdoor', 'available', NULL, '2025-10-25 11:39:24', '2025-10-25 11:39:24'),
(5, 1, 2, 'T5', 4, 'Outdoor', 'available', NULL, '2025-10-25 11:39:24', '2025-10-25 11:39:24'),
(6, 1, 2, 'T6', 4, 'Indor', 'available', '', '2025-10-25 15:14:45', '2025-10-25 15:14:45');

-- --------------------------------------------------------

--
-- Table structure for table `housekeeping_tasks`
--

CREATE TABLE `housekeeping_tasks` (
  `task_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `task_type` enum('cleaning','deep_cleaning','inspection','maintenance','turndown_service','laundry','minibar_restock') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id',
  `status` enum('pending','in_progress','completed','cancelled','on_hold') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `scheduled_time` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `estimated_duration` int DEFAULT NULL COMMENT 'Minutes',
  `actual_duration` int DEFAULT NULL COMMENT 'Minutes',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `issues_found` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `supplies_used` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of supplies',
  `quality_score` int DEFAULT NULL COMMENT '1-5 rating',
  `inspected_by` int DEFAULT NULL COMMENT 'supervisor user_id',
  `inspection_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `housekeeping_tasks`
--

INSERT INTO `housekeeping_tasks` (`task_id`, `inventory_id`, `task_type`, `priority`, `assigned_to`, `status`, `scheduled_time`, `started_at`, `completed_at`, `estimated_duration`, `actual_duration`, `notes`, `issues_found`, `supplies_used`, `quality_score`, `inspected_by`, `inspection_notes`, `created_at`, `updated_at`) VALUES
(1, 26, 'cleaning', 'normal', NULL, 'completed', '2025-10-27 07:42:24', '2025-10-27 08:17:12', '2025-10-27 08:18:14', NULL, 1, '', '', '', 4, NULL, '', '2025-10-27 07:42:24', '2025-10-27 08:18:14');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_categories`
--

CREATE TABLE `inventory_categories` (
  `category_id` int NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory_categories`
--

INSERT INTO `inventory_categories` (`category_id`, `category_name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Toiletries', 'Shampoo, soap, toilet paper, etc.', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(3, 'Kitchen', 'Cups, plates, utensils, etc.', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(4, 'Cleaning', 'Cleaning supplies and equipment', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(5, 'Maintenance', 'Tools and maintenance supplies', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(6, 'Amenities', 'Guest amenities and extras', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(7, 'Food & Beverage', 'Food items and beverages', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(8, 'Office Supplies', 'Stationery and office materials', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(9, 'Safety', 'Safety equipment and supplies', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(34, 'Drinks', 'Beer, Juice, Water', 1, '2025-10-24 06:32:00', '2025-10-24 06:32:00'),
(42, 'Protocals', '', 1, '2025-10-24 06:39:31', '2025-10-24 06:39:31'),
(43, 'Decor', '', 1, '2025-10-24 06:39:44', '2025-10-24 06:39:44');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `invoce_logo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_charge` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `balance_due` decimal(10,2) DEFAULT '0.00',
  `status` enum('draft','sent','paid','partially_paid','overdue','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `payment_terms` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_by` int DEFAULT NULL COMMENT 'staff user_id',
  `sent_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `booking_id`, `invoice_number`, `invoice_date`, `invoce_logo`, `due_date`, `subtotal`, `tax_amount`, `service_charge`, `discount_amount`, `total_amount`, `amount_paid`, `balance_due`, `status`, `payment_terms`, `notes`, `logo_url`, `generated_by`, `sent_at`, `paid_at`, `created_at`, `updated_at`) VALUES
(2, 2, 'INV-202510-0001', '2025-10-22', '', '2025-11-21', '5535000.00', '996300.00', '0.00', '0.00', '6531300.00', '0.00', '6531300.00', 'draft', 'Due on receipt', '', '/uploads/logos/test-logo.png', 6, NULL, NULL, '2025-10-22 12:21:11', '2025-10-22 22:31:09'),
(5, 3, 'INV-202510-0002', '2025-10-23', '/uploads/logos/logo-1761173041825-659934751.png', '2025-10-23', '1965000.00', '353700.00', '0.00', '0.00', '2318700.00', '0.00', '2318700.00', 'draft', 'Due on receipt', 'Final invoice with all charges', NULL, NULL, NULL, NULL, '2025-10-23 08:49:41', '2025-10-23 08:49:41'),
(10, 5, 'INV-202510-0005', '2025-10-26', '', '2025-11-25', '2262000.00', '407160.00', '0.00', '0.00', '2669160.00', '0.00', '2669160.00', 'draft', 'Due on receipt', '', NULL, 6, NULL, NULL, '2025-10-26 08:33:42', '2025-10-26 08:33:42'),
(11, 4, 'INV-202510-0006', '2025-10-26', '', '2025-11-25', '1906000.00', '343080.00', '0.00', '0.00', '2249080.00', '0.00', '2249080.00', 'draft', 'Due on receipt', '', NULL, 6, NULL, NULL, '2025-10-26 08:34:58', '2025-10-26 08:34:58'),
(13, 16, 'INV-202511-0001', '2025-11-03', '', '2025-12-03', '1476000.00', '265680.00', '0.00', '0.00', '1741680.00', '0.00', '1741680.00', 'draft', 'Due on receipt', '', NULL, 6, NULL, NULL, '2025-11-03 08:47:49', '2025-11-03 08:47:49');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `item_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`item_id`, `invoice_id`, `description`, `quantity`, `unit_price`, `total_price`, `tax_amount`) VALUES
(1, 2, 'Room 101 - Deluxe Room (9 nights)', 9, '615000.00', '5535000.00', '0.00'),
(13, 5, 'Room 101 - Villa (3 nights)', 3, '615000.00', '1845000.00', '0.00'),
(14, 5, 'ROOM SERVICE - HOUSEKEEPING - Test ironing service', 1, '15000.00', '15000.00', '0.00'),
(15, 5, 'ROOM SERVICE - HOUSEKEEPING - Test laundry service for booking 3', 1, '25000.00', '25000.00', '0.00'),
(16, 5, 'ROOM SERVICE - HOUSEKEEPING - cleaning bags', 1, '20000.00', '20000.00', '0.00'),
(17, 5, 'HOUSEKEEPING - Ironing 2 shirts', 1, '20000.00', '20000.00', '0.00'),
(18, 5, 'HOUSEKEEPING - Ironing 2 shirts', 1, '20000.00', '20000.00', '0.00'),
(19, 5, 'HOUSEKEEPING - cleaning shoes', 1, '10000.00', '10000.00', '0.00'),
(20, 5, 'HOUSEKEEPING - ironing 2 pents', 1, '10000.00', '10000.00', '0.00'),
(35, 10, 'Room 109 - Deluxe Room (3 nights)', 3, '738000.00', '2214000.00', '0.00'),
(36, 10, 'ROOM SERVICE - HOUSEKEEPING - Ironing 2 shirts', 1, '20000.00', '20000.00', '0.00'),
(37, 10, 'Restaurant - Caesar Salad', 1, '5000.00', '5000.00', '0.00'),
(38, 10, 'Restaurant - French Fries', 1, '3000.00', '3000.00', '0.00'),
(39, 10, 'HOUSEKEEPING - Ironing 2 shirts', 1, '20000.00', '20000.00', '0.00'),
(40, 11, 'Room 102 - Villa (3 nights)', 3, '615000.00', '1845000.00', '0.00'),
(41, 11, 'Restaurant - Beef Rise', 1, '55000.00', '55000.00', '0.00'),
(42, 11, 'Restaurant - Vegetable Stir Fry', 1, '6000.00', '6000.00', '0.00'),
(44, 13, 'Room 101 - Deluxe Room (2 nights)', 2, '738000.00', '1476000.00', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_settings`
--

CREATE TABLE `invoice_settings` (
  `setting_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL or path to company logo',
  `company_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Override hotel name on invoice',
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Company tagline or slogan',
  `invoice_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_website` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tax ID or VAT number',
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Business registration number',
  `primary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#2563EB' COMMENT 'Primary brand color (hex)',
  `secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#1E40AF' COMMENT 'Secondary brand color (hex)',
  `accent_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#3B82F6' COMMENT 'Accent color for highlights (hex)',
  `font_family` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Inter' COMMENT 'Font family for invoice',
  `footer_text` text COLLATE utf8mb4_unicode_ci COMMENT 'Custom footer text',
  `show_footer_logo` tinyint(1) DEFAULT '1' COMMENT 'Show logo in footer',
  `show_payment_qr` tinyint(1) DEFAULT '0' COMMENT 'Show QR code for payments',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_money_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_money_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., MTN, Airtel',
  `payment_terms` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT 'Payment due within 30 days' COMMENT 'Default payment terms',
  `terms_and_conditions` text COLLATE utf8mb4_unicode_ci COMMENT 'Invoice terms and conditions',
  `cancellation_policy` text COLLATE utf8mb4_unicode_ci,
  `invoice_template` enum('modern','classic','minimal','corporate') COLLATE utf8mb4_unicode_ci DEFAULT 'modern',
  `show_line_numbers` tinyint(1) DEFAULT '1',
  `show_item_codes` tinyint(1) DEFAULT '0',
  `show_tax_breakdown` tinyint(1) DEFAULT '1',
  `currency_symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'RWF',
  `currency_position` enum('before','after') COLLATE utf8mb4_unicode_ci DEFAULT 'before',
  `date_format` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'YYYY-MM-DD',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `invoice_prefix` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INV',
  `invoice_number_padding` int DEFAULT '4' COMMENT 'Number of digits in invoice number',
  `reset_numbering` enum('never','monthly','yearly') COLLATE utf8mb4_unicode_ci DEFAULT 'yearly',
  `send_email_on_generation` tinyint(1) DEFAULT '1',
  `cc_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CC email addresses (comma-separated)',
  `email_subject_template` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT 'Invoice {invoice_number} from {company_name}',
  `email_body_template` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom invoice branding and settings for each hotel/homestay';

--
-- Dumping data for table `invoice_settings`
--

INSERT INTO `invoice_settings` (`setting_id`, `homestay_id`, `logo_url`, `company_name`, `tagline`, `invoice_email`, `invoice_phone`, `invoice_website`, `tax_id`, `registration_number`, `primary_color`, `secondary_color`, `accent_color`, `font_family`, `footer_text`, `show_footer_logo`, `show_payment_qr`, `bank_name`, `bank_account_name`, `bank_account_number`, `bank_swift_code`, `mobile_money_number`, `mobile_money_provider`, `payment_terms`, `terms_and_conditions`, `cancellation_policy`, `invoice_template`, `show_line_numbers`, `show_item_codes`, `show_tax_breakdown`, `currency_symbol`, `currency_position`, `date_format`, `language`, `invoice_prefix`, `invoice_number_padding`, `reset_numbering`, `send_email_on_generation`, `cc_email`, `email_subject_template`, `email_body_template`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, '/uploads/logos/logo-1761173041825-659934751.png', 'Test Hotel Company', NULL, NULL, NULL, NULL, NULL, NULL, '#009973', '#1eae5c', '#007542', 'Inter', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Payment due within 30 days', NULL, NULL, 'corporate', 1, 1, 1, 'RWF', 'after', 'YYYY-MM-DD', 'en', 'INV', 4, 'yearly', 1, NULL, 'Invoice {invoice_number} from {company_name}', NULL, 1, '2025-10-22 14:33:43', '2025-10-22 22:44:01');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `location_id` int NOT NULL,
  `location_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`location_id`, `location_name`) VALUES
(2, 'Kigali'),
(5, 'Burera'),
(6, 'Gakenke'),
(7, 'Gicumbi'),
(8, 'Musanze'),
(9, 'Rulindo'),
(10, 'Gisagara'),
(11, 'Huye'),
(12, 'Kamonyi'),
(13, 'Muhanga'),
(14, 'Nyamagabe'),
(15, 'Nyanza'),
(16, 'Nyaruguru'),
(17, 'Ruhango'),
(18, 'Bugesera'),
(19, 'Gatsibo'),
(20, 'Kayonza'),
(21, 'Kirehe'),
(22, 'Ngoma'),
(23, 'Nyagatare'),
(24, 'Rwamagana'),
(25, 'Karongi'),
(26, 'Ngororero'),
(27, 'Nyabihu'),
(28, 'Nyamasheke'),
(29, 'Rubavu'),
(30, 'Rusizi'),
(31, 'Rutsiro');

-- --------------------------------------------------------

--
-- Stand-in structure for view `low_stock_alerts`
-- (See below for the actual view)
--
CREATE TABLE `low_stock_alerts` (
`item_id` int
,`item_name` varchar(100)
,`current_quantity` int
,`reorder_threshold` int
,`unit_price` decimal(10,2)
,`homestay_id` int
,`homestay_name` varchar(150)
,`alert_level` varchar(12)
);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_requests`
--

CREATE TABLE `maintenance_requests` (
  `request_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `reported_by` int NOT NULL COMMENT 'user_id (staff or guest)',
  `issue_type` enum('plumbing','electrical','hvac','furniture','appliance','structural','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('reported','assigned','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'reported',
  `assigned_to` int DEFAULT NULL COMMENT 'maintenance staff user_id',
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `resolution_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of image paths',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `menu_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `available` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_item_ingredients`
--

CREATE TABLE `menu_item_ingredients` (
  `ingredient_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `stock_item_id` int NOT NULL,
  `quantity_required` decimal(10,2) NOT NULL COMMENT 'Quantity of stock item needed for one serving',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unit of measurement for this ingredient',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Links menu items to stock items (ingredients/recipes)';

-- --------------------------------------------------------

--
-- Table structure for table `money_transactions`
--

CREATE TABLE `money_transactions` (
  `transaction_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `account_id` int NOT NULL,
  `type` enum('inflow','outflow','transfer','refund') NOT NULL,
  `source_type` enum('booking','restaurant','supplier','maintenance','refund','subscription','manual') NOT NULL,
  `source_id` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `payment_method` enum('cash','card','mobile_money','bank_transfer') NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `multi_room_bookings`
--

CREATE TABLE `multi_room_bookings` (
  `group_booking_id` int NOT NULL,
  `booking_id` int NOT NULL COMMENT 'Main booking ID',
  `room_booking_id` int NOT NULL COMMENT 'Individual room booking',
  `group_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_master_booking` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('booking','review','system','promotion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ota_mappings`
--

CREATE TABLE `ota_mappings` (
  `mapping_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `ota_listing_id` varchar(100) DEFAULT NULL,
  `sync_status` enum('active','paused','error') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `otp_id` int NOT NULL COMMENT 'Primary key for OTP verification',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phone number to verify',
  `otp_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hashed OTP code',
  `purpose` enum('registration','password_reset','phone_verification','login') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'registration' COMMENT 'Purpose of OTP verification',
  `is_used` tinyint(1) DEFAULT '0' COMMENT 'Whether OTP has been used',
  `expires_at` datetime NOT NULL COMMENT 'OTP expiration time',
  `verified_at` datetime DEFAULT NULL COMMENT 'Time when OTP was verified',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'OTP creation time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores OTP codes for phone verification via Twilio SMS';

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `transaction_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `account_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `payment_method` enum('cash','card','mobile_money','bank_transfer','paypal','stripe','check','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `paid_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_gateway_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','completed','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `gateway_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`transaction_id`, `booking_id`, `invoice_id`, `account_id`, `amount`, `currency`, `payment_method`, `paid_by`, `reference_number`, `bank_name`, `payment_gateway_id`, `status`, `gateway_response`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, '6642000.00', 'RWF', 'other', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-21 14:34:48', '2025-10-22 22:58:48'),
(2, 2, NULL, NULL, '5535000.00', 'RWF', 'other', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-22 07:01:04', '2025-10-22 22:58:48'),
(3, 3, NULL, NULL, '1845000.00', 'RWF', 'other', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-22 07:14:22', '2025-10-22 22:58:48'),
(22, 2, NULL, NULL, '10000.00', 'USD', 'cash', 'front@gmail.com', 'RF989', NULL, NULL, 'completed', NULL, '2025-10-22 23:07:41', '2025-10-22 23:07:41'),
(24, 4, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-23 08:44:07', '2025-10-23 08:44:45'),
(25, 5, NULL, NULL, '2214000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-23 10:05:14', '2025-10-23 10:06:41'),
(26, 6, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 17:10:31', '2025-10-24 17:10:31'),
(27, 7, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:04:16', '2025-10-24 19:04:16'),
(28, 8, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:09:24', '2025-10-24 19:09:24'),
(29, 9, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:09:34', '2025-10-24 19:09:34'),
(30, 10, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:12:43', '2025-10-24 19:12:43'),
(31, 11, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:12:59', '2025-10-24 19:12:59'),
(32, 12, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:13:07', '2025-10-24 19:13:07'),
(33, 13, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:13:09', '2025-10-24 19:13:09'),
(34, 14, NULL, NULL, '1845000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:13:11', '2025-10-24 19:13:11'),
(35, 15, NULL, NULL, '1230000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-24 19:15:57', '2025-10-24 19:15:57'),
(36, 16, NULL, NULL, '1476000.00', 'RWF', 'mobile_money', NULL, NULL, NULL, 'MOMO-123456789', 'completed', '{\"status\": \"success\", \"reference\": \"MOMO-REF-123\", \"timestamp\": \"2025-01-16T10:30:00Z\"}', '2025-10-27 08:51:25', '2025-10-27 08:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `rate_sync_logs`
--

CREATE TABLE `rate_sync_logs` (
  `sync_id` int NOT NULL,
  `room_type_id` int DEFAULT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `old_rate` decimal(10,2) DEFAULT NULL,
  `new_rate` decimal(10,2) DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_exports`
--

CREATE TABLE `report_exports` (
  `export_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `format` enum('pdf','excel','csv') DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_logs`
--

CREATE TABLE `report_logs` (
  `log_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `run_by` int DEFAULT NULL,
  `run_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('success','error') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_settings`
--

CREATE TABLE `report_settings` (
  `id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `default_page_orientation` enum('portrait','landscape') DEFAULT 'portrait',
  `default_page_size` enum('A4','A3','Letter','Legal','Tabloid') DEFAULT 'A4',
  `page_margins` enum('narrow','normal','wide','custom') DEFAULT 'normal',
  `custom_margin_top` int DEFAULT '20',
  `custom_margin_bottom` int DEFAULT '20',
  `custom_margin_left` int DEFAULT '20',
  `custom_margin_right` int DEFAULT '20',
  `show_header` tinyint(1) DEFAULT '1',
  `header_height` int DEFAULT '80',
  `header_logo_url` varchar(255) DEFAULT NULL,
  `header_logo_position` enum('left','center','right') DEFAULT 'left',
  `header_logo_size` enum('small','medium','large') DEFAULT 'medium',
  `header_company_info` tinyint(1) DEFAULT '1',
  `header_company_name` tinyint(1) DEFAULT '1',
  `header_company_address` tinyint(1) DEFAULT '1',
  `header_company_contact` tinyint(1) DEFAULT '1',
  `show_footer` tinyint(1) DEFAULT '1',
  `footer_height` int DEFAULT '60',
  `footer_content` enum('page_number','company_info','custom','none') DEFAULT 'page_number',
  `footer_custom_text` text,
  `footer_show_date` tinyint(1) DEFAULT '1',
  `footer_show_time` tinyint(1) DEFAULT '0',
  `report_font_family` varchar(50) DEFAULT 'Arial',
  `report_font_size` int DEFAULT '12',
  `report_line_height` decimal(3,1) DEFAULT '1.4',
  `report_color_scheme` enum('default','blue','green','red','custom') DEFAULT 'default',
  `report_primary_color` varchar(7) DEFAULT '#2563EB',
  `report_secondary_color` varchar(7) DEFAULT '#1E40AF',
  `report_accent_color` varchar(7) DEFAULT '#3B82F6',
  `table_border_style` enum('solid','dashed','dotted','none') DEFAULT 'solid',
  `table_border_width` int DEFAULT '1',
  `table_border_color` varchar(7) DEFAULT '#000000',
  `table_header_background` varchar(7) DEFAULT '#F5F5F5',
  `table_header_text_color` varchar(7) DEFAULT '#000000',
  `table_alternate_row_color` varchar(7) DEFAULT '#FAFAFA',
  `table_cell_padding` int DEFAULT '8',
  `print_background_colors` tinyint(1) DEFAULT '1',
  `print_images` tinyint(1) DEFAULT '1',
  `print_page_numbers` tinyint(1) DEFAULT '1',
  `print_date_time` tinyint(1) DEFAULT '1',
  `print_footer_url` tinyint(1) DEFAULT '0',
  `purchase_order_template` enum('standard','detailed','minimal') DEFAULT 'standard',
  `stock_report_template` enum('summary','detailed','comprehensive') DEFAULT 'detailed',
  `financial_report_template` enum('simple','professional','detailed') DEFAULT 'professional',
  `maintenance_report_template` enum('standard','detailed','checklist') DEFAULT 'standard',
  `auto_generate_page_numbers` tinyint(1) DEFAULT '1',
  `auto_generate_report_date` tinyint(1) DEFAULT '1',
  `auto_generate_report_time` tinyint(1) DEFAULT '0',
  `include_generated_by` tinyint(1) DEFAULT '1',
  `include_generation_timestamp` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `report_settings`
--

INSERT INTO `report_settings` (`id`, `homestay_id`, `default_page_orientation`, `default_page_size`, `page_margins`, `custom_margin_top`, `custom_margin_bottom`, `custom_margin_left`, `custom_margin_right`, `show_header`, `header_height`, `header_logo_url`, `header_logo_position`, `header_logo_size`, `header_company_info`, `header_company_name`, `header_company_address`, `header_company_contact`, `show_footer`, `footer_height`, `footer_content`, `footer_custom_text`, `footer_show_date`, `footer_show_time`, `report_font_family`, `report_font_size`, `report_line_height`, `report_color_scheme`, `report_primary_color`, `report_secondary_color`, `report_accent_color`, `table_border_style`, `table_border_width`, `table_border_color`, `table_header_background`, `table_header_text_color`, `table_alternate_row_color`, `table_cell_padding`, `print_background_colors`, `print_images`, `print_page_numbers`, `print_date_time`, `print_footer_url`, `purchase_order_template`, `stock_report_template`, `financial_report_template`, `maintenance_report_template`, `auto_generate_page_numbers`, `auto_generate_report_date`, `auto_generate_report_time`, `include_generated_by`, `include_generation_timestamp`, `created_at`, `updated_at`) VALUES
(1, 2, 'portrait', 'A4', 'normal', 20, 20, 20, 20, 1, 80, NULL, 'left', 'medium', 1, 1, 1, 1, 1, 60, 'page_number', '', 1, 0, 'Arial', 12, '1.4', 'green', '#2563EB', '#1E40AF', '#3B82F6', 'solid', 1, '#000000', '#F5F5F5', '#000000', '#FAFAFA', 8, 1, 1, 1, 1, 0, 'standard', 'detailed', 'professional', 'standard', 1, 1, 0, 1, 1, '2025-10-25 08:13:21', '2025-10-25 09:13:00');

-- --------------------------------------------------------

--
-- Table structure for table `report_templates`
--

CREATE TABLE `report_templates` (
  `template_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `query` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_capacity`
--

CREATE TABLE `restaurant_capacity` (
  `capacity_id` int NOT NULL,
  `eating_out_id` int NOT NULL,
  `max_capacity` int NOT NULL,
  `max_group_size` int DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `max_reservation_duration` int DEFAULT '240' COMMENT 'Maximum allowed reservation time in minutes',
  `buffer_minutes` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_capacity_bookings`
--

CREATE TABLE `restaurant_capacity_bookings` (
  `capacity_booking_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `eating_out_id` int NOT NULL,
  `reservation_start` datetime NOT NULL,
  `reservation_end` datetime NOT NULL,
  `guests` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_table`
--

CREATE TABLE `restaurant_table` (
  `table_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `table_number` varchar(10) NOT NULL,
  `seats` int NOT NULL,
  `status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int NOT NULL,
  `user_id` int NOT NULL,
  `review_type` enum('homestay','eating_out','tour_package') NOT NULL,
  `reference_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_assignments`
--

CREATE TABLE `room_assignments` (
  `assignment_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int NOT NULL COMMENT 'staff user_id',
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `actual_checkout_time` timestamp NULL DEFAULT NULL,
  `key_card_issued` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('assigned','checked_in','checked_out','cancelled','reassigned') COLLATE utf8mb4_unicode_ci DEFAULT 'assigned',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_availability`
--

CREATE TABLE `room_availability` (
  `availability_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `date` date NOT NULL,
  `available_units` int NOT NULL DEFAULT '0',
  `total_units` int NOT NULL DEFAULT '0',
  `min_stay` int DEFAULT '1',
  `max_stay` int DEFAULT NULL,
  `closed` tinyint(1) DEFAULT '0',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `room_availability_view`
-- (See below for the actual view)
--
CREATE TABLE `room_availability_view` (
`inventory_id` int
,`room_type_id` int
,`room_type` varchar(100)
,`unit_number` varchar(50)
,`floor` varchar(20)
,`room_status` enum('available','occupied','reserved','maintenance','out_of_order','cleaning')
,`current_status` varchar(12)
,`check_in_date` date
,`check_out_date` date
);

-- --------------------------------------------------------

--
-- Table structure for table `room_bookings`
--

CREATE TABLE `room_bookings` (
  `booking_id` int NOT NULL,
  `room_type_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `guests` int NOT NULL DEFAULT '1',
  `nights` int DEFAULT NULL,
  `room_price_per_night` decimal(10,2) NOT NULL,
  `total_room_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `homestay_id` int DEFAULT NULL,
  `guest_name` varchar(150) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `guest_id_type` varchar(50) DEFAULT NULL,
  `guest_id_number` varchar(100) DEFAULT NULL,
  `number_of_adults` int DEFAULT '1',
  `number_of_children` int DEFAULT '0',
  `early_checkin` tinyint(1) DEFAULT '0',
  `late_checkout` tinyint(1) DEFAULT '0',
  `early_checkin_fee` decimal(10,2) DEFAULT '0.00',
  `late_checkout_fee` decimal(10,2) DEFAULT '0.00',
  `extra_bed_count` int DEFAULT '0',
  `extra_bed_fee` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_charge` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) DEFAULT '0.00',
  `deposit_amount` decimal(10,2) DEFAULT '0.00',
  `deposit_paid` tinyint(1) DEFAULT '0',
  `special_requests` text,
  `internal_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `multi_room_booking_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room_bookings`
--

INSERT INTO `room_bookings` (`booking_id`, `room_type_id`, `inventory_id`, `check_in_date`, `check_out_date`, `guests`, `nights`, `room_price_per_night`, `total_room_amount`, `created_at`, `homestay_id`, `guest_name`, `guest_email`, `guest_phone`, `guest_id_type`, `guest_id_number`, `number_of_adults`, `number_of_children`, `early_checkin`, `late_checkout`, `early_checkin_fee`, `late_checkout_fee`, `extra_bed_count`, `extra_bed_fee`, `tax_amount`, `service_charge`, `discount_amount`, `final_amount`, `deposit_amount`, `deposit_paid`, `special_requests`, `internal_notes`, `updated_at`, `multi_room_booking_id`) VALUES
(1, 3, 19, '2025-10-22', '2025-10-23', 2, 9, '600000.00', '5400000.00', '2025-10-21 14:34:48', 2, 'IMANISHIMWE Noel', 'imanishimwenoel@gmail.com', '+250788123456', 'passport', 'P123456789', 2, 0, 0, 0, '0.00', '0.00', 0, '0.00', '972000.00', '270000.00', '0.00', '6642000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-21 23:45:13', NULL),
(2, 4, 18, '2025-10-18', '2025-10-27', 1, 9, '500000.00', '4500000.00', '2025-10-22 07:01:04', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '810000.00', '225000.00', '0.00', '5535000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-22 07:02:27', NULL),
(3, 4, 28, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-22 07:14:22', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-22 07:15:16', NULL),
(4, 4, 29, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-23 08:44:07', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-23 08:44:59', NULL),
(5, 3, 26, '2025-10-26', '2025-10-29', 1, 3, '600000.00', '1800000.00', '2025-10-23 10:05:14', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '324000.00', '90000.00', '0.00', '2214000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-23 10:06:57', NULL),
(6, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 17:10:31', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 17:10:31', NULL),
(7, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:04:16', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 19:04:16', NULL),
(8, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:09:24', 2, 'Test Guest 2', 'test2@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Test booking 2', NULL, '2025-10-24 19:09:24', NULL),
(9, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:09:34', 2, 'Test Guest 3', 'test3@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Test booking 3', NULL, '2025-10-24 19:09:34', NULL),
(10, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:12:43', 2, 'Test Guest Final', 'testfinal@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Final test', NULL, '2025-10-24 19:12:43', NULL),
(11, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:12:59', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 19:12:59', NULL),
(12, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:13:07', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 19:13:07', NULL),
(13, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:13:09', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 19:13:09', NULL),
(14, 4, NULL, '2025-10-26', '2025-10-29', 1, 3, '500000.00', '1500000.00', '2025-10-24 19:13:11', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '270000.00', '75000.00', '0.00', '1845000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-24 19:13:11', NULL),
(15, 4, NULL, '2025-11-01', '2025-11-03', 1, 2, '500000.00', '1000000.00', '2025-10-24 19:15:57', 2, 'Test Available Period', 'testavailable@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '180000.00', '50000.00', '0.00', '1230000.00', '0.00', 0, 'Test available period', NULL, '2025-10-24 19:15:57', NULL),
(16, 3, 18, '2025-10-28', '2025-10-30', 1, 2, '600000.00', '1200000.00', '2025-10-27 08:51:25', 2, 'NIYOGUSHIMWA Nathanael', 'nathan@gmail.com', '+250788123456', 'passport', 'P123456789', 1, 0, 0, 0, '0.00', '0.00', 0, '0.00', '216000.00', '60000.00', '0.00', '1476000.00', '0.00', 0, 'Late check-in expected around 10 PM', NULL, '2025-10-27 08:53:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `image_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_type` enum('main','gallery') DEFAULT 'gallery',
  `image_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room_images`
--

INSERT INTO `room_images` (`image_id`, `room_type_id`, `image_path`, `image_type`, `image_order`, `created_at`) VALUES
(1, 3, 'uploads/rooms/room_0_images-1761031719738-483181155.png', 'main', 0, '2025-10-21 07:28:39'),
(2, 4, 'uploads/rooms/room_1_images-1761031719740-995235909.png', 'main', 0, '2025-10-21 07:28:39'),
(3, 5, 'uploads/rooms/room_images-1761033629043-543366824.png', 'main', 0, '2025-10-21 08:00:29');

-- --------------------------------------------------------

--
-- Table structure for table `room_inventory`
--

CREATE TABLE `room_inventory` (
  `inventory_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `unit_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 101, 102, A1, B2',
  `floor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','occupied','reserved','maintenance','out_of_order','cleaning') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `last_cleaned` timestamp NULL DEFAULT NULL,
  `last_maintenance` timestamp NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_inventory`
--

INSERT INTO `room_inventory` (`inventory_id`, `room_type_id`, `unit_number`, `floor`, `status`, `last_cleaned`, `last_maintenance`, `notes`, `created_at`, `updated_at`) VALUES
(6, 2, '101', NULL, 'available', NULL, NULL, NULL, '2025-10-21 02:48:29', '2025-10-21 02:48:29'),
(18, 3, '101', NULL, 'occupied', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-27 08:54:03'),
(19, 3, '102', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-27 08:45:09'),
(20, 3, '103', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(21, 3, '104', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(22, 3, '105', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(23, 3, '106', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(24, 3, '107', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(25, 3, '108', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(26, 3, '109', NULL, 'available', '2025-10-27 08:18:14', NULL, NULL, '2025-10-21 07:28:39', '2025-10-27 08:18:14'),
(27, 3, '110', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(28, 4, '101', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-27 08:45:24'),
(29, 4, '102', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-27 08:45:24'),
(30, 4, '103', NULL, 'available', NULL, NULL, NULL, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(31, 3, '301', '1', 'available', NULL, NULL, NULL, '2025-10-27 07:16:13', '2025-10-27 07:16:13');

-- --------------------------------------------------------

--
-- Table structure for table `room_rates`
--

CREATE TABLE `room_rates` (
  `rate_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `rate_name` varchar(100) NOT NULL,
  `rate_type` enum('base','seasonal','weekend','holiday','promotional','last_minute') DEFAULT 'base',
  `price_per_night` decimal(10,2) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `min_nights` int DEFAULT '1',
  `max_nights` int DEFAULT NULL,
  `days_of_week` varchar(50) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_status_log`
--

CREATE TABLE `room_status_log` (
  `log_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `previous_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int NOT NULL COMMENT 'user_id',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_status_log`
--

INSERT INTO `room_status_log` (`log_id`, `inventory_id`, `previous_status`, `new_status`, `changed_by`, `reason`, `notes`, `created_at`) VALUES
(1, 19, 'occupied', 'cleaning', 6, 'Guest checked out', NULL, '2025-10-22 07:48:55'),
(2, 28, 'occupied', 'cleaning', 6, 'Guest checked out', NULL, '2025-10-22 07:51:23'),
(3, 18, 'occupied', 'cleaning', 6, 'Guest checked out', NULL, '2025-10-23 08:42:42'),
(4, 29, 'occupied', 'cleaning', 6, 'Guest checked out', NULL, '2025-10-27 07:23:13'),
(5, 26, 'occupied', 'cleaning', 6, 'Guest checked out', NULL, '2025-10-27 07:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `room_types`
--

CREATE TABLE `room_types` (
  `room_type_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `max_people` int NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `included` varchar(255) DEFAULT NULL,
  `size_sqm` int DEFAULT NULL,
  `minibar` tinyint(1) DEFAULT '0',
  `tea_coffee_facilities` tinyint(1) DEFAULT '0',
  `wardrobe_hangers` tinyint(1) DEFAULT '0',
  `luggage_rack` tinyint(1) DEFAULT '0',
  `safe` tinyint(1) DEFAULT '0',
  `air_conditioner` tinyint(1) DEFAULT '0',
  `heater` tinyint(1) DEFAULT '0',
  `fan` tinyint(1) DEFAULT '0',
  `wifi` tinyint(1) DEFAULT '0',
  `tv` tinyint(1) DEFAULT '0',
  `speaker` tinyint(1) DEFAULT '0',
  `phone` tinyint(1) DEFAULT '0',
  `usb_charging_points` tinyint(1) DEFAULT '0',
  `power_adapters` tinyint(1) DEFAULT '0',
  `desk_workspace` tinyint(1) DEFAULT '0',
  `iron_ironing_board` tinyint(1) DEFAULT '0',
  `hairdryer` tinyint(1) DEFAULT '0',
  `towels` tinyint(1) DEFAULT '0',
  `bathrobes` tinyint(1) DEFAULT '0',
  `slippers` tinyint(1) DEFAULT '0',
  `toiletries` tinyint(1) DEFAULT '0',
  `teeth_shaving_kits` tinyint(1) DEFAULT '0',
  `table_lamps` tinyint(1) DEFAULT '0',
  `bedside_lamps` tinyint(1) DEFAULT '0',
  `alarm_clock` tinyint(1) DEFAULT '0',
  `laundry_bag` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room_types`
--

INSERT INTO `room_types` (`room_type_id`, `homestay_id`, `name`, `description`, `price`, `max_people`, `discount`, `included`, `size_sqm`, `minibar`, `tea_coffee_facilities`, `wardrobe_hangers`, `luggage_rack`, `safe`, `air_conditioner`, `heater`, `fan`, `wifi`, `tv`, `speaker`, `phone`, `usb_charging_points`, `power_adapters`, `desk_workspace`, `iron_ironing_board`, `hairdryer`, `towels`, `bathrobes`, `slippers`, `toiletries`, `teeth_shaving_kits`, `table_lamps`, `bedside_lamps`, `alarm_clock`, `laundry_bag`, `created_at`, `updated_at`) VALUES
(3, 2, 'Deluxe Room', 'The Deluxe Room at Galaxy Hotel offers a perfect blend of comfort and elegance, featuring a spacious layout with modern furnishings and soothing décor. Each room is equipped with a plush king-size or twin bed, a private balcony with city or pool views, air conditioning, a flat-screen TV, complimentary Wi-Fi, and a minibar. Guests can also enjoy a luxurious en-suite bathroom with premium toiletries and a walk-in shower. Designed for both business and leisure travelers, the Deluxe Room provides a relaxing retreat with all the amenities needed for a pleasant and memorable stay.', '600000.00', 3, '0.00', 'Breakfast', 34, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(4, 2, 'Villa', 'This is villa room.', '500000.00', 1, '0.00', '', 40, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, '2025-10-21 07:28:39', '2025-10-21 07:28:39'),
(5, 2, 'Single Room', '', '200000.00', 1, '0.00', '', 56, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '2025-10-21 08:00:29', '2025-10-21 08:00:29');

-- --------------------------------------------------------

--
-- Table structure for table `staff_activity_logs`
--

CREATE TABLE `staff_activity_logs` (
  `log_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `staff_activity_logs`
--

INSERT INTO `staff_activity_logs` (`log_id`, `staff_id`, `action`, `table_name`, `record_id`, `timestamp`) VALUES
(3, 6, 'record_folio_payment', 'bookings', 2, '2025-10-22 23:07:41'),
(5, 6, 'create_guest_request', 'guest_requests', 1, '2025-10-23 00:48:43'),
(6, 6, 'update_request_status', 'guest_requests', 1, '2025-10-23 00:49:35'),
(7, 6, 'create_guest_request', 'guest_requests', 2, '2025-10-23 00:51:11'),
(8, 6, 'create_guest_request', 'guest_requests', 3, '2025-10-23 05:16:56'),
(9, 6, 'update_request_status', 'guest_requests', 2, '2025-10-23 05:19:08'),
(10, 6, 'create_guest_request', 'guest_requests', 4, '2025-10-23 05:33:10'),
(11, 6, 'create_guest_request', 'guest_requests', 5, '2025-10-23 05:41:37'),
(12, 6, 'create_guest_request', 'guest_requests', 6, '2025-10-23 05:51:56'),
(13, 8, 'create_guest_request', 'guest_requests', 7, '2025-10-23 06:43:19'),
(14, 6, 'create_guest_request', 'guest_requests', 8, '2025-10-23 07:42:47'),
(15, 6, 'create_guest_request', 'guest_requests', 9, '2025-10-23 08:18:30'),
(16, 1, 'create_guest_request', 'guest_requests', 10, '2025-10-23 08:23:10'),
(17, 1, 'create_guest_request', 'guest_requests', 11, '2025-10-23 08:36:58'),
(18, 6, 'create_guest_request', 'guest_requests', 12, '2025-10-23 08:40:04'),
(19, 6, 'create_guest_request', 'guest_requests', 13, '2025-10-23 10:23:04'),
(20, 6, 'create_guest_request', 'guest_requests', 14, '2025-10-23 11:20:59'),
(21, 6, 'create_guest_request', 'guest_requests', 15, '2025-10-23 13:54:32'),
(22, 6, 'create_guest_request', 'guest_requests', 16, '2025-11-03 09:05:29'),
(23, 6, 'update_request_status', 'guest_requests', 16, '2025-11-03 09:06:15');

-- --------------------------------------------------------

--
-- Table structure for table `staff_profiles`
--

CREATE TABLE `staff_profiles` (
  `staff_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `assigned_hotel` int DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_roles`
--

CREATE TABLE `staff_roles` (
  `role_id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_schedules`
--

CREATE TABLE `staff_schedules` (
  `schedule_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `shift_date` date NOT NULL,
  `shift_start` time NOT NULL,
  `shift_end` time NOT NULL,
  `shift_type` enum('morning','afternoon','evening','night','full_day') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full_day',
  `status` enum('scheduled','confirmed','completed','cancelled','no_show') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `actual_start` timestamp NULL DEFAULT NULL,
  `actual_end` timestamp NULL DEFAULT NULL,
  `break_duration` int DEFAULT '0' COMMENT 'Minutes',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_cost_log`
--

CREATE TABLE `stock_cost_log` (
  `cost_log_id` int NOT NULL,
  `item_id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `old_unit_cost` decimal(10,2) DEFAULT NULL,
  `new_unit_cost` decimal(10,2) NOT NULL,
  `cost_change_reason` enum('supplier_price_change','market_adjustment','bulk_discount','contract_renewal','manual_update') NOT NULL,
  `effective_date` date NOT NULL,
  `notes` text,
  `updated_by` int DEFAULT NULL COMMENT 'User who updated the cost',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `item_id` int NOT NULL,
  `homestay_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `current_quantity` int DEFAULT '0',
  `reorder_level` int DEFAULT '0',
  `unit_price` decimal(10,2) DEFAULT '0.00',
  `status` enum('active','inactive','discontinued') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_items`
--

INSERT INTO `stock_items` (`item_id`, `homestay_id`, `name`, `description`, `category`, `unit`, `current_quantity`, `reorder_level`, `unit_price`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Soda', '', 'Drinks', 'Box', 1290, 100, '10000.00', 'active', '2025-10-24 07:06:02', '2025-10-25 06:28:26'),
(2, 2, 'Rice', NULL, 'Food', 'kg', 50, 100, '2000.00', 'active', '2025-10-25 07:15:02', '2025-10-25 09:47:38'),
(3, 2, 'Cooking Oil', NULL, 'Food', 'L', 5, 0, '5000.00', 'active', '2025-10-25 07:15:02', '2025-10-25 09:47:38'),
(4, 2, 'Towels', NULL, 'Linen', 'pieces', 100, 0, '3000.00', 'active', '2025-10-25 07:15:02', '2025-10-25 07:15:30');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `movement_id` int NOT NULL,
  `item_id` int NOT NULL,
  `homestay_id` int DEFAULT NULL,
  `movement_type` enum('purchase','usage','adjustment','transfer','return') NOT NULL,
  `quantity` int NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT NULL,
  `account_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `movement_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`movement_id`, `item_id`, `homestay_id`, `movement_type`, `quantity`, `unit_cost`, `total_cost`, `account_id`, `staff_id`, `supplier_id`, `reference`, `movement_date`, `notes`, `created_at`) VALUES
(1, 1, 2, 'purchase', 100, '10000.00', '1000000.00', NULL, NULL, 3, 'PO-PO-1761317891010', '2025-10-25 06:28:26', 'Received from Purchase Order PO-1761317891010', '2025-10-25 06:28:26'),
(2, 1, 2, 'purchase', 190, '10000.00', '1900000.00', NULL, NULL, 3, 'PO-PO-1761317891010', '2025-10-25 06:28:26', 'Received from Purchase Order PO-1761317891010', '2025-10-25 06:28:26'),
(6, 2, 2, 'purchase', 25, '2000.00', '50000.00', NULL, NULL, NULL, NULL, '2025-10-25 10:00:00', NULL, '2025-10-25 07:15:36'),
(7, 3, 2, 'purchase', 10, '5000.00', '50000.00', NULL, NULL, NULL, NULL, '2025-10-25 10:30:00', NULL, '2025-10-25 07:15:36'),
(8, 4, 2, 'purchase', 50, '3000.00', '150000.00', NULL, NULL, NULL, NULL, '2025-10-25 11:00:00', NULL, '2025-10-25 07:15:36');

-- --------------------------------------------------------

--
-- Table structure for table `stock_orders`
--

CREATE TABLE `stock_orders` (
  `order_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('pending','verified','approved','sent','received','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `received_by` int DEFAULT NULL,
  `account_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_orders`
--

INSERT INTO `stock_orders` (`order_id`, `homestay_id`, `supplier_id`, `order_number`, `order_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `total_amount`, `notes`, `created_by`, `approved_by`, `received_by`, `account_id`, `created_at`, `updated_at`) VALUES
(2, 2, 3, 'PO-1761317891010', '2025-10-24 00:00:00', '2025-10-31', '2025-10-25', 'received', '3000000.00', '', NULL, NULL, NULL, NULL, '2025-10-24 14:58:11', '2025-10-25 06:28:26'),
(3, 2, 3, 'PO-001', '2025-10-20 00:00:00', NULL, NULL, 'received', '1500000.00', NULL, NULL, NULL, NULL, NULL, '2025-10-25 09:57:40', '2025-10-25 09:57:40'),
(4, 2, 3, 'PO-002', '2025-10-22 00:00:00', NULL, NULL, 'verified', '2000000.00', NULL, NULL, NULL, NULL, NULL, '2025-10-25 09:57:40', '2025-11-03 09:04:02'),
(5, 2, 4, 'PO-003', '2025-10-21 00:00:00', NULL, NULL, 'received', '800000.00', NULL, NULL, NULL, NULL, NULL, '2025-10-25 09:57:40', '2025-10-25 09:57:40'),
(6, 2, 5, 'PO-004', '2025-10-23 00:00:00', NULL, NULL, 'approved', '1200000.00', NULL, NULL, NULL, NULL, NULL, '2025-10-25 09:57:40', '2025-10-25 09:57:40'),
(7, 2, 3, 'PO-1762160292627', '2025-11-03 00:00:00', '2025-11-03', NULL, 'approved', '700000.00', '', NULL, NULL, NULL, NULL, '2025-11-03 08:58:12', '2025-11-03 08:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `stock_order_items`
--

CREATE TABLE `stock_order_items` (
  `order_item_id` int NOT NULL,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity_ordered` int NOT NULL,
  `quantity_received` int DEFAULT '0',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_order_items`
--

INSERT INTO `stock_order_items` (`order_item_id`, `order_id`, `item_id`, `quantity_ordered`, `quantity_received`, `unit_price`, `total_price`, `notes`, `created_at`) VALUES
(1, 2, 1, 100, 100, '10000.00', '1000000.00', NULL, '2025-10-24 14:58:11'),
(2, 2, 1, 200, 190, '10000.00', '2000000.00', NULL, '2025-10-24 14:58:11'),
(3, 7, 3, 100, 0, '5000.00', '500000.00', NULL, '2025-11-03 08:58:12'),
(4, 7, 2, 100, 0, '2000.00', '200000.00', NULL, '2025-11-03 08:58:12');

-- --------------------------------------------------------

--
-- Table structure for table `stock_suppliers`
--

CREATE TABLE `stock_suppliers` (
  `supplier_id` int NOT NULL,
  `homestay_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `notes` text,
  `address` text,
  `status` enum('active','inactive','blacklisted') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_suppliers`
--

INSERT INTO `stock_suppliers` (`supplier_id`, `homestay_id`, `name`, `email`, `phone`, `tin`, `contact_person`, `notes`, `address`, `status`, `created_at`, `updated_at`) VALUES
(3, NULL, 'NIYOGUSHIMWA Nathanael', 'nathanaelniyogushimwa@gmail.com', '0781796824', '908237', 'NIYOGUSHIMWA Natanael', '', 'Kigali\nMusanze, Rwanda', 'active', '2025-10-24 02:08:56', '2025-10-24 02:08:56'),
(4, 2, 'ABC Food Supplies', 'abc@food.com', '+250788123456', NULL, NULL, NULL, NULL, 'active', '2025-10-25 09:57:40', '2025-10-25 09:57:40'),
(5, 2, 'XYZ Cleaning Supplies', 'xyz@cleaning.com', '+250788654321', NULL, NULL, NULL, NULL, 'active', '2025-10-25 09:57:40', '2025-10-25 09:57:40'),
(6, 2, 'DEF Electronics', 'def@electronics.com', '+250788987654', NULL, NULL, NULL, NULL, 'inactive', '2025-10-25 09:57:40', '2025-10-25 09:57:40');

-- --------------------------------------------------------

--
-- Table structure for table `stock_units`
--

CREATE TABLE `stock_units` (
  `unit_id` int NOT NULL,
  `unit_name` varchar(50) NOT NULL,
  `unit_symbol` varchar(10) NOT NULL,
  `unit_type` enum('weight','volume','length','area','count','time') NOT NULL,
  `base_unit_id` int DEFAULT NULL COMMENT 'For conversion calculations',
  `conversion_factor` decimal(10,4) DEFAULT '1.0000' COMMENT 'Factor to convert to base unit',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_units`
--

INSERT INTO `stock_units` (`unit_id`, `unit_name`, `unit_symbol`, `unit_type`, `base_unit_id`, `conversion_factor`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Piece', 'pcs', 'count', NULL, '1.0000', 'Individual items', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(2, 'Set', 'set', 'count', NULL, '1.0000', 'Complete set of items', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(3, 'Pair', 'pair', 'count', NULL, '1.0000', 'Two items together', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(4, 'Dozen', 'doz', 'count', NULL, '1.0000', '12 pieces', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(6, 'Pack', 'pack', 'count', NULL, '1.0000', 'Items in a pack', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(7, 'Kilogram', 'kg', 'weight', NULL, '1.0000', 'Metric weight unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(8, 'Gram', 'g', 'weight', NULL, '1.0000', 'Small weight unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(9, 'Pound', 'lb', 'weight', NULL, '1.0000', 'Imperial weight unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(10, 'Liter', 'L', 'volume', NULL, '1.0000', 'Metric volume unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(11, 'Milliliter', 'ml', 'volume', NULL, '1.0000', 'Small volume unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(12, 'Gallon', 'gal', 'volume', NULL, '1.0000', 'Imperial volume unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(13, 'Meter', 'm', 'length', NULL, '1.0000', 'Metric length unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(14, 'Centimeter', 'cm', 'length', NULL, '1.0000', 'Small length unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(15, 'Foot', 'ft', 'length', NULL, '1.0000', 'Imperial length unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(16, 'Square Meter', 'm²', 'area', NULL, '1.0000', 'Metric area unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(17, 'Square Foot', 'ft²', 'area', NULL, '1.0000', 'Imperial area unit', 1, '2025-10-24 00:29:13', '2025-10-24 00:29:13'),
(35, 'Box', 'box', 'count', NULL, '1.0000', 'Items in a box', 1, '2025-10-24 01:39:28', '2025-10-24 01:39:28');

-- --------------------------------------------------------

--
-- Table structure for table `stock_usage_logs`
--

CREATE TABLE `stock_usage_logs` (
  `usage_id` int NOT NULL,
  `item_id` int NOT NULL,
  `homestay_id` int DEFAULT NULL,
  `used_for` enum('room','restaurant','maintenance','housekeeping','laundry','general') NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `linked_service_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `used_by` int DEFAULT NULL,
  `usage_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_usage_logs`
--

INSERT INTO `stock_usage_logs` (`usage_id`, `item_id`, `homestay_id`, `used_for`, `department`, `reference_id`, `linked_service_id`, `quantity`, `used_by`, `usage_date`, `notes`, `created_at`) VALUES
(4, 1, 2, 'housekeeping', 'Front Desk', NULL, NULL, 5, 2, '2025-10-25 09:43:29', 'Used for room cleaning', '2025-10-25 09:43:29'),
(5, 2, 2, 'restaurant', 'Kitchen', NULL, NULL, 10, 2, '2025-10-25 09:43:29', 'Used for food preparation', '2025-10-25 09:43:29'),
(6, 1, 2, 'maintenance', 'Maintenance', NULL, NULL, 2, 2, '2025-10-25 09:43:29', 'Used for equipment repair', '2025-10-25 09:43:29');

-- --------------------------------------------------------

--
-- Stand-in structure for view `stock_value_summary`
-- (See below for the actual view)
--
CREATE TABLE `stock_value_summary` (
`item_id` int
,`item_name` varchar(100)
,`category` varchar(50)
,`current_quantity` int
,`unit_price` decimal(10,2)
,`total_value` decimal(20,2)
,`homestay_id` int
,`homestay_name` varchar(150)
,`unit` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `supplier_performance`
-- (See below for the actual view)
--
CREATE TABLE `supplier_performance` (
`supplier_id` int
,`supplier_name` varchar(255)
,`contact_email` varchar(255)
,`contact_phone` varchar(50)
,`total_orders` bigint
,`total_purchase_value` decimal(34,2)
,`avg_order_value` decimal(16,6)
,`completed_orders` bigint
,`cancelled_orders` bigint
,`delivery_success_rate` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `role` enum('admin','vendor','client') COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `last_login` datetime DEFAULT NULL,
  `failed_logins` int DEFAULT '0',
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role`, `name`, `email`, `phone`, `phone_verified`, `password_hash`, `address`, `gender`, `profile_image`, `cover_image`, `is_active`, `email_verified`, `last_login`, `failed_logins`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(2, 'vendor', 'Vendor', 'vendor@gmail.com', '+250724718389', 0, '$2a$12$oNMCtER.Muvo30aRriUA8eaDVjDCLrpG.ezg3bKS0/htJ8cuNb8l2', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-11-06 08:13:36', 0, NULL, NULL, '2025-09-11 13:27:52', '2025-11-06 08:13:36'),
(3, 'admin', 'Admin', 'admin@gmail.com', '+250724718389', 0, '$2a$12$iW3M/Wponox8dWrw2/1H4.beHQl0XM98ZJNDBwySwkCOfvJO.5Ciu', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-10-14 05:36:31', 0, NULL, NULL, '2025-09-11 13:28:33', '2025-10-14 05:36:31'),
(4, 'client', 'MUGWANEZA Jules', 'client@gmail.com', '+250724718389', 0, '$2a$12$T/JcpleV8wfetsyst1h6XeH.n8pkUBFR8ptETRtZeE3WPj47x.Iwi', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-09-15 05:45:02', 1, NULL, NULL, '2025-09-11 13:29:28', '2025-10-10 10:32:27'),
(5, 'client', 'Vendor1', 'vendor1@gmail.com', '+250724718389', 0, '$2a$12$z.HKxo.OF4V8BbHyUFg3/e75i4ku.tZbo/Ml0C8UOFVm0OjOUXFx6', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-09-15 05:40:20', '2025-09-15 05:40:20'),
(6, 'vendor', 'NIYOGUSHIMWA Natanael', 'nathanaelniyogushimwa@gmail.com', '+250781796824', 0, '$2a$12$VFb2QGORBleh4.B2.8LawuqmA1DM5jW2HruMB8AwWqEWExxDhyTI6', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-20 01:02:15', 5, NULL, NULL, '2025-09-15 06:26:35', '2025-09-30 12:50:03'),
(7, 'vendor', 'IMANISHIMWE Noel', 'noel@gmail.com', '+250781721787', 0, '$2a$12$sVwXled8Ra/sCZ9O5kVT9O32zeZe1ymMyxFx/fgpHTOyDgrz5qunm', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-30 13:10:14', 0, NULL, NULL, '2025-09-15 16:11:51', '2025-09-30 13:10:14'),
(8, 'vendor', 'MUGABO Enock', 'mugabo@gmail.com', '+25078298983', 0, '$2a$12$vUqBkNJ./Yqm6f3RIZWPkuq/aOsFuqe2tfBnPgGBZw9KNUEOy7NSy', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-17 15:45:43', 0, NULL, NULL, '2025-09-17 15:45:43', '2025-09-17 15:45:43'),
(9, 'client', 'Test User', 'test@example.com', '+1234567890', 0, '$2a$12$H9Bp4ZBhj49yFI3zN8ZlaeZPcRqoggCG2RkNClIgQA1xkojRvzehK', '123 Test Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 2, NULL, NULL, '2025-09-28 02:13:52', '2025-09-29 12:43:47'),
(10, 'vendor', 'Test Vendor', 'vendor@example.com', '+1234567891', 0, '$2a$12$IxuWkY5gRlFtSYOFIo7MRO82tHgabLVmAWUYMOXd7M7k2cuDTm/sq', '123 Vendor Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 1, NULL, NULL, '2025-09-28 02:19:25', '2025-09-28 08:49:36'),
(11, 'client', 'Test Client', 'client@example.com', '+1234567892', 0, '$2a$12$ZRGuEU1yrKZBdFFsFRBnhuCLI9ZtdJQngDoQNsuebaZ41ix7o7CWu', '123 Client Street', 'female', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 0, NULL, NULL, '2025-09-28 02:19:27', '2025-09-28 06:16:35'),
(12, 'vendor', 'Category Test Vendor', 'categoryvendor@example.com', '+1234567893', 0, '$2a$12$gpCPJU6PKnXmGGDuzdcw7eu.iwpzxuz99EI7uICDdvgwmLHwn0TPy', '123 Category Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 0, NULL, NULL, '2025-09-28 03:04:52', '2025-09-28 06:16:35'),
(13, 'vendor', 'Johnson Johnson', 'john@gmail.com', '+250734567890', 0, '$2a$12$CVA.hD9ksouRCvqWNdBkxOcIObzgIWaTZRnrqBrwlcFuaPO4yG0aG', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:36:12', '2025-10-03 13:36:12'),
(14, 'vendor', 'John Doe', 'john.doe.test@example.com', '1234567890', 0, '$2a$12$r0/9HpRzInnx0X0F7WTv4O5VnqoyZzv3RN7BMVwlrH7ZZQAXVMvLO', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:37:17', '2025-10-03 13:37:17'),
(15, 'vendor', 'John Doe', 'john@example.com', '1234567890', 0, '$2a$12$61fSCsX56qmJhjB7o.2L3.7pIrFcd.F306rGHA5x8WBJguimFZEke', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:53:54', '2025-10-03 13:53:54'),
(16, 'vendor', 'Johnson Johnson', 'john1@gmail.com', '+250734567890', 0, '$2a$12$MQSkvA.awQ7efzR.sqP8qORA/jSDHNLMucNkXxlTwD9FzEDj2VnWG', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:57:34', '2025-10-03 13:57:34'),
(17, 'vendor', 'Test Vendor Admin', 'testvendor@admin.com', '1234567890', 0, '$2a$12$PPXAunK6kee8i4Drxl7SEOVIKFg0ZuYKWyabQ7Qd7U02ePAsOOlHS', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 14:19:43', '2025-10-03 14:19:43'),
(18, 'vendor', 'NIYO John', 'john25@gmail.com', '+250781796825', 0, '$2a$12$5W4rQksAe57bOL.y.oRcgegZB.Id.FrvcPEUMWjeuRam5sktPCMx.', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-04 11:51:08', '2025-10-04 11:51:08'),
(19, 'vendor', 'MUKUNZI Poul', 'poul@gmail.com', '+250781796828', 0, '$2a$12$9ZVB17aAXnZtCuQKHwoiT.x1UjvZJXSzqve2u8vvb7ums3pnCKW8C', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-07 18:12:05', '2025-10-07 18:12:05'),
(20, 'vendor', 'MUGABO Jaques', 'mujaques@gmail.com', '+250781796828', 0, '$2a$12$UOMKZkC/xyaenMOefMjwgeI9huUt6jn0b01XoKezG6I8C4K14YRiC', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-07 18:48:30', '2025-10-07 18:48:30');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` int NOT NULL,
  `user_id` int NOT NULL,
  `refresh_token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `low_stock_alerts`
--
DROP TABLE IF EXISTS `low_stock_alerts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`localhost` SQL SECURITY DEFINER VIEW `low_stock_alerts`  AS SELECT `si`.`item_id` AS `item_id`, `si`.`name` AS `item_name`, `si`.`current_quantity` AS `current_quantity`, `si`.`reorder_level` AS `reorder_threshold`, `si`.`unit_price` AS `unit_price`, `si`.`homestay_id` AS `homestay_id`, `h`.`name` AS `homestay_name`, (case when (`si`.`current_quantity` <= 0) then 'out_of_stock' when (`si`.`current_quantity` <= `si`.`reorder_level`) then 'low_stock' when (`si`.`current_quantity` <= (`si`.`reorder_level` * 1.5)) then 'warning' else 'normal' end) AS `alert_level` FROM (`stock_items` `si` left join `homestays` `h` on((`si`.`homestay_id` = `h`.`homestay_id`))) WHERE ((`si`.`status` = 'active') AND (`si`.`current_quantity` <= (`si`.`reorder_level` * 1.5))) ORDER BY (case when (`si`.`current_quantity` <= 0) then 'out_of_stock' when (`si`.`current_quantity` <= `si`.`reorder_level`) then 'low_stock' when (`si`.`current_quantity` <= (`si`.`reorder_level` * 1.5)) then 'warning' else 'normal' end) ASC, `si`.`current_quantity` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `room_availability_view`
--
DROP TABLE IF EXISTS `room_availability_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`localhost` SQL SECURITY DEFINER VIEW `room_availability_view`  AS SELECT `ri`.`inventory_id` AS `inventory_id`, `rt`.`room_type_id` AS `room_type_id`, `rt`.`name` AS `room_type`, `ri`.`unit_number` AS `unit_number`, `ri`.`floor` AS `floor`, `ri`.`status` AS `room_status`, (case when (`b`.`status` in ('pending','confirmed')) then 'reserved' when ((`b`.`status` = 'completed') and (`ri`.`status` = 'occupied')) then 'occupied' else `ri`.`status` end) AS `current_status`, `rb`.`check_in_date` AS `check_in_date`, `rb`.`check_out_date` AS `check_out_date` FROM (((`room_inventory` `ri` join `room_types` `rt` on((`ri`.`room_type_id` = `rt`.`room_type_id`))) left join `room_bookings` `rb` on((`ri`.`inventory_id` = `rb`.`inventory_id`))) left join `bookings` `b` on(((`rb`.`booking_id` = `b`.`booking_id`) and (`b`.`status` in ('pending','confirmed'))))) ;

-- --------------------------------------------------------

--
-- Structure for view `stock_value_summary`
--
DROP TABLE IF EXISTS `stock_value_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`localhost` SQL SECURITY DEFINER VIEW `stock_value_summary`  AS SELECT `si`.`item_id` AS `item_id`, `si`.`name` AS `item_name`, `si`.`category` AS `category`, `si`.`current_quantity` AS `current_quantity`, `si`.`unit_price` AS `unit_price`, (`si`.`current_quantity` * `si`.`unit_price`) AS `total_value`, `si`.`homestay_id` AS `homestay_id`, `h`.`name` AS `homestay_name`, `si`.`unit` AS `unit` FROM (`stock_items` `si` left join `homestays` `h` on((`si`.`homestay_id` = `h`.`homestay_id`))) WHERE (`si`.`status` = 'active') ORDER BY (`si`.`current_quantity` * `si`.`unit_price`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `supplier_performance`
--
DROP TABLE IF EXISTS `supplier_performance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`localhost` SQL SECURITY DEFINER VIEW `supplier_performance`  AS SELECT `ss`.`supplier_id` AS `supplier_id`, `ss`.`name` AS `supplier_name`, `ss`.`email` AS `contact_email`, `ss`.`phone` AS `contact_phone`, count(distinct `so`.`order_id`) AS `total_orders`, sum(`so`.`total_amount`) AS `total_purchase_value`, avg(`so`.`total_amount`) AS `avg_order_value`, count(distinct (case when (`so`.`status` = 'delivered') then `so`.`order_id` end)) AS `completed_orders`, count(distinct (case when (`so`.`status` = 'cancelled') then `so`.`order_id` end)) AS `cancelled_orders`, round(((count(distinct (case when (`so`.`status` = 'delivered') then `so`.`order_id` end)) * 100.0) / nullif(count(distinct `so`.`order_id`),0)),2) AS `delivery_success_rate` FROM (`stock_suppliers` `ss` left join `stock_orders` `so` on((`ss`.`supplier_id` = `so`.`supplier_id`))) WHERE (`ss`.`status` = 'active') GROUP BY `ss`.`supplier_id`, `ss`.`name`, `ss`.`email`, `ss`.`phone` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_audit_logs_user` (`user_id`),
  ADD KEY `idx_audit_logs_table` (`table_name`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_bookings_user` (`user_id`),
  ADD KEY `idx_booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_status` (`status`,`payment_status`);

--
-- Indexes for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD PRIMARY KEY (`charge_id`),
  ADD KEY `idx_booking_type` (`booking_id`,`charge_type`);

--
-- Indexes for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_booking_guest` (`booking_id`,`guest_id`);

--
-- Indexes for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD PRIMARY KEY (`modification_id`),
  ADD KEY `idx_booking_type` (`booking_id`,`modification_type`);

--
-- Indexes for table `check_in_logs`
--
ALTER TABLE `check_in_logs`
  ADD PRIMARY KEY (`check_in_log_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_check_in_time` (`check_in_time`),
  ADD KEY `idx_homestay_id` (`homestay_id`),
  ADD KEY `fk_inventory_id` (`inventory_id`);

--
-- Indexes for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD PRIMARY KEY (`delivery_note_id`),
  ADD UNIQUE KEY `delivery_number` (`delivery_number`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_supplier` (`supplier_id`),
  ADD KEY `idx_homestay` (`homestay_id`),
  ADD KEY `idx_delivery_date` (`delivery_date`),
  ADD KEY `idx_status` (`delivery_status`),
  ADD KEY `delivery_notes_ibfk_received_by` (`received_by`);

--
-- Indexes for table `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  ADD PRIMARY KEY (`delivery_item_id`),
  ADD KEY `idx_delivery_note` (`delivery_note_id`),
  ADD KEY `idx_order_item` (`order_item_id`),
  ADD KEY `idx_item` (`item_id`);

--
-- Indexes for table `eating_out`
--
ALTER TABLE `eating_out`
  ADD PRIMARY KEY (`eating_out_id`),
  ADD KEY `subcategory_id` (`subcategory_id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `external_bookings`
--
ALTER TABLE `external_bookings`
  ADD PRIMARY KEY (`external_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_booking_action` (`booking_id`,`action_type`),
  ADD KEY `idx_action_time` (`action_time`);

--
-- Indexes for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_status_severity` (`status`,`severity`);

--
-- Indexes for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  ADD PRIMARY KEY (`guest_id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_vip_loyalty` (`vip_status`,`loyalty_points`);

--
-- Indexes for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_booking_status` (`booking_id`,`status`),
  ADD KEY `idx_assigned` (`assigned_to`,`status`);

--
-- Indexes for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `hms_users`
--
ALTER TABLE `hms_users`
  ADD PRIMARY KEY (`hms_user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `assigned_hotel_id` (`assigned_hotel_id`);

--
-- Indexes for table `homestays`
--
ALTER TABLE `homestays`
  ADD PRIMARY KEY (`homestay_id`),
  ADD KEY `idx_homestays_vendor` (`vendor_id`),
  ADD KEY `fk_homestays_locations` (`location_id`);

--
-- Indexes for table `homestay_bookings`
--
ALTER TABLE `homestay_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `homestay_images`
--
ALTER TABLE `homestay_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_homestay_role` (`homestay_id`,`role`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  ADD PRIMARY KEY (`queue_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_order_item_id` (`order_item_id`),
  ADD KEY `idx_assigned_chef` (`assigned_chef`);

--
-- Indexes for table `hotel_menu`
--
ALTER TABLE `hotel_menu`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `subcategory_id` (`subcategory_id`);

--
-- Indexes for table `hotel_menu_categories`
--
ALTER TABLE `hotel_menu_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `hotel_menu_subcategories`
--
ALTER TABLE `hotel_menu_subcategories`
  ADD PRIMARY KEY (`subcategory_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  ADD PRIMARY KEY (`delivery_info_id`),
  ADD UNIQUE KEY `unique_booking_delivery` (`booking_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_delivered_by` (`delivered_by`);

--
-- Indexes for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `menu_id` (`menu_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_menu_item_id` (`menu_item_id`);

--
-- Indexes for table `hotel_restaurants`
--
ALTER TABLE `hotel_restaurants`
  ADD PRIMARY KEY (`restaurant_id`),
  ADD KEY `idx_homestay_id` (`homestay_id`);

--
-- Indexes for table `hotel_restaurant_images`
--
ALTER TABLE `hotel_restaurant_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `hotel_restaurant_orders`
--
ALTER TABLE `hotel_restaurant_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_homestay_id` (`homestay_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `fk_restaurant_orders_room` (`room_id`),
  ADD KEY `fk_restaurant_orders_creator` (`created_by`);

--
-- Indexes for table `hotel_restaurant_tables`
--
ALTER TABLE `hotel_restaurant_tables`
  ADD PRIMARY KEY (`table_id`),
  ADD KEY `idx_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_homestay_id` (`homestay_id`);

--
-- Indexes for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_assigned_status` (`assigned_to`,`status`),
  ADD KEY `idx_scheduled` (`scheduled_time`,`status`);

--
-- Indexes for table `inventory_categories`
--
ALTER TABLE `inventory_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`),
  ADD KEY `idx_category_name` (`category_name`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_invoice_number` (`invoice_number`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `homestay_id` (`homestay_id`),
  ADD KEY `idx_homestay` (`homestay_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`location_id`);

--
-- Indexes for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_status_priority` (`status`,`priority`),
  ADD KEY `idx_assigned` (`assigned_to`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  ADD PRIMARY KEY (`ingredient_id`),
  ADD KEY `idx_menu_id` (`menu_id`),
  ADD KEY `idx_stock_item_id` (`stock_item_id`);

--
-- Indexes for table `money_transactions`
--
ALTER TABLE `money_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  ADD PRIMARY KEY (`group_booking_id`),
  ADD KEY `room_booking_id` (`room_booking_id`),
  ADD KEY `idx_group_booking` (`booking_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`is_read`);

--
-- Indexes for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  ADD PRIMARY KEY (`mapping_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_purpose` (`purpose`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_payment_transactions_booking` (`booking_id`),
  ADD KEY `idx_payment_transactions_status` (`status`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_invoice_id` (`invoice_id`);

--
-- Indexes for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  ADD PRIMARY KEY (`sync_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `report_exports`
--
ALTER TABLE `report_exports`
  ADD PRIMARY KEY (`export_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `report_logs`
--
ALTER TABLE `report_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `report_settings`
--
ALTER TABLE `report_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_homestay_settings` (`homestay_id`);

--
-- Indexes for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD PRIMARY KEY (`template_id`);

--
-- Indexes for table `restaurant_capacity`
--
ALTER TABLE `restaurant_capacity`
  ADD PRIMARY KEY (`capacity_id`),
  ADD UNIQUE KEY `unique_eating_out_id` (`eating_out_id`),
  ADD KEY `eating_out_id` (`eating_out_id`);

--
-- Indexes for table `restaurant_capacity_bookings`
--
ALTER TABLE `restaurant_capacity_bookings`
  ADD PRIMARY KEY (`capacity_booking_id`),
  ADD KEY `idx_restaurant_time` (`eating_out_id`,`reservation_start`,`reservation_end`),
  ADD KEY `fk_rcb_booking` (`booking_id`);

--
-- Indexes for table `restaurant_table`
--
ALTER TABLE `restaurant_table`
  ADD PRIMARY KEY (`table_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_reviews_reference` (`reference_id`,`review_type`);

--
-- Indexes for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_booking_inventory` (`booking_id`,`inventory_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD UNIQUE KEY `room_availability_inventory_id_date` (`inventory_id`,`date`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `fk_room_bookings_room_type` (`room_type_id`);

--
-- Indexes for table `room_images`
--
ALTER TABLE `room_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_inventory`
--
ALTER TABLE `room_inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `unique_room_unit` (`room_type_id`,`unit_number`);

--
-- Indexes for table `room_rates`
--
ALTER TABLE `room_rates`
  ADD PRIMARY KEY (`rate_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_status_log`
--
ALTER TABLE `room_status_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_inventory_date` (`inventory_id`,`created_at`);

--
-- Indexes for table `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `staff_activity_logs`
--
ALTER TABLE `staff_activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `staff_roles`
--
ALTER TABLE `staff_roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_staff_date` (`staff_id`,`shift_date`),
  ADD KEY `idx_date_status` (`shift_date`,`status`);

--
-- Indexes for table `stock_cost_log`
--
ALTER TABLE `stock_cost_log`
  ADD PRIMARY KEY (`cost_log_id`),
  ADD KEY `idx_item` (`item_id`),
  ADD KEY `idx_supplier` (`supplier_id`),
  ADD KEY `idx_effective_date` (`effective_date`),
  ADD KEY `idx_reason` (`cost_change_reason`),
  ADD KEY `stock_cost_log_ibfk_updated_by` (`updated_by`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `stock_orders`
--
ALTER TABLE `stock_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `stock_order_items`
--
ALTER TABLE `stock_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `stock_suppliers`
--
ALTER TABLE `stock_suppliers`
  ADD PRIMARY KEY (`supplier_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tin` (`tin`);

--
-- Indexes for table `stock_units`
--
ALTER TABLE `stock_units`
  ADD PRIMARY KEY (`unit_id`),
  ADD UNIQUE KEY `unit_name` (`unit_name`),
  ADD UNIQUE KEY `unit_symbol` (`unit_symbol`),
  ADD KEY `idx_unit_type` (`unit_type`),
  ADD KEY `idx_base_unit` (`base_unit_id`);

--
-- Indexes for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  ADD PRIMARY KEY (`usage_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `idx_homestay` (`homestay_id`),
  ADD KEY `idx_usage_date` (`usage_date`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `stock_usage_logs_ibfk_user` (`used_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_phone_verified` (`phone_verified`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_user_sessions_user` (`user_id`),
  ADD KEY `idx_user_sessions_expires` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `booking_charges`
--
ALTER TABLE `booking_charges`
  MODIFY `charge_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `booking_guests`
--
ALTER TABLE `booking_guests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  MODIFY `modification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `check_in_logs`
--
ALTER TABLE `check_in_logs`
  MODIFY `check_in_log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  MODIFY `delivery_note_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  MODIFY `delivery_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `eating_out`
--
ALTER TABLE `eating_out`
  MODIFY `eating_out_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `external_bookings`
--
ALTER TABLE `external_bookings`
  MODIFY `external_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  MODIFY `account_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_reports`
--
ALTER TABLE `financial_reports`
  MODIFY `report_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  MODIFY `complaint_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  MODIFY `guest_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `guest_requests`
--
ALTER TABLE `guest_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_users`
--
ALTER TABLE `hms_users`
  MODIFY `hms_user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `homestays`
--
ALTER TABLE `homestays`
  MODIFY `homestay_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `homestay_images`
--
ALTER TABLE `homestay_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  MODIFY `staff_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  MODIFY `queue_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `hotel_menu`
--
ALTER TABLE `hotel_menu`
  MODIFY `menu_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `hotel_menu_categories`
--
ALTER TABLE `hotel_menu_categories`
  MODIFY `category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hotel_menu_subcategories`
--
ALTER TABLE `hotel_menu_subcategories`
  MODIFY `subcategory_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  MODIFY `delivery_info_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  MODIFY `order_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `hotel_restaurants`
--
ALTER TABLE `hotel_restaurants`
  MODIFY `restaurant_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hotel_restaurant_images`
--
ALTER TABLE `hotel_restaurant_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hotel_restaurant_orders`
--
ALTER TABLE `hotel_restaurant_orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `hotel_restaurant_tables`
--
ALTER TABLE `hotel_restaurant_tables`
  MODIFY `table_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  MODIFY `task_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_categories`
--
ALTER TABLE `inventory_categories`
  MODIFY `category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  MODIFY `setting_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `location_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `menu_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  MODIFY `ingredient_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `money_transactions`
--
ALTER TABLE `money_transactions`
  MODIFY `transaction_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  MODIFY `group_booking_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  MODIFY `mapping_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `otp_id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key for OTP verification';

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `transaction_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  MODIFY `sync_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_exports`
--
ALTER TABLE `report_exports`
  MODIFY `export_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_logs`
--
ALTER TABLE `report_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_settings`
--
ALTER TABLE `report_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `report_templates`
--
ALTER TABLE `report_templates`
  MODIFY `template_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurant_capacity`
--
ALTER TABLE `restaurant_capacity`
  MODIFY `capacity_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurant_capacity_bookings`
--
ALTER TABLE `restaurant_capacity_bookings`
  MODIFY `capacity_booking_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurant_table`
--
ALTER TABLE `restaurant_table`
  MODIFY `table_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_assignments`
--
ALTER TABLE `room_assignments`
  MODIFY `assignment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `room_availability`
--
ALTER TABLE `room_availability`
  MODIFY `availability_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_images`
--
ALTER TABLE `room_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `room_inventory`
--
ALTER TABLE `room_inventory`
  MODIFY `inventory_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `room_rates`
--
ALTER TABLE `room_rates`
  MODIFY `rate_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_status_log`
--
ALTER TABLE `room_status_log`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `room_types`
--
ALTER TABLE `room_types`
  MODIFY `room_type_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `staff_activity_logs`
--
ALTER TABLE `staff_activity_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  MODIFY `staff_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_roles`
--
ALTER TABLE `staff_roles`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  MODIFY `schedule_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_cost_log`
--
ALTER TABLE `stock_cost_log`
  MODIFY `cost_log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_items`
--
ALTER TABLE `stock_items`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `movement_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stock_orders`
--
ALTER TABLE `stock_orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stock_order_items`
--
ALTER TABLE `stock_order_items`
  MODIFY `order_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stock_suppliers`
--
ALTER TABLE `stock_suppliers`
  MODIFY `supplier_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `stock_units`
--
ALTER TABLE `stock_units`
  MODIFY `unit_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  MODIFY `usage_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `session_id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD CONSTRAINT `booking_charges_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD CONSTRAINT `booking_guests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_guests_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD CONSTRAINT `booking_modifications_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `check_in_logs`
--
ALTER TABLE `check_in_logs`
  ADD CONSTRAINT `check_in_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `check_in_logs_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `check_in_logs_ibfk_3` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_id` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE SET NULL;

--
-- Constraints for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `delivery_notes_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_notes_ibfk_order` FOREIGN KEY (`order_id`) REFERENCES `stock_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_notes_ibfk_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `delivery_notes_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE RESTRICT;

--
-- Constraints for table `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  ADD CONSTRAINT `delivery_note_items_ibfk_delivery` FOREIGN KEY (`delivery_note_id`) REFERENCES `delivery_notes` (`delivery_note_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_note_items_ibfk_item` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `delivery_note_items_ibfk_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `stock_order_items` (`order_item_id`) ON DELETE RESTRICT;

--
-- Constraints for table `eating_out`
--
ALTER TABLE `eating_out`
  ADD CONSTRAINT `eating_out_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `external_bookings`
--
ALTER TABLE `external_bookings`
  ADD CONSTRAINT `external_bookings_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  ADD CONSTRAINT `financial_accounts_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  ADD CONSTRAINT `front_desk_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  ADD CONSTRAINT `guest_complaints_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_complaints_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  ADD CONSTRAINT `guest_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD CONSTRAINT `guest_requests_assigned_to_fk` FOREIGN KEY (`assigned_to`) REFERENCES `hms_users` (`hms_user_id`),
  ADD CONSTRAINT `guest_requests_ibfk_117` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `guest_requests_ibfk_118` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  ADD CONSTRAINT `guest_reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_3` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_4` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `hms_users`
--
ALTER TABLE `hms_users`
  ADD CONSTRAINT `hms_users_ibfk_1` FOREIGN KEY (`assigned_hotel_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `homestays`
--
ALTER TABLE `homestays`
  ADD CONSTRAINT `fk_homestays_locations` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `homestays_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `homestay_bookings`
--
ALTER TABLE `homestay_bookings`
  ADD CONSTRAINT `homestay_bookings_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `homestay_bookings_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `homestay_images`
--
ALTER TABLE `homestay_images`
  ADD CONSTRAINT `homestay_images_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  ADD CONSTRAINT `homestay_staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `homestay_staff_ibfk_2` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  ADD CONSTRAINT `fk_kitchen_queue_chef` FOREIGN KEY (`assigned_chef`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_kitchen_queue_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `hotel_order_items` (`order_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_kitchen_queue_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `hotel_restaurant_orders` (`order_id`);

--
-- Constraints for table `hotel_menu`
--
ALTER TABLE `hotel_menu`
  ADD CONSTRAINT `fk_menu_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hotel_menu_ibfk_1` FOREIGN KEY (`subcategory_id`) REFERENCES `hotel_menu_subcategories` (`subcategory_id`) ON DELETE SET NULL;

--
-- Constraints for table `hotel_menu_categories`
--
ALTER TABLE `hotel_menu_categories`
  ADD CONSTRAINT `hotel_menu_categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_menu_subcategories`
--
ALTER TABLE `hotel_menu_subcategories`
  ADD CONSTRAINT `hotel_menu_subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `hotel_menu_categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  ADD CONSTRAINT `fk_delivery_info_deliverer` FOREIGN KEY (`delivered_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_delivery_info_order` FOREIGN KEY (`order_id`) REFERENCES `hotel_restaurant_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_order_delivery_info_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  ADD CONSTRAINT `fk_order_items_menu` FOREIGN KEY (`menu_item_id`) REFERENCES `hotel_menu` (`menu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `hotel_restaurant_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_order_items_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_order_items_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `hotel_menu` (`menu_id`);

--
-- Constraints for table `hotel_restaurants`
--
ALTER TABLE `hotel_restaurants`
  ADD CONSTRAINT `fk_restaurant_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hotel_restaurant_images`
--
ALTER TABLE `hotel_restaurant_images`
  ADD CONSTRAINT `hotel_restaurant_images_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`);

--
-- Constraints for table `hotel_restaurant_orders`
--
ALTER TABLE `hotel_restaurant_orders`
  ADD CONSTRAINT `fk_restaurant_orders_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_restaurant_orders_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_restaurant_orders_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_restaurant_orders_room` FOREIGN KEY (`room_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE SET NULL;

--
-- Constraints for table `hotel_restaurant_tables`
--
ALTER TABLE `hotel_restaurant_tables`
  ADD CONSTRAINT `fk_restaurant_tables_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_restaurant_tables_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  ADD CONSTRAINT `housekeeping_tasks_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

--
-- Constraints for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  ADD CONSTRAINT `invoice_settings_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `eating_out` (`eating_out_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  ADD CONSTRAINT `menu_item_ingredients_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `hotel_menu` (`menu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_item_ingredients_ibfk_2` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `money_transactions`
--
ALTER TABLE `money_transactions`
  ADD CONSTRAINT `money_transactions_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `money_transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  ADD CONSTRAINT `multi_room_bookings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `multi_room_bookings_ibfk_2` FOREIGN KEY (`room_booking_id`) REFERENCES `room_bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  ADD CONSTRAINT `ota_mappings_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  ADD CONSTRAINT `rate_sync_logs_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `report_exports`
--
ALTER TABLE `report_exports`
  ADD CONSTRAINT `report_exports_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`template_id`);

--
-- Constraints for table `report_logs`
--
ALTER TABLE `report_logs`
  ADD CONSTRAINT `report_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`template_id`);

--
-- Constraints for table `report_settings`
--
ALTER TABLE `report_settings`
  ADD CONSTRAINT `report_settings_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurant_table`
--
ALTER TABLE `restaurant_table`
  ADD CONSTRAINT `restaurant_table_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `eating_out` (`eating_out_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD CONSTRAINT `room_assignments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_assignments_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD CONSTRAINT `room_availability_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD CONSTRAINT `fk_room_bookings_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`),
  ADD CONSTRAINT `room_bookings_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`),
  ADD CONSTRAINT `room_bookings_ibfk_2` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `room_images`
--
ALTER TABLE `room_images`
  ADD CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_inventory`
--
ALTER TABLE `room_inventory`
  ADD CONSTRAINT `fk_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_rates`
--
ALTER TABLE `room_rates`
  ADD CONSTRAINT `room_rates_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_status_log`
--
ALTER TABLE `room_status_log`
  ADD CONSTRAINT `room_status_log_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_types`
--
ALTER TABLE `room_types`
  ADD CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD CONSTRAINT `staff_schedules_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `homestay_staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_cost_log`
--
ALTER TABLE `stock_cost_log`
  ADD CONSTRAINT `stock_cost_log_ibfk_item` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_cost_log_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_cost_log_ibfk_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`),
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`),
  ADD CONSTRAINT `stock_movements_ibfk_3` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `stock_movements_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `stock_movements_ibfk_5` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`);

--
-- Constraints for table `stock_orders`
--
ALTER TABLE `stock_orders`
  ADD CONSTRAINT `stock_orders_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `stock_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`),
  ADD CONSTRAINT `stock_orders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `stock_orders_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `stock_orders_ibfk_5` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `stock_orders_ibfk_6` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `stock_order_items`
--
ALTER TABLE `stock_order_items`
  ADD CONSTRAINT `stock_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `stock_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`);

--
-- Constraints for table `stock_suppliers`
--
ALTER TABLE `stock_suppliers`
  ADD CONSTRAINT `stock_suppliers_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `stock_units`
--
ALTER TABLE `stock_units`
  ADD CONSTRAINT `stock_units_ibfk_base` FOREIGN KEY (`base_unit_id`) REFERENCES `stock_units` (`unit_id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  ADD CONSTRAINT `stock_usage_logs_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`),
  ADD CONSTRAINT `stock_usage_logs_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_usage_logs_ibfk_user` FOREIGN KEY (`used_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
