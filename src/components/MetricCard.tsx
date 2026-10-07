import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  inverseTrendColor?: boolean;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber' | 'rose';
  subtitle?: string;
}

export const formatINR = (val: number | string): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  isCurrency = true,
  change,
  changeLabel,
  inverseTrendColor = false,
  icon: Icon,
  color = 'emerald',
  subtitle,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
      gradient: 'from-emerald-500/10 to-teal-500/5',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/60 dark:border-blue-800/40',
      gradient: 'from-blue-500/10 to-cyan-500/5',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200/60 dark:border-indigo-800/40',
      gradient: 'from-indigo-500/10 to-violet-500/5',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/60 dark:border-purple-800/40',
      gradient: 'from-purple-500/10 to-fuchsia-500/5',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      gradient: 'from-amber-500/10 to-orange-500/5',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200/60 dark:border-rose-800/40',
      gradient: 'from-rose-500/10 to-pink-500/5',
    },
  }[color];

  // Determine trend color
  let trendColorClass = 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  if (change !== undefined && change !== 0) {
    const isPositive = change > 0;
    const isGood = inverseTrendColor ? !isPositive : isPositive;
    trendColorClass = isGood
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50'
      : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50';
  }

  const displayValue = isCurrency && typeof value === 'number' ? formatINR(value) : value;

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorStyles.gradient} rounded-bl-full pointer-events-none`} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl ${colorStyles.bg} ${colorStyles.text} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {displayValue}
        </h2>

        {change !== undefined && (
          <div className="flex items-center space-x-1.5 pt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${trendColorClass}`}
            >
              {change > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            {changeLabel && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{changeLabel}</span>
            )}
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
