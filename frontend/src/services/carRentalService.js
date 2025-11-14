import apiClient from './apiClient';

const carRentalService = {
  // Cars
  async getCars(businessId) {
    const response = await apiClient.get(`/car-rental/business/${businessId}/cars`);
    return response.data;
  },

  async getCar(carId) {
    const response = await apiClient.get(`/car-rental/cars/${carId}`);
    return response.data;
  },

  async createCar(carData, imageFiles = []) {
    const formData = new FormData();
    
    // Add all car data fields to FormData
    Object.keys(carData).forEach(key => {
      if (key !== 'images' && carData[key] !== null && carData[key] !== undefined) {
        if (typeof carData[key] === 'object' && !Array.isArray(carData[key])) {
          formData.append(key, JSON.stringify(carData[key]));
        } else if (Array.isArray(carData[key]) && typeof carData[key][0] !== 'string') {
          formData.append(key, JSON.stringify(carData[key]));
        } else {
          formData.append(key, carData[key]);
        }
      }
    });
    
    // Add image files
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }
    
    const response = await apiClient.post('/car-rental/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCar(carId, carData) {
    const response = await apiClient.put(`/car-rental/cars/${carId}`, carData);
    return response.data;
  },

  async deleteCar(carId) {
    const response = await apiClient.delete(`/car-rental/cars/${carId}`);
    return response.data;
  },

  // Drivers
  async getDrivers(businessId) {
    const response = await apiClient.get(`/car-rental/business/${businessId}/drivers`);
    return response.data;
  },

  async getDriver(driverId) {
    const response = await apiClient.get(`/car-rental/drivers/${driverId}`);
    return response.data;
  },

  async createDriver(driverData) {
    const response = await apiClient.post('/car-rental/drivers', driverData);
    return response.data;
  },

  async updateDriver(driverId, driverData) {
    const response = await apiClient.put(`/car-rental/drivers/${driverId}`, driverData);
    return response.data;
  },

  async deleteDriver(driverId) {
    const response = await apiClient.delete(`/car-rental/drivers/${driverId}`);
    return response.data;
  },

  // Bookings
  async getBookings(businessId, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/car-rental/business/${businessId}/bookings?${params}`);
    return response.data;
  },

  async getBooking(bookingId) {
    const response = await apiClient.get(`/car-rental/bookings/${bookingId}`);
    return response.data;
  },

  async createBooking(bookingData) {
    const response = await apiClient.post('/car-rental/bookings', bookingData);
    return response.data;
  },

  async updateBooking(bookingId, bookingData) {
    const response = await apiClient.put(`/car-rental/bookings/${bookingId}`, bookingData);
    return response.data;
  },

  async deleteBooking(bookingId) {
    const response = await apiClient.delete(`/car-rental/bookings/${bookingId}`);
    return response.data;
  },

  async getBookingStats(vendorId) {
    const response = await apiClient.get(`/car-rental/bookings/stats/${vendorId}`);
    return response.data;
  }
};

export default carRentalService;

