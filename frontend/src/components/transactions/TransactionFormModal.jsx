import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'Entertainment', 'Other'];

const TransactionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialType = 'expense',
  transactionToEdit = null,
  loading = false
}) => {
  const { user } = useAuth();
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Sync state when opening or when transactionToEdit changes
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setTitle(transactionToEdit.title || '');
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : '');
      setCategory(transactionToEdit.category || (transactionToEdit.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]));
      setDate(
        transactionToEdit.date
          ? new Date(transactionToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(transactionToEdit.description || '');
      setError('');
    } else {
      setType(initialType);
      setTitle('');
      setAmount('');
      setCategory(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setError('');
    }
  }, [transactionToEdit, initialType, isOpen]);

  // Handle Type switch
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date(date).toISOString(),
      description: description.trim()
    };

    try {
      await onSubmit(payload, transactionToEdit?._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving transaction');
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : `Add New ${type === 'income' ? 'Income' : 'Expense'}`}
      subtitle="Fill in the details below to log your transaction"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        {!transactionToEdit && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Title / Note <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={type === 'income' ? 'e.g., Auspify Salary' : 'e.g., Grocery Shopping'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Amount & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ({user?.currency || 'INR'}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                {user?.currency === 'USD' ? '$' : '₹'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows="2"
            placeholder="Add any extra notes or memo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{transactionToEdit ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;
