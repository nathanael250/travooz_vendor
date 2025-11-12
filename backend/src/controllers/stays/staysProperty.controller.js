const staysPropertyService = require('../../services/stays/staysProperty.service');
const { validationSchemas, validate } = require('../../utils/validation');
const { sendSuccess, sendError, sendValidationError, sendNotFound } = require('../../utils/response.utils');
const jwt = require('jsonwebtoken');

// Create property listing (all 3 steps combined)
const createProperty = async (req, res) => {
    try {
        const { error } = validationSchemas.createProperty.validate(req.body, {
            abortEarly: false,
            allowUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return sendValidationError(res, errors);
        }

        const property = await staysPropertyService.createProperty(req.body);
        
        // Generate JWT token for the newly created user
        let token = null;
        if (property.user_id) {
            token = jwt.sign(
                { 
                    userId: property.user_id,
                    id: property.user_id,
                    email: req.body.email,
                    role: 'vendor'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );
        }
        
        return sendSuccess(res, {
            property_id: property.property_id,
            user_id: property.user_id,
            status: property.status,
            verification_code: property.verification_code, // Include code for development
            token: token, // Include JWT token for immediate authentication
            message: 'Property listing created successfully. Please check your email for verification code.'
        }, 'Property listing created successfully', 201);
    } catch (err) {
        console.error('Error creating property:', err);
        
        // Handle duplicate email error
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
            return sendError(res, 'Email already exists. Please use a different email or sign in.', 400);
        }
        
        return sendError(res, err.message || 'Failed to create property listing', 500);
    }
};

// Get property by ID
const getPropertyById = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        if (!propertyId) {
            return sendError(res, 'Invalid property ID', 400);
        }

        const property = await staysPropertyService.getPropertyById(propertyId);
        
        if (!property) {
            return sendNotFound(res, 'Property not found');
        }

        return sendSuccess(res, property);
    } catch (err) {
        console.error('Error getting property:', err);
        return sendError(res, err.message || 'Failed to get property', 500);
    }
};

// Get user's properties (requires authentication)
const getMyProperties = async (req, res) => {
    try {
        // Get user_id from authenticated token (req.user.userId or req.user.user_id)
        const userId = req.user?.userId || req.user?.user_id || req.query.user_id;
        
        if (!userId) {
            return sendError(res, 'User ID required. Please ensure you are authenticated.', 400);
        }

        const properties = await staysPropertyService.getPropertiesByUserId(userId);
        return sendSuccess(res, properties);
    } catch (err) {
        console.error('Error getting user properties:', err);
        return sendError(res, err.message || 'Failed to get properties', 500);
    }
};

// Get properties by userId (no auth required - for setup flow)
const getPropertiesByUserId = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (!userId || isNaN(userId)) {
            return sendError(res, 'Valid user ID is required', 400);
        }

        const properties = await staysPropertyService.getPropertiesByUserId(userId);
        return sendSuccess(res, properties);
    } catch (err) {
        console.error('Error getting properties by user ID:', err);
        return sendError(res, err.message || 'Failed to get properties', 500);
    }
};

// Update property
const updateProperty = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        if (!propertyId) {
            return sendError(res, 'Invalid property ID', 400);
        }

        const property = await staysPropertyService.updateProperty(propertyId, req.body);
        return sendSuccess(res, property, 'Property updated successfully');
    } catch (err) {
        console.error('Error updating property:', err);
        if (err.message === 'Property not found') {
            return sendNotFound(res, err.message);
        }
        return sendError(res, err.message || 'Failed to update property', 500);
    }
};

// Delete property
const deleteProperty = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        if (!propertyId) {
            return sendError(res, 'Invalid property ID', 400);
        }

        await staysPropertyService.deleteProperty(propertyId);
        return sendSuccess(res, null, 'Property deleted successfully');
    } catch (err) {
        console.error('Error deleting property:', err);
        if (err.message === 'Property not found') {
            return sendNotFound(res, err.message);
        }
        return sendError(res, err.message || 'Failed to delete property', 500);
    }
};

// Get property with all related data
const getPropertyWithAllData = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        if (!propertyId) {
            return sendError(res, 'Invalid property ID', 400);
        }

        // Verify user owns this property
        const userId = req.user?.userId || req.user?.user_id;
        if (!userId) {
            return sendError(res, 'Authentication required', 401);
        }

        const property = await staysPropertyService.getPropertyWithAllData(propertyId);
        
        if (!property) {
            return sendNotFound(res, 'Property not found');
        }

        // Verify ownership
        if (property.user_id !== userId) {
            return sendError(res, 'Unauthorized access to this property', 403);
        }

        return sendSuccess(res, property);
    } catch (err) {
        console.error('Error getting property with all data:', err);
        if (err.message === 'Property not found') {
            return sendNotFound(res, err.message);
        }
        return sendError(res, err.message || 'Failed to get property data', 500);
    }
};

module.exports = {
    createProperty,
    getPropertyById,
    getMyProperties,
    getPropertiesByUserId,
    updateProperty,
    deleteProperty,
    getPropertyWithAllData
};

