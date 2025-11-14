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
  const publicEndpoints = [
    'auth/login',
    'auth/signup',
    'auth/refresh-token',
    'tours/auth/login', // Tours login endpoint
    'admin/auth/login', // Admin login endpoint
    'categories',
    'subcategories'
  ];
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    config.url && config.url.includes(endpoint)
  );
  
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
      // Only clear token for non-login endpoints (token expired on protected routes)
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
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

