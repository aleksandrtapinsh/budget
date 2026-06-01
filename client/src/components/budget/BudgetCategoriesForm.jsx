import { useState } from 'react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SUGGESTED = ['Rent/Mortgage', 'Groceries', 'Transportation', 'Utilities', 'Entertainment', 'Savings', 'Healthcare', 'Dining Out'];

const DEFAULT_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
];

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BudgetCategoriesForm({ month, year, income, onSubmit, onBack, onCancel }) {
  const [categories, setCategories] = useState([{ name: '', plannedAmount: '', color: DEFAULT_COLORS[0] }]);
  const [error, setError] = useState('');

  const totalPlanned = categories.reduce((sum, c) => sum + (Number(c.plannedAmount) || 0), 0);
  const remaining = income.monthlyIncome - totalPlanned;

  const addCategory = () =>
    setCategories((prev) => [...prev, { name: '', plannedAmount: '', color: DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length] }]);

  const removeCategory = (i) => setCategories((prev) => prev.filter((_, idx) => idx !== i));

  const updateCategory = (i, field, value) =>
    setCategories((prev) => prev.map((cat, idx) => (idx === i ? { ...cat, [field]: value } : cat)));

  function addSuggested(name) {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories((prev) => {
      const nextColor = DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length];
      const hasEmpty = prev.find((c) => !c.name.trim());
      if (hasEmpty) return prev.map((c) => (!c.name.trim() ? { ...c, name } : c));
      return [...prev, { name, plannedAmount: '', color: nextColor }];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    for (const cat of categories) {
      if (!cat.name.trim()) return setError('All category names are required.');
      if (Number(cat.plannedAmount) <= 0) return setError('All planned amounts must be positive.');
    }
    await onSubmit(categories.map((c) => ({ name: c.name.trim(), plannedAmount: Number(c.plannedAmount), color: c.color })));
  }

  const inputCls = 'bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex-shrink-0">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Step 4 of 4 — Almost done!</p>
              <h2 className="text-xl font-bold text-gray-100">{MONTH_NAMES[month - 1]} {year} Budget</h2>
            </div>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
          </div>
          <div className="mt-4 h-1.5 bg-emerald-500 rounded-full" />
        </div>

        {/* Income bar */}
        <div className="mx-8 mb-4 flex-shrink-0">
          <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-medium">Monthly income</p>
              <p className="text-lg font-bold text-emerald-300">{fmt(income.monthlyIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Unallocated</p>
              <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {fmt(remaining)}
              </p>
            </div>
          </div>
          {totalPlanned > 0 && (
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((totalPlanned / income.monthlyIncome) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 pb-2">
            {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2 mb-4">{error}</p>}

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => {
                  const used = categories.some((c) => c.name.toLowerCase() === s.toLowerCase());
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSuggested(s)}
                      disabled={used}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${used ? 'border-emerald-700 bg-emerald-900/30 text-emerald-500 cursor-default' : 'border-gray-600 hover:border-emerald-600 hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-400'}`}
                    >
                      {used ? '✓ ' : '+ '}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs font-medium text-gray-400 mb-2">Categories</p>
            {categories.map((cat, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input type="color" value={cat.color} onChange={(e) => updateCategory(i, 'color', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-600 cursor-pointer p-0.5 flex-shrink-0 bg-gray-700"
                  title="Pick category color" />
                <input placeholder="Category name" value={cat.name} onChange={(e) => updateCategory(i, 'name', e.target.value)}
                  className={inputCls + ' flex-1'} />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" placeholder="0" min={0} value={cat.plannedAmount}
                    onChange={(e) => updateCategory(i, 'plannedAmount', e.target.value)}
                    className={inputCls + ' w-28 pl-7'} />
                </div>
                <button type="button" onClick={() => removeCategory(i)}
                  className="text-gray-600 hover:text-red-400 text-xl w-6 flex-shrink-0">×</button>
              </div>
            ))}
            <button type="button" onClick={addCategory}
              className="text-sm text-emerald-500 hover:text-emerald-400 mt-1 mb-4">+ Add category</button>
          </div>

          <div className="flex gap-3 px-8 py-6 flex-shrink-0 border-t border-gray-700">
            <button type="button" onClick={onBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
              Back
            </button>
            <button type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium">
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
