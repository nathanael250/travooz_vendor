import apiClient from './apiClient';

// Tour Packages API
export const tourPackagesAPI = {
  getAll: async (status) => {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get(`/tours/packages${query}`);
    return res.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/tours/packages/${id}`);
    return res.data;
  },

  create: async (tourPackage) => {
    const res = await apiClient.post('/tours/packages', tourPackage);
    return res.data;
  },

  update: async (id, tourPackage) => {
    const res = await apiClient.put(`/tours/packages/${id}`, tourPackage);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/tours/packages/${id}`);
    return res.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (status, startDate, endDate) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/tours/bookings${query}`);
    // Handle backend response structure: { success: true, data: [...] }
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    // Fallback for direct array or other structures
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/tours/bookings/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/tours/bookings/${id}/status`, { status });
    return res.data;
  },
};

// Images API (for tour packages)
export const tourImagesAPI = {
  getByPackage: async (packageId) => {
    const res = await apiClient.get(`/tours/packages/${packageId}/images`);
    return res.data || [];
  },

  add: async (packageId, images) => {
    const res = await apiClient.post(`/tours/packages/${packageId}/images`, { images });
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/tours/images/${id}`);
    return res.data;
  },
};

