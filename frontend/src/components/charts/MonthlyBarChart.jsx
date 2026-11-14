import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5">
        <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Income:
          </span>
          <span className="font-bold text-slate-900">
            {formatCurrency(payload[0]?.value)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-medium text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Expenses:
          </span>
          <span className="font-bold text-slate-900">
            {formatCurrency(payload[1]?.value)}
          </span>
        </div>
        {payload[0] && payload[1] && (
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-500">Net Savings:</span>
            <span
              className={`font-extrabold ${
                payload[0].value - payload[1].value >= 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {formatCurrency(payload[0].value - payload[1].value)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const MonthlyBarChart = ({ data = [], height = 300 }) => {
  const { formatCurrency } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No monthly data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => {
              if (val >= 100000) return `${(val / 1000).toFixed(0)}k`;
              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
              return val;
            }}
          />
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="Expense"
            dataKey="expense"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
