import apiClient from './apiClient';

// Create car rental API client
const carRentalApiClient = apiClient;

// Car Rental Auth Service
export const carRentalAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await carRentalApiClient.post('/car-rental/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('car_rental_token', response.data.data.token);
        localStorage.setItem('car_rental_user', JSON.stringify(response.data.data.user));
        if (response.data.data.carRentalBusinessId) {
          localStorage.setItem('car_rental_business_id', response.data.data.carRentalBusinessId);
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
      const response = await carRentalApiClient.get('/car-rental/auth/profile');
      if (response.data.success) {
        localStorage.setItem('car_rental_user', JSON.stringify(response.data.data));
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
      const response = await carRentalApiClient.post('/car-rental/auth/forgot-password', {
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
      const response = await carRentalApiClient.post('/car-rental/auth/reset-password', {
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
    localStorage.removeItem('car_rental_token');
    localStorage.removeItem('car_rental_user');
    localStorage.removeItem('car_rental_business_id');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('car_rental_token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('car_rental_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default carRentalAuthService;



