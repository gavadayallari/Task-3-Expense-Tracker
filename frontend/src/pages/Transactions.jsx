import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionFormModal from '../components/transactions/TransactionFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Transactions = () => {
  const { formatCurrency, user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: 'All',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    order: 'desc'
  });

  // Modal and Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        type: filters.type || undefined,
        search: filters.search || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        order: filters.order
      };

      const res = await transactionService.getTransactions(params);
      if (res.success) {
        setTransactions(res.data);
        setTotalRecords(res.total);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: 'All',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      order: 'desc'
    });
  };

  const handleOpenAdd = (type = 'expense') => {
    setModalType(type);
    setSelectedTx(null);
    setModalOpen(true);
  };

  const handleEdit = (tx) => {
    setSelectedTx(tx);
    setModalType(tx.type);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data, id) => {
    setActionLoading(true);
    try {
      if (id) {
        await transactionService.updateTransaction(id, data);
      } else {
        await transactionService.createTransaction(data);
      }
      setModalOpen(false);
      setSelectedTx(null);
      await fetchTransactions();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteTx) return;
    setActionLoading(true);
    try {
      await transactionService.deleteTransaction(confirmDeleteTx._id);
      setConfirmDeleteTx(null);
      await fetchTransactions();
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Title', 'Type', 'Category', 'Amount', 'Currency', 'Date', 'Description'];
    const rows = transactions.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      user?.currency || 'INR',
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finflow_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick sums for current filter view
  const currentIncomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const currentExpenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </span>
            All Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, categorize, and export your entire financial ledger
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-4">
          <span>Found {totalRecords} records</span>
          <span className="text-emerald-700">
            Total Inflow: {formatCurrency(currentIncomeTotal)}
          </span>
          <span className="text-rose-700">
            Total Outflow: {formatCurrency(currentExpenseTotal)}
          </span>
        </div>
      </div>

      {/* Multi-criteria Filters */}
      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        showTypeFilter={true}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(tx) => setConfirmDeleteTx(tx)}
        emptyMessage="No transactions match your current search or filters"
      />

      {/* Modals */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleFormSubmit}
        initialType={modalType}
        transactionToEdit={selectedTx}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteTx}
        onClose={() => setConfirmDeleteTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${confirmDeleteTx?.title}" (${formatCurrency(
          confirmDeleteTx?.amount
        )})?`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Transactions;
