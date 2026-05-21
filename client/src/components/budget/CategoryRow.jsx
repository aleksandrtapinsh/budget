const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CategoryRow({ category, plannedAmount, totalSpent, remaining, percentUsed }) {
  const clamped = Math.min(percentUsed, 100);
  const barColor = percentUsed >= 100 ? 'bg-red-500' : percentUsed >= 75 ? 'bg-yellow-500' : 'bg-green-500';
  const overBudget = remaining < 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
        <span className="text-sm text-gray-500">{fmt(totalSpent)} / {fmt(plannedAmount)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
      <p className={`text-xs mt-1 ${overBudget ? 'text-red-500' : 'text-gray-400'}`}>
        {overBudget ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
      </p>
    </div>
  );
}
