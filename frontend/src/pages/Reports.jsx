import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  Coins,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import StatCard from '../components/common/StatCard';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TrendAreaChart from '../components/charts/TrendAreaChart';

const Reports = () => {
  const { formatCurrency } = useAuth();

  const [monthsCount, setMonthsCount] = useState(6);
  const [categoryType, setCategoryType] = useState('expense');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const [monthlyRes, categoryRes, overviewRes] = await Promise.all([
        transactionService.getMonthlyReport(monthsCount),
        transactionService.getCategoryReport(categoryType, params),
        transactionService.getAnalyticsOverview(params)
      ]);

      if (monthlyRes.success) setMonthlyData(monthlyRes.data);
      if (categoryRes.success) setCategoryData(categoryRes.data);
      if (overviewRes.success) setOverview(overviewRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [monthsCount, categoryType, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <PieIcon className="w-5 h-5" />
            </span>
            Financial Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deep-dive financial diagnostics, category breakdown, and net savings performance
          </p>
        </div>

        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">History:</span>
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonthsCount(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                monthsCount === m
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Filter Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
          />
          <span className="text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* Key Analytical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Savings"
          amount={formatCurrency(overview?.netSavings || 0)}
          subtitle={`Savings Ratio: ${overview?.savingsRatio || 0}%`}
          icon={TrendingUp}
          variant="highlight"
          badgeText={overview?.netSavings >= 0 ? 'Surplus' : 'Deficit'}
          badgeType={overview?.netSavings >= 0 ? 'positive' : 'negative'}
        />

        <StatCard
          title="Total Inflow"
          amount={formatCurrency(overview?.totalIncome || 0)}
          subtitle={`Avg: ${formatCurrency(overview?.avgIncome || 0)} / deposit`}
          icon={Coins}
          variant="income"
        />

        <StatCard
          title="Total Outflow"
          amount={formatCurrency(overview?.totalExpense || 0)}
          subtitle={`Avg: ${formatCurrency(overview?.avgExpense || 0)} / purchase`}
          icon={CreditCard}
          variant="expense"
        />

        <StatCard
          title="Financial Health"
          amount={
            (overview?.savingsRatio || 0) >= 30
              ? 'Excellent'
              : (overview?.savingsRatio || 0) >= 15
              ? 'Good'
              : 'Attention'
          }
          subtitle="Based on savings margin"
          icon={ShieldCheck}
          variant="default"
          badgeText={`${overview?.savingsRatio || 0}% saved`}
          badgeType={(overview?.savingsRatio || 0) >= 20 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Income vs. Expense Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Performance across past {monthsCount} recorded months
              </p>
            </div>
          </div>
          <MonthlyBarChart data={monthlyData} height={300} />
        </div>

        {/* Category Breakdown with Toggle */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Proportional spend analysis</p>
            </div>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setCategoryType('expense')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  categoryType === 'expense'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setCategoryType('income')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  categoryType === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>
          <CategoryPieChart data={categoryData} height={280} />
        </div>
      </div>

      {/* Savings Trend Area Chart & Key Outliers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Savings Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Monthly Net Savings Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Positive cash balance generated each month
            </p>
          </div>
          <TrendAreaChart data={monthlyData} height={260} />
        </div>

        {/* Outlier Insights Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Key Financial Highlights</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top outliers in your records</p>
          </div>

          <div className="space-y-3">
            {/* Highest Income */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Largest Income
                </span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {overview?.highestIncome?.title || 'None recorded'}
                </p>
                <p className="text-sm font-extrabold text-emerald-600 mt-0.5">
                  {formatCurrency(overview?.highestIncome?.amount || 0)}
                </p>
              </div>
            </div>

            {/* Highest Expense */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  Largest Single Expense
                </span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {overview?.highestExpense?.title || 'None recorded'}
                </p>
                <p className="text-sm font-extrabold text-rose-600 mt-0.5">
                  {formatCurrency(overview?.highestExpense?.amount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Recommendation:</span> Maintaining a savings ratio of 20% or higher puts you in the top tier of disciplined personal budgeting.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
