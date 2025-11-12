const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travoozapp_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query helper function
const executeQuery = async (query, params = []) => {
    try {
        // Check if query contains LIMIT ? or OFFSET ? - use query() instead of execute()
        // Also use query() for bulk inserts with VALUES ?
        if (query.includes('LIMIT ?') || query.includes('OFFSET ?') || query.includes('VALUES ?')) {
            const [results] = await pool.query(query, params);
            return results;
        } else {
            const [results] = await pool.execute(query, params);
            return results;
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Execute transaction helper function
const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeTransaction
};

// Also export pool directly for services that need it
module.exports.pool = pool;

