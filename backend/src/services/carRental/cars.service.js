const { executeQuery, pool } = require('../../../config/database');

/**
 * Helper function to normalize image paths
 * Converts absolute paths to relative web paths
 * @param {string} imagePath - Path from database
 * @returns {string} Normalized path for web serving
 */
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return null;
    
    // If already a relative path starting with /uploads/, handle it
    if (imagePath.startsWith('/uploads/')) {
        // Remove /travooz/ since express.static already serves from /var/www/uploads/travooz/
        // From: /uploads/travooz/cars/car-123.png
        // To: /uploads/cars/car-123.png
        return imagePath.replace('/uploads/travooz/', '/uploads/');
    }
    
    // If absolute path, convert to relative web path
    // From: /var/www/uploads/travooz/cars/car-123.png
    // To: /uploads/cars/car-123.png
    if (imagePath.includes('/var/www/uploads/travooz/')) {
        return imagePath.replace('/var/www/uploads/travooz/', '/uploads/');
    }
    
    // Fallback: try to extract after /travooz/
    const travoozIndex = imagePath.lastIndexOf('/travooz/');
    if (travoozIndex !== -1) {
        return '/uploads/' + imagePath.substring(travoozIndex + '/travooz/'.length);
    }
    
    // Last resort: return as-is
    return imagePath;
};

class CarsService {
    /**
     * Ensure cars table exists in the database
     */
    async ensureCarsTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS cars (
                    car_id INT AUTO_INCREMENT PRIMARY KEY,
                    vendor_id INT NOT NULL,
                    subcategory_id INT NOT NULL,
                    brand VARCHAR(100) NOT NULL COMMENT 'e.g., Toyota, Honda, BMW',
                    model VARCHAR(100) NOT NULL COMMENT 'e.g., Camry, Civic, X5',
                    year YEAR NOT NULL,
                    license_plate VARCHAR(20) NOT NULL UNIQUE,
                    color VARCHAR(50) DEFAULT NULL,
                    seat_capacity INT NOT NULL,
                    transmission ENUM('automatic','manual') DEFAULT 'automatic',
                    fuel_type ENUM('petrol','diesel','electric','hybrid') DEFAULT 'petrol',
                    mileage INT DEFAULT NULL COMMENT 'Current mileage of the car',
                    daily_rate DECIMAL(10,2) NOT NULL,
                    weekly_rate DECIMAL(10,2) DEFAULT NULL,
                    monthly_rate DECIMAL(10,2) DEFAULT NULL,
                    security_deposit DECIMAL(10,2) DEFAULT '0.00',
                    is_available TINYINT(1) DEFAULT 1,
                    location VARCHAR(255) DEFAULT NULL COMMENT 'Where the car is located',
                    description TEXT,
                    features LONGTEXT COMMENT 'JSON array of features: AC, GPS, Bluetooth, etc.',
                    images LONGTEXT COMMENT 'JSON array of image URLs - DEPRECATED: Use car_images table instead',
                    status ENUM('active','maintenance','sold','inactive') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_vendor_id (vendor_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        } catch (error) {
            console.error('Error ensuring cars table:', error);
            // Table might already exist, continue
        }
    }

