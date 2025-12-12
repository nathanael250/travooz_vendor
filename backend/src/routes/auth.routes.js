const express = require('express');
const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Login endpoint for restaurants (checks both profiles and restaurant_users tables)
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

    let user = null;
    let userType = 'profile'; // 'profile' or 'restaurant_user'

    // First, check restaurant_users table
    try {
      const [restaurantUsers] = await pool.execute(
        `SELECT ru.*, r.id as restaurant_id, r.name as restaurant_name, r.status as restaurant_status
         FROM restaurant_users ru
         LEFT JOIN restaurants r ON r.user_id = ru.user_id
         WHERE ru.email = ? AND ru.is_active = 1`,
        [email]
      );

      if (restaurantUsers.length > 0) {
        user = restaurantUsers[0];
        userType = 'restaurant_user';
        
        // Verify password (restaurant_users uses password_hash)
        const isValidPassword = await bcrypt.compare(password, user.password_hash || user.password);
        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false,
            error: 'Invalid email or password' 
          });
        }

        // Allow login regardless of restaurant status - user can see approval status in dashboard
        // Update last login
        await pool.execute(
          'UPDATE restaurant_users SET last_login = ? WHERE user_id = ?',
          [new Date(), user.user_id]
        );

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.user_id, 
            email: user.email, 
            role: user.role || 'vendor',
            restaurant_id: user.restaurant_id || null,
            userType: 'restaurant_user'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: user.user_id,
              email: user.email,
              role: user.role || 'vendor',
              name: user.name,
              restaurant_id: user.restaurant_id || null,
              restaurant_name: user.restaurant_name || null,
              restaurant_status: user.restaurant_status || null,
              userType: 'restaurant_user'
            }
          }
        });
      }
    } catch (restaurantUserError) {
      // If restaurant_users table doesn't exist yet, continue to check profiles
      console.log('Restaurant users table check failed, checking profiles:', restaurantUserError.message);
    }

    // If not found in restaurant_users, check profiles table
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

    user = users[0];

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
      { id: user.id, email: user.email, role: user.role || 'vendor', userType: 'profile' },
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
          full_name: user.full_name,
          userType: 'profile'
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

