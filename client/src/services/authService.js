import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  async login(loginIdentifier, password, rememberMe = true) {
    const response = await api.post('/api/auth/login', {
      loginIdentifier,
      password,
      rememberMe,
    });
    return response.data;
  },

  async logout() {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};
