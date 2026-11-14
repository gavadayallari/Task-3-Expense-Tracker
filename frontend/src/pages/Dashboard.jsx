import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import StatCard from '../components/common/StatCard';
import TransactionTable from '../components/transactions/TransactionTable';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TransactionFormModal from '../components/transactions/TransactionFormModal';

const Dashboard = () => {
  const { user, formatCurrency } = useAuth();

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        transactionService.getDashboardSummary(),
        transactionService.getMonthlyReport(6),
        transactionService.getCategoryReport('expense')
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (monthlyRes.success) setMonthlyData(monthlyRes.data);
      if (categoryRes.success) setCategoryData(categoryRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenModal = (type = 'expense', tx = null) => {
    setTransactionType(type);
    setSelectedTx(tx);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data, id) => {
    setActionLoading(true);
    try {
      if (id) {
        await transactionService.updateTransaction(id, data);
      } else {
        await transactionService.createTransaction(data);
      }
      setModalOpen(false);
      setSelectedTx(null);
      await fetchDashboardData();
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
      await fetchDashboardData();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-indigo-100 text-xs font-semibold backdrop-blur-md mb-2">
              Financial Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Explorer'}!
            </h2>
            <p className="text-sm text-indigo-100 mt-1 max-w-xl">
              Track your earnings, monitor daily expenditures, and analyze smart savings trends in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleOpenModal('income')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              onClick={() => handleOpenModal('expense')}
              className="px-4 py-2.5 bg-white text-brand-700 hover:bg-indigo-50 text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-black/10 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 -mb-10 w-48 h-48 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <StatCard
          title="Current Balance"
          amount={formatCurrency(summary?.balance || 0)}
          subtitle={`This Month: ${formatCurrency(summary?.thisMonth?.balance || 0)}`}
          icon={Wallet}
          variant="highlight"
          badgeText={summary?.balance >= 0 ? 'Surplus' : 'Deficit'}
          badgeType={summary?.balance >= 0 ? 'positive' : 'negative'}
        />

        {/* Total Income */}
        <StatCard
          title="Total Income"
          amount={formatCurrency(summary?.totalIncome || 0)}
          subtitle={`${summary?.transactionCounts?.income || 0} deposits recorded`}
          icon={ArrowDownLeft}
          variant="income"
          badgeText={`This mo: ${formatCurrency(summary?.thisMonth?.income || 0)}`}
          badgeType="positive"
        />

        {/* Total Expenses */}
        <StatCard
          title="Total Expenses"
          amount={formatCurrency(summary?.totalExpense || 0)}
          subtitle={`${summary?.transactionCounts?.expense || 0} expenses logged`}
          icon={ArrowUpRight}
          variant="expense"
          badgeText={`This mo: ${formatCurrency(summary?.thisMonth?.expense || 0)}`}
          badgeType="negative"
        />

        {/* Savings Rate */}
        <StatCard
          title="Savings Rate"
          amount={`${summary?.savingsRate || 0}%`}
          subtitle="Net savings / Total income"
          icon={TrendingUp}
          variant="default"
          badgeText={summary?.savingsRate > 20 ? 'Healthy' : 'Moderate'}
          badgeType={summary?.savingsRate > 20 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Income & Expenses
              </h3>
              <p className="text-xs text-slate-500">
                Cash flow analysis across recent months
              </p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MonthlyBarChart data={monthlyData} height={280} />
        </div>

        {/* Expense by Category Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Expense Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution across categories</p>
            </div>
          </div>
          <CategoryPieChart data={categoryData} height={280} />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Latest financial activity recorded on your account
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <span>See All ({summary?.transactionCounts?.total || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TransactionTable
          transactions={summary?.recentTransactions || []}
          loading={loading}
          onEdit={(tx) => handleOpenModal(tx.type, tx)}
          onDelete={(tx) => setConfirmDeleteTx(tx)}
          emptyMessage="No recent transactions yet"
        />
      </div>

      {/* Modals */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleModalSubmit}
        initialType={transactionType}
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

export default Dashboard;
