import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import api from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

const CATEGORIES = [
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
  'Investments',
  'Other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}) => {
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionInfo, setPredictionInfo] = useState<{
    predicted: string;
    confidence: number;
    explanation?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setDescription(transactionToEdit.description);
      setTransactionDate(transactionToEdit.transaction_date);
      setPredictionInfo(null);
      setError(null);
    } else {
      setType('Expense');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setPredictionInfo(null);
      setError(null);
    }
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  // AI Auto-detect Category handler
  const handleAutoDetect = async () => {
    if (!description.trim()) {
      setError('Please type a description first (e.g. "Domino\'s Pizza", "Uber cab", "Airtel bill")');
      return;
    }
    setError(null);
    setIsPredicting(true);
    try {
      const res = await api.predictCategory(description);
      if (res.success && res.data) {
        setCategory(res.data.predicted_category);
        setPredictionInfo({
          predicted: res.data.predicted_category,
          confidence: res.data.confidence,
          explanation: res.data.explanation,
        });
      }
    } catch (err: any) {
      console.error('Category prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (transactionToEdit) {
        await api.updateTransaction(transactionToEdit.id, {
          type,
          amount: numAmount,
          category,
          description: description.trim(),
          transaction_date: transactionDate,
        });
      } else {
        await api.createTransaction({
          type,
          amount: numAmount,
          category,
          description: description.trim(),
          transaction_date: transactionDate,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter transaction details and use AI auto-categorization
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

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setType('Expense')}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  type === 'Expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💸 Expense
              </button>
              <button
                type="button"
                onClick={() => setType('Income')}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  type === 'Income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💰 Income
              </button>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Amount (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Description with AI Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Description <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isPredicting || !description.trim()}
                className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-40 transition"
              >
                {isPredicting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                )}
                AI Auto-Detect Category
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Domino's Pizza, Uber ride to office, Grocery at BigBasket"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPredictionInfo(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
            {predictionInfo && (
              <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>
                    AI matched category: <strong>{predictionInfo.predicted}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold rounded-full">
                  {predictionInfo.confidence}% Match
                </span>
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
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
              {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
