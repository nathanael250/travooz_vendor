import apiClient from './apiClient';

const carRentalSetupService = {
  async register(payload) {
    const response = await apiClient.post('/car-rental/register', payload);
    return response.data;
  },

  async saveBusinessDetails(payload) {
    const response = await apiClient.post('/car-rental/business-details', payload);
    return response.data;
  },

  async saveTaxPayment(payload) {
    const response = await apiClient.post('/car-rental/tax-payment', payload);
    return response.data;
  },

  async createCarRental(payload) {
    const response = await apiClient.post('/car-rental/cars', payload);
    return response.data;
  },

  async submitAgreement(payload) {
    const response = await apiClient.post('/car-rental/agreement', payload);
    return response.data;
  },

  async getSubmissionStatus(carRentalBusinessId) {
    const response = await apiClient.get(`/car-rental/status/${carRentalBusinessId}`);
    return response.data;
  },

  /**
   * Get current onboarding progress
   */
  async getProgress() {
    try {
      const response = await apiClient.get('/car-rental/onboarding/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save or update onboarding progress
   */
  async saveProgress(stepKey, businessId = null, isComplete = false) {
    try {
      const response = await apiClient.post('/car-rental/onboarding/progress', {
        stepKey,
        businessId,
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
  async completeStep(stepKey, businessId = null) {
    try {
      const response = await apiClient.post('/car-rental/onboarding/complete-step', {
        stepKey,
        businessId
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
      const response = await apiClient.get('/car-rental/onboarding/next-step');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get setup progress by business ID
   */
  async getSetupProgress(businessId) {
    try {
      const response = await apiClient.get(`/car-rental/setup/progress/${businessId}`);
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
      const response = await apiClient.get('/car-rental/setup/progress');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save step data
   */
  async saveStepData(businessId, stepNumber, stepData) {
    try {
      const response = await apiClient.post('/car-rental/setup/save-step', {
        businessId,
        stepNumber,
        stepData
      });
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
      const response = await apiClient.post('/car-rental/email-verification/send', {
        userId,
        email,
        userName
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify email code
   */
  async verifyEmailCode(userId, email, code, carRentalBusinessId = null) {
    try {
      const response = await apiClient.post('/car-rental/email-verification/verify', {
        userId,
        email,
        code,
        carRentalBusinessId
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default carRentalSetupService;
