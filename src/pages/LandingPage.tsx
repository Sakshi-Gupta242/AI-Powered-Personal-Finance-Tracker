import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  PieChart,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BrainCircuit,
      title: 'Scikit-Learn ML Prediction',
      desc: 'Predict next month’s expected expenses using Linear Regression trained on your multi-month historical habits.',
      tag: 'Machine Learning',
    },
    {
      icon: Sparkles,
      title: 'Smart Category Auto-Detection',
      desc: 'TF-IDF Vectorizer and Logistic Regression classify descriptions like "Domino\'s Pizza" or "Uber" instantly.',
      tag: 'NLP Classification',
    },
    {
      icon: PieChart,
      title: 'Smart Category Budgeting',
      desc: 'Set monthly category thresholds with automated warnings at 80% and overspending alerts at 100%.',
      tag: 'Real-time Alerts',
    },
    {
      icon: BarChart3,
      title: 'Deep Spending Analytics',
      desc: 'Interactive Recharts dashboards breaking down income vs expense, monthly savings rates, and category distribution in ₹ INR.',
      tag: 'Visual Dashboards',
    },
    {
      icon: Calendar,
      title: 'Monthly Financial Reports & PDF',
      desc: 'Generate executive monthly statements with category distributions and 1-click official PDF export.',
      tag: 'ReportLab PDF',
    },
    {
      icon: Lock,
      title: 'JWT & MySQL Architecture',
      desc: 'Secure password hashing with Werkzeug, signed JWT tokens, and strict user-isolated relational queries.',
      tag: 'Production Ready',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-600/10 blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-emerald-600/10 blur-[120px]" />
      </div>

      {/* Top Floating Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/30">
            ₹
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
              SmartFinance<span className="text-emerald-400">.AI</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Track • Analyze • Predict • Save
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack AI/ML Personal Finance Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Take Absolute Control of Your Money with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Predictive AI
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          Smart budgeting, automatic TF-IDF expense categorizer, and Scikit-learn Linear Regression forecasting tailored for modern Indian Rupee (₹) financial goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-base rounded-2xl border border-slate-700/80 transition"
          >
            <span>Explore Demo Account</span>
          </Link>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-800/80 text-left">
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
            <p className="text-xs text-slate-400 mt-1">Zero External Paid APIs</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-2xl sm:text-3xl font-black text-teal-400">Scikit-Learn</p>
            <p className="text-xs text-slate-400 mt-1">Linear Regression & TF-IDF</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">₹ INR</p>
            <p className="text-xs text-slate-400 mt-1">Indian Rupee Native</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">MySQL & JWT</p>
            <p className="text-xs text-slate-400 mt-1">Production Security</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
            Engineered Features
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything you need for intelligent financial management
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group p-7 bg-slate-900/60 hover:bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition">
                  <f.icon className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-800 rounded-lg border border-slate-700">
                  {f.tag}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition">
                {f.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="p-10 sm:p-16 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to experience smart personal budgeting?
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Create an account or login with the one-click demo profile to explore the ML insights and charts.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 AI-Powered Personal Finance Tracker & Smart Budgeting System. Built for viva & production deployment.</p>
      </footer>
    </div>
  );
};
