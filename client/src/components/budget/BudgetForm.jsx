import { useState } from 'react';

// Form for creating or editing a budget's planned amounts.
// Props:
//   initialData  – budget object to prefill (null for create)
//   onSubmit     – async (data) => void
//   onCancel     – () => void
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetForm({ initialData, onSubmit, onCancel }) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [month, setMonth] = useState(initialData?.month ?? new Date().getMonth() + 1);
    const [year, setYear] = useState(initialData?.year ?? new Date().getFullYear());
    const [categories, setCategories] = useState(
        initialData?.categories ?? [{ name: '', plannedAmount: '' }]
    );
    const [error, setError] = useState('');

    const addCategory = () => {
        // TODO: append { name: '', plannedAmount: '' } to categories
        setCategories(prev => [...prev, { name: '', plannedAmount: '' }]);
    };

    const removeCategory = (index) => {
        // TODO: remove category at index
        setCategories(prev => prev.filter((_, i) => i !== index));
    };

    const updateCategory = (index, field, value) => {
        // TODO: update the specified field on categories[index]
        setCategories(prev => prev.map((cat, i) => i === index ? { ...cat, [field]: value } : cat)
        );
    };

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
            categories: categories.map((c) => ({ name: c.name, plannedAmount: Number(c.plannedAmount) })),
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', margin: '1rem 0' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                    placeholder="Budget name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ flex: 1 }}
                />
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {MONTH_NAMES.map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: 80 }}
                    min={2000}
                    max={2100}
                />
            </div>

            <h3 style={{ margin: '0 0 0.5rem' }}>Categories</h3>
            {categories.map((cat, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        placeholder="Category name"
                        value={cat.name}
                        onChange={(e) => updateCategory(i, 'name', e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={cat.plannedAmount}
                        onChange={(e) => updateCategory(i, 'plannedAmount', e.target.value)}
                        min={0}
                        style={{ width: 100 }}
                    />
                    <button type="button" onClick={() => removeCategory(i)}>×</button>
                </div>
            ))}
            <button type="button" onClick={addCategory} style={{ marginBottom: '0.75rem' }}>+ Add Category</button>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit">{initialData ? 'Save Changes' : 'Create Budget'}</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}
