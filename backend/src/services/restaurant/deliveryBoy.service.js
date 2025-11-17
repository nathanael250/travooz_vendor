const { pool } = require('../../../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class DeliveryBoyService {
  /**
   * Ensure delivery_boys table exists
   */
  async ensureDeliveryBoysTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS delivery_boys (
          id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name varchar(255) NOT NULL,
          email varchar(255) NOT NULL,
          password varchar(255) NOT NULL,
          mobile varchar(50) NOT NULL,
          address text DEFAULT NULL,
          bonus_type enum('fixed_amount_per_order','percentage_per_order') DEFAULT 'fixed_amount_per_order',
          bonus_amount decimal(10,2) DEFAULT 0.00,
          bonus_percentage decimal(5,2) DEFAULT 0.00,
          is_active tinyint(1) DEFAULT 1,
          total_orders int DEFAULT 0,
          total_earnings decimal(10,2) DEFAULT 0.00,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_email (email),
          UNIQUE KEY unique_mobile (mobile),
          KEY idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error) {
      console.error('Error ensuring delivery_boys table:', error);
    }
  }

  /**
   * Ensure delivery_boy_cash_collection table exists
   */
  async ensureCashCollectionTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS delivery_boy_cash_collection (
          id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          delivery_boy_id int NOT NULL,
          amount decimal(10,2) NOT NULL,
          transaction_date timestamp NOT NULL,
          message text DEFAULT NULL,
          status enum('delivery_boy_cash','delivery_boy_cash_collection') DEFAULT 'delivery_boy_cash',
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_delivery_boy_id (delivery_boy_id),
          KEY idx_status (status),
          KEY idx_transaction_date (transaction_date),
          FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error) {
      console.error('Error ensuring delivery_boy_cash_collection table:', error);
    }
  }

  /**
   * Get all delivery boys with optional filters
   */
  async getDeliveryBoys(filters = {}) {
    await this.ensureDeliveryBoysTable();

    const {
      id = null,
      search = null,
      limit = 25,
      offset = 0,
      sort = 'id',
      order = 'DESC'
    } = filters;

    let query = 'SELECT * FROM delivery_boys WHERE 1=1';
    const params = [];

    if (id) {
      query += ' AND id = ?';
      params.push(id);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Validate sort column
    const allowedSortColumns = ['id', 'name', 'email', 'mobile', 'created_at', 'total_orders', 'total_earnings'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Get delivery boy by ID
   */
  async getDeliveryBoyById(id) {
    await this.ensureDeliveryBoysTable();

    const [rows] = await pool.execute(
      'SELECT * FROM delivery_boys WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Add or update delivery boy
   */
  async addDeliveryBoy(data) {
    await this.ensureDeliveryBoysTable();

    const {
      edit_delivery_boy = null,
      name,
      email,
      password,
      confirm_password,
      mobile,
      address = null,
      bonus_type = 'fixed_amount_per_order',
      bonus_amount = 0,
      bonus_percentage = 0
    } = data;

    // Validate required fields
    if (!name || !email || !mobile) {
      throw new Error('Name, email, and mobile are required');
    }

    // If editing, validate password only if provided
    if (edit_delivery_boy) {
      const existing = await this.getDeliveryBoyById(edit_delivery_boy);
      if (!existing) {
        throw new Error('Delivery boy not found');
      }

      let updateQuery = 'UPDATE delivery_boys SET name = ?, email = ?, mobile = ?, address = ?, bonus_type = ?, bonus_amount = ?, bonus_percentage = ?';
      const updateParams = [name, email, mobile, address, bonus_type, bonus_amount, bonus_percentage];

      // Update password only if provided
      if (password) {
        if (password !== confirm_password) {
          throw new Error('Password and confirm password do not match');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += ', password = ?';
        updateParams.push(hashedPassword);
      }

      updateQuery += ' WHERE id = ?';
      updateParams.push(edit_delivery_boy);

      await pool.execute(updateQuery, updateParams);
      return await this.getDeliveryBoyById(edit_delivery_boy);
    } else {
      // Creating new delivery boy
      if (!password || !confirm_password) {
        throw new Error('Password and confirm password are required');
      }

      if (password !== confirm_password) {
        throw new Error('Password and confirm password do not match');
      }

      // Check if email or mobile already exists
      const [existing] = await pool.execute(
        'SELECT * FROM delivery_boys WHERE email = ? OR mobile = ?',
        [email, mobile]
      );

      if (existing.length > 0) {
        throw new Error('Email or mobile number already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.execute(
        `INSERT INTO delivery_boys 
         (name, email, password, mobile, address, bonus_type, bonus_amount, bonus_percentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, mobile, address, bonus_type, bonus_amount, bonus_percentage]
      );

      const [newDeliveryBoy] = await pool.execute(
        'SELECT * FROM delivery_boys WHERE email = ?',
        [email]
      );

      return newDeliveryBoy[0];
    }
  }

  /**
   * Delete delivery boy
   */
  async deleteDeliveryBoy(id) {
    await this.ensureDeliveryBoysTable();

    const existing = await this.getDeliveryBoyById(id);
    if (!existing) {
      throw new Error('Delivery boy not found');
    }

    await pool.execute('DELETE FROM delivery_boys WHERE id = ?', [id]);
    return { success: true, message: 'Delivery boy deleted successfully' };
  }

  /**
   * Manage delivery boy cash collection
   */
  async manageCashCollection(data) {
    await this.ensureCashCollectionTable();

    const {
      delivery_boy_id,
      amount,
      transaction_date,
      message = null,
      status = 'delivery_boy_cash'
    } = data;

    if (!delivery_boy_id || !amount || !transaction_date) {
      throw new Error('Delivery boy ID, amount, and transaction date are required');
    }

    // Verify delivery boy exists
    const deliveryBoy = await this.getDeliveryBoyById(delivery_boy_id);
    if (!deliveryBoy) {
      throw new Error('Delivery boy not found');
    }

    await pool.execute(
      `INSERT INTO delivery_boy_cash_collection 
       (delivery_boy_id, amount, transaction_date, message, status)
       VALUES (?, ?, ?, ?, ?)`,
      [delivery_boy_id, amount, transaction_date, message, status]
    );

    // Update delivery boy's total earnings if status is delivery_boy_cash_collection (admin collected)
    if (status === 'delivery_boy_cash_collection') {
      await pool.execute(
        'UPDATE delivery_boys SET total_earnings = total_earnings + ? WHERE id = ?',
        [amount, delivery_boy_id]
      );
    }

    const [newRecord] = await pool.execute(
      'SELECT * FROM delivery_boy_cash_collection WHERE id = LAST_INSERT_ID()'
    );

    return newRecord[0];
  }

  /**
   * Get delivery boy cash collection records
   */
  async getCashCollection(filters = {}) {
    await this.ensureCashCollectionTable();

    const {
      delivery_boy_id = null,
      status = null,
      limit = 25,
      offset = 0,
      sort = 'id',
      order = 'DESC',
      search = null
    } = filters;

    let query = `
      SELECT c.*, db.name as delivery_boy_name, db.email as delivery_boy_email, db.mobile as delivery_boy_mobile
      FROM delivery_boy_cash_collection c
      LEFT JOIN delivery_boys db ON c.delivery_boy_id = db.id
      WHERE 1=1
    `;
    const params = [];

    if (delivery_boy_id) {
      query += ' AND c.delivery_boy_id = ?';
      params.push(delivery_boy_id);
    }

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (db.name LIKE ? OR db.email LIKE ? OR db.mobile LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Validate sort column
    const allowedSortColumns = ['id', 'transaction_date', 'amount', 'created_at'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY c.${sortColumn} ${sortOrder}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = new DeliveryBoyService();

