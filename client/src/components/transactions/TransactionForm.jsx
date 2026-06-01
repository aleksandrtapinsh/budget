import { useState } from 'react';

export default function TransactionForm({ initialData, budgets, onSubmit, onCancel }) {
  const [budgetId, setBudgetId] = useState(initialData?.budgetId ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [amount, setAmount] = useState(initialData?.amount ?? '');
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [type, setType] = useState(initialData?.type ?? 'expense');

  const selectedBudget = budgets.find((b) => b._id === budgetId);
  const categoryOptions = selectedBudget?.categories ?? [];

  const handleBudgetChange = (e) => {
    setBudgetId(e.target.value);
    setCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ budgetId, category, amount: Number(amount), date, description, type });
  };

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 my-4 flex flex-col gap-3">
      <select value={budgetId} onChange={handleBudgetChange} required className={inputCls}>
        <option value="">Select budget…</option>
        {budgets.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
      </select>
      <div className="flex gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} required disabled={!budgetId} className={inputCls}>
          <option value="">{budgetId ? 'Select category…' : 'Select a budget first'}</option>
          {categoryOptions.map((c) => (
            <option key={c.name} value={c.name}>{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</option>
          ))}
        </select>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} step="0.01" required className={inputCls} />
      </div>
      <div className="flex gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
        <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
      </div>
      <div className="flex gap-4">
        {['expense', 'income'].map((t) => (
          <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" value={t} checked={type === t} onChange={() => setType(t)} className="accent-indigo-600" />
            <span className="capitalize">{t}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {initialData ? 'Save' : 'Add Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
