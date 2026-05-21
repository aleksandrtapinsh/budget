const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function BudgetCard({ budget, summary, onSelect, onDelete }) {
  const totalPlanned = summary.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const totalSpent = summary.reduce((sum, cat) => sum + cat.totalSpent, 0);
  const overallPercent = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  const clamped = Math.min(overallPercent, 100);
  const barColor = overallPercent >= 100 ? 'bg-red-500' : overallPercent >= 75 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div
      onClick={onSelect}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition w-56"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-400">{MONTH_NAMES[budget.month - 1]} {budget.year}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{budget.name}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-gray-300 hover:text-red-400 text-lg leading-none"
          aria-label="Delete budget"
        >
          ×
        </button>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{fmt(totalSpent)} spent</span>
        <span>of {fmt(totalPlanned)}</span>
      </div>
    </div>
  );
}
