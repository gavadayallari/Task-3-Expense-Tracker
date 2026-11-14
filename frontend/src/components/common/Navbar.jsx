import React from 'react';
import { Menu, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onOpenSidebar, onOpenNewTransaction, title, subtitle }) => {
  const { user } = useAuth();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {title || 'Financial Dashboard'}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-600 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Date and Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-slate-600 font-medium hidden md:inline-block bg-slate-100 px-3 py-1.5 rounded-full">
            {formattedDate}
          </span>

          <button
            onClick={() => onOpenNewTransaction('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-sm"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span> Income
          </button>

          <button
            onClick={() => onOpenNewTransaction('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shadow-sm"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span> Expense
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
