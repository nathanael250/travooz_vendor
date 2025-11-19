const bcrypt = require('bcryptjs');
const { pool, executeQuery } = require('../../../config/database');

let tablesInitialized = false;

const ensureTables = async () => {
  if (tablesInitialized) {
    return;
  }

  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS car_rental_users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(50) DEFAULT 'vendor',
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_businesses (
      car_rental_business_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      business_type VARCHAR(100),
      short_description TEXT,
      location VARCHAR(255),
      location_data LONGTEXT,
      car_type VARCHAR(100),
      car_type_name VARCHAR(150),
      subcategory_id INT,
      description TEXT,
      phone VARCHAR(50),
      currency VARCHAR(10),
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_car_rental_business_user FOREIGN KEY (user_id)
        REFERENCES car_rental_users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_tax_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      car_rental_business_id INT NOT NULL,
      tin VARCHAR(100) NOT NULL,
      legal_business_name VARCHAR(255) NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      documents LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_car_rental_tax_info_business FOREIGN KEY (car_rental_business_id)
        REFERENCES car_rental_businesses(car_rental_business_id) ON DELETE CASCADE,
      UNIQUE KEY unique_car_rental_tax_info (car_rental_business_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      car_rental_business_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      car_types LONGTEXT,
      daily_rate DECIMAL(10,2),
      currency VARCHAR(10),
      availability_start_date DATE,
      availability_end_date DATE,
      features LONGTEXT,
      cover_photo LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_car_rental_listing_business FOREIGN KEY (car_rental_business_id)
        REFERENCES car_rental_businesses(car_rental_business_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_setup_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      car_rental_business_id INT NOT NULL,
      user_id INT NOT NULL,
      current_step INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'in_progress',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_car_rental_progress (car_rental_business_id),
      CONSTRAINT fk_car_rental_progress_business FOREIGN KEY (car_rental_business_id)
        REFERENCES car_rental_businesses(car_rental_business_id) ON DELETE CASCADE,
      CONSTRAINT fk_car_rental_progress_user FOREIGN KEY (user_id)
        REFERENCES car_rental_users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_setup_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      car_rental_business_id INT NOT NULL,
      user_id INT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending_review',
      submitted_at TIMESTAMP NULL,
      agreement_signed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_car_rental_submission (car_rental_business_id),
      CONSTRAINT fk_car_rental_submission_business FOREIGN KEY (car_rental_business_id)
        REFERENCES car_rental_businesses(car_rental_business_id) ON DELETE CASCADE,
      CONSTRAINT fk_car_rental_submission_user FOREIGN KEY (user_id)
        REFERENCES car_rental_users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const statement of tableStatements) {
    await pool.execute(statement);
  }

  tablesInitialized = true;
};

const safeJsonStringify = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON value:', error.message);
    return null;
  }
};

