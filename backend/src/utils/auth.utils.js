const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthUtils {
    // Hash password
    static async hashPassword(password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Generate JWT token
    static generateToken(payload, expiresIn = process.env.JWT_EXPIRE || '24h') {
        return jwt.sign(payload, process.env.JWT_SECRET || 'stays-secret-key-change-in-production', { expiresIn });
    }

    // Verify JWT token
    static verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET || 'stays-secret-key-change-in-production');
    }

    // Generate random token for password reset
    static generateResetToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = AuthUtils;

