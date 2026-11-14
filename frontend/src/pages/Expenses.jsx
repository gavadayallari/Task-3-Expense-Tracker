import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Plus,
  CreditCard,
  TrendingDown,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import StatCard from '../components/common/StatCard';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionFormModal from '../components/transactions/TransactionFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Expenses = () => {
  const { formatCurrency } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    order: 'desc'
  });

  // Modal and Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        type: 'expense',
        search: filters.search,
        category: filters.category !== 'All' ? filters.category : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        order: filters.order
      };

      const res = await transactionService.getTransactions(params);
      if (res.success) {
        setExpenses(res.data);
        setTotalCount(res.total);
      }
    } catch (error) {
      console.error('Failed to load expense records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      order: 'desc'
    });
  };

  const handleOpenAddModal = () => {
    setSelectedTx(null);
    setModalOpen(true);
  };

  const handleEditModal = (tx) => {
    setSelectedTx(tx);
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
      await fetchExpenses();
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
      await fetchExpenses();
    } finally {
      setActionLoading(false);
    }
  };

  // Expense Metrics
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const avgExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;
  const highestExpense = expenses.reduce(
    (max, curr) => (curr.amount > max ? curr.amount : max),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            Expense Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor everyday expenses, utilities, dining, travel and shopping outlays
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-rose-600/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Expense Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          amount={formatCurrency(totalAmount)}
          subtitle="Matching current filter"
          icon={CreditCard}
          variant="expense"
        />
        <StatCard
          title="Average Expense"
          amount={formatCurrency(avgExpense)}
          subtitle="Per recorded transaction"
          icon={TrendingDown}
          variant="default"
        />
        <StatCard
          title="Highest Expense"
          amount={formatCurrency(highestExpense)}
          subtitle="Single largest transaction"
          icon={AlertCircle}
          variant="default"
        />
        <StatCard
          title="Total Records"
          amount={totalCount}
          subtitle="Expense entries logged"
          icon={Layers}
          variant="default"
        />
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        showTypeFilter={false}
      />

      {/* Expenses Table */}
      <TransactionTable
        transactions={expenses}
        loading={loading}
        onEdit={handleEditModal}
        onDelete={(tx) => setConfirmDeleteTx(tx)}
        emptyMessage="No expense entries matching your filters"
      />

      {/* Modals */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleFormSubmit}
        initialType="expense"
        transactionToEdit={selectedTx}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteTx}
        onClose={() => setConfirmDeleteTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense Record"
        message={`Are you sure you want to delete "${confirmDeleteTx?.title}" (${formatCurrency(
          confirmDeleteTx?.amount
        )})?`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Expenses;
