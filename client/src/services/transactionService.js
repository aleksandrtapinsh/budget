import api from './api.js';

export const getTransactions = async (filters = {}) => {
  const { data } = await api.get('/transactions', { params: filters });
  return data;
};

export const createTransaction = async (transactionData) => {
  const { data } = await api.post('/transactions', transactionData);
  return data;
};

export const updateTransaction = async (id, updates) => {
  const { data } = await api.put(`/transactions/${id}`, updates);
  return data;
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};

export const getBudgetSummary = async (budgetId) => {
  const { data } = await api.get(`/summary/${budgetId}`);
  return data;
};
