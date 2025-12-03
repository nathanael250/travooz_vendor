const carsService = require('../../services/carRental/cars.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

// Get all cars for a business
const getCars = async (req, res) => {
    try {
        const carRentalBusinessId = req.params.businessId || req.query.businessId;
        
        if (!carRentalBusinessId) {
            return sendError(res, 'Business ID is required', 400);
        }

        const cars = await carsService.getCarsByBusiness(carRentalBusinessId);
        return sendSuccess(res, cars, 'Cars retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getCars controller:', error);
        return sendError(res, error.message || 'Failed to get cars', 500);
    }
};

// Get a single car
const getCar = async (req, res) => {
    try {
        const { carId } = req.params;
        const car = await carsService.getCarById(carId);
        
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        return sendSuccess(res, car, 'Car retrieved successfully', 200);
    } catch (error) {
        console.error('Error in getCar controller:', error);
        return sendError(res, error.message || 'Failed to get car', 500);
    }
};

// Create a new car
const createCar = async (req, res) => {
    try {
        const carData = req.body;
        
        // Handle uploaded images
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagePaths.push(`/uploads/cars/${file.filename}`);
            });
        }
        
        carData.imagePaths = imagePaths;
        const car = await carsService.createCar(carData);
        return sendSuccess(res, car, 'Car created successfully', 201);
    } catch (error) {
        console.error('Error in createCar controller:', error);
        return sendError(res, error.message || 'Failed to create car', 500);
    }
};

// Update a car
const updateCar = async (req, res) => {
    try {
        const { carId } = req.params;
        const carData = req.body;
        
        // Handle uploaded image files
        const uploadedFiles = req.files || [];
        console.log('Update car - uploaded files:', uploadedFiles.length);
        console.log('Update car - car data:', carData);
        
        const car = await carsService.updateCar(carId, carData, uploadedFiles);
        return sendSuccess(res, car, 'Car updated successfully', 200);
    } catch (error) {
        console.error('Error in updateCar controller:', error);
        return sendError(res, error.message || 'Failed to update car', 500);
    }
};

// Delete a car
const deleteCar = async (req, res) => {
    try {
        const { carId } = req.params;
        await carsService.deleteCar(carId);
        return sendSuccess(res, null, 'Car deleted successfully', 200);
    } catch (error) {
        console.error('Error in deleteCar controller:', error);
        return sendError(res, error.message || 'Failed to delete car', 500);
    }
};

// Add images to a car
const addCarImages = async (req, res) => {
    try {
        const { carId } = req.params;
        
        if (!req.files || req.files.length === 0) {
            return sendError(res, 'No images provided', 400);
        }
        
        const imagePaths = req.files.map(file => `/uploads/cars/${file.filename}`);
        const car = await carsService.addCarImages(carId, imagePaths);
        return sendSuccess(res, car, 'Images added successfully', 200);
    } catch (error) {
        console.error('Error in addCarImages controller:', error);
        return sendError(res, error.message || 'Failed to add images', 500);
    }
};

// Delete a car image
const deleteCarImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        await carsService.deleteCarImage(imageId);
        return sendSuccess(res, null, 'Image deleted successfully', 200);
    } catch (error) {
        console.error('Error in deleteCarImage controller:', error);
        return sendError(res, error.message || 'Failed to delete image', 500);
    }
};

module.exports = {
    getCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    addCarImages,
    deleteCarImage
};

