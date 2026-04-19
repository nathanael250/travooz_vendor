/**
 * Service-aware Token Manager
 * 
 * Manages service-specific authentication tokens in localStorage.
 * Prevents token collision when the same email is used across multiple services.
 */

// Service constants
export const SERVICES = {
  STAYS: 'stays',
  TOURS: 'tours',
  RESTAURANT: 'restaurant',
  CAR_RENTAL: 'car_rental',
  CLIENT: 'client',
  ADMIN: 'admin'
};

/**
 * Get the localStorage key for a service token
 * @param {string} service - Service identifier
 * @returns {string} localStorage key
 */
const getTokenKey = (service) => {
  return `${service}_token`;
};

/**
 * Store token for a specific service
 * @param {string} service - Service identifier
 * @param {string} token - JWT token
 */
export const setToken = (service, token) => {
  if (!service || !token) {
    console.warn('[tokenManager] setToken called with invalid service or token');
    return;
  }
  const key = getTokenKey(service);
  localStorage.setItem(key, token);
  console.log(`[tokenManager] Token stored for service: ${service}`);
};

/**
 * Get token for a specific service
 * @param {string} service - Service identifier
 * @returns {string|null} JWT token or null
 */
export const getToken = (service) => {
  if (!service) {
    console.warn('[tokenManager] getToken called without service');
    return null;
  }
  const key = getTokenKey(service);
  return localStorage.getItem(key);
};

/**
 * Remove token for a specific service
 * @param {string} service - Service identifier
 */
export const removeToken = (service) => {
  if (!service) {
    console.warn('[tokenManager] removeToken called without service');
    return;
  }
  const key = getTokenKey(service);
  localStorage.removeItem(key);
  console.log(`[tokenManager] Token removed for service: ${service}`);
};

/**
 * Detect service from URL path
 * @param {string} url - URL path (e.g., '/restaurant/dashboard' or '/tours/auth/login')
 * @returns {string|null} Service identifier or null
 */
export const detectServiceFromUrl = (url) => {
  if (!url) return null;

  const urlLower = url.toLowerCase();

  // Check for service-specific paths
  if (urlLower.includes('/restaurant/') || urlLower.includes('/eating-out/')) {
    return SERVICES.RESTAURANT;
  }
  
  if (urlLower.includes('/tours/') || urlLower.includes('/tour/')) {
    return SERVICES.TOURS;
  }
  
  if (urlLower.includes('/stays/') || urlLower.includes('/stay/')) {
    return SERVICES.STAYS;
  }
  
  if (urlLower.includes('/car-rental/') || urlLower.includes('/car_rental/')) {
    return SERVICES.CAR_RENTAL;
  }
  
  if (urlLower.includes('/client/')) {
    return SERVICES.CLIENT;
  }
  
  if (urlLower.includes('/admin/')) {
    return SERVICES.ADMIN;
  }

  return null;
};

/**
 * Get token for a request based on URL
 * Detects the service from the URL and returns the appropriate token
 * @param {string} url - Request URL path
 * @returns {string|null} JWT token or null
 */
export const getTokenForRequest = (url) => {
  // First try to detect service from URL
  const service = detectServiceFromUrl(url);
  
  if (service) {
    const token = getToken(service);
    if (token) {
      return token;
    }
  }

  // Fallback: Try to detect from current window location
  if (typeof window !== 'undefined') {
    const currentService = detectServiceFromUrl(window.location.pathname);
    if (currentService) {
      const token = getToken(currentService);
      if (token) {
        return token;
      }
    }
  }

  // Legacy fallback: Check for old token keys (backwards compatibility)
  const legacyToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
  if (legacyToken) {
    console.warn('[tokenManager] Using legacy token. Consider migrating to service-specific tokens.');
    return legacyToken;
  }

  return null;
};

/**
 * Clear all service tokens (useful for logout from all services)
 */
export const clearAllTokens = () => {
  Object.values(SERVICES).forEach(service => {
    removeToken(service);
  });
  // Also clear legacy tokens
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
};
