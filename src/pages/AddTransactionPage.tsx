import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import api from '../services/api';

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

const PRESETS = [
  { label: '🍕 Domino\'s Pizza', type: 'Expense', cat: 'Food', desc: "Domino's Pizza and garlic bread with friends", amt: 850 },
  { label: '🚗 Uber Cab', type: 'Expense', cat: 'Transportation', desc: 'Uber ride to office during rain', amt: 450 },
  { label: '🛒 Grocery Supermarket', type: 'Expense', cat: 'Food', desc: 'BigBasket weekly grocery shopping', amt: 3200 },
  { label: '⚡ Electricity Bill', type: 'Expense', cat: 'Bills', desc: 'Monthly electricity power bill', amt: 2250 },
  { label: '🎬 Netflix 4K', type: 'Expense', cat: 'Entertainment', desc: 'Netflix Ultra HD monthly subscription', amt: 649 },
  { label: '🏠 House Rent', type: 'Expense', cat: 'Rent', desc: 'Monthly apartment room rent', amt: 16000 },
  { label: '💼 Salary Credit', type: 'Income', cat: 'Salary', desc: 'Monthly Software Engineer Salary Credit', amt: 65000 },
];

export const AddTransactionPage: React.FC = () => {
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<{
    predicted: string;
    confidence: number;
    explanation: string;
    alternatives: Array<{ category: string; confidence: number }>;
  } | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleAutoDetect = async () => {
    if (!description.trim()) {
      setErrorMsg('Please enter a description first to test AI category detection.');
      return;
    }
    setErrorMsg(null);
    setIsPredicting(true);
    try {
      const res = await api.predictCategory(description.trim());
      if (res.success && res.data) {
        setCategory(res.data.predicted_category);
        setPredictionResult({
          predicted: res.data.predicted_category,
          confidence: res.data.confidence,
          explanation: res.data.explanation,
          alternatives: res.data.alternatives || [],
        });
      }
    } catch (err: any) {
      setErrorMsg('Category classifier service unavailable.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setType(preset.type as any);
    setCategory(preset.cat);
    setDescription(preset.desc);
    setAmount(String(preset.amt));
    setPredictionResult(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive numeric amount.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a transaction description.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTransaction({
        type,
        amount: numAmount,
        category,
        description: description.trim(),
        transaction_date: transactionDate,
      });

      setSuccessMsg(`Transaction of ₹${numAmount.toLocaleString('en-IN')} added successfully!`);
      // Reset form
      setAmount('');
      setDescription('');
      setPredictionResult(null);

      setTimeout(() => {
        navigate('/transactions');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Record New Transaction
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log financial entries with automatic ML category detection & database persistence
          </p>
        </div>
      </div>

      {/* Quick Presets Carousel */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Templates</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 hover:text-emerald-700 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-600 transition shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {errorMsg && (
          <div className="flex items-center p-4 text-xs sm:text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 rounded-2xl border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center p-4 text-xs sm:text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Transaction Flow <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setType('Expense')}
                className={`py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition ${
                  type === 'Expense'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 ring-2 ring-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>💸 Expense (Money Out)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('Income')}
                className={`py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition ${
                  type === 'Income'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>💰 Income (Money In)</span>
              </button>
            </div>
          </div>

          {/* Amount and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Amount (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Transaction Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Description & AI Auto Detect */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Transaction Description <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isPredicting || !description.trim()}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 transition disabled:opacity-40"
              >
                {isPredicting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>✨ Predict Category with AI</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Pizza Hut dinner with college friends, Uber ride to station, Electricity bill"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPredictionResult(null);
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />

            {/* AI Category Result Callout */}
            {predictionResult && (
              <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>
                      Predicted Category: <strong>{predictionResult.predicted}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full font-extrabold text-[10px]">
                      {predictionResult.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                    {predictionResult.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Expense / Income Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
