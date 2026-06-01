import { useState, useRef, useEffect } from 'react';

// ── CSV parsing ──────────────────────────────────────────────────────────────

function parseLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { fields.push(field.trim()); field = ''; }
    else { field += c; }
  }
  fields.push(field.trim());
  return fields;
}

function parseAmount(raw) {
  return parseFloat(raw.replace(/[$, ]/g, ''));
}

function parseTransactionCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('Empty CSV');

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
  const idx = {
    date:   headers.findIndex(h => h === 'date'),
    desc:   headers.findIndex(h => ['description', 'memo', 'name', 'transaction', 'details'].includes(h)),
    amt:    headers.findIndex(h => h === 'amount'),
    debit:  headers.findIndex(h => ['debit', 'debit amount', 'withdrawal', 'withdrawals'].includes(h)),
    credit: headers.findIndex(h => ['credit', 'credit amount', 'deposit', 'deposits'].includes(h)),
    type:   headers.findIndex(h => ['type', 'transaction type', 'credit/debit', 'debit/credit', 'dr/cr'].includes(h)),
  };
  if (idx.date === -1) throw new Error('Missing required column: Date');
  const hasSplitCols = idx.debit !== -1 && idx.credit !== -1;
  if (!hasSplitCols && idx.amt === -1) throw new Error('Missing required column: Amount (or Debit/Credit columns)');

  return lines.slice(1).flatMap(line => {
    const f = parseLine(line);

    const [month, day, year] = (f[idx.date] ?? '').split('/');
    const date = `${year}-${month?.padStart(2,'0')}-${day?.padStart(2,'0')}`;
    if (!date || date === 'undefined-undefined-undefined') return [];

    const description = idx.desc !== -1 ? (f[idx.desc] ?? '').trim() : '';

    let amount, type;

    if (hasSplitCols) {
      const debitVal  = parseAmount(f[idx.debit]  ?? '');
      const creditVal = parseAmount(f[idx.credit] ?? '');
      const isDebit   = !isNaN(debitVal)  && debitVal  > 0;
      const isCredit  = !isNaN(creditVal) && creditVal > 0;
      if (!isDebit && !isCredit) return [];
      amount = isDebit ? debitVal : creditVal;
      type   = isCredit ? 'income' : 'expense';
    } else {
      const amtRaw   = f[idx.amt] ?? '';
      const amtClean = amtRaw.replace(/[$, ]/g, '');
      amount = Math.abs(parseFloat(amtClean));
      if (isNaN(amount) || amount === 0) return [];

      if (idx.type !== -1) {
        const tv = (f[idx.type] ?? '').toLowerCase().trim();
        type = (tv === 'credit' || tv === 'income' || tv === 'deposit' || tv === 'cr') ? 'income' : 'expense';
      } else {
        type = amtClean.startsWith('-') ? 'expense' : 'income';
      }
    }

    return [{ date, description, amount, type }];
  });
}

// ── Auto-suggest categories ──────────────────────────────────────────────────

const HINTS = [
  { kw: ['taco bell','mcdonald','qdoba','chick-fil-a','noodles','chipotle','burger','wendy','pizza','panera','starbucks','subway','waffle'], cats: ['dining out','dining','food','restaurants'] },
  { kw: ['marathon','speedway','shell','bp ','sunoco','exxon','mobil','fuel','wayne trace expr'], cats: ['transportation','gas','fuel','auto'] },
  { kw: ['discord','netflix','spotify','hulu','steam','xbox','playstation','twitch'], cats: ['entertainment','subscriptions','streaming'] },
  { kw: ['google','apple','amazon','claude.ai','anthropic'], cats: ['subscriptions','entertainment','technology'] },
  { kw: ['robinhood','coinbase','fidelity','vanguard','etrade'], cats: ['savings','investments','investing'] },
  { kw: ['insurance','gerber','allstate','geico','state farm','fort4fitnes','fitness','gym','planet fitness'], cats: ['healthcare','insurance','fitness'] },
  { kw: ['walmart','kroger','meijer','aldi','target','whole foods','trader joe','publix'], cats: ['groceries','food','shopping'] },
  { kw: ['electric','utility','comcast','at&t','att','verizon','t-mobile','spectrum','water bill'], cats: ['utilities','bills'] },
  { kw: ['discover','americanexpress','american express','chase','capital one','first financial'], cats: ['bills','utilities','credit card'] },
  { kw: ['dicks sporting','dick\'s spo','sporting good'], cats: ['shopping','entertainment'] },
  { kw: ['cash app','venmo','zelle','paypal'], cats: ['transfer','other'] },
];

