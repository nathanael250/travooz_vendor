import apiClient from './apiClient';
import { handleRestaurantNotFound, isRestaurantNotFoundError } from '../utils/restaurantAuth';

// Restaurant API - Each vendor manages one restaurant
export const restaurantsAPI = {
  // Get vendor's restaurant (singular - one restaurant per vendor)
  // Include all statuses (active, pending, etc.) so users can see their restaurant even if pending
  getMyRestaurant: async () => {
    try {
      const res = await apiClient.get(`/restaurants`);
      const restaurants = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const restaurant = restaurants.length > 0 ? restaurants[0] : null;
      
      // If we have a restaurant_id in localStorage but no restaurant found, it was deleted
      const restaurantId = localStorage.getItem('restaurant_id');
      if (restaurantId && !restaurant) {
        console.log('⚠️ Restaurant ID exists in session but restaurant not found - likely deleted');
        handleRestaurantNotFound();
        return null;
      }
      
      // Log restaurant data for debugging
      if (restaurant) {
        console.log('🔍 getMyRestaurant - Restaurant data:', {
          id: restaurant.id,
          name: restaurant.name,
          status: restaurant.status,
          statusType: typeof restaurant.status,
          allKeys: Object.keys(restaurant)
        });
      }
      
      // Return the first (and only) restaurant for the vendor, regardless of status
      return restaurant;
    } catch (error) {
      // Check if restaurant was not found (deleted)
      if (isRestaurantNotFoundError(error)) {
        console.log('⚠️ Restaurant not found (404) - likely deleted');
        handleRestaurantNotFound();
        return null;
      }
      
      console.error('Error fetching restaurant:', error);
      // If the endpoint doesn't exist or fails, try the eating-out endpoint
      try {
        const res = await apiClient.get(`/eating-out/vendor/my`);
        const restaurants = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const restaurant = restaurants.length > 0 ? restaurants[0] : null;
        
        // Check if restaurant was deleted
        const restaurantId = localStorage.getItem('restaurant_id');
        if (restaurantId && !restaurant) {
          console.log('⚠️ Restaurant ID exists in session but restaurant not found (fallback) - likely deleted');
          handleRestaurantNotFound();
          return null;
        }
        
        if (restaurant) {
          console.log('🔍 getMyRestaurant (fallback) - Restaurant data:', {
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
            statusType: typeof restaurant.status
          });
        }
        
        return restaurant;
      } catch (fallbackError) {
        // Check if restaurant was not found in fallback too
        if (isRestaurantNotFoundError(fallbackError)) {
          console.log('⚠️ Restaurant not found in fallback endpoint (404) - likely deleted');
          handleRestaurantNotFound();
          return null;
        }
        
        console.error('Error fetching restaurant from fallback endpoint:', fallbackError);
        return null;
      }
    }
  },

  getAll: async (status) => {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get(`/restaurants${query}`);
    // Handle both direct array response and wrapped response
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/restaurants/${id}`);
      const restaurant = res.data;
      
      // If restaurant not found but we have it in session, it was deleted
      if (!restaurant && localStorage.getItem('restaurant_id') === id) {
        console.log('⚠️ Restaurant ID in session but restaurant not found - likely deleted');
        handleRestaurantNotFound();
        return null;
      }
      
      // Log restaurant data for debugging
      if (restaurant) {
        console.log('🔍 getById - Restaurant data:', {
          id: restaurant.id,
          name: restaurant.name,
          status: restaurant.status,
          statusType: typeof restaurant.status,
          allKeys: Object.keys(restaurant)
        });
      }
      
      return restaurant;
    } catch (error) {
      // Check if restaurant was not found (deleted)
      if (isRestaurantNotFoundError(error)) {
        console.log('⚠️ Restaurant not found by ID (404) - likely deleted');
        handleRestaurantNotFound();
        return null;
      }
      throw error;
    }
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

// Orders API - Updated to use new restaurant orders endpoints
export const ordersAPI = {
  getAll: async (restaurantId, filters = {}) => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurant_id', restaurantId);
    if (filters.status) params.append('status', filters.status);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.order_type) params.append('order_type', filters.order_type);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/restaurant/orders${query}`);
    return res.data?.data || res.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/restaurant/orders/${id}`);
    return res.data?.data || res.data;
  },

  create: async (orderData) => {
    const res = await apiClient.post('/restaurant/orders', orderData);
    return res.data?.data || res.data;
  },

  updateStatus: async (id, status, deliveryBoyId = null) => {
    const res = await apiClient.patch(`/restaurant/orders/${id}/status`, { 
      status,
      delivery_boy_id: deliveryBoyId 
    });
    return res.data?.data || res.data;
  },

  assignDeliveryBoy: async (orderId, deliveryBoyId) => {
    const res = await apiClient.put(`/restaurant/orders/${orderId}/assign-delivery`, {
      delivery_boy_id: deliveryBoyId
    });
    return res.data?.data || res.data;
  },
};

// Menu Items API - Automatically uses vendor's restaurant
export const menuItemsAPI = {
  getAll: async (available) => {
    // No need to pass restaurant_id - backend automatically uses vendor's restaurant
    const params = new URLSearchParams();
    if (available !== undefined) params.append('available', String(available));
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/restaurant/menu${query}`);
    return res.data?.data || res.data || [];
  },

  getCategories: async () => {
    const res = await apiClient.get(`/restaurant/menu/categories`);
    return res.data?.data || res.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/restaurant/menu/${id}`);
    return res.data?.data || res.data;
  },

  create: async (menuItem) => {
    const res = await apiClient.post('/restaurant/menu', menuItem);
    return res.data?.data || res.data;
  },

  update: async (id, menuItem) => {
    const res = await apiClient.put(`/restaurant/menu/${id}`, menuItem);
    return res.data?.data || res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/restaurant/menu/${id}`);
    return res.data?.data || res.data;
  },

  import: async (items) => {
    const res = await apiClient.post('/restaurant/menu/import', { items });
    return res.data?.data || res.data;
  },
};

