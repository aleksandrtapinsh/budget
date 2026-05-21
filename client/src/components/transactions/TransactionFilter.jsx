// Props:
//   filters    – { budgetId, category, type, startDate, endDate }
//   budgets    – array of budget options
//   onChange   – (updatedFilters) => void

export default function TransactionFilter({ filters, budgets, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0', alignItems: 'center' }}>
      <select value={filters.budgetId || ''} onChange={(e) => handleChange('budgetId', e.target.value)}>
        <option value="">All budgets</option>
        {budgets.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
      </select>
      <input placeholder="Category" value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)} />
      <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input type="date" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} />
      <input type="date" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} />
      <button type="button" onClick={() => onChange({})}>Clear</button>
    </div>
  );
}
