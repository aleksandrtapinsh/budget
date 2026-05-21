import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BudgetCard from '../components/budget/BudgetCard.jsx';
import CategoryRow from '../components/budget/CategoryRow.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { getBudgetSummary } from '../services/transactionService.js';

export default function Dashboard() {
  const { budgets, activeBudget, setActiveBudget, summary, setSummary, fetchBudgets, deleteBudget } = useBudget();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (!activeBudget) return;
    getBudgetSummary(activeBudget._id).then(setSummary);
  }, [activeBudget]);

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Dashboard</h1>
        {activeBudget && (
          <p style={{ color: '#6b7280' }}>{MONTH_NAMES[activeBudget.month - 1]} {activeBudget.year}</p>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              summary={activeBudget?._id === budget._id ? summary : []}
              onSelect={() => setActiveBudget(budget)}
              onDelete={async () => { await deleteBudget(budget._id); fetchBudgets(); }}
            />
          ))}
        </div>

        {activeBudget && summary.length > 0 && (
          <section>
            <h2>Category Breakdown</h2>
            {summary.map((row) => (
              <CategoryRow key={row.category} {...row} />
            ))}
          </section>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => navigate('/planner')}>+ New Budget</button>
          <button onClick={() => navigate('/transactions')}>+ Add Transaction</button>
        </div>
      </main>
    </>
  );
}
