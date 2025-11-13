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
  }
};

export default carRentalSetupService;
