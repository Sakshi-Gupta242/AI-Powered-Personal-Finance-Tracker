import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Budget } from '../types';
import api from '../services/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: Budget | null;
  currentMonth: number;
  currentYear: number;
}

const BUDGET_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Rent',
  'Transportation',
  'Other',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  currentMonth,
  currentYear,
}) => {
  const [category, setCategory] = useState<string>('Food');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAmount(String(budgetToEdit.amount));
      setError(null);
    } else {
      setCategory('Food');
      setAmount('');
      setError(null);
    }
  }, [budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (budgetToEdit) {
        await api.updateBudget(budgetToEdit.id, {
          category,
          amount: numAmount,
        });
      } else {
        await api.setBudget({
          category,
          amount: numAmount,
          month: currentMonth,
          year: currentYear,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to set budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {budgetToEdit ? 'Edit Category Budget' : 'Set Category Budget'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set monthly spending limit to prevent overspending
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/50">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={!!budgetToEdit}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition disabled:opacity-60"
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Monthly Budget Limit (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                step="50"
                min="100"
                required
                placeholder="e.g., 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You will receive automated warnings at 80% and overspending alerts at 100%.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 transition"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {budgetToEdit ? 'Update Limit' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
