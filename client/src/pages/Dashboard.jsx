import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BudgetCard from '../components/budget/BudgetCard.jsx';
import CategoryRow from '../components/budget/CategoryRow.jsx';
import PieChart from '../components/budget/PieChart.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { getBudgetSummary } from '../services/transactionService.js';

const DEFAULT_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
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
  const monthlyIncome = activeBudget?.income?.monthlyIncome ?? 0;
  const totalPlanned = summaryWithColors.reduce((s, r) => s + r.plannedAmount, 0);
  const unallocated = Math.max(0, monthlyIncome - totalPlanned);

  const pieSlices = summaryWithColors.map((r) => ({
    label: r.category,
    plannedValue: r.plannedAmount,
    spentValue: r.totalSpent,
    color: r.color,
  }));

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
            {activeBudget && (
              <p className="text-sm text-gray-500 mt-0.5">{MONTH_NAMES[activeBudget.month - 1]} {activeBudget.year}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/calendar')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + New Budget
            </button>
            <button onClick={() => navigate('/transactions')} className="bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm">
              + Transaction
            </button>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-gray-800 border border-dashed border-gray-600 rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No budgets yet</p>
            <button onClick={() => navigate('/calendar')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-gray-200 mb-5">Category Breakdown</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <PieChart slices={pieSlices} total={monthlyIncome} size={180} holeRatio={0.5} />
                    {totalSpent > 0 ? (
                      <p className="text-sm font-semibold text-gray-300">{fmt(totalSpent)} spent</p>
                    ) : (
                      <p className="text-xs text-gray-500">No spending yet</p>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    {summaryWithColors.map((row) => <CategoryRow key={row.category} {...row} />)}
                    {unallocated > 0 && (
                      <div className="flex items-center gap-3 py-2.5 border-t border-gray-700 mt-1">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500">Unallocated</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-gray-500">{fmt(unallocated)}</p>
                        </div>
                      </div>
                    )}
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
