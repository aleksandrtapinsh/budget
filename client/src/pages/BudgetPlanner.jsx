import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import BudgetForm from '../components/budget/BudgetForm.jsx';
import { useBudget } from '../context/BudgetContext.jsx';

export default function BudgetPlanner() {
  const { budgets, fetchBudgets, createBudget, updateBudget } = useBudget();
  const [editing, setEditing] = useState(null); // budget being edited, or null for create mode
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (data) => {
    if (editing) {
      await updateBudget(editing._id, data);
    } else {
      await createBudget(data);
    }
    setShowForm(false);
    setEditing(null);
    fetchBudgets();
  };

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Budget Planner</h1>
          <button onClick={() => { setEditing(null); setShowForm(true); }}>+ New Budget</button>
        </div>

        {showForm && (
          <BudgetForm
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
          {budgets.map((budget) => (
            <li key={budget._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <span>{budget.name} — {MONTH_NAMES[budget.month - 1]} {budget.year}</span>
              <button onClick={() => { setEditing(budget); setShowForm(true); }}>Edit</button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
