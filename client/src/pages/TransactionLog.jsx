import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import TransactionList from '../components/transactions/TransactionList.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionFilter from '../components/transactions/TransactionFilter.jsx';
import CsvImportModal from '../components/transactions/CsvImportModal.jsx';
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
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchBudgets(); }, []);
  useEffect(() => { getTransactions(filters).then(setTransactions); }, [filters]);

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

  const handleCsvImport = async (rows) => {
    const created = await Promise.all(rows.map(r => createTransaction(r)));
    setTransactions((prev) => [...created.reverse(), ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Transactions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Import CSV
            </button>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {showForm && (
          <TransactionForm
            initialData={editing}
            budgets={budgets}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}

        <TransactionFilter filters={filters} budgets={budgets} onChange={setFilters} />

        <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5">
          <TransactionList
            transactions={transactions}
            onEdit={(tx) => { setEditing(tx); setShowForm(true); }}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {showImport && (
        <CsvImportModal
          budgets={budgets}
          onClose={() => setShowImport(false)}
          onImport={handleCsvImport}
        />
      )}
    </div>
  );
}
