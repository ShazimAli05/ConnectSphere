import api from './api';

export const userService = {
  async searchUsers(query = '') {
    const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get('/api/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/api/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
