import api from './api';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/users?${query}`);
    return response.data;
  },

  async toggleUserStatus(userId, isSuspended) {
    const response = await api.put(`/api/admin/users/${userId}/status`, { isSuspended });
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async getReports() {
    const response = await api.get('/api/admin/reports');
    return response.data;
  },

  async updateReport(reportId, updateData) {
    const response = await api.put(`/api/admin/reports/${reportId}`, updateData);
    return response.data;
  },
};
