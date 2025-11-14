const { executeQuery } = require('../../../config/database');

class DriversService {
    /**
     * Ensure drivers table exists
     */
    async ensureDriversTable() {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS drivers (
                    driver_id INT AUTO_INCREMENT PRIMARY KEY,
                    vendor_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(50) NOT NULL,
                    license_number VARCHAR(100) NOT NULL,
                    license_expiry_date DATE,
                    address TEXT,
                    date_of_birth DATE,
                    emergency_contact_name VARCHAR(255),
                    emergency_contact_phone VARCHAR(50),
                    experience_years INT DEFAULT 0,
                    languages VARCHAR(255),
                    is_available TINYINT(1) DEFAULT 1,
                    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                    profile_photo LONGTEXT,
                    documents LONGTEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_vendor_id (vendor_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        } catch (error) {
            console.error('Error ensuring drivers table:', error);
            // Table might already exist, continue
        }
    }

    /**
     * Get all drivers for a car rental business
     * @param {number} vendorId 
     */
    async getDriversByVendor(vendorId) {
        try {
            await this.ensureDriversTable();
            const drivers = await executeQuery(
                `SELECT * FROM drivers 
                 WHERE vendor_id = ? 
                 ORDER BY created_at DESC`,
                [vendorId]
            );
            return drivers;
        } catch (error) {
            console.error('Error getting drivers:', error);
            throw error;
        }
    }

    /**
     * Get a single driver by ID
     * @param {number} driverId 
     */
    async getDriverById(driverId) {
        try {
            await this.ensureDriversTable();
            const drivers = await executeQuery(
                `SELECT * FROM drivers WHERE driver_id = ?`,
                [driverId]
            );
            return drivers[0] || null;
        } catch (error) {
            console.error('Error getting driver:', error);
            throw error;
        }
    }

    /**
     * Create a new driver
     * @param {object} driverData 
     */
    async createDriver(driverData) {
        try {
            await this.ensureDriversTable();
            const {
                vendor_id,
                name,
                email,
                phone,
                license_number,
                license_expiry_date,
                address,
                date_of_birth,
                emergency_contact_name,
                emergency_contact_phone,
                experience_years = 0,
                languages,
                is_available = 1,
                status = 'active',
                profile_photo,
                documents,
                notes
            } = driverData;

            // Convert empty date strings to null
            const processedLicenseExpiryDate = license_expiry_date && license_expiry_date.trim() !== '' ? license_expiry_date : null;
            const processedDateOfBirth = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;

            const result = await executeQuery(
                `INSERT INTO drivers (
                    vendor_id, name, email, phone, license_number, license_expiry_date,
                    address, date_of_birth, emergency_contact_name, emergency_contact_phone,
                    experience_years, languages, is_available, status, profile_photo, documents, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    vendor_id,
                    name,
                    email,
                    phone,
                    license_number,
                    processedLicenseExpiryDate,
                    address,
                    processedDateOfBirth,
                    emergency_contact_name,
                    emergency_contact_phone,
                    experience_years,
                    languages,
                    is_available,
                    status,
                    profile_photo,
                    documents ? JSON.stringify(documents) : null,
                    notes
                ]
            );

            const driverId = result.insertId;
            return await this.getDriverById(driverId);
        } catch (error) {
            console.error('Error creating driver:', error);
            throw error;
        }
    }

    /**
     * Update a driver
     * @param {number} driverId 
     * @param {object} driverData 
     */
    async updateDriver(driverId, driverData) {
        try {
            await this.ensureDriversTable();
            const {
                name,
                email,
                phone,
                license_number,
                license_expiry_date,
                address,
                date_of_birth,
                emergency_contact_name,
                emergency_contact_phone,
                experience_years,
                languages,
                is_available,
                status,
                profile_photo,
                documents,
                notes
            } = driverData;

            const updateFields = [];
            const updateValues = [];

            if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
            if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
            if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
            if (license_number !== undefined) { updateFields.push('license_number = ?'); updateValues.push(license_number); }
            if (license_expiry_date !== undefined) { 
                const processedDate = license_expiry_date && license_expiry_date.trim() !== '' ? license_expiry_date : null;
                updateFields.push('license_expiry_date = ?'); 
                updateValues.push(processedDate); 
            }
            if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address); }
            if (date_of_birth !== undefined) { 
                const processedDate = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;
                updateFields.push('date_of_birth = ?'); 
                updateValues.push(processedDate); 
            }
            if (emergency_contact_name !== undefined) { updateFields.push('emergency_contact_name = ?'); updateValues.push(emergency_contact_name); }
            if (emergency_contact_phone !== undefined) { updateFields.push('emergency_contact_phone = ?'); updateValues.push(emergency_contact_phone); }
            if (experience_years !== undefined) { updateFields.push('experience_years = ?'); updateValues.push(experience_years); }
            if (languages !== undefined) { updateFields.push('languages = ?'); updateValues.push(languages); }
            if (is_available !== undefined) { updateFields.push('is_available = ?'); updateValues.push(is_available); }
            if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
            if (profile_photo !== undefined) { updateFields.push('profile_photo = ?'); updateValues.push(profile_photo); }
            if (documents !== undefined) { updateFields.push('documents = ?'); updateValues.push(JSON.stringify(documents)); }
            if (notes !== undefined) { updateFields.push('notes = ?'); updateValues.push(notes); }

            if (updateFields.length === 0) {
                return await this.getDriverById(driverId);
            }

            updateValues.push(driverId);

            await executeQuery(
                `UPDATE drivers SET ${updateFields.join(', ')} WHERE driver_id = ?`,
                updateValues
            );

            return await this.getDriverById(driverId);
        } catch (error) {
            console.error('Error updating driver:', error);
            throw error;
        }
    }

    /**
     * Delete a driver
     * @param {number} driverId 
     */
    async deleteDriver(driverId) {
        try {
            await this.ensureDriversTable();
            await executeQuery(
                `DELETE FROM drivers WHERE driver_id = ?`,
                [driverId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting driver:', error);
            throw error;
        }
    }
}

module.exports = new DriversService();

