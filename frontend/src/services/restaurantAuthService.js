import apiClient from './apiClient';
import { setToken, getToken, removeToken, SERVICES } from '../utils/tokenManager';

const restaurantAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/eating-out/setup/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const data = response.data.data;
        // Store token using tokenManager
        if (data.token) {
          setToken(SERVICES.RESTAURANT, data.token);
        }
        // Also store user data in localStorage for backward compatibility
        if (data.user) {
          localStorage.setItem('restaurant_user', JSON.stringify(data.user));
        }
        return data;
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
      const response = await apiClient.get('/eating-out/setup/auth/profile');
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
      const response = await apiClient.post('/eating-out/setup/auth/forgot-password', {
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
      const response = await apiClient.post('/eating-out/setup/auth/reset-password', {
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
    removeToken(SERVICES.RESTAURANT);
    localStorage.removeItem('restaurant_user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!getToken(SERVICES.RESTAURANT);
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('restaurant_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get authentication token
   */
  getToken() {
    return getToken(SERVICES.RESTAURANT);
  },
};

export default restaurantAuthService;










