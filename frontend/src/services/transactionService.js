import api from './api';

export const transactionService = {
  // Get dashboard metrics & summary
  getDashboardSummary: async () => {
    const response = await api.get('/transactions/dashboard');
    return response.data;
  },

  // Get transactions with filtering, search and sorting
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get single transaction
  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction (income or expense)
  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Update existing transaction
  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Reports: Monthly comparison
  getMonthlyReport: async (months = 6) => {
    const response = await api.get('/reports/monthly', { params: { months } });
    return response.data;
  },

  // Reports: Category breakdown
  getCategoryReport: async (type = 'expense', params = {}) => {
    const response = await api.get('/reports/category', { params: { type, ...params } });
    return response.data;
  },

  // Reports: Analytical overview
  getAnalyticsOverview: async (params = {}) => {
    const response = await api.get('/reports/overview', { params });
    return response.data;
  }
};
