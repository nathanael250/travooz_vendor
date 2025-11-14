const clientDiscoveryService = require('../../services/client/clientDiscovery.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

/**
 * Get all properties (stays) with filters
 */
const getProperties = async (req, res) => {
  try {
    const properties = await clientDiscoveryService.getProperties(req.query);
    return sendSuccess(res, properties, 'Properties retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getProperties:', error);
    return sendError(res, error.message || 'Failed to get properties', 500);
  }
};

/**
 * Get property details by ID
 */
const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await clientDiscoveryService.getPropertyById(propertyId);
    
    if (!property) {
      return sendError(res, 'Property not found', 404);
    }

    return sendSuccess(res, property, 'Property retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    return sendError(res, error.message || 'Failed to get property', 500);
  }
};

/**
 * Check property availability for dates
 */
const checkPropertyAvailability = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return sendError(res, 'check_in_date and check_out_date are required', 400);
    }

    const availability = await clientDiscoveryService.checkPropertyAvailability(
      propertyId,
      check_in_date,
      check_out_date
    );

    return sendSuccess(res, availability, 'Availability checked successfully', 200);
  } catch (error) {
    console.error('Error in checkPropertyAvailability:', error);
    return sendError(res, error.message || 'Failed to check availability', 500);
  }
};

/**
 * Get all tour packages with filters
 */
const getTourPackages = async (req, res) => {
  try {
    const tours = await clientDiscoveryService.getTourPackages(req.query);
    return sendSuccess(res, tours, 'Tour packages retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getTourPackages:', error);
    return sendError(res, error.message || 'Failed to get tour packages', 500);
  }
};

/**
 * Get tour package details by ID
 */
const getTourPackageById = async (req, res) => {
  try {
    const { tourId } = req.params;
    const tour = await clientDiscoveryService.getTourPackageById(tourId);
    
    if (!tour) {
      return sendError(res, 'Tour package not found', 404);
    }

    return sendSuccess(res, tour, 'Tour package retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getTourPackageById:', error);
    return sendError(res, error.message || 'Failed to get tour package', 500);
  }
};

/**
 * Check tour availability for a date
 */
const checkTourAvailability = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { tour_date } = req.query;

    if (!tour_date) {
      return sendError(res, 'tour_date is required', 400);
    }

    const availability = await clientDiscoveryService.checkTourAvailability(tourId, tour_date);
    return sendSuccess(res, availability, 'Availability checked successfully', 200);
  } catch (error) {
    console.error('Error in checkTourAvailability:', error);
    return sendError(res, error.message || 'Failed to check availability', 500);
  }
};

/**
 * Get all restaurants with filters
 */
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await clientDiscoveryService.getRestaurants(req.query);
    return sendSuccess(res, restaurants, 'Restaurants retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return sendError(res, error.message || 'Failed to get restaurants', 500);
  }
};

/**
 * Get restaurant details by ID
 */
const getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await clientDiscoveryService.getRestaurantById(restaurantId);
    
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    return sendSuccess(res, restaurant, 'Restaurant retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getRestaurantById:', error);
    return sendError(res, error.message || 'Failed to get restaurant', 500);
  }
};

/**
 * Check restaurant table availability
 */
const checkRestaurantAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { reservation_date, reservation_time, guests } = req.query;

    if (!reservation_date || !reservation_time) {
      return sendError(res, 'reservation_date and reservation_time are required', 400);
    }

    const availability = await clientDiscoveryService.checkRestaurantAvailability(
      restaurantId,
      reservation_date,
      reservation_time,
      guests
    );

    return sendSuccess(res, availability, 'Availability checked successfully', 200);
  } catch (error) {
    console.error('Error in checkRestaurantAvailability:', error);
    return sendError(res, error.message || 'Failed to check availability', 500);
  }
};

/**
 * Get all car rentals with filters
 */
const getCarRentals = async (req, res) => {
  try {
    const cars = await clientDiscoveryService.getCarRentals(req.query);
    return sendSuccess(res, cars, 'Car rentals retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getCarRentals:', error);
    return sendError(res, error.message || 'Failed to get car rentals', 500);
  }
};

/**
 * Get car rental details by ID
 */
const getCarRentalById = async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await clientDiscoveryService.getCarRentalById(carId);
    
    if (!car) {
      return sendError(res, 'Car rental not found', 404);
    }

    return sendSuccess(res, car, 'Car rental retrieved successfully', 200);
  } catch (error) {
    console.error('Error in getCarRentalById:', error);
    return sendError(res, error.message || 'Failed to get car rental', 500);
  }
};

/**
 * Check car availability for dates
 */
const checkCarAvailability = async (req, res) => {
  try {
    const { carId } = req.params;
    const { pickup_date, return_date } = req.query;

    if (!pickup_date || !return_date) {
      return sendError(res, 'pickup_date and return_date are required', 400);
    }

    const availability = await clientDiscoveryService.checkCarAvailability(
      carId,
      pickup_date,
      return_date
    );

    return sendSuccess(res, availability, 'Availability checked successfully', 200);
  } catch (error) {
    console.error('Error in checkCarAvailability:', error);
    return sendError(res, error.message || 'Failed to check availability', 500);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  checkPropertyAvailability,
  getTourPackages,
  getTourPackageById,
  checkTourAvailability,
  getRestaurants,
  getRestaurantById,
  checkRestaurantAvailability,
  getCarRentals,
  getCarRentalById,
  checkCarAvailability
};



