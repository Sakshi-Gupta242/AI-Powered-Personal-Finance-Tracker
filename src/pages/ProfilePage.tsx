import React, { useState } from 'react';
import {
  Database,
  Code,
  CheckCircle2,
  Loader2,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, seedAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedAccount();
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Failed to seed account:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Profile & Viva Technical Specs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your credentials, database seeding, and inspect project architecture
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-2xl flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                JWT Authenticated Session
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 1-Click Demo Reset / Seeder for Viva Presentation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Viva Demonstration Seeder</span>
        </div>

        <h2 className="text-xl font-bold">Populate Realistic Multi-Month Data</h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Instantly seeds 70+ realistic transactions spanning the past 4 months (Food, Rent, Bills, Salary, Shopping, Travel) and 8 category budgets in Indian Rupee (₹). This immediately populates all charts, ML Linear Regression velocity graphs, and overspending warning states.
        </p>

        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : seedSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{seedSuccess ? 'Database Seeded! Reloading...' : 'Seed / Reset Demo Dataset'}</span>
          </button>
        </div>
      </div>

      {/* College Project Viva Technical Architecture Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Code className="w-4 h-4" />
          <span>System Architecture & Viva Specifications</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Technology Stack & Implementation Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900 dark:text-white text-sm">Frontend Layer</p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>React 18 + Vite:</strong> Component-based SPA architecture
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Tailwind CSS:</strong> Modern responsive utility styling
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Recharts:</strong> Interactive SVG graphs & charts
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Lucide Icons:</strong> Sleek vector glyph iconography
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900 dark:text-white text-sm">Backend & Database Layer</p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Python Flask REST APIs:</strong> Modular Blueprint architecture
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>MySQL / SQLAlchemy ORM:</strong> Relational schema & foreign keys
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>JWT & Werkzeug:</strong> Token authentication & password hashing
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>ReportLab:</strong> Dynamic vector PDF statement generation
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 md:col-span-2">
            <p className="font-bold text-slate-900 dark:text-white text-sm">Machine Learning Modules</p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Expense Prediction:</strong> Scikit-Learn Ordinary Least Squares (OLS) Linear Regression ($y = mx + c$) modeling monthly expense velocity.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Category Classification:</strong> TF-IDF Vectorizer with Sublinear Term Frequency + Multinomial Logistic Regression classifying transaction descriptions with confidence scoring.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • <strong>Personalized Recommendation Engine:</strong> Rule-based statistical engine identifying budget deviations, month-over-month surges, and annual compounding savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
