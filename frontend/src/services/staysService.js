import apiClient from './apiClient';

// Create a dedicated stays API client (matching old system pattern)
const staysApiClient = apiClient;

// Add token to requests if available
staysApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stays_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
staysApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're NOT on a login page and NOT on other service pages
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath.includes('/auth/');
      const isTourPage = currentPath.includes('/tours/');
      const isRestaurantPage = currentPath.includes('/restaurant/');
      const isCarRentalPage = currentPath.includes('/car-rental/');
      
      // CRITICAL: Only handle stays-related 401s, ignore 401s from other services
      // Check if this is actually a stays API call
      const isStaysApiCall = error.config?.url?.includes('/stays/') || 
                            error.config?.baseURL?.includes('/stays/');
      
      // Don't redirect if we're on login pages or other service pages
      // This prevents stays interceptor from interfering with other services
      // Also only redirect if this is actually a stays API call
      if (isStaysApiCall && !isLoginPage && !isTourPage && !isRestaurantPage && !isCarRentalPage) {
        localStorage.removeItem('stays_token');
        localStorage.removeItem('stays_user');
        window.location.href = '/stays/login';
      } else {
        // Just clear stays tokens, don't redirect
        // This is not a stays API call or we're on another service's page
        if (isStaysApiCall) {
          localStorage.removeItem('stays_token');
          localStorage.removeItem('stays_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const staysAuthService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await staysApiClient.post('/stays/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('stays_token', response.data.data.token);
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
      const response = await staysApiClient.get('/stays/auth/profile');
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
      const response = await staysApiClient.post('/stays/auth/forgot-password', {
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
      const response = await staysApiClient.post('/stays/auth/reset-password', {
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
    localStorage.removeItem('stays_token');
    localStorage.removeItem('stays_user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('stays_token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('stays_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Property API functions
export const submitPropertyListing = async (data) => {
  try {
    const response = await staysApiClient.post('/stays/properties', data);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPropertyListing = async (propertyId) => {
  try {
    const response = await staysApiClient.get(`/stays/properties/${propertyId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPropertyWithAllData = async (propertyId) => {
  try {
    const response = await staysApiClient.get(`/stays/properties/${propertyId}/complete`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePropertyListing = async (propertyId, data) => {
  try {
    const response = await staysApiClient.put(`/stays/properties/${propertyId}`, data);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyPropertyListings = async (userId = null) => {
  try {
    const url = userId 
      ? `/stays/properties/my?user_id=${userId}`
      : '/stays/properties/my';
    const response = await staysApiClient.get(url);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPropertyImageLibrary = async (propertyId) => {
  try {
    const response = await staysApiClient.get(`/stays/properties/${propertyId}/images`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadPropertyImages = async (propertyId, formData) => {
  try {
    const response = await staysApiClient.post(
      `/stays/properties/${propertyId}/images/property`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePropertyImage = async (imageId) => {
  try {
    const response = await staysApiClient.delete(`/stays/properties/images/${imageId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePropertyImage = async (imageId, payload) => {
  try {
    const response = await staysApiClient.put(`/stays/properties/images/${imageId}`, payload);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadRoomImages = async (roomId, formData) => {
  try {
    const response = await staysApiClient.post(
      `/stays/rooms/${roomId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRoomImage = async (imageId) => {
  try {
    const response = await staysApiClient.delete(`/stays/rooms/images/${imageId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRoomImage = async (imageId, payload) => {
  try {
    const response = await staysApiClient.put(`/stays/rooms/images/${imageId}`, payload);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get properties by userId (no auth required - for setup flow)
export const getPropertiesByUserId = async (userId) => {
  try {
    const response = await staysApiClient.get(`/stays/properties/by-user/${userId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Email verification API functions
export const sendEmailVerificationCode = async (userId, email, userName) => {
  try {
    const response = await staysApiClient.post('/stays/email-verification/send', {
      userId,
      email,
      userName,
    });
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyEmailCode = async (userId, email, code) => {
  try {
    const response = await staysApiClient.post('/stays/email-verification/verify', {
      userId,
      email,
      code,
    });
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Property Setup API functions
export const staysSetupService = {
  /**
   * Step 2: Save Contract Acceptance
   */
  async saveContract(propertyId) {
    try {
      const response = await staysApiClient.post('/stays/setup/contract', {
        propertyId,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 3: Save Policies and Settings
   */
  async savePolicies(propertyId, policiesData) {
    try {
      const response = await staysApiClient.post('/stays/setup/policies', {
        propertyId,
        ...policiesData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 4: Save Property Amenities
   */
  async saveAmenities(propertyId, amenitiesData) {
    try {
      const response = await staysApiClient.post('/stays/setup/amenities', {
        propertyId,
        ...amenitiesData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 5-6: Save Room (with beds, amenities, rate plans)
   */
  async saveRoom(propertyId, roomData) {
    try {
      const response = await staysApiClient.post('/stays/setup/room', {
        propertyId,
        ...roomData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 7: Save Promotions
   */
  async savePromotions(propertyId, promotions) {
    try {
      const response = await staysApiClient.post('/stays/setup/promotions', {
        propertyId,
        promotions,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 8: Save Images
   */
  async saveImages(propertyId, imagesData) {
    try {
      const response = await staysApiClient.post('/stays/setup/images', {
        propertyId,
        ...imagesData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 9: Save Tax Details
   */
  async saveTaxDetails(propertyId, taxData) {
    try {
      const response = await staysApiClient.post('/stays/setup/taxes', {
        propertyId,
        ...taxData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 10: Save Connectivity Settings
   */
  async saveConnectivity(propertyId, connectivityData) {
    try {
      const response = await staysApiClient.post('/stays/setup/connectivity', {
        propertyId,
        ...connectivityData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get Setup Status
   */
  async getSetupStatus(propertyId) {
    try {
      const response = await staysApiClient.get(`/stays/setup/status/${propertyId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit Final Listing
   */
  async submitListing(propertyId) {
    try {
      const response = await staysApiClient.post('/stays/setup/submit', {
        propertyId,
      });
      return response.data.data || response.data;
    } catch (error) {
      // If error response has data, return it (includes incompleteSteps)
      if (error.response?.data) {
        // Throw an error object that includes incompleteSteps
        const errorData = error.response.data;
        const customError = new Error(errorData.message || 'Failed to submit listing');
        customError.incompleteSteps = errorData.incompleteSteps || [];
        customError.success = errorData.success || false;
        throw customError;
      }
      throw error;
    }
  },
};

// Booking and Availability API functions
export const staysBookingService = {
  async getBookings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await staysApiClient.get(`/stays/bookings?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getBookingById(bookingId) {
    try {
      const response = await staysApiClient.get(`/stays/bookings/${bookingId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getRoomAvailability(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await staysApiClient.get(`/stays/availability?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

