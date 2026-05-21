import { createContext, useContext, useState } from 'react';
import * as budgetService from '../services/budgetService.js';

const BudgetContext = createContext(null);

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);
  const [summary, setSummary] = useState([]);

  const fetchBudgets = async () => {
    const data = await budgetService.getBudgets();
    setBudgets(data);
    if (data.length > 0) setActiveBudget(data[0]);
  };

  const createBudget = async (data) => {
    const created = await budgetService.createBudget(data);
    setBudgets((prev) => [created, ...prev]);
  };

  const updateBudget = async (id, updates) => {
    const updated = await budgetService.updateBudget(id, updates);
    setBudgets((prev) => prev.map((b) => (b._id === id ? updated : b)));
  };

  const deleteBudget = async (id) => {
    await budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b._id !== id));
    setActiveBudget((prev) => (prev?._id === id ? null : prev));
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        activeBudget,
        setActiveBudget,
        summary,
        setSummary,
        fetchBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
};
