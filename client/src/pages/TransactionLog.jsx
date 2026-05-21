import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import TransactionList from '../components/transactions/TransactionList.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionFilter from '../components/transactions/TransactionFilter.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService.js';

export default function TransactionLog() {
  const { budgets, fetchBudgets } = useBudget();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    getTransactions(filters).then(setTransactions);
  }, [filters]);

  const handleCreate = async (data) => {
    const created = await createTransaction(data);
    setTransactions((prev) => [created, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    const updated = await updateTransaction(editing._id, data);
    setTransactions((prev) => prev.map((tx) => (tx._id === editing._id ? updated : tx)));
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Transactions</h1>
          <button onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Transaction</button>
        </div>

        {showForm && (
          <TransactionForm
            initialData={editing}
            budgets={budgets}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}

        <TransactionFilter
          filters={filters}
          budgets={budgets}
          onChange={setFilters}
        />

        <TransactionList
          transactions={transactions}
          onEdit={(tx) => { setEditing(tx); setShowForm(true); }}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
}