// Delivery Boys API - Proxied to external API
export const deliveryBoysAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.id) params.append('id', filters.id);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/restaurant/delivery-boys${query}`);
    return res.data?.data || res.data || [];
  },

  add: async (deliveryBoyData) => {
    const res = await apiClient.post('/restaurant/delivery-boys/add', deliveryBoyData);
    return res.data?.data || res.data;
  },

  delete: async (id) => {
    const res = await apiClient.post('/restaurant/delivery-boys/delete', { id });
    return res.data?.data || res.data;
  },

  getCashCollection: async (filters = {}) => {
    const res = await apiClient.post('/restaurant/delivery-boys/cash-collection/list', filters);
    return res.data?.data || res.data || [];
  },

  manageCashCollection: async (data) => {
    const res = await apiClient.post('/restaurant/delivery-boys/cash-collection', data);
    return res.data?.data || res.data;
  },
};

// Table Bookings API
export const tableBookingsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.booking_date) params.append('booking_date', filters.booking_date);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/restaurant/table-bookings${query}`);
    return res.data?.data || res.data || [];
  },

  checkAvailability: async (restaurantId, bookingDate, bookingTime, numberOfGuests) => {
    const res = await apiClient.post('/restaurant/table-bookings/check-availability', {
      restaurant_id: restaurantId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      number_of_guests: numberOfGuests
    });
    return res.data?.data || res.data;
  },

  create: async (bookingData) => {
    const res = await apiClient.post('/restaurant/table-bookings', bookingData);
    return res.data?.data || res.data;
  },

  updateStatus: async (bookingId, status) => {
    const res = await apiClient.put(`/restaurant/table-bookings/${bookingId}/status`, { status });
    return res.data?.data || res.data;
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

