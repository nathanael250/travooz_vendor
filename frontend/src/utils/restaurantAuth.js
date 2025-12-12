/**
 * Utility functions for restaurant authentication and session management
 */

/**
 * Handle restaurant not found - logout user and redirect to login
 * This is called when a restaurant is deleted but session still exists
 */
export const handleRestaurantNotFound = () => {
  console.log('🚪 Restaurant not found - logging out and redirecting to login');
  
  // Clear all restaurant and auth related localStorage items
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('restaurant_id');
  localStorage.removeItem('restaurant_setup_progress');
  localStorage.removeItem('restaurant_setup_in_progress');
  
  // Clear any other restaurant-related data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('restaurant_') || key.startsWith('menu_') || key.startsWith('order_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Stop any ongoing navigation or async operations
  // Use replace instead of href to prevent back button issues
  // Use window.location.replace to prevent back navigation
  // Do it immediately, no timeout
  try {
    // Prevent any React Router navigation
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/restaurant/login');
    }
    // Force full page reload to login
    window.location.replace('/restaurant/login');
  } catch (e) {
    // Fallback if replace fails
    console.error('Error during redirect:', e);
    window.location.href = '/restaurant/login';
  }
};

/**
 * Check if error indicates restaurant not found or access denied
 */
export const isRestaurantNotFoundError = (error) => {
  // Check for 404 status
  if (error?.response?.status === 404) {
    const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.message || '';
    const lowerMessage = errorMessage.toLowerCase();
    
    // Check if it's a restaurant-related 404
    if (lowerMessage.includes('restaurant') || 
        lowerMessage.includes('access denied') ||
        error?.config?.url?.includes('/restaurant') ||
        error?.config?.url?.includes('/eating-out')) {
      return true;
    }
  }
  
  // Check for 403 status (access denied)
  if (error?.response?.status === 403) {
    const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.message || '';
    const lowerMessage = errorMessage.toLowerCase();
    
    // Check if it's a restaurant-related 403
    if (lowerMessage.includes('restaurant') || 
        lowerMessage.includes('access denied') ||
        error?.config?.url?.includes('/restaurant') ||
        error?.config?.url?.includes('/eating-out')) {
      return true;
    }
  }
  
  // Check for "restaurant not found", "access denied", or "access token is required" message
  const errorMessage = error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       error?.message || '';
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('restaurant not found') || 
      lowerMessage.includes('no restaurant found') ||
      lowerMessage.includes('access token is required') ||
      lowerMessage.includes('token is required') ||
      lowerMessage.includes('authentication required') ||
      (lowerMessage.includes('access denied') && 
       (error?.config?.url?.includes('/restaurant') || 
        error?.config?.url?.includes('/eating-out')))) {
    return true;
  }
  
  return false;
};

