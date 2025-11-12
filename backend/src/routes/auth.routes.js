const express = require('express');
const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Login endpoint for restaurants (uses profiles table)
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Check if user exists in profiles table
    const [users] = await pool.execute(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'vendor' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'vendor',
          full_name: user.full_name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed' 
    });
  }
});

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const [users] = await pool.execute(
      'SELECT id, email, full_name, role, created_at, updated_at FROM profiles WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get profile' 
    });
  }
});

module.exports = router;

