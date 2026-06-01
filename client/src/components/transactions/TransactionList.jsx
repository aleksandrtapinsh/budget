const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <p className="text-sm text-gray-500 py-8 text-center">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-700">
      {transactions.map((tx) => (
        <li key={tx._id} className="flex items-center gap-4 py-3">
          <span className="text-xs text-gray-500 w-24 shrink-0">{new Date(tx.date).toLocaleDateString()}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
            {tx.type}
          </span>
          <span className="text-sm text-gray-300 capitalize flex-1 truncate">
            {tx.category}{tx.description ? ` — ${tx.description}` : ''}
          </span>
          <span className={`text-sm font-semibold shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
            {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
          </span>
          <button onClick={() => onEdit(tx)} className="text-xs text-gray-500 hover:text-emerald-400">Edit</button>
          <button onClick={() => onDelete(tx._id)} className="text-xs text-gray-500 hover:text-red-400">Delete</button>
        </li>
      ))}
    </ul>
  );
}
