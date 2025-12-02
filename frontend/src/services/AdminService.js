import apiClient from './apiClient';

class AdminService {
  /**
   * Login admin user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/admin/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in admin:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to login';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get admin profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/admin/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all pending accounts
   */
  async getAllPendingAccounts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.service_type) params.append('service_type', filters.service_type);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/admin/accounts${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending accounts:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch pending accounts';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get account statistics
   */
  async getAccountStats() {
    try {
      const response = await apiClient.get('/admin/accounts/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching account stats:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch statistics';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve an account
   */
  async approveAccount(serviceType, accountId, notes = '') {
    try {
      const response = await apiClient.post(`/admin/accounts/${serviceType}/${accountId}/approve`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error approving account:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to approve account';
      throw new Error(errorMessage);
    }
  }

  /**
   * Reject an account
   */
  async rejectAccount(serviceType, accountId, rejectionReason = '', notes = '') {
    try {
      const response = await apiClient.post(`/admin/accounts/${serviceType}/${accountId}/reject`, { rejectionReason, notes });
      return response.data;
    } catch (error) {
      console.error('Error rejecting account:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reject account';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete an account and all associated data
   */
  async deleteAccount(serviceType, accountId) {
    try {
      const response = await apiClient.delete(`/admin/accounts/${serviceType}/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete account';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get full account details for review
   */
  async getAccountDetails(serviceType, accountId) {
    try {
      const response = await apiClient.get(`/admin/accounts/${serviceType}/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch account details';
      throw new Error(errorMessage);
    }
  }

  // Package management methods
  async getPackages(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/admin/packages?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch packages';
      throw new Error(errorMessage);
    }
  }

  async getPackageStats() {
    try {
      const response = await apiClient.get('/admin/packages/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching package stats:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch package statistics';
      throw new Error(errorMessage);
    }
  }

  async getPackageDetails(packageId) {
    try {
      const response = await apiClient.get(`/admin/packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch package details';
      throw new Error(errorMessage);
    }
  }

  async approvePackage(packageId, notes = null) {
    try {
      const response = await apiClient.post(`/admin/packages/${packageId}/approve`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error approving package:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to approve package';
      throw new Error(errorMessage);
    }
  }

  async rejectPackage(packageId, rejectionReason = null, notes = null) {
    try {
      const response = await apiClient.post(`/admin/packages/${packageId}/reject`, { rejectionReason, notes });
      return response.data;
    } catch (error) {
      console.error('Error rejecting package:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reject package';
      throw new Error(errorMessage);
    }
  }
}

export default new AdminService();

