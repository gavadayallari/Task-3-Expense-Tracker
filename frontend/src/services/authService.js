import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('finflow_token', response.data.token);
      localStorage.setItem('finflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('finflow_token', response.data.token);
      localStorage.setItem('finflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('finflow_token');
    localStorage.removeItem('finflow_user');
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    if (response.data.user) {
      localStorage.setItem('finflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Check if locally authenticated
  getCurrentUser: () => {
    const userStr = localStorage.getItem('finflow_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('finflow_token');
  }
};
