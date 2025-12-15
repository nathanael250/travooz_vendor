import apiClient from './apiClient';

// Create a restaurant (EatingOut)
// If images are provided as File[], sends multipart/form-data; otherwise JSON
export const getMyRestaurants = async () => {
  const res = await apiClient.get('/eating-out/vendor/my');
  return res.data?.data || res.data;
};

export const deleteRestaurant = async (id) => {
  const res = await apiClient.delete(`eating-out/${id}/permanent`);
  return res.data?.data;
};

export const getRestaurant = async (id) => {
  const res = await apiClient.get(`eating-out/${id}`);
  return res.data?.data; // includes images array if present
};

// Capacity: get current settings
export const getRestaurantCapacity = async (id) => {
  try {
    const res = await apiClient.get(`eating-out/${id}/capacity`);
    return res.data?.data;
  } catch (error) {
    // If no capacity settings exist, return default
    if (error.response?.status === 404) {
      return { max_capacity: 50 };
    }
    throw error;
  }
};

// Capacity: vendor updates settings
export const updateRestaurantCapacity = async (id, payload) => {
  const res = await apiClient.put(`eating-out/${id}/capacity`, payload);
  return res.data?.data;
};

// Capacity: public availability check
export const checkRestaurantAvailability = async (id, { booking_date, duration_minutes, guests }) => {
  const params = new URLSearchParams();
  if (booking_date) params.set('booking_date', booking_date);
  if (duration_minutes != null) params.set('duration_minutes', duration_minutes);
  if (guests != null) params.set('guests', guests);
  const res = await apiClient.get(`eating-out/${id}/availability?${params.toString()}`);
  return res.data?.data; // { available, reservation_start, reservation_end, duration_minutes } or { available:false, reason }
};

export const deleteRestaurantImage = async (restaurantId, imageId) => {
  const res = await apiClient.delete(`eating-out/${restaurantId}/images/${imageId}`);
  return res.data; // { success, message, images }
};

export const setRestaurantMainImage = async (restaurantId, imageId) => {
  const res = await apiClient.put(`eating-out/${restaurantId}/images/${imageId}/main`);
  return res.data; // { success, message, images }
};

