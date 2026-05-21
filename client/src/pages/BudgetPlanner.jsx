import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import BudgetForm from '../components/budget/BudgetForm.jsx';
import { useBudget } from '../context/BudgetContext.jsx';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetPlanner() {
  const { budgets, fetchBudgets, createBudget, updateBudget } = useBudget();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (data) => {
    if (editing) await updateBudget(editing._id, data);
    else await createBudget(data);
    setShowForm(false);
    setEditing(null);
    fetchBudgets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Budget
          </button>
        </div>

        {showForm && (
          <BudgetForm
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}

        {budgets.length === 0 && !showForm ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No budgets yet. Create one above.</p>
          </div>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {budgets.map((budget) => (
              <li key={budget._id} className="flex justify-between items-center px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{budget.name}</p>
                  <p className="text-xs text-gray-400">{MONTH_NAMES[budget.month - 1]} {budget.year}</p>
                </div>
                <button
                  onClick={() => { setEditing(budget); setShowForm(true); }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
