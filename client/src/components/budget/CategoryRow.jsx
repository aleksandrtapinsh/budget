const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CategoryRow({ category, plannedAmount, totalSpent, remaining, color }) {
  const overBudget = remaining < 0;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-700 last:border-0">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color ?? '#10b981' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 capitalize truncate">{category}</p>
        <p className={`text-xs ${overBudget ? 'text-red-400' : 'text-gray-500'}`}>
          {overBudget ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-100">{fmt(totalSpent)}</p>
        <p className="text-xs text-gray-500">of {fmt(plannedAmount)}</p>
      </div>
    </div>
  );
}
