const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CategoryRow({ category, plannedAmount, totalSpent, remaining, color }) {
  const overBudget = remaining < 0;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color ?? '#6366f1' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 capitalize truncate">{category}</p>
        <p className={`text-xs ${overBudget ? 'text-red-500' : 'text-gray-400'}`}>
          {overBudget ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-800">{fmt(totalSpent)}</p>
        <p className="text-xs text-gray-400">of {fmt(plannedAmount)}</p>
      </div>
    </div>
  );
}
