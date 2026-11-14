import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const COLORS = [
  '#f97316', // Orange - Food
  '#3b82f6', // Blue - Travel
  '#a855f7', // Purple - Shopping
  '#f59e0b', // Amber - Bills
  '#06b6d4', // Cyan - Education
  '#ef4444', // Red - Health
  '#ec4899', // Pink - Entertainment
  '#10b981', // Emerald - Salary/Investments
  '#6366f1', // Indigo - Business/Other
  '#64748b'  // Slate
];

const CustomTooltip = ({ active, payload, formatCurrency }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: payload[0].fill }}
          />
          {item.category}
        </p>
        <p className="text-slate-600">
          Amount: <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
        </p>
        <p className="text-slate-600">
          Share: <span className="font-bold text-slate-900">{item.percentage}%</span> ({item.count} items)
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data = [], height = 300 }) => {
  const { formatCurrency } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No expense category records found
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            layout="horizontal"
            wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
