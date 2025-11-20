const express = require('express');
const router = express.Router();
const clientBookingController = require('../controllers/client/clientBooking.controller');
const clientPaymentController = require('../controllers/client/clientPayment.controller');
const clientDiscoveryController = require('../controllers/client/clientDiscovery.controller');
const clientAuthController = require('../controllers/client/clientAuth.controller');
const restaurantOrderController = require('../controllers/restaurant/restaurantOrder.controller');
const tableBookingController = require('../controllers/restaurant/tableBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Client-facing discovery/browsing routes (public - no authentication required)
// Properties (Stays)
// IMPORTANT: More specific routes must come before parameterized routes
router.get('/properties/available', clientDiscoveryController.getPropertiesWithAvailableRooms);
router.get('/properties', clientDiscoveryController.getProperties);
router.get('/properties/:propertyId/availability', clientDiscoveryController.checkPropertyAvailability);
router.get('/properties/:propertyId', clientDiscoveryController.getPropertyById);

// Tours
router.get('/tours', clientDiscoveryController.getTourPackages);
router.get('/tours/:tourId', clientDiscoveryController.getTourPackageById);
router.get('/tours/:tourId/availability', clientDiscoveryController.checkTourAvailability);

// Restaurants
router.get('/restaurants', clientDiscoveryController.getRestaurants);
router.get('/restaurants/:restaurantId', clientDiscoveryController.getRestaurantById);
router.get('/restaurants/:restaurantId/availability', clientDiscoveryController.checkRestaurantAvailability);
router.get('/restaurants/:restaurantId/table-availability', tableBookingController.checkAvailability);

// Client authentication routes
router.post('/auth/register', clientAuthController.registerClient);
router.post('/auth/login', clientAuthController.loginClient);
router.get('/auth/profile', authenticate, clientAuthController.getClientProfile);

// Car Rentals
router.get('/car-rentals', clientDiscoveryController.getCarRentals);
router.get('/car-rentals/:carId', clientDiscoveryController.getCarRentalById);
router.get('/car-rentals/:carId/availability', clientDiscoveryController.checkCarAvailability);

// Client-facing booking routes (public - no authentication required)
router.post('/bookings/stays', clientBookingController.createStayBooking);
router.post('/bookings/tours', clientBookingController.createTourBooking);
router.post('/bookings/restaurants', clientBookingController.createRestaurantReservation);
router.post('/bookings/car-rentals', clientBookingController.createCarRentalBooking);
router.get('/bookings/:bookingReference', clientBookingController.getBookingByReference);

// Client-facing restaurant order routes (public - no authentication required)
router.post('/orders/restaurants', restaurantOrderController.createOrder);

// Client-facing table booking routes (public - no authentication required)
router.post('/bookings/tables', tableBookingController.createTableBooking);

// Client-facing payment routes (public - no authentication required)
router.post('/payments/:transactionId/process', clientPaymentController.processPayment);
router.get('/payments/:transactionId', clientPaymentController.getTransaction);
router.get('/payments/:transactionId/verify', clientPaymentController.verifyPayment);

module.exports = router;

