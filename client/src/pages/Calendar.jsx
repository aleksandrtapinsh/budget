import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import IncomeWizard from '../components/budget/IncomeWizard.jsx';
import BudgetCategoriesForm from '../components/budget/BudgetCategoriesForm.jsx';
import { useBudget } from '../context/BudgetContext.jsx';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(n) {
  if (!n) return null;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Calendar() {
  const { budgets, fetchBudgets, createBudget, deleteBudget } = useBudget();
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  // wizard state
  const [wizardTarget, setWizardTarget] = useState(null);   // { month, year }
  const [incomeData, setIncomeData] = useState(null);        // after wizard complete
  // categories form state
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => { fetchBudgets(); }, []);

  const budgetByMonth = {};
  for (const b of budgets) {
    if (b.year === year) budgetByMonth[b.month] = b;
  }

  function handleMonthClick(month) {
    const existing = budgetByMonth[month];
    if (existing) {
      navigate('/dashboard');
      return;
    }
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Year header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">Click a month to create or view its budget</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500"
            >
              ‹
            </button>
            <span className="text-xl font-bold text-gray-800 w-16 text-center">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500"
            >
              ›
            </button>
          </div>
        </div>

        {/* Month grid */}
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
                  relative rounded-2xl p-4 text-left transition-all border
                  ${hasBudget
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                    : isToday
                      ? 'bg-white border-indigo-300 ring-2 ring-indigo-200 hover:border-indigo-400'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}
                `}
              >
                {isToday && !hasBudget && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${hasBudget ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {MONTH_SHORT[i]}
                </p>
                <p className={`text-base font-bold ${hasBudget ? 'text-white' : 'text-gray-800'}`}>
                  {name}
                </p>
                {hasBudget && budget.income?.monthlyIncome ? (
                  <p className="text-xs text-indigo-200 mt-1">{fmt(budget.income.monthlyIncome)}/mo</p>
                ) : hasBudget ? (
                  <p className="text-xs text-indigo-200 mt-1">Budget set</p>
                ) : (
                  <p className={`text-xs mt-1 ${isToday ? 'text-indigo-400' : 'text-gray-300'}`}>+ Add budget</p>
                )}
                {hasBudget && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBudget(budget._id).then(fetchBudgets); }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 hover:bg-red-400 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete budget"
                  >
                    ×
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary strip */}
        {Object.keys(budgetByMonth).length > 0 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">{year} Overview</p>
            <div className="flex flex-wrap gap-3">
              {Object.values(budgetByMonth).map((b) => (
                <div key={b._id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <span className="text-xs font-medium text-gray-700">{MONTH_SHORT[b.month - 1]}</span>
                  {b.income?.monthlyIncome && (
                    <span className="text-xs text-indigo-600 font-semibold">{fmt(b.income.monthlyIncome)}</span>
                  )}
                  <button
                    onClick={() => { navigate('/dashboard'); }}
                    className="text-xs text-gray-400 hover:text-indigo-600"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Income Wizard Modal */}
      {wizardTarget && !showCategories && (
        <IncomeWizard
          month={wizardTarget.month}
          year={wizardTarget.year}
          onComplete={handleWizardComplete}
          onCancel={() => setWizardTarget(null)}
        />
      )}

      {/* Categories form modal */}
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
