const driversService = require('../../services/carRental/drivers.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Get all drivers for a vendor
const getDrivers = async (req, res) => {
    try {
        const vendorId = req.params.businessId || req.params.vendorId || req.query.vendorId || req.query.businessId;
        
        if (!vendorId) {
            return sendError(res, 'Business ID is required', 400);
        }

        const drivers = await driversService.getDriversByVendor(vendorId);
        return sendSuccess(res, drivers, 'Drivers retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getDrivers controller:', error);
        return sendError(res, error.message || 'Failed to get drivers', 500);
    }
};

// Get a single driver
const getDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const driver = await driversService.getDriverById(driverId);
        
        if (!driver) {
            return sendError(res, 'Driver not found', 404);
        }

        return sendSuccess(res, driver, 'Driver retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getDriver controller:', error);
        return sendError(res, error.message || 'Failed to get driver', 500);
    }
};

// Create a new driver
const createDriver = async (req, res) => {
    try {
        const driverData = req.body;
        const driver = await driversService.createDriver(driverData);
        return sendSuccess(res, driver, 'Driver created successfully', 201);
    } catch (error) {
        console.error('Error in createDriver controller:', error);
        return sendError(res, error.message || 'Failed to create driver', 500);
    }
};

// Update a driver
const updateDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const driverData = req.body;
        const driver = await driversService.updateDriver(driverId, driverData);
        return sendSuccess(res, driver, 'Driver updated successfully', 200);
    } catch (error) {
        console.error('Error in updateDriver controller:', error);
        return sendError(res, error.message || 'Failed to update driver', 500);
    }
};

// Delete a driver
const deleteDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        await driversService.deleteDriver(driverId);
        return sendSuccess(res, null, 'Driver deleted successfully', 200);
    } catch (error) {
        console.error('Error in deleteDriver controller:', error);
        return sendError(res, error.message || 'Failed to delete driver', 500);
    }
};

module.exports = {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver
};

