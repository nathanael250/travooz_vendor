const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('../config/database');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const defaultOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://www.travooz.com'
];

const extraOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extraOrigins]));

// Normalize origins (remove trailing slashes)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Log the incoming origin for debugging
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', normalizedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/+$/, '');
    
    // Check if origin is allowed
    if (normalizedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // In development, also allow any localhost origin
    if (normalizedOrigin.includes('localhost')) {
      console.log('CORS: Allowing localhost origin:', normalizedOrigin);
      return callback(null, true);
    }
    
    console.error(`CORS: Origin ${normalizedOrigin} not allowed`);
    return callback(new Error(`Origin ${normalizedOrigin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(morgan('dev'));
// Increase body parser limit to handle base64-encoded images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory with CORS headers
const uploadsPath = path.join(__dirname, '../uploads');
const absoluteUploadsPath = path.resolve(uploadsPath);

// Log uploads path for debugging
console.log('📁 Uploads directory path:', absoluteUploadsPath);
console.log('📁 Uploads directory exists:', fs.existsSync(absoluteUploadsPath));

// Ensure uploads directory exists
if (!fs.existsSync(absoluteUploadsPath)) {
  console.warn('⚠️  Uploads directory does not exist, creating it...');
  fs.mkdirSync(absoluteUploadsPath, { recursive: true });
}

app.use('/uploads', (req, res, next) => {
  // Log upload requests for debugging
  console.log('📤 Static file request:', req.method, req.path);
  console.log('📤 Full URL:', req.originalUrl);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(absoluteUploadsPath, {
  // Add fallthrough to allow 404 handling if file doesn't exist
  fallthrough: true,
  // Add index option to prevent directory listing
  index: false
}));

// Add a catch-all for /uploads to log if static middleware didn't handle it
app.use('/uploads', (req, res, next) => {
  const requestedPath = path.join(absoluteUploadsPath, req.path);
  console.log('🔍 Static middleware fallthrough - checking file:', requestedPath);
  console.log('🔍 File exists:', fs.existsSync(requestedPath));
  
  if (fs.existsSync(requestedPath)) {
    const stats = fs.statSync(requestedPath);
    if (stats.isFile()) {
      console.log('✅ Serving file:', requestedPath);
      return res.sendFile(requestedPath);
    } else if (stats.isDirectory()) {
      console.log('⚠️  Path is a directory, not a file');
      return res.status(403).json({ 
        success: false, 
        message: 'Directory listing not allowed' 
      });
    }
  }
  
  console.error('❌ File not found:', requestedPath);
  console.error('❌ Requested path:', req.path);
  console.error('❌ Uploads directory:', absoluteUploadsPath);
  
  // Return 404 with more details
  res.status(404).json({
    success: false,
    message: 'File not found',
    requestedPath: req.path,
    uploadsDirectory: absoluteUploadsPath,
    fullPath: requestedPath
  });
});

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

// Uploads directory diagnostic endpoint
app.get('/health/uploads', (req, res) => {
  const uploadsInfo = {
    uploadsPath: absoluteUploadsPath,
    exists: fs.existsSync(absoluteUploadsPath),
    isDirectory: fs.existsSync(absoluteUploadsPath) ? fs.statSync(absoluteUploadsPath).isDirectory() : false,
    readable: fs.existsSync(absoluteUploadsPath) ? (() => {
      try {
        fs.accessSync(absoluteUploadsPath, fs.constants.R_OK);
        return true;
      } catch {
        return false;
      }
    })() : false
  };
  
  // Try to list some files in restaurants directory
  const restaurantsPath = path.join(absoluteUploadsPath, 'restaurants');
  if (fs.existsSync(restaurantsPath)) {
    try {
      const files = fs.readdirSync(restaurantsPath);
      uploadsInfo.restaurantsFiles = files.slice(0, 10); // First 10 files
      uploadsInfo.restaurantsFileCount = files.length;
    } catch (error) {
      uploadsInfo.restaurantsError = error.message;
    }
  }
  
  res.json({
    success: true,
    ...uploadsInfo
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
const carRentalRoutes = require('./routes/carRental.routes');
const adminAccountsRoutes = require('./routes/adminAccounts.routes');
const adminAuthRoutes = require('./routes/adminAuth.routes');
const clientRoutes = require('./routes/client.routes');
const deliveryBoyRoutes = require('./routes/deliveryBoy.routes');
const restaurantOrdersRoutes = require('./routes/restaurantOrders.routes');
const restaurantTableBookingsRoutes = require('./routes/restaurantTableBookings.routes');

// Service routes
app.use('/api/v1/stays', staysRoutes);
app.use('/api/v1/eating-out/setup', restaurantSetupRoutes);
app.use('/api/v1/restaurants', restaurantsRoutes);
app.use('/api/v1/restaurant', deliveryBoyRoutes);
app.use('/api/v1/restaurant', restaurantOrdersRoutes);
app.use('/api/v1/restaurant', restaurantTableBookingsRoutes);
app.use('/api/v1/restaurant/menu', menuItemsRoutes);
app.use('/api/v1/tours', toursRoutes);
app.use('/api/v1/car-rental', carRentalRoutes);

// Client-facing public APIs (no authentication required)
app.use('/api/v1/client', clientRoutes);

// Restaurant management routes
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/menu-items', menuItemsRoutes);
app.use('/api/v1/images', imagesRoutes);

// Auth routes (for restaurants and general authentication)
app.use('/api/v1/auth', authRoutes);

// Admin routes - mount public auth routes first (no authentication required)
app.use('/api/v1/admin', adminAuthRoutes);
// Protected admin routes (require authentication)
app.use('/api/v1/admin', adminAccountsRoutes);
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

//this is for testing sec