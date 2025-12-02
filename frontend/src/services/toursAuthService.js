import apiClient from './apiClient';

// Create tours API client
const toursApiClient = apiClient;

// Tours Auth Service
export const toursAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await toursApiClient.post('/tours/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('tours_token', response.data.data.token);
        localStorage.setItem('tours_user', JSON.stringify(response.data.data.user));
        if (response.data.data.tourBusinessId) {
          localStorage.setItem('tour_business_id', response.data.data.tourBusinessId);
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
      const response = await toursApiClient.get('/tours/auth/profile');
      if (response.data.success) {
        localStorage.setItem('tours_user', JSON.stringify(response.data.data));
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
      const response = await toursApiClient.post('/tours/auth/forgot-password', {
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
      const response = await toursApiClient.post('/tours/auth/reset-password', {
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
    localStorage.removeItem('tours_token');
    localStorage.removeItem('tours_user');
    localStorage.removeItem('tour_business_id');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('tours_token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('tours_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default toursAuthService;



