export default function TransactionFilter({ filters, budgets, onChange }) {
  const handleChange = (field, value) => onChange({ ...filters, [field]: value });

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="flex flex-wrap gap-2 my-4 items-center">
      <select value={filters.budgetId || ''} onChange={(e) => handleChange('budgetId', e.target.value)} className={inputCls}>
        <option value="">All budgets</option>
        {budgets.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
      </select>
      <input placeholder="Category" value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)} className={inputCls} />
      <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)} className={inputCls}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input type="date" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} className={inputCls} />
      <input type="date" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} className={inputCls} />
      <button onClick={() => onChange({})} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">
        Clear
      </button>
    </div>
  );
}
