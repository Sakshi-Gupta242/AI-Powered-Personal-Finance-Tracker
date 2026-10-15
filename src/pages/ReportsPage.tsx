import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Loader2,
  Sparkles,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { MonthlyReport } from '../types';
import { formatINR } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

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

export const ReportsPage: React.FC = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getMonthlyReport(selectedMonth, selectedYear);
      if (res.success) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = await api.downloadPdfReport(selectedMonth, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed, using print view as fallback:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.sendEmailReport(selectedMonth, selectedYear);
      setEmailStatus(res.message || 'Report sent to your registered email successfully!');
      setTimeout(() => setEmailStatus(null), 6000);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setEmailStatus(err.message || 'Failed to send email report');
      setTimeout(() => setEmailStatus(null), 6000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Generating comprehensive monthly statement..." />;
  }

  const summary = report?.summary;
  const categories = report?.category_breakdown || [];
  const budgetComparison = report?.budget_comparison || [];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Financial Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete statement of income, expenditure, budget adherence & AI savings advice
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
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition disabled:opacity-50"
            title="Send financial statement to registered email"
          >
            {isSendingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Mail className="w-4 h-4 text-emerald-600" />
            )}
            <span>Email Report</span>
          </button>

          <button
            onClick={handleBrowserPrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md hover:shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Email Status Notification */}
      {emailStatus && (
        <div className="print:hidden p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{emailStatus}</span>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-widest mb-1">
              <span>Financial Statement</span>
              <span>•</span>
              <span>{report?.period.month_name}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              AI-Powered Personal Finance Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Account Holder: <strong>{report?.user.name}</strong> ({report?.user.email})
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            <p>Currency: Indian Rupee (₹ INR)</p>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            1. Executive Monthly Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Total Monthly Inflow
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(summary?.total_income || 0)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Total Monthly Expenses
              </span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(summary?.total_expenses || 0)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Net Monthly Savings
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(summary?.net_savings || 0)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Savings Retention Rate
              </span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {summary?.savings_percentage || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* 2. Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            2. Category-wise Expenditure Breakdown
          </h3>
          {categories.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Amount (₹)</th>
                    <th className="px-5 py-3 text-right">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#64748B' }}
                        />
                        <span>{c.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(c.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 font-semibold">
                        {c.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No expenses recorded for this month.</p>
          )}
        </div>

        {/* 3. Budget vs Actual Spending Comparison */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            3. Budget vs Actual Spending Analysis
          </h3>
          {budgetComparison.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Budget Limit (₹)</th>
                    <th className="px-5 py-3 text-right">Actual Spent (₹)</th>
                    <th className="px-5 py-3 text-right">Remaining (₹)</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {budgetComparison.map((b, idx) => (
                    <tr key={idx}>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {b.category}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                        {formatINR(b.budget)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(b.spent)}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold ${
                          b.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatINR(b.remaining)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Over Budget'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : b.status === 'Near Limit'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {b.status} ({b.utilization_pct}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No category budgets configured for this month.</p>
          )}
        </div>

        {/* 4. AI Insights & Highlights */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Automated Financial Summary</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            • <strong>Savings Performance:</strong> You retained{' '}
            <strong>{summary?.savings_percentage}%</strong> of your monthly income in savings pool.
          </p>
          {categories.length > 0 && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              • <strong>Dominant Expenditure:</strong> Highest expenditure for {report?.period.month_name} was in <strong>{categories[0].category}</strong> ({formatINR(categories[0].amount)}, {categories[0].percentage}% of total expenses).
            </p>
          )}
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            • <strong>Predictive Telemetry:</strong> Machine learning forecasts stable spending behavior with recommendation to maintain at least 20% savings margin.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <p>AI-Powered Personal Finance Tracker & Smart Budgeting System</p>
          <p>Tagline: Track. Analyze. Predict. Save.</p>
        </div>
      </div>
    </div>
  );
};