export const updateRestaurant = async (id, payload) => {
  const { new_images, ...data } = payload || {};
  const hasFiles = Array.isArray(new_images) && new_images.length > 0;

  if (hasFiles) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    new_images.forEach((file) => formData.append('images', file));

    const res = await apiClient.put(`eating-out/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  }

  const res = await apiClient.put(`eating-out/${id}`, data);
  return res.data?.data;
};

export const createRestaurant = async (payload) => {
  const { images, ...data } = payload || {};

  // Determine if we need to send as multipart
  const hasFiles = Array.isArray(images) && images.length > 0;

  if (hasFiles) {
    const formData = new FormData();

    // Append fields: JSON-stringify arrays/objects for backend to parse
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    // Append images[]
    images.forEach((file) => formData.append('images', file));

    const res = await apiClient.post('eating-out', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data; // created restaurant
  }

  const res = await apiClient.post('eating-out', data);
  return res.data?.data; // created restaurant
};

// Restaurant Setup API functions
export const restaurantSetupService = {
  /**
   * Step 1: Create initial restaurant listing (from ListYourRestaurantStep2)
   */
  async createRestaurantListing(listingData) {
    try {
      const response = await apiClient.post('/eating-out/setup/listing', listingData);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 1 (Setup): Save Business Details
   */
  async saveBusinessDetails(restaurantId, businessData) {
    try {
      const response = await apiClient.post('/eating-out/setup/business-details', {
        restaurantId,
        ...businessData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 2 (Setup): Save Media (logo and gallery images)
   */
  async saveMedia(restaurantId, mediaData, onUploadProgress) {
    try {
      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      
      // Validate file sizes before upload (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (mediaData.logo) {
        if (mediaData.logo.size > MAX_FILE_SIZE) {
          throw new Error('Logo image is too large. Maximum size is 10MB. Please compress the image and try again.');
        }
        formData.append('logo', mediaData.logo);
      }
      
      if (mediaData.galleryImages && Array.isArray(mediaData.galleryImages)) {
        for (const file of mediaData.galleryImages) {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Gallery image "${file.name}" is too large. Maximum size is 10MB. Please compress the image and try again.`);
          }
          formData.append('galleryImages', file);
        }
      }

      const response = await apiClient.post('/eating-out/setup/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes timeout for large file uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        } : undefined,
      });
      return response.data.data || response.data;
    } catch (error) {
      // Handle network errors specifically
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Upload timed out. Please check your internet connection and try again. If the problem persists, try uploading smaller images.');
      }
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  /**
   * Step 3 (Setup): Save Payments & Pricing
   */
  async savePaymentsPricing(restaurantId, pricingData) {
    try {
      const response = await apiClient.post('/eating-out/setup/payments-pricing', {
        restaurantId,
        ...pricingData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 4 (Setup): Save Restaurant Capacity
   */
  async saveCapacity(restaurantId, capacityData) {
    try {
      const response = await apiClient.post('/eating-out/setup/capacity', {
        restaurantId,
        ...capacityData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  /**
   * Step 4.5 (Setup): Save operating schedule (weekly + exceptions)
   */
  async saveOperatingSchedule(restaurantId, { operatingSchedule = {}, exceptions = [] } = {}) {
    try {
      // Convert operatingSchedule object (monday, tuesday..) to array with day_of_week numbers
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const scheduleArray = Object.entries(operatingSchedule || {}).map(([dayName, hours]) => ({
        day_of_week: dayMap[dayName.toLowerCase()],
        opens: hours.open || null,
        closes: hours.close || null,
        is_closed: !!hours.closed,
      }));

      const response = await apiClient.post('/eating-out/setup/operating-schedule', {
        restaurantId,
        operatingSchedule: scheduleArray,
        exceptions: Array.isArray(exceptions) ? exceptions : []
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Error saving operating schedule:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Step 5 (Setup): Save Tax & Legal Information
   */
  async saveTaxLegal(restaurantId, taxLegalData) {
    try {
      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      
      // Add text fields
      Object.entries(taxLegalData).forEach(([key, value]) => {
        if (key === 'businessLicenseFile' || key === 'taxRegistrationCertificateFile') {
          if (value) {
            formData.append(key, value);
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await apiClient.post('/eating-out/setup/tax-legal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 5 (Setup): Save Menu Setup (categories, items, addons, customizations)
   */
  async saveMenuSetup(restaurantId, menuData) {
    try {
      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      formData.append('categories', JSON.stringify(menuData.categories || []));
      formData.append('menuItems', JSON.stringify(menuData.menuItems || []));
      
      // Handle menu item images if any
      if (menuData.menuItemImages) {
        Object.entries(menuData.menuItemImages).forEach(([itemId, file]) => {
          if (file) {
            formData.append(`menuItemImage_${itemId}`, file);
          }
        });
      }

      const response = await apiClient.post('/eating-out/setup/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 6: Get Setup Status
   */
  async getSetupStatus(restaurantId) {
    try {
      const response = await apiClient.get(`/eating-out/setup/status/${restaurantId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Complete Setup (without agreement step)
   */
  async completeSetup(restaurantId) {
    try {
      const response = await apiClient.post('/eating-out/setup/complete', {
        restaurantId,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Step 7: Save Agreement Acceptance
   */
  async saveAgreement(restaurantId, agreementData) {
    try {
      const response = await apiClient.post('/eating-out/setup/agreement', {
        restaurantId,
        ...agreementData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get setup progress for a restaurant
   */
  async getSetupProgress(restaurantId) {
    try {
      const response = await apiClient.get(`/eating-out/setup/progress/${restaurantId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get setup progress by user ID (for login check)
   */
  async getSetupProgressByUser() {
    try {
      const response = await apiClient.get('/eating-out/setup/progress');
      return response.data.data || null;
    } catch (error) {
      // If no progress found, return null (not an error)
      if (error.response?.status === 404) {
        return null;
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Save step data
   */
  async saveStepData(restaurantId, stepNumber, stepData) {
    try {
      const response = await apiClient.post('/eating-out/setup/save-step', {
        restaurantId,
        stepNumber,
        stepData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get restaurant by ID (includes images)
   */
  async getRestaurant(restaurantId) {
    try {
      // Use the restaurants route for fetching a restaurant by id (requires authentication)
      const response = await apiClient.get(`/restaurants/${restaurantId}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Send email verification code
   */
  async sendEmailVerificationCode(userId, email, userName) {
    try {
      const response = await apiClient.post('/eating-out/setup/email-verification/send', {
        userId,
        email,
        userName
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email verification code:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Verify email code
   */
  async verifyEmailCode(userId, email, verificationCode, restaurantId) {
    try {
      const response = await apiClient.post('/eating-out/setup/email-verification/verify', {
        userId,
        email,
        code: verificationCode, // Backend expects 'code' not 'verificationCode'
        restaurantId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying email code:', error);
      throw error.response?.data || error;
    }
  },
};

// Restaurant Onboarding Progress Tracking API functions
export const restaurantOnboardingProgressService = {
  /**
   * Get current onboarding progress
   */
  async getProgress() {
    try {
      const response = await apiClient.get('/eating-out/onboarding/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save or update onboarding progress
   */
  async saveProgress(stepKey, restaurantId = null, isComplete = false) {
    try {
      const response = await apiClient.post('/eating-out/onboarding/progress', {
        stepKey,
        restaurantId,
        isComplete
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mark a step as complete and move to next step
   */
  async completeStep(stepKey, restaurantId = null) {
    try {
      const response = await apiClient.post('/eating-out/onboarding/complete-step', {
        stepKey,
        restaurantId
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get the next step the user should be on
   */
  async getNextStep() {
    try {
      const response = await apiClient.get('/eating-out/onboarding/next-step');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset progress (for testing)
   */
  async resetProgress() {
    try {
      const response = await apiClient.delete('/eating-out/onboarding/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};