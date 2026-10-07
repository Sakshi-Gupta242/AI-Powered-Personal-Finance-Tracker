import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import { Transaction } from '../types';
import api from '../services/api';
import { formatINR } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';

const CATEGORIES = [
  'All',
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Rent',
  'Transportation',
  'Salary',
  'Freelance',
  'Other',
];

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

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [type, setType] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        type: type !== 'All' ? type : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (res.success) {
        setTransactions(res.transactions);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.total_pages);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, category, type, startDate, endDate, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTransaction(txnToDelete.id);
      setTxnToDelete(null);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount (INR)'];
    const rows = transactions.map((t) => [
      t.id,
      t.transaction_date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, filter, export and manage all income and expense logs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setSelectedTxn(null);
              setIsAddEditOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md hover:shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </form>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              <option value="All">Type: All</option>
              <option value="Expense">Type: Expense (💸)</option>
              <option value="Income">Type: Income (💰)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [col, ord] = e.target.value.split('-');
                setSortBy(col);
                setSortOrder(ord);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              <option value="date-desc">Sort: Date (Newest)</option>
              <option value="date-asc">Sort: Date (Oldest)</option>
              <option value="amount-desc">Sort: Amount (High → Low)</option>
              <option value="amount-asc">Sort: Amount (Low → High)</option>
            </select>
          </div>
        </div>

        {/* Date Range & Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {(search || category !== 'All' || type !== 'All' || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching transactions..." />
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Flow</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount (₹)</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {t.transaction_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            t.type === 'Income'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {t.type === 'Income' ? (
                            <ArrowDownLeft className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          )}
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-lg font-bold text-[10px]"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[t.category] || '#64748B'}18`,
                            color: CATEGORY_COLORS[t.category] || '#64748B',
                          }}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            t.type === 'Income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {t.type === 'Income' ? '+' : '-'} {formatINR(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedTxn(t);
                              setIsAddEditOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTxnToDelete(t)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <p>
                Showing <strong>{transactions.length}</strong> of <strong>{totalCount}</strong> transactions
              </p>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No matching transactions found"
            description="Try changing your search query or reset active filters."
            action={
              <button
                onClick={() => {
                  setSelectedTxn(null);
                  setIsAddEditOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
              >
                Add Transaction
              </button>
            }
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <TransactionModal
        isOpen={isAddEditOpen}
        transactionToEdit={selectedTxn}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={fetchTransactions}
      />

      {/* Delete Confirmation Modal */}
      {txnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this transaction: "
              <strong>{txnToDelete.description}</strong>" ({formatINR(txnToDelete.amount)})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTxnToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition"
              >
                {isDeleting ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
