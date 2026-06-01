import { useState } from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DEFAULT_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
];

export default function BudgetForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [month, setMonth] = useState(initialData?.month ?? new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year ?? new Date().getFullYear());
  const [categories, setCategories] = useState(
    initialData?.categories?.map((c, i) => ({ ...c, color: c.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }))
      ?? [{ name: '', plannedAmount: '', color: DEFAULT_COLORS[0] }]
  );
  const [error, setError] = useState('');

  const addCategory = () =>
    setCategories((prev) => [...prev, { name: '', plannedAmount: '', color: DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length] }]);

  const removeCategory = (i) => setCategories((prev) => prev.filter((_, idx) => idx !== i));

  const updateCategory = (i, field, value) =>
    setCategories((prev) => prev.map((cat, idx) => (idx === i ? { ...cat, [field]: value } : cat)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Budget name is required.');
    for (const cat of categories) {
      if (!cat.name.trim()) return setError('All category names are required.');
      if (Number(cat.plannedAmount) <= 0) return setError('All planned amounts must be positive.');
    }
    await onSubmit({
      name,
      month: Number(month),
      year: Number(year),
      categories: categories.map((c) => ({ name: c.name, plannedAmount: Number(c.plannedAmount), color: c.color })),
    });
  };

  const inputCls = 'bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full';

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 my-4">
      {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="flex gap-3 mb-4">
        <input placeholder="Budget name" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls + ' flex-1'} />
        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min={2000} max={2100}
          className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-24" />
      </div>

      <p className="text-sm font-medium text-gray-300 mb-2">Categories</p>
      {categories.map((cat, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input type="color" value={cat.color} onChange={(e) => updateCategory(i, 'color', e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-600 cursor-pointer p-0.5 flex-shrink-0 bg-gray-700"
            title="Pick category color" />
          <input placeholder="Name" value={cat.name} onChange={(e) => updateCategory(i, 'name', e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1" />
          <input type="number" placeholder="Amount" value={cat.plannedAmount} min={0}
            onChange={(e) => updateCategory(i, 'plannedAmount', e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-28" />
          <button type="button" onClick={() => removeCategory(i)}
            className="text-gray-600 hover:text-red-400 text-xl px-1">×</button>
        </div>
      ))}
      <button type="button" onClick={addCategory}
        className="text-sm text-emerald-500 hover:text-emerald-400 mb-4">+ Add category</button>

      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {initialData ? 'Save Changes' : 'Create Budget'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
