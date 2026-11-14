import React from 'react';

const StatCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default',
  badgeText,
  badgeType = 'neutral'
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      amountColor: 'text-slate-900',
    },
    income: {
      bg: 'bg-white',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600',
      amountColor: 'text-emerald-600',
    },
    expense: {
      bg: 'bg-white',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600',
      amountColor: 'text-rose-600',
    },
    highlight: {
      bg: 'bg-gradient-to-br from-brand-600 to-indigo-700 text-white',
      border: 'border-transparent',
      iconBg: 'bg-white/20 text-white',
      amountColor: 'text-white',
      subtitleColor: 'text-indigo-100',
      titleColor: 'text-indigo-100'
    }
  };

  const style = variantStyles[variant] || variantStyles.default;
  const isHighlight = variant === 'highlight';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md ${style.bg} ${style.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isHighlight ? style.titleColor : 'text-slate-600'}`}>
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.amountColor}`}>
          {amount}
        </h3>
        {badgeText && (
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              badgeType === 'positive'
                ? 'bg-emerald-100 text-emerald-800'
                : badgeType === 'negative'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`text-xs mt-2 font-medium ${isHighlight ? style.subtitleColor : 'text-slate-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
