const clientBookingService = require('../../services/client/clientBooking.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

/**
 * Create a stay/room booking
 */
const createStayBooking = async (req, res) => {
  try {
    const booking = await clientBookingService.createStayBooking(req.body);
    return sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Error in createStayBooking:', error);
    return sendError(res, error.message || 'Failed to create booking', 400);
  }
};

/**
 * Create a tour package booking
 */
const createTourBooking = async (req, res) => {
  try {
    const booking = await clientBookingService.createTourBooking(req.body);
    return sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Error in createTourBooking:', error);
    return sendError(res, error.message || 'Failed to create booking', 400);
  }
};

/**
 * Create a restaurant table reservation
 */
const createRestaurantReservation = async (req, res) => {
  try {
    const booking = await clientBookingService.createRestaurantReservation(req.body);
    return sendSuccess(res, booking, 'Reservation created successfully', 201);
  } catch (error) {
    console.error('Error in createRestaurantReservation:', error);
    return sendError(res, error.message || 'Failed to create reservation', 400);
  }
};

/**
 * Create a car rental booking
 */
const createCarRentalBooking = async (req, res) => {
  try {
    const booking = await clientBookingService.createCarRentalBooking(req.body);
    return sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Error in createCarRentalBooking:', error);
    return sendError(res, error.message || 'Failed to create booking', 400);
  }
};

/**
 * Get booking by reference
 */
const getBookingByReference = async (req, res) => {
  try {
    const { bookingReference } = req.params;
    const booking = await clientBookingService.getBookingByReference(bookingReference);
    
    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    return sendSuccess(res, booking, 'Booking retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getBookingByReference:', error);
    return sendError(res, error.message || 'Failed to get booking', 500);
  }
};

module.exports = {
  createStayBooking,
  createTourBooking,
  createRestaurantReservation,
  createCarRentalBooking,
  getBookingByReference
};

