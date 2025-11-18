import apiClient from './apiClient';

const clientRestaurantService = {
  /**
   * Get restaurant details by ID (public endpoint)
   */
  async getRestaurantById(restaurantId) {
    const response = await apiClient.get(`/client/restaurants/${restaurantId}`);
    return response.data;
  },

  /**
   * Get menu items for a restaurant (public endpoint)
   */
  async getMenuItems(restaurantId) {
    const response = await apiClient.get(`/menu-items?restaurant_id=${restaurantId}&available=true`);
    return response.data;
  },

  /**
   * Get menu categories for a restaurant (public endpoint)
   */
  async getMenuCategories(restaurantId) {
    const response = await apiClient.get(`/menu-items/categories?restaurant_id=${restaurantId}`);
    return response.data;
  },

  /**
   * Check table availability for a restaurant
   */
  async checkTableAvailability(restaurantId, bookingDate, bookingTime, numberOfGuests) {
    const response = await apiClient.get(`/client/restaurants/${restaurantId}/table-availability`, {
      params: {
        booking_date: bookingDate,
        booking_time: bookingTime,
        number_of_guests: numberOfGuests
      }
    });
    return response.data;
  },

  /**
   * Create a restaurant order (delivery or dine-in)
   */
  async createOrder(orderData) {
    const response = await apiClient.post('/client/orders/restaurants', orderData);
    return response.data;
  }
};

export default clientRestaurantService;

