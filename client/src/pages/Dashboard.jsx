import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BudgetCard from '../components/budget/BudgetCard.jsx';
import CategoryRow from '../components/budget/CategoryRow.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { getBudgetSummary } from '../services/transactionService.js';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard() {
  const { budgets, activeBudget, setActiveBudget, summary, setSummary, fetchBudgets, deleteBudget } = useBudget();
  const navigate = useNavigate();

  useEffect(() => { fetchBudgets(); }, []);

  useEffect(() => {
    if (!activeBudget) return;
    getBudgetSummary(activeBudget._id).then(setSummary);
  }, [activeBudget]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {activeBudget && (
              <p className="text-sm text-gray-500 mt-0.5">{MONTH_NAMES[activeBudget.month - 1]} {activeBudget.year}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/planner')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + New Budget
            </button>
            <button onClick={() => navigate('/transactions')} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm">
              + Transaction
            </button>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No budgets yet</p>
            <button onClick={() => navigate('/planner')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Create your first budget
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3 flex-wrap mb-8">
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
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Category Breakdown</h2>
                {summary.map((row) => <CategoryRow key={row.category} {...row} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
