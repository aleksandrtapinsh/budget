import api from './api.js';

export const getBudgets = async () => {
  const { data } = await api.get('/budgets');
  return data;
};

export const createBudget = async (budgetData) => {
  const { data } = await api.post('/budgets', budgetData);
  return data;
};

export const updateBudget = async (id, updates) => {
  const { data } = await api.put(`/budgets/${id}`, updates);
  return data;
};

export const deleteBudget = async (id) => {
  await api.delete(`/budgets/${id}`);
};
