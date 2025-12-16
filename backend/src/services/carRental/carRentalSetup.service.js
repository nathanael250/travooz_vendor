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
      email_verified TINYINT(1) DEFAULT 0,
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
      latitude DECIMAL(10,8) DEFAULT NULL,
      longitude DECIMAL(11,8) DEFAULT NULL,
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
      payment_method VARCHAR(100) DEFAULT NULL,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS car_rental_onboarding_progress_track (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      business_id INT,
      current_step VARCHAR(50) DEFAULT 'business-details',
      step_name VARCHAR(100),
      step_number INT,
      is_complete TINYINT(1) DEFAULT 0,
      completed_steps JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_car_rental_onboarding_user (user_id),
      CONSTRAINT fk_car_rental_onboarding_user FOREIGN KEY (user_id)
        REFERENCES car_rental_users(user_id) ON DELETE CASCADE,
      CONSTRAINT fk_car_rental_onboarding_business FOREIGN KEY (business_id)
        REFERENCES car_rental_businesses(car_rental_business_id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const statement of tableStatements) {
    await pool.execute(statement);
  }

  // Ensure email_verified column exists in car_rental_users (for existing tables)
  try {
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'car_rental_users' 
      AND COLUMN_NAME = 'email_verified'
    `);
    
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE car_rental_users 
        ADD COLUMN email_verified TINYINT(1) DEFAULT 0 
        AFTER password_hash
      `);
      console.log('✅ Added email_verified column to car_rental_users table');
    } else {
      console.log('ℹ️  email_verified column already exists in car_rental_users table');
    }
  } catch (alterError) {
    console.warn('Could not add email_verified column:', alterError.message);
    // Don't throw - continue execution
  }

  // Update payment_method column to allow NULL (for existing tables)
  try {
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'car_rental_tax_info' 
      AND COLUMN_NAME = 'payment_method'
    `);
    
    if (columns.length > 0 && columns[0].IS_NULLABLE === 'NO') {
      await pool.execute(`ALTER TABLE car_rental_tax_info MODIFY COLUMN payment_method VARCHAR(100) DEFAULT NULL`);
    }
  } catch (alterError) {
    console.warn('Could not update payment_method column:', alterError.message);
  }

  // Add latitude and longitude columns if they don't exist (for existing tables)
  try {
    await pool.execute(`
      ALTER TABLE car_rental_businesses 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) DEFAULT NULL
    `);
  } catch (error) {
    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we need to check first
    try {
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'car_rental_businesses' 
        AND COLUMN_NAME IN ('latitude', 'longitude')
      `);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      if (!columnNames.includes('latitude')) {
        await pool.execute(`ALTER TABLE car_rental_businesses ADD COLUMN latitude DECIMAL(10,8) DEFAULT NULL`);
      }
      
      if (!columnNames.includes('longitude')) {
        await pool.execute(`ALTER TABLE car_rental_businesses ADD COLUMN longitude DECIMAL(11,8) DEFAULT NULL`);
      }
    } catch (alterError) {
      console.warn('Could not add latitude/longitude columns (they may already exist):', alterError.message);
    }
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

    // Get the existing business to ensure it exists and get its userId
    const [existingBusiness] = await pool.execute(
      `SELECT user_id FROM car_rental_businesses WHERE car_rental_business_id = ?`,
      [carRentalBusinessId]
    );

    if (!existingBusiness || existingBusiness.length === 0) {
      throw new Error('Car rental business not found');
    }

    // Use the existing business's userId to ensure foreign key constraint is satisfied
    const existingUserId = existingBusiness[0].user_id;

    // Verify the user exists in car_rental_users
    const [userCheck] = await pool.execute(
      `SELECT user_id FROM car_rental_users WHERE user_id = ?`,
      [existingUserId]
    );

    if (!userCheck || userCheck.length === 0) {
      throw new Error(`User with ID ${existingUserId} does not exist in car_rental_users. Please ensure the user account is properly created.`);
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

    // Use existingUserId for progress update
    await this.#updateProgress(carRentalBusinessId, existingUserId, 4, 'in_progress');

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
        taxPayment.paymentMethod || null,
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
    // If user.id is provided, verify it exists in car_rental_users
    if (user.id) {
      const [userCheck] = await pool.execute(
        `SELECT user_id FROM car_rental_users WHERE user_id = ?`,
        [user.id]
      );

      if (userCheck && userCheck.length > 0) {
        return userCheck[0].user_id;
      }

      // If user.id doesn't exist in car_rental_users, try to find by email or create new
      // Don't just return user.id as it might be from a different table
    }

    if (!user.email) {
      throw new Error('User email is required');
    }

    // Normalize email for comparison (trim and lowercase)
    const normalizedEmail = (user.email || '').trim().toLowerCase();

    const existingUsers = await executeQuery(
      `SELECT user_id, password_hash, email FROM car_rental_users WHERE LOWER(TRIM(email)) = ?`,
      [normalizedEmail]
    );

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      // If user exists and a password is provided, update the password
      if (user.password && user.password.trim()) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.execute(
          `UPDATE car_rental_users SET password_hash = ? WHERE user_id = ?`,
          [hashedPassword, existingUser.user_id]
        );
        console.log(`✅ Updated password for existing car rental user: ${normalizedEmail}`);
      } else {
        // If user exists but no password is provided, check if they have a password_hash
        // If they don't have one, they'll need to use forgot password
        if (!existingUser.password_hash) {
          console.log(`⚠️  Existing user ${normalizedEmail} has no password_hash. They'll need to use forgot password.`);
        } else {
          console.log(`ℹ️  Existing user ${normalizedEmail} already has a password_hash. Password not updated.`);
        }
      }
      return existingUser.user_id;
    }

    // If no password is provided (e.g., for vendors from other services),
    // generate a random password that they'll need to reset later
    let passwordToHash = user.password;
    if (!passwordToHash || !passwordToHash.trim()) {
      // Generate a random password for vendors who don't provide one
      // They'll need to reset it via forgot password flow
      const crypto = require('crypto');
      passwordToHash = crypto.randomBytes(16).toString('hex');
      console.log(`⚠️  Generated temporary password for vendor: ${normalizedEmail} (no password provided)`);
    }

    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const fullName = [user.firstName || '', user.lastName || '']
      .filter(Boolean)
      .join(' ')
      .trim() || business.carRentalBusinessName || normalizedEmail.split('@')[0];

    const formattedPhone = this.#formatPhone(user.phone, user.countryCode, { allowDefault: true });

    // normalizedEmail is already declared above, reuse it for insert
    try {
      const insertResult = await pool.execute(
        `INSERT INTO car_rental_users (role, name, email, phone, password_hash, email_verified)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [
          'vendor',
          fullName,
          normalizedEmail,
          formattedPhone,
          hashedPassword
        ]
      );

      const [result] = insertResult;
      console.log(`✅ Created new car rental user: ${normalizedEmail} (user_id: ${result.insertId})`);
      return result.insertId;
    } catch (insertError) {
      // Handle duplicate email error (MySQL error code 1062)
      if (insertError.code === 'ER_DUP_ENTRY' || insertError.errno === 1062) {
        console.log(`⚠️  Duplicate email detected during insert: ${normalizedEmail}. Checking existing user...`);
        
        // Double-check: query again to get the existing user (case-insensitive)
        const duplicateCheck = await executeQuery(
          `SELECT user_id, password_hash, email_verified FROM car_rental_users WHERE LOWER(TRIM(email)) = ?`,
          [normalizedEmail]
        );
        
        if (duplicateCheck && duplicateCheck.length > 0) {
          const existingUser = duplicateCheck[0];
          console.log(`✅ Found existing user with email ${normalizedEmail} (user_id: ${existingUser.user_id})`);
          console.log(`ℹ️  Existing user has password_hash: ${!!existingUser.password_hash}`);
          console.log(`ℹ️  Existing user email_verified: ${existingUser.email_verified}`);
          
          // If password was provided, update it (even if one exists - user might be resetting)
          if (user.password && user.password.trim()) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await pool.execute(
              `UPDATE car_rental_users SET password_hash = ? WHERE user_id = ?`,
              [hashedPassword, existingUser.user_id]
            );
            console.log(`✅ Updated password for existing user: ${normalizedEmail}`);
          } else if (!existingUser.password_hash) {
            // If no password provided and user has no password_hash, they'll need to use forgot password
            console.log(`⚠️  Existing user ${normalizedEmail} has no password_hash and no password was provided. They'll need to use forgot password.`);
          }
          
          return existingUser.user_id;
        } else {
          // This shouldn't happen, but handle it
          throw new Error(`Email ${normalizedEmail} already exists, but could not retrieve user information.`);
        }
      } else {
        // Re-throw other errors
        console.error('❌ Error creating car rental user:', insertError);
        throw insertError;
      }
    }
  }

  async #createOrUpdateBusiness({ userId, location, locationData, business, existingBusinessId }) {
    const locationString = location && location.trim() ? location.trim() : 'Kigali, Rwanda';
    const locationDataJson = safeJsonStringify(locationData);
    
    // Extract latitude and longitude from locationData
    const latitude = locationData?.geometry?.location?.lat || 
                     locationData?.lat || 
                     locationData?.latitude || 
                     null;
    const longitude = locationData?.geometry?.location?.lng || 
                      locationData?.lng || 
                      locationData?.longitude || 
                      null;

    // Verify userId exists in car_rental_users before proceeding
    if (userId) {
      const [userCheck] = await pool.execute(
        `SELECT user_id FROM car_rental_users WHERE user_id = ?`,
        [userId]
      );

      if (!userCheck || userCheck.length === 0) {
        throw new Error(`User with ID ${userId} does not exist in car_rental_users. Please ensure the user account is properly created.`);
      }
    }

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

    const businessPhone = this.#formatPhone(business.phone, business.countryCode);

    if (targetBusinessId) {
      await pool.execute(
        `UPDATE car_rental_businesses
          SET business_name = ?, business_type = ?, short_description = ?, location = ?, location_data = ?,
              latitude = ?, longitude = ?, car_type = ?, car_type_name = ?, subcategory_id = ?, description = ?, phone = ?, currency = ?,
              status = 'in_progress', updated_at = CURRENT_TIMESTAMP
        WHERE car_rental_business_id = ?`,
        [
          business.carRentalBusinessName || business.businessName || 'Car Rental Business',
          business.carTypes && business.carTypes.length > 0 
            ? business.carTypes.join(',') 
            : (business.carType || null),
          business.shortDescription || business.description || null,
          locationString,
          locationDataJson,
          latitude,
          longitude,
          // Handle multiple car types - store as comma-separated string
          business.carTypes && business.carTypes.length > 0 
            ? business.carTypes.join(',') 
            : (business.carType || null),
          business.carTypeNames && business.carTypeNames.length > 0
            ? business.carTypeNames.join(', ')
            : (business.carTypeName || null),
          // Store first subcategory_id for backward compatibility
          business.subcategoryIds && business.subcategoryIds.length > 0
            ? business.subcategoryIds[0]
            : (business.subcategoryId || null),
          business.description || null,
          businessPhone,
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
        user_id, business_name, business_type, short_description, location, location_data, latitude, longitude,
        car_type, car_type_name, subcategory_id, description, phone, currency, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
      [
        userId,
        business.carRentalBusinessName || business.businessName || 'Car Rental Business',
        business.carTypes && business.carTypes.length > 0 
          ? business.carTypes.join(',') 
          : (business.carType || null),
        business.shortDescription || business.description || null,
        locationString,
        locationDataJson,
        latitude,
        longitude,
        // Handle multiple car types - store as comma-separated string or JSON
        business.carTypes && business.carTypes.length > 0 
          ? business.carTypes.join(',') 
          : (business.carType || null),
        business.carTypeNames && business.carTypeNames.length > 0
          ? business.carTypeNames.join(', ')
          : (business.carTypeName || null),
        // Store first subcategory_id for backward compatibility, or store as JSON
        business.subcategoryIds && business.subcategoryIds.length > 0
          ? business.subcategoryIds[0]
          : (business.subcategoryId || null),
        business.description || null,
        businessPhone,
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

  #formatPhone(phone, countryCode, { allowDefault = false } = {}) {
    const raw = (phone || '').toString().replace(/\s+/g, '');
    if (!raw) return null;
    if (raw.startsWith('+')) return raw;

    const codeSource = (countryCode || (allowDefault ? '+250' : '')).toString().replace(/\s+/g, '');
    if (!codeSource) {
      return raw;
    }

    const codeWithPlus = codeSource.startsWith('+') ? codeSource : `+${codeSource}`;
    const numberPart = raw.replace(/^\+/, '');
    return `${codeWithPlus}${numberPart}`;
  }
}

module.exports = new CarRentalSetupService();
