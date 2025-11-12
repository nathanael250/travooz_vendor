import apiClient from './apiClient';

// Restaurant API
export const restaurantsAPI = {
  getAll: async (status) => {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get(`/restaurants${query}`);
    // Handle both direct array response and wrapped response
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/restaurants/${id}`);
    return res.data;
  },

  create: async (restaurant) => {
    const res = await apiClient.post('/restaurants', restaurant);
    return res.data;
  },

  update: async (id, restaurant) => {
    const res = await apiClient.put(`/restaurants/${id}`, restaurant);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/restaurants/${id}`);
    return res.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (status, startDate, endDate) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/orders${query}`);
    // Handle both direct array response and wrapped response
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/orders/${id}/status`, { status });
    return res.data;
  },
};

// Menu Items API
export const menuItemsAPI = {
  getAll: async (restaurantId, available) => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurant_id', restaurantId);
    if (available !== undefined) params.append('available', String(available));
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/menu-items${query}`);
    // Handle both direct array response and wrapped response
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/menu-items/${id}`);
    return res.data;
  },

  create: async (menuItem) => {
    const res = await apiClient.post('/menu-items', menuItem);
    return res.data;
  },

  update: async (id, menuItem) => {
    const res = await apiClient.put(`/menu-items/${id}`, menuItem);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/menu-items/${id}`);
    return res.data;
  },

  import: async (items) => {
    const res = await apiClient.post('/menu-items/import', { items });
    return res.data;
  },
};

// Images API
export const imagesAPI = {
  getByEntity: async (entityType, entityId) => {
    const res = await apiClient.get(`/images/${entityType}/${entityId}`);
    // Handle both direct array response and wrapped response
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  add: async (entityType, entityId, images) => {
    const res = await apiClient.post('/images', { entityType, entityId, images });
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/images/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/images/${id}`, data);
    return res.data;
  },
};