class CarRentalSetupService {
  async registerVendor(payload) {
    await ensureTables();

    const { user = {}, location = '', locationData = null, business = {} } = payload || {};

    if (!business || !business.carRentalBusinessName) {
      throw new Error('Business information is required');
    }

    const userId = await this.#getOrCreateUser(user, business);

    const businessRecord = await this.#createOrUpdateBusiness({
      userId,
      location,
      locationData,
      business,
      existingBusinessId: payload?.carRentalBusinessId
    });

    await this.#updateProgress(businessRecord.car_rental_business_id, userId, 3, 'in_progress');

    return {
      userId,
      carRentalBusinessId: businessRecord.car_rental_business_id,
      business: businessRecord
    };
  }

  async saveBusinessDetails(payload) {
    await ensureTables();

    const { carRentalBusinessId, userId, businessDetails } = payload || {};

    if (!carRentalBusinessId) {
      throw new Error('carRentalBusinessId is required');
    }

    if (!businessDetails) {
      throw new Error('businessDetails are required');
    }

    await pool.execute(
      `UPDATE car_rental_businesses
        SET business_name = ?, business_type = ?, short_description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE car_rental_business_id = ?`,
      [
        businessDetails.businessName || '',
        businessDetails.businessType || null,
        businessDetails.shortDescription || null,
        carRentalBusinessId
      ]
    );

    await this.#updateProgress(carRentalBusinessId, userId, 4, 'in_progress');

    return {
      carRentalBusinessId,
      status: 'business_details_saved'
    };
  }

  async saveTaxPayment(payload) {
    await ensureTables();

    const { carRentalBusinessId, userId, taxPayment, documents = [] } = payload || {};

    if (!carRentalBusinessId) {
      throw new Error('carRentalBusinessId is required');
    }

    if (!taxPayment) {
      throw new Error('taxPayment data is required');
    }

    const documentsJson = safeJsonStringify(documents);

    await pool.execute(
      `INSERT INTO car_rental_tax_info (
        car_rental_business_id, tin, legal_business_name, payment_method, documents
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tin = VALUES(tin),
        legal_business_name = VALUES(legal_business_name),
        payment_method = VALUES(payment_method),
        documents = VALUES(documents),
        updated_at = CURRENT_TIMESTAMP`,
      [
        carRentalBusinessId,
        taxPayment.tin,
        taxPayment.legalBusinessName,
        taxPayment.paymentMethod,
        documentsJson
      ]
    );

    await this.#updateProgress(carRentalBusinessId, userId, 6, 'in_progress');

    return {
      carRentalBusinessId,
      status: 'tax_payment_saved'
    };
  }

  async createCarRental(payload) {
    await ensureTables();

    const { carRentalBusinessId, userId, carRental } = payload || {};

    if (!carRentalBusinessId) {
      throw new Error('carRentalBusinessId is required');
    }

    if (!carRental) {
      throw new Error('carRental data is required');
    }

    const carTypesJson = safeJsonStringify(carRental.carTypes || []);
    const featuresJson = safeJsonStringify(carRental.features || []);

    await pool.execute(
      `INSERT INTO car_rental_listings (
        car_rental_business_id, title, description, car_types, daily_rate, currency,
        availability_start_date, availability_end_date, features, cover_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        car_types = VALUES(car_types),
        daily_rate = VALUES(daily_rate),
        currency = VALUES(currency),
        availability_start_date = VALUES(availability_start_date),
        availability_end_date = VALUES(availability_end_date),
        features = VALUES(features),
        cover_photo = VALUES(cover_photo),
        updated_at = CURRENT_TIMESTAMP`,
      [
        carRentalBusinessId,
        carRental.carTitle,
        carRental.description,
        carTypesJson,
        carRental.dailyRate || null,
        carRental.currency || 'RWF',
        carRental.availabilityStartDate || null,
        carRental.availabilityEndDate || null,
        featuresJson,
        carRental.coverPhoto || null
      ]
    );

    await this.#updateProgress(carRentalBusinessId, userId, 6, 'in_progress');

    return {
      carRentalBusinessId,
      status: 'car_rental_saved'
    };
  }

  async submitAgreement(payload) {
    await ensureTables();

    const { carRentalBusinessId, userId } = payload || {};

    if (!carRentalBusinessId) {
      throw new Error('carRentalBusinessId is required');
    }

    if (!userId) {
      throw new Error('userId is required');
    }

    await pool.execute(
      `INSERT INTO car_rental_setup_submissions (
        car_rental_business_id, user_id, status, submitted_at, agreement_signed_at
      ) VALUES (?, ?, 'pending_review', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        status = 'pending_review',
        submitted_at = CURRENT_TIMESTAMP,
        agreement_signed_at = CURRENT_TIMESTAMP`,
      [carRentalBusinessId, userId]
    );

    await this.#updateProgress(carRentalBusinessId, userId, 7, 'pending_review');

    return {
      carRentalBusinessId,
      status: 'pending_review'
    };
  }

  async getSubmissionStatus(carRentalBusinessId) {
    await ensureTables();

    if (!carRentalBusinessId) {
      throw new Error('carRentalBusinessId is required');
    }

    // Check business status first (this is updated when admin approves)
    const businesses = await executeQuery(
      `SELECT status, created_at, updated_at
       FROM car_rental_businesses
       WHERE car_rental_business_id = ?`,
      [carRentalBusinessId]
    );

    // If business is approved, return approved status immediately
    if (businesses && businesses.length > 0 && businesses[0].status === 'approved') {
      return {
        status: 'approved',
        submitted_at: businesses[0].created_at,
        updated_at: businesses[0].updated_at
      };
    }

    // Otherwise, check submission status
    const submissions = await executeQuery(
      `SELECT status, submitted_at, agreement_signed_at, created_at
       FROM car_rental_setup_submissions
       WHERE car_rental_business_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [carRentalBusinessId]
    );

    if (!submissions || submissions.length === 0) {
      // If business exists but no submission, check business status
      if (businesses && businesses.length > 0) {
        return {
          status: businesses[0].status || 'pending_review',
          message: 'No submission found, but business exists.'
        };
      }
      return {
        status: 'in_progress',
        message: 'No submission found for this business yet.'
      };
    }

    return submissions[0];
  }

  async #getOrCreateUser(user = {}, business = {}) {
    if (user.id) {
      return user.id;
    }

    if (!user.email) {
      throw new Error('User email is required');
    }

    const existingUsers = await executeQuery(
      `SELECT user_id FROM car_rental_users WHERE email = ?`,
      [user.email]
    );

    if (existingUsers && existingUsers.length > 0) {
      return existingUsers[0].user_id;
    }

    if (!user.password) {
      throw new Error('Password is required to create a new user account');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const fullName = [user.firstName || '', user.lastName || '']
      .filter(Boolean)
      .join(' ')
      .trim() || business.carRentalBusinessName || user.email.split('@')[0];

    const insertResult = await pool.execute(
      `INSERT INTO car_rental_users (role, name, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'vendor',
        fullName,
        user.email,
        user.phone || null,
        hashedPassword
      ]
    );

    const [result] = insertResult;

    return result.insertId;
  }

  async #createOrUpdateBusiness({ userId, location, locationData, business, existingBusinessId }) {
    const locationString = location && location.trim() ? location.trim() : 'Kigali, Rwanda';
    const locationDataJson = safeJsonStringify(locationData);

    let targetBusinessId = existingBusinessId;

    if (!targetBusinessId) {
      const existingBusinesses = await executeQuery(
        `SELECT car_rental_business_id FROM car_rental_businesses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      if (existingBusinesses && existingBusinesses.length > 0) {
        targetBusinessId = existingBusinesses[0].car_rental_business_id;
      }
    }

    if (targetBusinessId) {
      await pool.execute(
        `UPDATE car_rental_businesses
          SET business_name = ?, business_type = ?, short_description = ?, location = ?, location_data = ?,
              car_type = ?, car_type_name = ?, subcategory_id = ?, description = ?, phone = ?, currency = ?,
              status = 'in_progress', updated_at = CURRENT_TIMESTAMP
        WHERE car_rental_business_id = ?`,
        [
          business.carRentalBusinessName || business.businessName || 'Car Rental Business',
          business.carType || null,
          business.shortDescription || business.description || null,
          locationString,
          locationDataJson,
          business.carType || null,
          business.carTypeName || null,
          business.subcategoryId || null,
          business.description || null,
          business.phone || null,
          business.currency || 'RWF',
          targetBusinessId
        ]
      );

      const updated = await executeQuery(
        `SELECT * FROM car_rental_businesses WHERE car_rental_business_id = ?`,
        [targetBusinessId]
      );

      return updated[0];
    }

    const insertResult = await pool.execute(
      `INSERT INTO car_rental_businesses (
        user_id, business_name, business_type, short_description, location, location_data, car_type,
        car_type_name, subcategory_id, description, phone, currency, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
      [
        userId,
        business.carRentalBusinessName || business.businessName || 'Car Rental Business',
        business.carType || null,
        business.shortDescription || business.description || null,
        locationString,
        locationDataJson,
        business.carType || null,
        business.carTypeName || null,
        business.subcategoryId || null,
        business.description || null,
        business.phone || null,
        business.currency || 'RWF'
      ]
    );

    const [result] = insertResult;

    const created = await executeQuery(
      `SELECT * FROM car_rental_businesses WHERE car_rental_business_id = ?`,
      [result.insertId]
    );

    return created[0];
  }

  async #updateProgress(carRentalBusinessId, userId, step, status) {
    if (!carRentalBusinessId || !userId) {
      return;
    }

    await pool.execute(
      `INSERT INTO car_rental_setup_progress (
        car_rental_business_id, user_id, current_step, status
      ) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        current_step = VALUES(current_step),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP`,
      [carRentalBusinessId, userId, step, status]
    );
  }
}

module.exports = new CarRentalSetupService();
