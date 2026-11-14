import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-slate-600">
          Monthly Savings:{' '}
          <span
            className={`font-bold ${
              val >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(val)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const TrendAreaChart = ({ data = [], height = 260 }) => {
  const { formatCurrency } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-xs text-slate-400">
        No trend data available
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#savingsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendAreaChart;
