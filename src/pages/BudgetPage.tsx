import React, { useState, useEffect } from 'react';
import {
  PieChart,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { Budget } from '../types';
import api from '../services/api';
import { formatINR, MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { BudgetModal } from '../components/BudgetModal';

export const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Month & Year state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.getBudgets(selectedMonth, selectedYear);
      if (res.success) {
        setBudgets(res.budgets || []);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleDeleteBudget = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this category budget limit?')) return;
    try {
      await api.deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Period Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Smart Budget Guard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Category thresholds with automated 80% warnings & 100% overspending telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none"
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md hover:shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set Category Limit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Budget Allocated"
          value={summary?.total_budgeted || 0}
          icon={PieChart}
          color="indigo"
          subtitle={`For ${monthNames[selectedMonth - 1]} ${selectedYear}`}
        />

        <MetricCard
          title="Actual Spent"
          value={summary?.total_spent || 0}
          icon={TrendingUp}
          color={summary?.overall_utilization_pct > 100 ? 'rose' : 'amber'}
          subtitle={`${summary?.overall_utilization_pct || 0}% overall utilization`}
        />

        <MetricCard
          title="Remaining Budget Pool"
          value={summary?.total_remaining || 0}
          icon={CheckCircle2}
          color={summary?.total_remaining >= 0 ? 'emerald' : 'rose'}
          subtitle={summary?.total_remaining >= 0 ? 'Safe margin available' : 'Budget exceeded!'}
        />

        <MetricCard
          title="Overspending State"
          value={
            summary?.overall_utilization_pct > 100
              ? 'Critical Overspend'
              : summary?.overall_utilization_pct >= 80
              ? 'Warning Zone'
              : 'Healthy Control'
          }
          isCurrency={false}
          icon={ShieldAlert}
          color={
            summary?.overall_utilization_pct > 100
              ? 'rose'
              : summary?.overall_utilization_pct >= 80
              ? 'amber'
              : 'emerald'
          }
          subtitle="Real-time alert engine"
        />
      </div>

      {/* Budget Cards List */}
      {loading ? (
        <LoadingSpinner label="Calculating budget utilization & spending margins..." />
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.amount;
            const utilization = b.utilization_pct || 0;
            const isOverspent = spent > limit;
            const isWarning = !isOverspent && utilization >= 80;

            return (
              <div
                key={b.id}
                className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md ${
                  isOverspent
                    ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Status Indicator Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {b.category}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {monthNames[selectedMonth - 1]} {selectedYear}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isOverspent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Exceeded ({utilization}%)
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Warning ({utilization}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        On Track ({utilization}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Numbers */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spent:</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatINR(spent)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Budget Limit:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatINR(limit)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-medium">
                      {isOverspent ? 'Over budget by:' : 'Remaining:'}
                    </span>
                    <span
                      className={`font-bold ${
                        isOverspent
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatINR(Math.abs(limit - spent))}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isOverspent
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedBudget(b);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition inline-flex items-center"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit Limit
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition inline-flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No category budgets configured"
          description={`You haven't set any category budget limits for ${monthNames[selectedMonth - 1]} ${selectedYear}. Set budget limits to prevent overspending!`}
          action={
            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Set Your First Budget
            </button>
          }
        />
      )}

      {/* Budget Set/Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        budgetToEdit={selectedBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
      />
    </div>
  );
};
