import apiClient from './apiClient';

// Create restaurant API client
const restaurantApiClient = apiClient;

// Restaurant Auth Service
export const restaurantAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await restaurantApiClient.post('/restaurant/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('restaurant_token', response.data.data.token);
        localStorage.setItem('restaurant_user', JSON.stringify(response.data.data.user));
        if (response.data.data.restaurantId) {
          localStorage.setItem('restaurant_id', response.data.data.restaurantId);
        }
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await restaurantApiClient.get('/restaurant/auth/profile');
      if (response.data.success) {
        localStorage.setItem('restaurant_user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get profile');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await restaurantApiClient.post('/restaurant/auth/forgot-password', {
        email,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to request password reset');
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, password) {
    try {
      const response = await restaurantApiClient.post('/restaurant/auth/reset-password', {
        token,
        password,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('restaurant_token');
    localStorage.removeItem('restaurant_user');
    localStorage.removeItem('restaurant_id');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('restaurant_token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('restaurant_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default restaurantAuthService;


