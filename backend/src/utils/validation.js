const Joi = require('joi');

// Validation schemas
const validationSchemas = {
  // Property listing validation
  createProperty: Joi.object({
    location: Joi.string().max(255).optional().allow('', null),
    locationData: Joi.object({
      name: Joi.string().optional(),
      formatted_address: Joi.string().optional(),
      place_id: Joi.string().optional(),
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
      address_components: Joi.array().optional()
    }).optional().allow(null),
    propertyName: Joi.string().max(255).optional(),
    propertyType: Joi.string().max(100).optional(),
    numberOfRooms: Joi.number().integer().min(1).optional(),
    legalName: Joi.string().max(255).optional(),
    currency: Joi.string().length(3).optional(),
    channelManager: Joi.string().valid('yes', 'no').optional(),
    partOfChain: Joi.string().valid('yes', 'no').optional(),
    bookingComUrl: Joi.string().uri().optional().allow(''),
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
    countryCode: Joi.string().max(10).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validationSchemas,
  validate
};

