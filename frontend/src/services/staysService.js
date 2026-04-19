import apiClient from './apiClient';
import { setToken, getToken, removeToken, SERVICES } from '../utils/tokenManager';

/**
 * Stays Authentication Service
 */
export const staysAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/stays/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token using tokenManager
        const token = response.data.data.token;
        setToken(SERVICES.STAYS, token);
        
        // Store user data
        localStorage.setItem('stays_user', JSON.stringify(response.data.data.user));
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
      const response = await apiClient.get('/stays/auth/profile');
      if (response.data.success) {
        localStorage.setItem('stays_user', JSON.stringify(response.data.data));
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
      const response = await apiClient.post('/stays/auth/forgot-password', {
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
      const response = await apiClient.post('/stays/auth/reset-password', {
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
    removeToken(SERVICES.STAYS);
    localStorage.removeItem('stays_user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!getToken(SERVICES.STAYS);
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('stays_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get authentication token
   */
  getToken() {
    return getToken(SERVICES.STAYS);
  },
};

/**
 * Send email verification code
 */
export const sendEmailVerificationCode = async (userId, email, userName) => {
  try {
    const response = await apiClient.post('/stays/email-verification/send', {
      userId,
      email,
      userName
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error sending email verification code:', error);
    throw error.response?.data || error;
  }
};

/**
 * Verify email code
 */
export const verifyEmailCode = async (userId, email, code) => {
  try {
    const response = await apiClient.post('/stays/email-verification/verify', {
      userId,
      email,
      code
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error verifying email code:', error);
    throw error.response?.data || error;
  }
};

/**
 * Stays Onboarding Progress Tracking Service
 */
export const staysOnboardingProgressService = {
  async getProgress() {
    try {
      const response = await apiClient.get('/stays/onboarding/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async saveProgress(stepKey, propertyId = null, isComplete = false) {
    try {
      const response = await apiClient.post('/stays/onboarding/progress', {
        stepKey,
        propertyId,
        isComplete
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async completeStep(stepKey, propertyId = null) {
    try {
      const response = await apiClient.post('/stays/onboarding/complete-step', {
        stepKey,
        propertyId
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getNextStep() {
    try {
      const response = await apiClient.get('/stays/onboarding/next-step');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async resetProgress() {
    try {
      const response = await apiClient.delete('/stays/onboarding/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

/**
 * Stays Setup Service - Property setup and configuration
 */
export const staysSetupService = {
  /**
   * Save contract acceptance
   */
  async saveContract(propertyId) {
    try {
      const response = await apiClient.post('/stays/setup/contract', {
        propertyId
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save policies
   */
  async savePolicies(propertyId, policiesData) {
    try {
      const response = await apiClient.post('/stays/setup/policies', {
        propertyId,
        ...policiesData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get policies
   */
  async getPolicies(propertyId) {
    try {
      const response = await apiClient.get(`/stays/setup/policies/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save amenities
   */
  async saveAmenities(propertyId, amenitiesData) {
    try {
      const response = await apiClient.post('/stays/setup/amenities', {
        propertyId,
        ...amenitiesData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get amenities
   */
  async getAmenities(propertyId) {
    try {
      const response = await apiClient.get(`/stays/setup/amenities/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save room
   */
  async saveRoom(propertyId, roomData) {
    try {
      const response = await apiClient.post('/stays/setup/room', {
        propertyId,
        ...roomData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete room
   */
  async deleteRoom(propertyId, roomId) {
    try {
      const response = await apiClient.delete(`/stays/setup/room/${roomId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save promotions
   */
  async savePromotions(propertyId, promotionsData) {
    try {
      const response = await apiClient.post('/stays/setup/promotions', {
        propertyId,
        ...promotionsData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save tax details
   */
  async saveTaxDetails(propertyId, taxData) {
    try {
      const response = await apiClient.post('/stays/setup/taxes', {
        propertyId,
        ...taxData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get tax details
   */
  async getTaxDetails(propertyId) {
    try {
      const response = await apiClient.get(`/stays/setup/taxes/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save connectivity settings
   */
  async saveConnectivity(propertyId, connectivityData) {
    try {
      const response = await apiClient.post('/stays/setup/connectivity', {
        propertyId,
        ...connectivityData
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get connectivity settings
   */
  async getConnectivity(propertyId) {
    try {
      const response = await apiClient.get(`/stays/setup/connectivity/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get setup status
   */
  async getSetupStatus(propertyId) {
    try {
      const response = await apiClient.get(`/stays/setup/status/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit listing for review
   */
  async submitListing(propertyId) {
    try {
      const response = await apiClient.post('/stays/setup/submit', {
        propertyId
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

/**
 * Stays Booking Service
 */
export const staysBookingService = {
  /**
   * Get bookings with optional filters
   */
  async getBookings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = `/stays/bookings${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get room availability
   */
  async getRoomAvailability(startDate, endDate) {
    try {
      const response = await apiClient.get('/stays/availability', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

/**
 * Get my property listings
 */
export const getMyPropertyListings = async () => {
  try {
    const response = await apiClient.get('/stays/properties/my');
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get property listing by ID
 */
export const getPropertyListing = async (propertyId) => {
  try {
    const response = await apiClient.get(`/stays/properties/${propertyId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get properties by user ID
 */
export const getPropertiesByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/stays/properties/by-user/${userId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get property with all data (complete)
 */
export const getPropertyWithAllData = async (propertyId) => {
  try {
    const response = await apiClient.get(`/stays/properties/${propertyId}/complete`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get property rooms
 */
export const getPropertyRooms = async (propertyId) => {
  try {
    const response = await apiClient.get(`/stays/properties/${propertyId}/rooms`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update property listing
 */
export const updatePropertyListing = async (propertyId, propertyData) => {
  try {
    const response = await apiClient.put(`/stays/properties/${propertyId}`, propertyData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get property image library
 */
export const getPropertyImageLibrary = async (propertyId) => {
  try {
    const response = await apiClient.get(`/stays/properties/${propertyId}/images`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload property images
 */
export const uploadPropertyImages = async (propertyId, formData) => {
  try {
    const response = await apiClient.post(
      `/stays/properties/${propertyId}/images/property`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete property image
 */
export const deletePropertyImage = async (imageId) => {
  try {
    const response = await apiClient.delete(`/stays/properties/images/${imageId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update property image
 */
export const updatePropertyImage = async (imageId, imageData) => {
  try {
    const response = await apiClient.put(`/stays/properties/images/${imageId}`, imageData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create property (used in Step 3 of listing flow)
 */
export const createProperty = async (propertyData) => {
  try {
    const response = await apiClient.post('/stays/properties', propertyData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload room images
 */
export const uploadRoomImages = async (roomId, formData) => {
  try {
    const response = await apiClient.post(
      `/stays/rooms/${roomId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete room image
 */
export const deleteRoomImage = async (imageId) => {
  try {
    const response = await apiClient.delete(`/stays/rooms/images/${imageId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update room image
 */
export const updateRoomImage = async (imageId, imageData) => {
  try {
    const response = await apiClient.put(`/stays/rooms/images/${imageId}`, imageData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
