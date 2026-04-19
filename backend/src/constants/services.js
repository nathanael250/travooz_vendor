/**
 * Service Constants
 * 
 * Centralized definition of all services in the system.
 * This is the single source of truth for service identifiers.
 * 
 * IMPORTANT: These values must match the service column in the unified users table.
 */

const SERVICES = {
    RESTAURANT: 'restaurant',
    CAR_RENTAL: 'car_rental',
    TOURS: 'tours',
    STAYS: 'stays'
};

// Array of all valid services (useful for validation)
const VALID_SERVICES = Object.values(SERVICES);

/**
 * Validate if a service is valid
 * @param {string} service - Service identifier to validate
 * @returns {boolean} - True if service is valid
 */
const isValidService = (service) => {
    return VALID_SERVICES.includes(service);
};

/**
 * Get service display name
 * @param {string} service - Service identifier
 * @returns {string} - Display name for the service
 */
const getServiceDisplayName = (service) => {
    const displayNames = {
        [SERVICES.RESTAURANT]: 'Restaurant',
        [SERVICES.CAR_RENTAL]: 'Car Rental',
        [SERVICES.TOURS]: 'Tours',
        [SERVICES.STAYS]: 'Stays'
    };
    return displayNames[service] || service;
};

module.exports = {
    SERVICES,
    VALID_SERVICES,
    isValidService,
    getServiceDisplayName
};





