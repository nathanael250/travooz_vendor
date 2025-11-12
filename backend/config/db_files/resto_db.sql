-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 08, 2025 at 01:53 PM
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
-- Database: `resto_db`
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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
