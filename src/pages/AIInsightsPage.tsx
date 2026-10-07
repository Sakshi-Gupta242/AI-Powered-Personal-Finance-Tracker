import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Lightbulb,
  Loader2,
  Zap,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';
import { formatINR } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AIInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Category Classifier Sandbox state
  const [testDesc, setTestDesc] = useState<string>('Dominos Pizza with friends');
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classifierResult, setClassifierResult] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getAIInsights();
      if (res.success) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    handleClassifySandbox('Dominos Pizza with friends');
  }, []);

  const handleClassifySandbox = async (desc: string) => {
    if (!desc.trim()) return;
    setIsClassifying(true);
    try {
      const res = await api.predictCategory(desc);
      if (res.success && res.data) {
        setClassifierResult(res.data);
      }
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Running Scikit-learn Linear Regression & ML analysis..." />;
  }

  const prediction = insights?.prediction;
  const metrics = insights?.metrics;
  const health = insights?.financial_health;
  const recommendations = insights?.recommendations || [];
  const savingsTips = insights?.savings_tips || [];
  const rule503020 = insights?.rule_50_30_20;

  // Prepare chart series combining historical and forecast point
  const historical = prediction?.historical_data || [];
  const chartData = historical.map((h: any) => ({
    label: h.label,
    actual: h.total_expense,
    predicted: null,
  }));

  if (prediction && prediction.has_enough_data) {
    chartData.push({
      label: 'Next Month (Forecast)',
      actual: null,
      predicted: prediction.predicted_amount,
    });
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scikit-Learn ML Intelligence Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              AI Spending Telemetry & Future Prediction
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Powered by Ordinary Least Squares (OLS) Linear Regression for multi-month expense forecasting and TF-IDF text classification for instant category prediction.
            </p>
          </div>

          {/* Financial Health Score Meter */}
          {health && (
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 backdrop-blur text-center flex-shrink-0 min-w-[200px]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Financial Health Score
              </p>
              <div className="flex items-center justify-center space-x-2 my-2">
                <span className="text-3xl font-black text-emerald-400">{health.score}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                  health.score >= 75
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : health.score >= 50
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {health.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Scikit-Learn Linear Regression Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Expense Prediction Model (Linear Regression)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trained on historical monthly spending time-series
              </p>
            </div>
          </div>

          {prediction?.model_info && (
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
              Formula: {prediction.model_info.formula || 'y = mx + c'}
            </span>
          )}
        </div>

        {/* Prediction Stats Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
              Predicted Next Month Expense
            </span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
              {formatINR(prediction?.predicted_amount || 0)}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              {prediction?.percentage_change > 0 ? '+' : ''}
              {prediction?.percentage_change}% vs current month
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Spending Velocity (Slope)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {prediction?.slope > 0 ? '+' : ''}
              {formatINR(prediction?.slope || 0)} / mo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Trend Direction: <strong>{prediction?.trend || 'Stable'}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Model Training Samples
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {prediction?.model_info?.data_points_count || historical.length} Months
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Confidence: <strong>{prediction?.confidence || 'High'}</strong>
            </p>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">
            Historical Actuals vs ML Forecast Trajectory
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" fontSize={11} stroke="#94A3B8" />
                <YAxis
                  fontSize={11}
                  stroke="#94A3B8"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => (val !== null ? formatINR(Number(val)) : 'N/A')}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical Actual Spend (₹)"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="ML Predicted Spend (₹)"
                  stroke="#10B981"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
          <strong>Viva Explanation:</strong> {prediction?.explanation}
        </div>
      </section>

      {/* 2. Interactive Category Classifier Sandbox */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Interactive ML Category Classifier Sandbox
            </h2>
            <p className="text-xs text-slate-400">
              Test TF-IDF Vectorizer + Logistic Regression live with custom transaction descriptions
            </p>
          </div>
        </div>

        {/* Sandbox Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type any transaction description (e.g., Domino's Pizza, Uber ride, College books, Amazon headphones)..."
            value={testDesc}
            onChange={(e) => setTestDesc(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => handleClassifySandbox(testDesc)}
            disabled={isClassifying || !testDesc.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-50 flex-shrink-0"
          >
            {isClassifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Run ML Classification</span>
          </button>
        </div>

        {/* Classifier Output Box */}
        {classifierResult && (
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold">Predicted Category:</span>
                <span className="text-lg font-black text-emerald-400">
                  {classifierResult.predicted_category}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
                {classifierResult.confidence}% Match Confidence
              </span>
            </div>

            <p className="text-xs text-slate-300">{classifierResult.explanation}</p>

            {classifierResult.alternatives && classifierResult.alternatives.length > 0 && (
              <div className="pt-2 border-t border-slate-700 flex items-center space-x-2 text-xs text-slate-400">
                <span className="font-semibold">Alternative Candidates:</span>
                <div className="flex space-x-2">
                  {classifierResult.alternatives.map((alt: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-md font-mono text-[11px]"
                    >
                      {alt.category} ({alt.confidence}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Deep AI Recommendations & 50/30/20 Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations & Saving Tips */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>AI Dynamic Recommendations</span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Actionable Optimization Strategies
          </h2>

          <div className="space-y-3">
            {savingsTips.length > 0 ? (
              savingsTips.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.title}</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.tip}</p>
                  <div className="mt-3 flex items-center justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Monthly Target: -{formatINR(t.monthly_potential)}</span>
                    <span>Annual Savings: +{formatINR(t.annual_potential)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No specific tips generated yet.</p>
            )}

            {recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs"
              >
                <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold mb-1">
                  <span>{rec.title}</span>
                  <span>{rec.impact}</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 50/30/20 Rule Blueprint */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Budgeting Benchmark</span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            50/30/20 Financial Framework
          </h2>

          {rule503020 ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Based on your total income of <strong>{formatINR(metrics?.total_income || 0)}</strong>, here is the recommended standard allocation:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      50% Essentials & Needs
                    </p>
                    <p className="text-[11px] text-slate-400">Rent, Utilities, Food, Groceries</p>
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {formatINR(rule503020.needs_target)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      30% Wants & Lifestyle
                    </p>
                    <p className="text-[11px] text-slate-400">Entertainment, Shopping, Dining</p>
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {formatINR(rule503020.wants_target)}
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      20% Savings & Investments
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Emergency fund & wealth creation
                    </p>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                    {formatINR(rule503020.savings_target)}
                  </span>
                </div>
              </div>

              {insights?.emergency_fund_target > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>Recommended 3-Month Emergency Buffer: </span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                    {formatINR(insights.emergency_fund_target)}
                  </strong>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Add income entries to calculate 50/30/20 distribution.</p>
          )}
        </div>
      </div>
    </div>
  );
};
