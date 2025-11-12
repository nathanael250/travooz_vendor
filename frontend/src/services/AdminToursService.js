import apiClient from './apiClient';

class AdminToursService {
  /**
   * Get all tour submissions for admin review
   */
  async getAllSubmissions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/admin/tours/submissions${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tour submissions:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch tour submissions';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats() {
    try {
      const response = await apiClient.get('/admin/tours/submissions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch statistics';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get submission details by ID
   */
  async getSubmissionById(submissionId) {
    try {
      const response = await apiClient.get(`/admin/tours/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch submission details';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update submission status (approve/reject)
   */
  async updateSubmissionStatus(submissionId, status, notes = '', rejectionReason = '') {
    try {
      const body = { status };
      if (notes) body.notes = notes;
      if (rejectionReason) body.rejectionReason = rejectionReason;
      
      const response = await apiClient.patch(`/admin/tours/submissions/${submissionId}/status`, body);
      return response.data;
    } catch (error) {
      console.error('Error updating submission status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update submission status';
      throw new Error(errorMessage);
    }
  }
}

export default new AdminToursService();