function suggestCategory(description, categoryNames) {
  if (!categoryNames.length) return '';
  const desc = description.toLowerCase();
  for (const { kw, cats } of HINTS) {
    if (kw.some(k => desc.includes(k))) {
      for (const c of cats) {
        const match = categoryNames.find(n => n.toLowerCase().includes(c) || c.includes(n.toLowerCase()));
        if (match) return match;
      }
    }
  }
  return '';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CsvImportModal({ budgets, onClose, onImport }) {
  const [step, setStep]   = useState('upload'); // 'upload' | 'review'
  const [rows, setRows]   = useState([]);
  const [budgetId, setBudgetId] = useState('');
  const [bulkCat, setBulkCat]   = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef();

  const selectedBudget   = budgets.find(b => b._id === budgetId);
  const categoryNames    = selectedBudget?.categories.map(c => c.name) ?? [];
  const includedRows     = rows.filter(r => r.include);
  const allChecked       = rows.length > 0 && rows.every(r => r.include);
  const missingCategory  = includedRows.some(r => r.type === 'expense' && !r.category);

  // Auto-suggest when budget changes
  useEffect(() => {
    if (!categoryNames.length) return;
    setRows(prev => prev.map(r => ({
      ...r,
      category: r.category || suggestCategory(r.description, categoryNames),
    })));
  }, [budgetId]);

  // Apply bulk category
  useEffect(() => {
    if (!bulkCat) return;
    setRows(prev => prev.map(r => (r.include && r.type === 'expense') ? { ...r, category: bulkCat } : r));
    setBulkCat('');
  }, [bulkCat]);

  function handleFile(file) {
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseTransactionCSV(e.target.result);
        if (!parsed.length) { setError('No valid transactions found in this file.'); return; }
        setRows(parsed.map((r, i) => ({ ...r, id: i, include: true, category: '' })));
        setStep('review');
      } catch (err) {
        setError(err.message || 'Failed to parse CSV.');
      }
    };
    reader.readAsText(file);
  }

  function toggleRow(id) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, include: !r.include } : r));
  }

  function setRowCategory(id, category) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, category } : r));
  }

  function toggleAll() {
    setRows(prev => prev.map(r => ({ ...r, include: !allChecked })));
  }

  function toggleRowType(id) {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const newType = r.type === 'expense' ? 'income' : 'expense';
      return { ...r, type: newType, category: newType === 'income' ? '' : r.category };
    }));
  }

  async function handleImport() {
    if (!budgetId) { setError('Please select a budget.'); return; }
    if (missingCategory) { setError('All included transactions need a category.'); return; }
    setError('');
    setImporting(true);
    try {
      await onImport(includedRows.map(r => ({
        budgetId,
        category: r.type === 'income' ? (r.category || 'income') : r.category,
        amount: r.amount,
        date: r.date,
        description: r.description,
        type: r.type,
      })));
      onClose();
    } catch {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  const inputCls = 'bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  // ── Upload step ────────────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-100">Import Transactions</h2>
              <p className="text-sm text-gray-500 mt-0.5">Upload a CSV from your bank</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2 mb-4">{error}</p>}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-600 hover:border-emerald-600 hover:bg-gray-700/50'}`}
          >
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-300 font-medium">Drop your CSV here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          <p className="text-xs text-gray-600 mt-4 text-center">
            Columns: Date, Description, Amount — or Debit/Credit split columns
          </p>

          <button onClick={onClose} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Review step ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-100">Review Transactions</h2>
              <p className="text-sm text-gray-500">
                {rows.length} found · {includedRows.length} selected
                {includedRows.some(r => r.type === 'income') && (
                  <span className="ml-2 text-emerald-500">{includedRows.filter(r => r.type === 'income').length} income</span>
                )}
                <span className="ml-2 text-gray-600 text-xs">· click amount to toggle type</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Budget selector */}
            <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)} className={inputCls + ' flex-1 min-w-40'}>
              <option value="">Select budget…</option>
              {budgets.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>

            {/* Bulk category */}
            <select
              value={bulkCat}
              onChange={(e) => setBulkCat(e.target.value)}
              disabled={!budgetId || !categoryNames.length}
              className={inputCls + ' flex-1 min-w-40'}
            >
              <option value="">Set category for all selected…</option>
              {categoryNames.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>

            {/* Toggle all */}
            <button onClick={toggleAll} className="text-sm text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg whitespace-nowrap">
              {allChecked ? 'Uncheck all' : 'Check all'}
            </button>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2 mt-3">{error}</p>}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {rows.map((row) => {
            const missing = row.include && row.type === 'expense' && !row.category;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 py-2.5 border-b border-gray-700 last:border-0 ${!row.include ? 'opacity-40' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={row.include}
                  onChange={() => toggleRow(row.id)}
                  className="accent-emerald-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{formatDate(row.date)}</span>
                <span className="text-sm text-gray-300 flex-1 min-w-0 truncate" title={row.description}>
                  {row.description}
                </span>
                <button
                  type="button"
                  onClick={() => row.include && toggleRowType(row.id)}
                  title="Click to toggle income / expense"
                  className={`text-sm font-semibold flex-shrink-0 w-20 text-right rounded px-1 transition-opacity ${row.include ? 'cursor-pointer hover:opacity-70' : 'cursor-default'} ${row.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {row.type === 'income' ? '+' : '-'}{fmt(row.amount)}
                </button>
                {row.type === 'income' ? (
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700 rounded-lg px-2 py-1.5 flex-shrink-0 w-36 text-center">
                    Income
                  </span>
                ) : (
                  <select
                    value={row.category}
                    onChange={(e) => setRowCategory(row.id, e.target.value)}
                    disabled={!row.include || !budgetId}
                    className={`text-sm rounded-lg px-2 py-1.5 flex-shrink-0 w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500 border ${missing ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-gray-700 border-gray-600 text-gray-100'}`}
                  >
                    <option value="">Category…</option>
                    {categoryNames.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !includedRows.length || !budgetId}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium"
          >
            {importing ? 'Importing…' : `Import ${includedRows.length} transaction${includedRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
