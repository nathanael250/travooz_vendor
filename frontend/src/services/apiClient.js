import axios from 'axios';

// Ensure base URL doesn't have trailing slash to avoid double slashes
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return envURL.endsWith('/') ? envURL.slice(0, -1) : envURL;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Default 30 seconds timeout for regular requests
});

// Request interceptor - add authentication token
apiClient.interceptors.request.use((config) => {
  // Public endpoints that don't need authentication
  // Use exact path matching to avoid false positives (e.g., /restaurant/menu/categories matching 'categories')
  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh-token',
    '/tours/auth/login', // Tours login endpoint
    '/admin/auth/login', // Admin login endpoint
    '/categories', // Only match exact /categories path, not /restaurant/menu/categories
    '/subcategories', // Only match exact /subcategories path
    '/client/', // All client-facing endpoints are public
    '/menu-items' // Menu items endpoint (public when used with restaurant_id)
  ];
  
  const isClientAuthRoute = config.url?.startsWith('/client/auth/');
  const isClientAuthProtectedRoute = isClientAuthRoute && 
    !config.url?.includes('/client/auth/register') &&
    !config.url?.includes('/client/auth/login');
  
  // Check if this is a public endpoint - use exact path matching
  // IMPORTANT: Only match exact paths, not paths that contain the endpoint string
  let isPublicEndpoint = publicEndpoints.some(endpoint => {
    if (!config.url) return false;
    const url = config.url;
    
    // Special handling for /client/ prefix - all client endpoints are public
    if (endpoint === '/client/' && url.startsWith('/client/')) {
      return true;
    }
    
    // Special handling for /menu-items - public when used with restaurant_id query param
    if (endpoint === '/menu-items') {
      if (url === '/menu-items' || url.startsWith('/menu-items?')) {
        return true;
      }
      if (url.startsWith('/menu-items/')) {
        // Only public if it's a query-based request, not a specific item ID
        return false; // Specific item IDs require auth
      }
    }
    
    // Exact match
    if (url === endpoint) return true;
    
    // Match with query string: /categories?param=value
    if (url.startsWith(endpoint + '?')) return true;
    
    // Match sub-paths but NOT if it's a restaurant/menu route
    // e.g., /categories/something is public, but /restaurant/menu/categories is NOT
    if (url.startsWith(endpoint + '/')) {
      // If it contains /restaurant/ or /menu/, it's NOT a public endpoint
      if (url.includes('/restaurant/') || url.includes('/menu/')) {
        return false;
      }
      return true;
    }
    
    return false;
  });
  
  if (isClientAuthProtectedRoute) {
    isPublicEndpoint = false;
  }
  
  // Debug logging for categories endpoint
  if (config.url && config.url.includes('/restaurant/menu/categories')) {
    console.log('Categories endpoint detected:', config.url);
    console.log('Is public endpoint?', isPublicEndpoint);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    console.log('Token available?', !!token);
  }
  
  // Only add token for non-public endpoints
  if (!isPublicEndpoint) {
    const isAdminRoute = config.url && config.url.includes('/admin/');
    let token = null;

    if (isClientAuthProtectedRoute) {
      token = localStorage.getItem('client_token');
    } else if (isAdminRoute) {
      token = localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
    } else {
      token = localStorage.getItem('token') || 
        localStorage.getItem('auth_token') || 
        localStorage.getItem('stays_token') ||
        localStorage.getItem('admin_token');
    }

    // Fallback to client token for other protected client endpoints
    if (!token && config.url?.startsWith('/client/')) {
      token = localStorage.getItem('client_token');
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      if (config.url && config.url.includes('/restaurant/menu/categories')) {
        console.log('Token added to request header');
      }
    } else if (config.url && config.url.includes('/restaurant/menu/categories')) {
      console.warn('No token found in localStorage for categories request');
    }
  } else {
    if (config.url && config.url.includes('/restaurant/menu/categories')) {
      console.warn('Categories endpoint was treated as public - this should not happen!');
    }
  }
  
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error || {};
    
    // Check if this is a restaurant-related request
    const isRestaurantRequest = config?.url?.includes('/restaurant') || 
                                config?.url?.includes('/eating-out');
    const currentPath = window.location.pathname;
    const isRestaurantRoute = currentPath.includes('/restaurant/');
    
    // Don't auto-logout during setup flow (steps 1-3, email verification)
    const isSetupFlow = currentPath.includes('/restaurant/list-your-restaurant') ||
                        currentPath.includes('/restaurant/setup/email-verification') ||
                        currentPath.includes('/restaurant/setup/business-details') ||
                        currentPath.includes('/restaurant/setup/media') ||
                        currentPath.includes('/restaurant/setup/payments') ||
                        currentPath.includes('/restaurant/setup/capacity') ||
                        currentPath.includes('/restaurant/setup/tax-legal') ||
                        currentPath.includes('/restaurant/setup/menu') ||
                        currentPath.includes('/restaurant/setup/review') ||
                        currentPath.includes('/restaurant/setup/agreement');
    
    // Handle restaurant not found or access denied errors
    // BUT skip auto-logout during setup flow (let setup pages handle their own errors)
    // NOTE: tighten the conditions so generic 404/403/401 (e.g. order-not-found, transient auth) don't force a logout
    if ((isRestaurantRequest || isRestaurantRoute) && !isSetupFlow) {
      const errorMessage = response?.data?.message || 
                          response?.data?.error || 
                          error?.message || '';
      const lowerMessage = (errorMessage || '').toLowerCase();

      // Decide explicitly whether this error should trigger a logout/redirect
      let shouldLogout = false;

      // 1) Explicit restaurant-not-found: logout only when message clearly indicates the restaurant entity is missing
      if (response?.status === 404) {
        if (lowerMessage.includes('restaurant not found') || lowerMessage.includes('no restaurant found') || config?.url?.includes('/restaurant')) {
          shouldLogout = true;
        } else {
          // If it's a 404 for something else (e.g. order not found), do NOT logout
          shouldLogout = false;
        }
      }

      // 2) Access denied (403): logout only when the message indicates restaurant access problems
      if (!shouldLogout && response?.status === 403) {
        if (lowerMessage.includes('access denied') && (lowerMessage.includes('restaurant') || config?.url?.includes('/restaurant'))) {
          shouldLogout = true;
        }
      }

      // 3) Authentication/token errors: only logout when the message indicates token is missing/required/invalid
      if (!shouldLogout && response?.status === 401) {
        const isTokenError = lowerMessage.includes('access token is required') ||
                             lowerMessage.includes('token is required') ||
                             lowerMessage.includes('authentication required') ||
                             lowerMessage.includes('invalid token') ||
                             lowerMessage.includes('token expired');

        if (isTokenError && (isRestaurantRequest || config?.url?.includes('/restaurant'))) {
          shouldLogout = true;
        }
      }

      if (shouldLogout) {
        console.log('🚪 Restaurant error (explicit conditions) - logging out');
        const { handleRestaurantNotFound } = await import('../utils/restaurantAuth');
        handleRestaurantNotFound();
        return Promise.reject(new Error('Restaurant access denied - redirecting to login'));
      }
    }
    
    // Handle 401 - Unauthorized (token expired/invalid)
    // BUT: Don't clear tokens or redirect for login endpoints (they return 401 on invalid credentials)
    const isLoginEndpoint = config?.url?.includes('/auth/login') || 
                           config?.url?.includes('/tours/auth/login') ||
                           config?.url?.includes('/stays/auth/login') ||
                           config?.url?.includes('/admin/auth/login') ||
                           config?.url?.includes('/client/auth/login');
    
    if (response && response.status === 401 && !isLoginEndpoint) {
      const errorMessage = response?.data?.message || 
                          response?.data?.error || 
                          error?.message || '';
      const lowerMessage = errorMessage.toLowerCase();
      
      // Check if error message indicates token is required/invalid
      const isTokenError = lowerMessage.includes('access token is required') ||
                          lowerMessage.includes('token is required') ||
                          lowerMessage.includes('authentication required') ||
                          lowerMessage.includes('invalid token') ||
                          lowerMessage.includes('token expired');
      
      // If it's a restaurant route and we have a token error, logout immediately
      if (isRestaurantRequest && isTokenError) {
        console.log('🚪 401 with token error on restaurant route - logging out');
        const { handleRestaurantNotFound } = await import('../utils/restaurantAuth');
        handleRestaurantNotFound();
        return Promise.reject(error);
      }
      
      // Check if we're on a restaurant route - don't clear tokens for restaurant routes
      // Let the RestaurantDashboardLayout handle the redirect
      const isStaysRoute = currentPath.includes('/stays/');
      const isTourRoute = currentPath.includes('/tours/');
      const isCarRentalRoute = currentPath.includes('/car-rental/');
      const isClientRoute = currentPath.includes('/client/');
      const isClientRequest = config?.url?.startsWith('/client/');
      
      // For restaurant routes with 401, check if it's a setup page
      // Setup pages should also logout on 401 to prevent getting stuck
      const isSetupPage = currentPath.includes('/restaurant/setup/');
      
      if (isRestaurantRoute && isSetupPage) {
        // On setup pages, 401 means token is invalid - logout immediately
        console.log('🚪 401 on restaurant setup page - logging out');
        const { handleRestaurantNotFound } = await import('../utils/restaurantAuth');
        handleRestaurantNotFound();
        return Promise.reject(error);
      } else if (isRestaurantRoute && !isSetupPage) {
        // On dashboard pages, let layout handle it (might be temporary network issue)
        console.log('401 on restaurant dashboard route - preserving tokens, letting layout handle redirect');
        // Don't clear tokens - let RestaurantDashboardLayout handle authentication
        // Don't redirect here - let the component handle it
      } else if (!isStaysRoute && !isTourRoute && !isCarRentalRoute) {
        // Only clear token if we're NOT on a specific service route
        // This prevents clearing tokens when navigating between service dashboards
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
      }
      
      if (isClientRoute || isClientRequest) {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
      }
      // Don't redirect here - let the component handle it
    }
    
    // Handle 429 - Rate limit
    if (response && response.status === 429) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 2;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delayMs = 1000 * Math.pow(2, config.__retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return apiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

