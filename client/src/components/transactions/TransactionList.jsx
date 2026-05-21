const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {transactions.map((tx) => (
        <li key={tx._id} className="flex items-center gap-4 py-3">
          <span className="text-xs text-gray-400 w-24 shrink-0">{new Date(tx.date).toLocaleDateString()}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {tx.type}
          </span>
          <span className="text-sm text-gray-700 capitalize flex-1 truncate">
            {tx.category}{tx.description ? ` — ${tx.description}` : ''}
          </span>
          <span className={`text-sm font-semibold shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
            {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
          </span>
          <button onClick={() => onEdit(tx)} className="text-xs text-gray-400 hover:text-indigo-600">Edit</button>
          <button onClick={() => onDelete(tx._id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
        </li>
      ))}
    </ul>
  );
}
