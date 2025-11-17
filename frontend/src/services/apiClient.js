import axios from 'axios';

// Ensure base URL doesn't have trailing slash to avoid double slashes
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return envURL.endsWith('/') ? envURL.slice(0, -1) : envURL;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
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
    '/subcategories' // Only match exact /subcategories path
  ];
  
  // Check if this is a public endpoint - use exact path matching
  // IMPORTANT: Only match exact paths, not paths that contain the endpoint string
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    if (!config.url) return false;
    const url = config.url;
    
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
  
  // Debug logging for categories endpoint
  if (config.url && config.url.includes('/restaurant/menu/categories')) {
    console.log('Categories endpoint detected:', config.url);
    console.log('Is public endpoint?', isPublicEndpoint);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    console.log('Token available?', !!token);
  }
  
  // Only add token for non-public endpoints
  if (!isPublicEndpoint) {
    // Check all possible token keys to support different apps
    // Admin token takes priority for admin routes
    const isAdminRoute = config.url && config.url.includes('/admin/');
    const token = isAdminRoute 
      ? localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('auth_token')
      : localStorage.getItem('token') || 
        localStorage.getItem('auth_token') || 
        localStorage.getItem('stays_token') ||
        localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      if (config.url && config.url.includes('/restaurant/menu/categories')) {
        console.log('Token added to request header');
      }
    } else {
      if (config.url && config.url.includes('/restaurant/menu/categories')) {
        console.warn('No token found in localStorage for categories request');
      }
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
    
    // Handle 401 - Unauthorized (token expired/invalid)
    // BUT: Don't clear tokens or redirect for login endpoints (they return 401 on invalid credentials)
    const isLoginEndpoint = config?.url?.includes('/auth/login') || 
                           config?.url?.includes('/tours/auth/login') ||
                           config?.url?.includes('/stays/auth/login') ||
                           config?.url?.includes('/admin/auth/login');
    
    if (response && response.status === 401 && !isLoginEndpoint) {
      // Check if we're on a restaurant route - don't clear tokens for restaurant routes
      // Let the RestaurantDashboardLayout handle the redirect
      const currentPath = window.location.pathname;
      const isRestaurantRoute = currentPath.includes('/restaurant/');
      const isStaysRoute = currentPath.includes('/stays/');
      const isTourRoute = currentPath.includes('/tours/');
      const isCarRentalRoute = currentPath.includes('/car-rental/');
      
      // CRITICAL: Don't clear tokens on restaurant routes - let the layout handle auth
      // This prevents the session from being killed when API calls fail
      if (isRestaurantRoute) {
        console.log('401 on restaurant route - preserving tokens, letting layout handle redirect');
        // Don't clear tokens - let RestaurantDashboardLayout handle authentication
        // Don't redirect here - let the component handle it
      } else if (!isStaysRoute && !isTourRoute && !isCarRentalRoute) {
        // Only clear token if we're NOT on a specific service route
        // This prevents clearing tokens when navigating between service dashboards
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
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

