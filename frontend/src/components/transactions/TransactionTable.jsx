import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Inbox,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TransactionTable = ({
  transactions = [],
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = 'No transactions recorded yet'
}) => {
  const { formatCurrency } = useAuth();

  const getCategoryColor = (category, type) => {
    if (type === 'income') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    const colors = {
      Food: 'bg-orange-50 text-orange-700 border-orange-200',
      Travel: 'bg-blue-50 text-blue-700 border-blue-200',
      Shopping: 'bg-purple-50 text-purple-700 border-purple-200',
      Bills: 'bg-amber-50 text-amber-700 border-amber-200',
      Education: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Health: 'bg-red-50 text-red-700 border-red-200',
      Entertainment: 'bg-pink-50 text-pink-700 border-pink-200',
      Other: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return colors[category] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">{emptyMessage}</h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Start recording your income and expenses to keep track of your cash flow and financial health.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-6">Transaction</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <tr
                  key={tx._id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Title & Icon */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {tx.title}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-slate-600 truncate max-w-xs">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                        tx.category,
                        tx.type
                      )}`}
                    >
                      <Tag className="w-3 h-3" />
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formattedDate}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-bold text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        title="Delete transaction"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div key={tx._id} className="p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {tx.title}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(
                        tx.category,
                        tx.type
                      )}`}
                    >
                      {tx.category}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-bold text-sm block ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[11px] text-slate-600 flex items-center justify-end gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </div>
              </div>

              {tx.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  {tx.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                <button
                  onClick={() => onEdit(tx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;
