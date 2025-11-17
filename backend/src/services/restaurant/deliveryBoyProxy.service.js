const axios = require('axios');

class DeliveryBoyProxyService {
  constructor() {
    // External API base URL - should be in environment variables
    this.baseURL = process.env.DELIVERY_BOY_API_URL || 'https://rwandaarts.com/admin/app/v1/api';
  }

  /**
   * Get delivery boys from external API
   * POST /get_delivery_boys
   */
  async getDeliveryBoys(filters = {}) {
    try {
      const {
        id = null,
        search = null,
        limit = 25,
        offset = 0,
        sort = 'id',
        order = 'DESC'
      } = filters;

      const params = new URLSearchParams();
      if (id) params.append('id', id);
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      if (sort) params.append('sort', sort);
      if (order) params.append('order', order);

      // External API uses POST for get_delivery_boys
      const response = await axios.post(
        `${this.baseURL}/get_delivery_boys?${params.toString()}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching delivery boys from external API:', error);
      throw new Error(`Failed to fetch delivery boys: ${error.message}`);
    }
  }

  /**
   * Add delivery boy via external API
   * POST /add_delivery_boy
   */
  async addDeliveryBoy(data, authToken) {
    try {
      const formData = new URLSearchParams();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(
        `${this.baseURL}/add_delivery_boy`,
        formData.toString(),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding delivery boy via external API:', error);
      throw new Error(`Failed to add delivery boy: ${error.message}`);
    }
  }

  /**
   * Delete delivery boy via external API
   * POST /delete_delivery_boy
   */
  async deleteDeliveryBoy(deliveryBoyId, authToken) {
    try {
      const formData = new URLSearchParams();
      formData.append('id', deliveryBoyId);

      const response = await axios.post(
        `${this.baseURL}/delete_delivery_boy`,
        formData.toString(),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting delivery boy via external API:', error);
      throw new Error(`Failed to delete delivery boy: ${error.message}`);
    }
  }

  /**
   * Manage delivery boy cash collection via external API
   * POST /manage_delivery_boy_cash_collection
   */
  async manageCashCollection(data, authToken) {
    try {
      const formData = new URLSearchParams();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(
        `${this.baseURL}/manage_delivery_boy_cash_collection`,
        formData.toString(),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error managing cash collection via external API:', error);
      throw new Error(`Failed to manage cash collection: ${error.message}`);
    }
  }

  /**
   * Get delivery boy cash collection records via external API
   * POST /get_delivery_boy_cash_collection
   */
  async getCashCollection(filters = {}, authToken) {
    try {
      const formData = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          formData.append(key, filters[key]);
        }
      });

      const response = await axios.post(
        `${this.baseURL}/get_delivery_boy_cash_collection`,
        formData.toString(),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching cash collection from external API:', error);
      throw new Error(`Failed to fetch cash collection: ${error.message}`);
    }
  }

  /**
   * Map restaurant order to delivery boy API provider format
   * Transforms restaurant order structure to match the delivery boy API's expected format
   */
  mapRestaurantOrderToDeliveryBoyFormat(restaurantOrder) {
    if (!restaurantOrder || restaurantOrder.order_type !== 'delivery') {
      throw new Error('Order must be a delivery order');
    }

    // Calculate totals
    const subtotal = parseFloat(restaurantOrder.subtotal || 0);
    const deliveryFee = parseFloat(restaurantOrder.delivery_fee || 0);
    const taxAmount = parseFloat(restaurantOrder.tax_amount || 0);
    const discountAmount = parseFloat(restaurantOrder.discount_amount || 0);
    
    // Calculate tax percentage if tax_amount and subtotal are available
    const taxPercent = subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(2) : '0.00';
    
    // Calculate totals
    const total = subtotal + deliveryFee + taxAmount - discountAmount;
    const finalTotal = total; // Assuming no additional charges
    const totalPayable = finalTotal; // Assuming same as final total

    // Format date
    const orderDate = restaurantOrder.created_at 
      ? new Date(restaurantOrder.created_at).toISOString().replace('T', ' ').substring(0, 19)
      : new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Format delivery date (if estimated_delivery_time exists, use it; otherwise use created_at + 1 hour)
    let deliveryDate = '';
    let deliveryTime = '';
    if (restaurantOrder.estimated_delivery_time) {
      const deliveryDateTime = new Date(restaurantOrder.estimated_delivery_time);
      deliveryDate = deliveryDateTime.toISOString().split('T')[0];
      const hour = deliveryDateTime.getHours();
      deliveryTime = `${hour.toString().padStart(2, '0')}:00-${(hour + 2).toString().padStart(2, '0')}:00`;
    } else {
      const estimatedTime = new Date(restaurantOrder.created_at);
      estimatedTime.setHours(estimatedTime.getHours() + 1);
      deliveryDate = estimatedTime.toISOString().split('T')[0];
      const hour = estimatedTime.getHours();
      deliveryTime = `${hour.toString().padStart(2, '0')}:00-${(hour + 2).toString().padStart(2, '0')}:00`;
    }

    // Format date delivered if exists
    const dateDelivered = restaurantOrder.delivered_at
      ? new Date(restaurantOrder.delivered_at).toISOString().replace('T', ' ').substring(0, 19)
      : '';

    // Map order items
    const orderItems = (restaurantOrder.items || []).map((item, index) => {
      const itemPrice = parseFloat(item.unit_price || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      const itemTaxAmount = parseFloat(item.tax_amount || 0);
      const itemTaxPercent = itemPrice > 0 ? ((itemTaxAmount / itemPrice) * 100).toFixed(2) : '0.00';
      const discountedPrice = itemPrice; // Assuming no item-level discount
      const subtotal = discountedPrice * quantity;

      // Build variant name from addons and customizations
      let variantName = '';
      const variantParts = [];
      
      if (item.addons && Array.isArray(item.addons) && item.addons.length > 0) {
        variantParts.push(`Addons: ${item.addons.length}`);
      }
      
      if (item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0) {
        const customizations = item.customizations.map(c => `${c.name}: ${c.value}`).join(', ');
        variantParts.push(customizations);
      }
      
      variantName = variantParts.join(' | ') || 'Standard';

      return {
        id: String(index + 1),
        product_id: item.menu_item_id || item.id || '',
        product_name: item.item_name || item.name || 'Unknown Item',
        quantity: String(quantity),
        price: itemPrice.toFixed(2),
        discounted_price: discountedPrice.toFixed(2),
        tax_amount: itemTaxAmount.toFixed(2),
        tax_percent: itemTaxPercent,
        subtotal: subtotal.toFixed(2),
        image: item.item_image || item.image_url || '',
        variant_id: item.menu_item_id || item.id || '',
        variant_name: variantName
      };
    });

    // Build status history
    const statusHistory = [];
    if (restaurantOrder.created_at) {
      statusHistory.push(['pending', new Date(restaurantOrder.created_at).toISOString().replace('T', ' ').substring(0, 19)]);
    }
    
    const orderStatus = restaurantOrder.order_status || restaurantOrder.status || 'pending';
    const statusMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'preparing': 'preparing',
      'ready': 'preparing',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    const mappedStatus = statusMap[orderStatus] || 'pending';
    if (restaurantOrder.updated_at && mappedStatus !== 'pending') {
      statusHistory.push([mappedStatus, new Date(restaurantOrder.updated_at).toISOString().replace('T', ' ').substring(0, 19)]);
    }
    
    if (restaurantOrder.delivered_at && mappedStatus === 'delivered') {
      statusHistory.push(['delivered', dateDelivered]);
    }

    // Generate OTP (simple 4-digit code - in production, use a proper OTP generator)
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    // Map the order
    const mappedOrder = {
      id: restaurantOrder.id || '',
      username: restaurantOrder.customer_name || '',
      mobile: restaurantOrder.customer_phone || '',
      delivery_charge: deliveryFee.toFixed(2),
      wallet_balance: '0.00', // Not available in restaurant orders
      promocode: '', // Not available in restaurant orders
      promo_discount: '0.00', // Not available in restaurant orders
      payment_method: restaurantOrder.payment_method || 'cash',
      final_total: finalTotal.toFixed(2),
      total: total.toFixed(2),
      total_payable: totalPayable.toFixed(2),
      address: restaurantOrder.delivery_address || '',
      total_tax_amount: taxAmount.toFixed(2),
      total_tax_percent: taxPercent,
      date_added: orderDate,
      is_cancellable: restaurantOrder.order_status === 'pending' || restaurantOrder.order_status === 'confirmed' ? '1' : '0',
      is_returnable: '0', // Restaurant orders typically not returnable
      is_already_cancelled: restaurantOrder.order_status === 'cancelled' ? '1' : '0',
      is_already_returned: '0',
      is_return_request_submitted: '0',
      active_status: mappedStatus,
      otp: otp,
      latitude: restaurantOrder.delivery_latitude ? String(restaurantOrder.delivery_latitude) : '',
      longitude: restaurantOrder.delivery_longitude ? String(restaurantOrder.delivery_longitude) : '',
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_boy_id: restaurantOrder.delivery_boy_id ? String(restaurantOrder.delivery_boy_id) : '',
      name: restaurantOrder.customer_name || '',
      type: 'delivery',
      date_delivered: dateDelivered,
      amount: totalPayable.toFixed(2),
      cash_received: restaurantOrder.payment_method === 'cash' ? totalPayable.toFixed(2) : '0.00',
      message: restaurantOrder.special_instructions || 'Thank you for your order!',
      order_items: orderItems,
      status: statusHistory
    };

    return mappedOrder;
  }
}

module.exports = new DeliveryBoyProxyService();

