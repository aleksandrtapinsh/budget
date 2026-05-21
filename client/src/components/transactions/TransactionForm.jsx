import { useState } from 'react';

// Props:
//   initialData  – transaction object to prefill (null for create)
//   budgets      – array of budget options for the dropdown
//   onSubmit     – async (data) => void
//   onCancel     – () => void

export default function TransactionForm({ initialData, budgets, onSubmit, onCancel }) {
  const [budgetId, setBudgetId] = useState(initialData?.budgetId ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [amount, setAmount] = useState(initialData?.amount ?? '');
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [type, setType] = useState(initialData?.type ?? 'expense');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ budgetId, category, amount: Number(amount), date, description, type });
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)} required>
        <option value="">Select budget…</option>
        {budgets.map((b) => (
          <option key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select>
      <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} step="0.01" required />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label><input type="radio" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} /> Expense</label>
        <label><input type="radio" value="income" checked={type === 'income'} onChange={() => setType('income')} /> Income</label>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit">{initialData ? 'Save' : 'Add Transaction'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
