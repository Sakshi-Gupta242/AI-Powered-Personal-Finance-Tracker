import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  Sparkles,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieIcon,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import { MetricCard, formatINR } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10B981',
  Travel: '#3B82F6',
  Shopping: '#8B5CF6',
  Education: '#EC4899',
  Bills: '#F59E0B',
  Entertainment: '#6366F1',
  Healthcare: '#EF4444',
  Rent: '#14B8A6',
  Transportation: '#F97316',
  Salary: '#059669',
  Freelance: '#0D9488',
  Other: '#64748B',
};

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [savingsTips, setSavingsTips] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, mRes, cRes, wRes, predRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMonthlyChart(),
        api.getCategoryBreakdown(),
        api.getWeeklySpending(),
        api.getExpensePrediction(),
      ]);

      if (sumRes.success) {
        setSummary(sumRes.summary);
        setRecentTxns(sumRes.recent_transactions || []);
        setWarnings(sumRes.warnings || []);
        setSavingsTips(sumRes.savings_tips || []);
      }
      if (mRes.success) setMonthlyData(mRes.monthly_data || []);
      if (cRes.success) setCategoriesData(cRes.categories || []);
      if (wRes.success) setWeeklyData(wRes.weekly_data || []);
      if (predRes.success) setPrediction(predRes.prediction);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" label="Analyzing financial records & training ML models..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time spending analysis, budget telemetry & AI prediction engine
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/ai-insights"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Insights Sandbox</span>
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md hover:shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Warnings & Alerts Banner */}
      {warnings.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start space-x-3 text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm text-rose-900 dark:text-rose-100">
              Budget Overspending Warning Detected
            </p>
            <div className="mt-1 space-y-1">
              {warnings.map((w, idx) => (
                <p key={idx}>{w.message}</p>
              ))}
            </div>
          </div>
          <Link
            to="/budget"
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs self-center flex-shrink-0 transition"
          >
            Adjust Budget
          </Link>
        </div>
      )}

      {/* 6 Key KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Income"
          value={summary?.total_income || 0}
          icon={Wallet}
          color="emerald"
          subtitle="All-time credited inflow"
        />

        <MetricCard
          title="Total Expenses"
          value={summary?.total_expenses || 0}
          icon={TrendingDown}
          color="rose"
          inverseTrendColor
          subtitle="All-time debited expenses"
        />

        <MetricCard
          title="Remaining Balance"
          value={summary?.remaining_balance || 0}
          icon={TrendingUp}
          color={summary?.remaining_balance >= 0 ? 'indigo' : 'rose'}
          subtitle="Net cumulative cash pool"
        />

        <MetricCard
          title="Savings Rate"
          value={`${summary?.savings_rate || 0}%`}
          isCurrency={false}
          icon={Percent}
          color="blue"
          subtitle="Target benchmark: ≥ 20%"
        />

        <MetricCard
          title="This Month Spend"
          value={summary?.current_month_spending || 0}
          change={summary?.mom_spending_change_pct}
          changeLabel="vs last mo"
          inverseTrendColor
          icon={Calendar}
          color="amber"
        />

        <MetricCard
          title="Budget Status"
          value={summary?.budget_status || 'On Track'}
          isCurrency={false}
          icon={PieIcon}
          color={
            summary?.budget_status === 'Over Budget'
              ? 'rose'
              : summary?.budget_status === 'Warning'
              ? 'amber'
              : 'emerald'
          }
          subtitle={`${summary?.budget_utilization_pct || 0}% limit used`}
        />
      </div>

      {/* ML Prediction Callout Banner */}
      {prediction && prediction.has_enough_data && (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Linear Regression Forecast
                </span>
                <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  {prediction.confidence} Confidence
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold mt-0.5">
                Predicted next month expense:{' '}
                <span className="text-emerald-300 font-extrabold">
                  {formatINR(prediction.predicted_amount)}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{prediction.explanation}</p>
            </div>
          </div>
          <Link
            to="/ai-insights"
            className="self-end md:self-center px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow flex-shrink-0"
          >
            View ML Details
          </Link>
        </div>
      )}

      {/* Primary Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Income vs Expenses */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Income vs Expenses
              </h2>
              <p className="text-xs text-slate-400">Cashflow comparison across recorded months</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" fontSize={11} stroke="#94A3B8" />
                  <YAxis
                    fontSize={11}
                    stroke="#94A3B8"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income (₹)" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense (₹)" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No monthly records" description="Add transactions to populate the cashflow graph." />
            )}
          </div>
        </div>

        {/* Chart 2: Category Expense Breakdown (Pie/Donut) */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Expense Category Distribution
              </h2>
              <p className="text-xs text-slate-400">Percentage share per spending category</p>
            </div>
            <PieIcon className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#64748B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatINR(Number(val))} (${item.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No expense categories" description="Add expenses to see category breakdown." />
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Weekly Spending & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Bar */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Spending Velocity
              </h2>
              <p className="text-xs text-slate-400">Expense outflow across recent weeks</p>
            </div>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" fontSize={11} stroke="#94A3B8" />
                  <YAxis
                    fontSize={11}
                    stroke="#94A3B8"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" name="Weekly Spend (₹)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No weekly records" description="Weekly velocity will appear as you record entries." />
            )}
          </div>
        </div>

        {/* Monthly Net Savings Trend Area */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Net Savings Trajectory
              </h2>
              <p className="text-xs text-slate-400">Surplus cash retained each month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" fontSize={11} stroke="#94A3B8" />
                  <YAxis
                    fontSize={11}
                    stroke="#94A3B8"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    name="Net Savings (₹)"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#savingsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No savings trajectory" description="Savings trend will render when data is available." />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Latest activity posted to your account</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All ({summary?.total_count || recentTxns.length})
            </Link>
          </div>

          {recentTxns.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {recentTxns.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.type === 'Income'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {t.type === 'Income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {t.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{t.transaction_date}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.2 rounded-md"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[t.category] || '#64748B'}20`,
                            color: CATEGORY_COLORS[t.category] || '#64748B',
                          }}
                        >
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        t.type === 'Income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'} {formatINR(t.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No transactions yet"
              description="Record your first income or expense transaction to kickstart AI analysis."
              action={
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
                >
                  Add Transaction
                </button>
              }
            />
          )}
        </div>

        {/* AI Recommendations Card (1 Col) */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Saving Advice</span>
            </div>

            <h2 className="text-lg font-bold mb-3">Personalized Optimization</h2>

            <div className="space-y-3">
              {savingsTips.length > 0 ? (
                savingsTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{tip.title}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{tip.tip}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                      Annual Potential: +{formatINR(tip.annual_potential)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  Add transactions to enable the dynamic AI recommendation engine.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              to="/ai-insights"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              <span>Explore Full AI Insights</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
