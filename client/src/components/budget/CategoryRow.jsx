// Renders a single category's planned vs. actual spending as a progress bar row.
// Props:
//   category      – String
//   plannedAmount – Number
//   totalSpent    – Number
//   remaining     – Number
//   percentUsed   – Number

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CategoryRow({ category, plannedAmount, totalSpent, remaining, percentUsed }) {
  const barColor = percentUsed >= 100 ? '#dc2626' : percentUsed >= 75 ? '#d97706' : '#16a34a';
  const clamped = Math.min(percentUsed, 100);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{category}</span>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{fmt(totalSpent)} / {fmt(plannedAmount)}</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${clamped}%`, background: barColor, borderRadius: 99 }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 2, color: remaining < 0 ? '#dc2626' : '#6b7280' }}>
        {remaining < 0 ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
      </div>
    </div>
  );
}
