import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import IncomeWizard from '../components/budget/IncomeWizard.jsx';
import BudgetCategoriesForm from '../components/budget/BudgetCategoriesForm.jsx';
import PieChart from '../components/budget/PieChart.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { getBudgetSummary } from '../services/transactionService.js';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DEFAULT_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
];

function fmt(n) {
  if (!n) return null;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Calendar() {
  const { budgets, fetchBudgets, createBudget, deleteBudget } = useBudget();
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [summaries, setSummaries] = useState({});

  const [wizardTarget, setWizardTarget] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => { fetchBudgets(); }, []);

  useEffect(() => {
    const visible = budgets.filter((b) => b.year === year);
    if (visible.length === 0) return;
    Promise.all(visible.map((b) => getBudgetSummary(b._id).then((s) => [b._id, s])))
      .then((entries) => setSummaries(Object.fromEntries(entries)));
  }, [budgets, year]);

  const budgetByMonth = {};
  for (const b of budgets) {
    if (b.year === year) budgetByMonth[b.month] = b;
  }

  function getPieSlices(budget) {
    const summary = summaries[budget._id] ?? [];
    return budget.categories.map((cat, i) => {
      const row = summary.find((s) => s.category === cat.name);
      return {
        label: cat.name,
        plannedValue: cat.plannedAmount,
        spentValue: row?.totalSpent ?? 0,
        color: cat.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      };
    });
  }

  function handleMonthClick(month) {
    const existing = budgetByMonth[month];
    if (existing) { navigate('/dashboard'); return; }
    setWizardTarget({ month, year });
    setIncomeData(null);
    setShowCategories(false);
  }

  function handleWizardComplete(data) {
    setIncomeData(data);
    setShowCategories(true);
  }

  async function handleCategoriesSubmit(categories) {
    if (!wizardTarget || !incomeData) return;
    const monthName = MONTH_NAMES[wizardTarget.month - 1];
    await createBudget({
      name: `${monthName} ${wizardTarget.year}`,
      month: wizardTarget.month,
      year: wizardTarget.year,
      income: incomeData.income,
      categories,
    });
    setWizardTarget(null);
    setIncomeData(null);
    setShowCategories(false);
    fetchBudgets();
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Budget Calendar</h1>
            <p className="text-sm text-gray-500 mt-0.5">Click a month to create or view its budget</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setYear((y) => y - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-400">
              ‹
            </button>
            <span className="text-xl font-bold text-gray-200 w-16 text-center">{year}</span>
            <button onClick={() => setYear((y) => y + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-400">
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const budget = budgetByMonth[month];
            const isToday = month === today.getMonth() + 1 && year === today.getFullYear();
            const hasBudget = !!budget;

            return (
              <button
                key={month}
                onClick={() => handleMonthClick(month)}
                className={`
                  relative rounded-2xl p-4 text-left transition-all border group
                  ${hasBudget
                    ? 'bg-gray-800 border-emerald-800 hover:border-emerald-600 hover:shadow-sm'
                    : isToday
                      ? 'bg-gray-800 border-emerald-700 ring-2 ring-emerald-900 hover:border-emerald-600'
                      : 'bg-gray-800 border-gray-700 hover:border-emerald-700 hover:shadow-sm'}
                `}
              >
                {isToday && !hasBudget && (
                  <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}

                <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${hasBudget ? 'text-emerald-500' : 'text-gray-600'}`}>
                  {MONTH_SHORT[i]}
                </p>
                <p className={`text-sm font-bold ${hasBudget ? 'text-gray-100' : 'text-gray-400'}`}>
                  {name}
                </p>

                {hasBudget ? (
                  <>
                    <div className="flex justify-center my-2">
                      <PieChart
                        slices={getPieSlices(budget)}
                        total={budget.income?.monthlyIncome}
                        size={80}
                        holeRatio={0.42}
                      />
                    </div>
                    {budget.income?.monthlyIncome && (
                      <p className="text-xs text-emerald-500 font-semibold text-center">
                        {fmt(budget.income.monthlyIncome)}/mo
                      </p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBudget(budget._id).then(fetchBudgets); }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-700 hover:bg-red-900 text-gray-500 hover:text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete budget"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <p className={`text-xs mt-1 ${isToday ? 'text-emerald-600' : 'text-gray-600'}`}>+ Add budget</p>
                )}
              </button>
            );
          })}
        </div>

        {Object.keys(budgetByMonth).length > 0 && (
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-300 mb-3">{year} Overview</p>
            <div className="flex flex-wrap gap-3">
              {Object.values(budgetByMonth).map((b) => (
                <div key={b._id} className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2">
                  <span className="text-xs font-medium text-gray-300">{MONTH_SHORT[b.month - 1]}</span>
                  {b.income?.monthlyIncome && (
                    <span className="text-xs text-emerald-400 font-semibold">{fmt(b.income.monthlyIncome)}</span>
                  )}
                  <button onClick={() => navigate('/dashboard')} className="text-xs text-gray-500 hover:text-emerald-400">
                    View →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {wizardTarget && !showCategories && (
        <IncomeWizard
          month={wizardTarget.month}
          year={wizardTarget.year}
          onComplete={handleWizardComplete}
          onCancel={() => setWizardTarget(null)}
        />
      )}

      {showCategories && wizardTarget && incomeData && (
        <BudgetCategoriesForm
          month={wizardTarget.month}
          year={wizardTarget.year}
          income={incomeData.income}
          onSubmit={handleCategoriesSubmit}
          onBack={() => setShowCategories(false)}
          onCancel={() => { setWizardTarget(null); setIncomeData(null); setShowCategories(false); }}
        />
      )}
    </div>
  );
}
