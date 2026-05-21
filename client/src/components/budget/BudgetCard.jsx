// Displays a summary card for a single budget (e.g. "May 2025")
// Props:
//   budget     – { _id, name, month, year, categories }
//   summary    – [{ category, plannedAmount, totalSpent, remaining, percentUsed }]
//   onSelect   – () => void  (called when user clicks the card)
//   onDelete   – () => void

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetCard({ budget, summary, onSelect, onDelete }) {
    // TODO: calculate totals across all categories:
    //   totalPlanned = sum of plannedAmount
    //   totalSpent   = sum of totalSpent
    //   overallPercent = (totalSpent / totalPlanned) * 100

    const totalPlanned = summary.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const totalSpent = summary.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const overallPercent = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
    const clamped = Math.min(overallPercent, 100);

    const barColor =
        overallPercent >= 100 ? '#A32D2D' :
            overallPercent >= 75 ? '#BA7517' :
                '#3B6D11';

    const fmt = (n) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return (
        <div onClick={onSelect} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                        {MONTH_NAMES[budget.month - 1]} {budget.year}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '4px 0 0' }}>
                        {budget.name}
                    </p>
                </div>

                <button
                    aria-label="Delete budget"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                    <i classname="ti ti-trash" aria-hidden="true" />
                </button>
            </div>

            <div style={{ margin: '12px 0 6px' }}>
                <div style={{ height: 6, background: 'var(--color-background-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${clamped}%`, background: barColor, borderRadius: 99 }} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{fmt(totalSpent)} spent</span>
                <span style={{ color: 'var(--color-text-secondary)' }}> of {fmt(totalPlanned)}</span>
            </div>
            {/* TODO: render month/year heading and budget name */}
            {/* TODO: render overall progress bar (totalSpent / totalPlanned) */}
            {/* TODO: render totalSpent and totalPlanned amounts */}
            {/* TODO: render delete button (stop propagation so it doesn't trigger onSelect) */}
        </div >
    );
}
