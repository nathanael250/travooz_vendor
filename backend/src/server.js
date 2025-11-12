const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('../config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(morgan('dev'));
// Increase body parser limit to handle base64-encoded images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Travooz Vendor Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  const isConnected = await testConnection();
  res.json({ 
    status: isConnected ? 'connected' : 'disconnected',
    database: process.env.DB_NAME || 'travooz_database'
  });
});

// API Routes
const staysRoutes = require('./routes/stays.routes');
const adminRoutes = require('./routes/admin.routes');
const restaurantSetupRoutes = require('./routes/restaurant.routes');
const restaurantsRoutes = require('./routes/restaurants.routes');
const adminRestaurantRoutes = require('./routes/adminRestaurant.routes');
const toursRoutes = require('./routes/tours.routes');
const adminToursRoutes = require('./routes/adminTours.routes');
const authRoutes = require('./routes/auth.routes');
const ordersRoutes = require('./routes/orders.routes');
const menuItemsRoutes = require('./routes/menuItems.routes');
const imagesRoutes = require('./routes/images.routes');

// Service routes
app.use('/api/v1/stays', staysRoutes);
app.use('/api/v1/eating-out/setup', restaurantSetupRoutes);
app.use('/api/v1/restaurants', restaurantsRoutes);
app.use('/api/v1/tours', toursRoutes);

// Restaurant management routes
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/menu-items', menuItemsRoutes);
app.use('/api/v1/images', imagesRoutes);

// Auth routes (for restaurants and general authentication)
app.use('/api/v1/auth', authRoutes);

// Admin routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/restaurants', adminRestaurantRoutes);
app.use('/api/v1/admin/tours', adminToursRoutes);

// TODO: Add other service routes
// app.use('/api/v1/restaurants', restaurantRoutes);
// app.use('/api/v1/tours', tourRoutes);
// app.use('/api/v1/cars', carRoutes);
// app.use('/api/v1/activities', activityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Travooz Vendor Backend server running on port ${PORT}`);
  await testConnection();
});

module.exports = app;

