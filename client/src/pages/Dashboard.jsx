import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BudgetCard from '../components/budget/BudgetCard.jsx';
import CategoryRow from '../components/budget/CategoryRow.jsx';
import PieChart from '../components/budget/PieChart.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { getBudgetSummary } from '../services/transactionService.js';

const DEFAULT_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function Dashboard() {
  const { budgets, activeBudget, setActiveBudget, summary, setSummary, fetchBudgets, deleteBudget } = useBudget();
  const navigate = useNavigate();

  useEffect(() => { fetchBudgets(); }, []);

  useEffect(() => {
    if (!activeBudget) return;
    getBudgetSummary(activeBudget._id).then(setSummary);
  }, [activeBudget]);

  const summaryWithColors = summary.map((row) => {
    const cat = activeBudget?.categories.find((c) => c.name.toLowerCase() === row.category.toLowerCase());
    const i = activeBudget?.categories.indexOf(cat) ?? 0;
    return { ...row, color: cat?.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] };
  });

  const totalSpent = summaryWithColors.reduce((s, r) => s + r.totalSpent, 0);
  const spentSlices = summaryWithColors
    .filter((r) => r.totalSpent > 0)
    .map((r) => ({ value: r.totalSpent, color: r.color, label: r.category }));

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
            <button onClick={() => navigate('/calendar')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
            <button onClick={() => navigate('/calendar')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                <h2 className="text-base font-semibold text-gray-800 mb-5">Category Breakdown</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <PieChart slices={spentSlices} size={180} holeRatio={0.5} />
                    {totalSpent > 0 ? (
                      <p className="text-sm font-semibold text-gray-700">{fmt(totalSpent)} spent</p>
                    ) : (
                      <p className="text-xs text-gray-400">No spending yet</p>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    {summaryWithColors.map((row) => <CategoryRow key={row.category} {...row} />)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
