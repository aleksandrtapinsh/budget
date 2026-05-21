// Props:
//   transactions  – array of transaction objects
//   onEdit        – (transaction) => void
//   onDelete      – (id) => void

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <p>No transactions yet.</p>;
  }

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {transactions.map((tx) => (
        <li key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280', fontSize: 13, minWidth: 90 }}>{new Date(tx.date).toLocaleDateString()}</span>
          <span style={{ textTransform: 'capitalize', fontSize: 12, background: tx.type === 'income' ? '#dcfce7' : '#fee2e2', color: tx.type === 'income' ? '#16a34a' : '#dc2626', padding: '1px 6px', borderRadius: 99 }}>{tx.type}</span>
          <span style={{ textTransform: 'capitalize', flex: 1 }}>{tx.category}{tx.description ? ` — ${tx.description}` : ''}</span>
          <span style={{ fontWeight: 600, color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
            {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
          </span>
          <button onClick={() => onEdit(tx)}>Edit</button>
          <button onClick={() => onDelete(tx._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
