import apiClient from './apiClient';
import { setToken, getToken as getTokenFromManager, removeToken, SERVICES } from '../utils/tokenManager';

const carRentalAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/car-rental/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token using tokenManager
        const token = response.data.data.token;
        setToken(SERVICES.CAR_RENTAL, token);
        
        // Store user data
        localStorage.setItem('car_rental_user', JSON.stringify(response.data.data.user));
        if (response.data.data.carRentalBusinessId) {
          localStorage.setItem('car_rental_business_id', String(response.data.data.carRentalBusinessId));
        }
        if (response.data.data.carRentalBusiness?.business_name) {
          localStorage.setItem('car_rental_business_name', response.data.data.carRentalBusiness.business_name);
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
      const response = await apiClient.get('/car-rental/auth/profile');
      if (response.data.success) {
        localStorage.setItem('car_rental_user', JSON.stringify(response.data.data));
        if (response.data.data.car_rental_business_id) {
          localStorage.setItem('car_rental_business_id', String(response.data.data.car_rental_business_id));
        }
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
      const response = await apiClient.post('/car-rental/auth/forgot-password', {
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
      const response = await apiClient.post('/car-rental/auth/reset-password', {
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
    removeToken(SERVICES.CAR_RENTAL);
    localStorage.removeItem('car_rental_user');
    localStorage.removeItem('car_rental_business_id');
    localStorage.removeItem('car_rental_business_name');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!getTokenFromManager(SERVICES.CAR_RENTAL);
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('car_rental_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get authentication token
   */
  getToken() {
    return getTokenFromManager(SERVICES.CAR_RENTAL);
  },
};

export default carRentalAuthService;