    /**
     * Ensure car_images table exists in the database
     */
    async ensureCarImagesTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS car_images (
                    image_id INT AUTO_INCREMENT PRIMARY KEY,
                    car_id INT NOT NULL,
                    image_path VARCHAR(500) NOT NULL COMMENT 'Path to the uploaded image file',
                    image_type ENUM('main', 'gallery') DEFAULT 'gallery',
                    image_order INT DEFAULT 0 COMMENT 'Order for displaying images',
                    is_primary TINYINT(1) DEFAULT 0 COMMENT '1 if this is the primary/main image',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_car_id (car_id),
                    INDEX idx_is_primary (is_primary),
                    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        } catch (error) {
            console.error('Error ensuring car_images table:', error);
            // Table might already exist, continue
        }
    }

    /**
     * Get all cars for a car rental business
     * @param {number} carRentalBusinessId 
     */
    async getCarsByBusiness(carRentalBusinessId) {
        try {
            await this.ensureCarsTable();
            await this.ensureCarImagesTable();
            const cars = await executeQuery(
                `SELECT * FROM cars 
                 WHERE vendor_id = ? 
                 ORDER BY created_at DESC`,
                [carRentalBusinessId]
            );
            
            // Get images for each car
            for (const car of cars) {
                const images = await executeQuery(
                    `SELECT image_id, image_path, image_type, image_order, is_primary 
                     FROM car_images 
                     WHERE car_id = ? 
                     ORDER BY is_primary DESC, image_order ASC`,
                    [car.car_id]
                );
                // Normalize image paths before returning
                car.images = images.map(img => normalizeImagePath(img.image_path));
                car.imageDetails = images;
            }
            
            return cars;
        } catch (error) {
            console.error('Error getting cars:', error);
            throw error;
        }
    }

    /**
     * Get a single car by ID
     * @param {number} carId 
     */
    async getCarById(carId) {
        try {
            await this.ensureCarsTable();
            await this.ensureCarImagesTable();
            const cars = await executeQuery(
                `SELECT * FROM cars WHERE car_id = ?`,
                [carId]
            );
            
            if (!cars || cars.length === 0) {
                return null;
            }
            
            const car = cars[0];
            
            // Get images for the car
            const images = await executeQuery(
                `SELECT image_id, image_path, image_type, image_order, is_primary 
                 FROM car_images 
                 WHERE car_id = ? 
                 ORDER BY is_primary DESC, image_order ASC`,
                [carId]
            );
            // Normalize image paths before returning
            car.images = images.map(img => normalizeImagePath(img.image_path));
            car.imageDetails = images;
            
            return car;
        } catch (error) {
            console.error('Error getting car:', error);
            throw error;
        }
    }

    /**
     * Create a new car
     * @param {object} carData 
     */
    async createCar(carData) {
        try {
            await this.ensureCarsTable();
            await this.ensureCarImagesTable();
            const {
                vendor_id,
                subcategory_id,
                brand,
                model,
                year,
                license_plate,
                color,
                seat_capacity,
                transmission = 'automatic',
                fuel_type = 'petrol',
                mileage,
                daily_rate,
                weekly_rate,
                monthly_rate,
                security_deposit = 0.00,
                is_available = 1,
                location,
                description,
                features,
                imagePaths = [], // Array of image paths from file uploads
                status = 'active'
            } = carData;

            const result = await executeQuery(
                `INSERT INTO cars (
                    vendor_id, subcategory_id, brand, model, year, license_plate, 
                    color, seat_capacity, transmission, fuel_type, mileage, 
                    daily_rate, weekly_rate, monthly_rate, security_deposit, 
                    is_available, location, description, features, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    vendor_id,
                    subcategory_id,
                    brand,
                    model,
                    year,
                    license_plate,
                    color,
                    seat_capacity,
                    transmission,
                    fuel_type,
                    mileage,
                    daily_rate,
                    weekly_rate,
                    monthly_rate,
                    security_deposit,
                    is_available,
                    location,
                    description,
                    features ? JSON.stringify(features) : null,
                    status
                ]
            );

            const carId = result.insertId;
            
            // Insert images into car_images table
            if (imagePaths && imagePaths.length > 0) {
                for (let i = 0; i < imagePaths.length; i++) {
                    await executeQuery(
                        `INSERT INTO car_images (car_id, image_path, image_type, image_order, is_primary) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                            carId,
                            imagePaths[i],
                            i === 0 ? 'main' : 'gallery',
                            i,
                            i === 0 ? 1 : 0
                        ]
                    );
                }
            }
            
            return await this.getCarById(carId);
        } catch (error) {
            console.error('Error creating car:', error);
            throw error;
        }
    }

    /**
     * Update a car
     * @param {number} carId 
     * @param {object} carData 
     * @param {Array} uploadedFiles - Array of uploaded image files
     */
    async updateCar(carId, carData, uploadedFiles = []) {
        try {
            await this.ensureCarsTable();
            await this.ensureCarImagesTable();
            
            const {
                brand,
                model,
                year,
                license_plate,
                color,
                seat_capacity,
                transmission,
                fuel_type,
                mileage,
                daily_rate,
                weekly_rate,
                monthly_rate,
                security_deposit,
                is_available,
                location,
                description,
                features,
                images, // Array of existing image URLs to keep
                status
            } = carData;

            // Parse images if it's a string
            let existingImages = images;
            if (typeof images === 'string') {
                try {
                    existingImages = JSON.parse(images);
                } catch (e) {
                    existingImages = [];
                }
            }
            existingImages = Array.isArray(existingImages) ? existingImages : [];

            console.log('Updating car:', carId);
            console.log('Existing images to keep:', existingImages);
            console.log('New uploaded files:', uploadedFiles.length);

            // Update car basic information
            const updateFields = [];
            const updateValues = [];

            if (brand !== undefined) { updateFields.push('brand = ?'); updateValues.push(brand); }
            if (model !== undefined) { updateFields.push('model = ?'); updateValues.push(model); }
            if (year !== undefined) { updateFields.push('year = ?'); updateValues.push(year); }
            if (license_plate !== undefined) { updateFields.push('license_plate = ?'); updateValues.push(license_plate); }
            if (color !== undefined) { updateFields.push('color = ?'); updateValues.push(color); }
            if (seat_capacity !== undefined) { updateFields.push('seat_capacity = ?'); updateValues.push(seat_capacity); }
            if (transmission !== undefined) { updateFields.push('transmission = ?'); updateValues.push(transmission); }
            if (fuel_type !== undefined) { updateFields.push('fuel_type = ?'); updateValues.push(fuel_type); }
            if (mileage !== undefined) { updateFields.push('mileage = ?'); updateValues.push(mileage); }
            if (daily_rate !== undefined) { updateFields.push('daily_rate = ?'); updateValues.push(daily_rate); }
            if (weekly_rate !== undefined) { updateFields.push('weekly_rate = ?'); updateValues.push(weekly_rate); }
            if (monthly_rate !== undefined) { updateFields.push('monthly_rate = ?'); updateValues.push(monthly_rate); }
            if (security_deposit !== undefined) { updateFields.push('security_deposit = ?'); updateValues.push(security_deposit); }
            if (is_available !== undefined) { updateFields.push('is_available = ?'); updateValues.push(is_available); }
            if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
            if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
            if (features !== undefined) { updateFields.push('features = ?'); updateValues.push(JSON.stringify(features)); }
            if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }

            if (updateFields.length > 0) {
                updateValues.push(carId);
                await executeQuery(
                    `UPDATE cars SET ${updateFields.join(', ')} WHERE car_id = ?`,
                    updateValues
                );
            }

            // Handle image updates
            // Get current images from car_images table
            const currentImages = await executeQuery(
                `SELECT image_id, image_path FROM car_images WHERE car_id = ?`,
                [carId]
            );

            // Delete images that are not in the existing images list
            for (const currentImage of currentImages) {
                if (!existingImages.includes(currentImage.image_path)) {
                    console.log('Deleting image:', currentImage.image_path);
                    await executeQuery(
                        `DELETE FROM car_images WHERE image_id = ?`,
                        [currentImage.image_id]
                    );
                }
            }

            // Add new uploaded images
            if (uploadedFiles && uploadedFiles.length > 0) {
                // Get the max order from existing images
                const maxOrderResult = await executeQuery(
                    `SELECT MAX(image_order) as max_order FROM car_images WHERE car_id = ?`,
                    [carId]
                );
                let nextOrder = (maxOrderResult[0]?.max_order || 0) + 1;

                for (const file of uploadedFiles) {
                    // Convert absolute path to relative web path
                    // From: /var/www/uploads/travooz/cars/car-123.png
                    // To: /uploads/cars/car-123.png (without travooz since express.static serves from that dir)
                    let imagePath = file.path.replace(/\\/g, '/');
                    
                    // Extract just the filename part and construct the correct path
                    if (imagePath.includes('/var/www/uploads/travooz/')) {
                        imagePath = imagePath.replace('/var/www/uploads/travooz/', '/uploads/');
                    }
                    
                    console.log('Adding new image:', imagePath);
                    
                    await executeQuery(
                        `INSERT INTO car_images (car_id, image_path, image_type, image_order, is_primary) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [carId, imagePath, 'gallery', nextOrder++, 0]
                    );
                }
            }

            // If no images left, reset primary image
            const remainingImages = await executeQuery(
                `SELECT image_id FROM car_images WHERE car_id = ?`,
                [carId]
            );
            
            if (remainingImages.length > 0) {
                // Make sure the first image is primary
                await executeQuery(
                    `UPDATE car_images SET is_primary = 0 WHERE car_id = ?`,
                    [carId]
                );
                await executeQuery(
                    `UPDATE car_images SET is_primary = 1 WHERE car_id = ? ORDER BY image_order ASC LIMIT 1`,
                    [carId]
                );
            }

            return await this.getCarById(carId);
        } catch (error) {
            console.error('Error updating car:', error);
            throw error;
        }
    }

    /**
     * Delete a car
     * @param {number} carId 
     */
    async deleteCar(carId) {
        try {
            await this.ensureCarsTable();
            await this.ensureCarImagesTable();
            // Images will be deleted automatically due to CASCADE
            await executeQuery(
                `DELETE FROM cars WHERE car_id = ?`,
                [carId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting car:', error);
            throw error;
        }
    }

    /**
     * Add images to a car
     * @param {number} carId 
     * @param {Array<string>} imagePaths - Array of image file paths
     */
    async addCarImages(carId, imagePaths) {
        try {
            await this.ensureCarImagesTable();
            
            // Get current max order
            const currentImages = await executeQuery(
                `SELECT MAX(image_order) as max_order FROM car_images WHERE car_id = ?`,
                [carId]
            );
            let startOrder = currentImages[0]?.max_order !== null ? currentImages[0].max_order + 1 : 0;
            
            // Check if there's already a primary image
            const hasPrimary = await executeQuery(
                `SELECT COUNT(*) as count FROM car_images WHERE car_id = ? AND is_primary = 1`,
                [carId]
            );
            const needsPrimary = hasPrimary[0].count === 0;
            
            for (let i = 0; i < imagePaths.length; i++) {
                await executeQuery(
                    `INSERT INTO car_images (car_id, image_path, image_type, image_order, is_primary) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        carId,
                        imagePaths[i],
                        needsPrimary && i === 0 ? 'main' : 'gallery',
                        startOrder + i,
                        needsPrimary && i === 0 ? 1 : 0
                    ]
                );
            }
            
            return await this.getCarById(carId);
        } catch (error) {
            console.error('Error adding car images:', error);
            throw error;
        }
    }

    /**
     * Delete a car image
     * @param {number} imageId 
     */
    async deleteCarImage(imageId) {
        try {
            await this.ensureCarImagesTable();
            await executeQuery(
                `DELETE FROM car_images WHERE image_id = ?`,
                [imageId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting car image:', error);
            throw error;
        }
    }
}

module.exports = new CarsService();

