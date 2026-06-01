import { useState } from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DEFAULT_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
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

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 my-4">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="flex gap-3 mb-4">
        <input placeholder="Budget name" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls + ' flex-1'} />
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min={2000} max={2100}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-24" />
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
      {categories.map((cat, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input
            type="color"
            value={cat.color}
            onChange={(e) => updateCategory(i, 'color', e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"
            title="Pick category color"
          />
          <input placeholder="Name" value={cat.name} onChange={(e) => updateCategory(i, 'name', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1" />
          <input type="number" placeholder="Amount" value={cat.plannedAmount} min={0}
            onChange={(e) => updateCategory(i, 'plannedAmount', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28" />
          <button type="button" onClick={() => removeCategory(i)}
            className="text-gray-300 hover:text-red-400 text-xl px-1">×</button>
        </div>
      ))}
      <button type="button" onClick={addCategory}
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-4">+ Add category</button>

      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {initialData ? 'Save Changes' : 'Create Budget'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
