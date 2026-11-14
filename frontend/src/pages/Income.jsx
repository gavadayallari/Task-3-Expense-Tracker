import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Coins,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import StatCard from '../components/common/StatCard';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionFormModal from '../components/transactions/TransactionFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Income = () => {
  const { formatCurrency } = useAuth();

  const [incomes, setIncomes] = useState([]);
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

  // Load Incomes
  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const params = {
        type: 'income',
        search: filters.search,
        category: filters.category !== 'All' ? filters.category : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        order: filters.order
      };

      const res = await transactionService.getTransactions(params);
      if (res.success) {
        setIncomes(res.data);
        setTotalCount(res.total);
      }
    } catch (error) {
      console.error('Failed to load income records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
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
      await fetchIncomes();
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
      await fetchIncomes();
    } finally {
      setActionLoading(false);
    }
  };

  // Income Metrics
  const totalAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const avgIncome = incomes.length > 0 ? totalAmount / incomes.length : 0;

  // Find top category
  const categoryCounts = {};
  incomes.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + i.amount;
  });
  const topCategory = Object.keys(categoryCounts).reduce((a, b) =>
    categoryCounts[a] > categoryCounts[b] ? a : b,
    incomes.length > 0 ? incomes[0]?.category : 'None'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            Income Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track salaries, freelance retainers, investment returns, and revenue streams
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Income</span>
        </button>
      </div>

      {/* Income Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          amount={formatCurrency(totalAmount)}
          subtitle="Matching current filter"
          icon={Coins}
          variant="income"
        />
        <StatCard
          title="Average Deposit"
          amount={formatCurrency(avgIncome)}
          subtitle="Per recorded transaction"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Top Source"
          amount={topCategory}
          subtitle={
            categoryCounts[topCategory]
              ? formatCurrency(categoryCounts[topCategory])
              : 'N/A'
          }
          icon={Award}
          variant="default"
        />
        <StatCard
          title="Total Records"
          amount={totalCount}
          subtitle="Income entries logged"
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

      {/* Income Transactions Table */}
      <TransactionTable
        transactions={incomes}
        loading={loading}
        onEdit={handleEditModal}
        onDelete={(tx) => setConfirmDeleteTx(tx)}
        emptyMessage="No income entries matching your filters"
      />

      {/* Modals */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleFormSubmit}
        initialType="income"
        transactionToEdit={selectedTx}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteTx}
        onClose={() => setConfirmDeleteTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Income Record"
        message={`Are you sure you want to delete "${confirmDeleteTx?.title}" (${formatCurrency(
          confirmDeleteTx?.amount
        )})?`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Income;
