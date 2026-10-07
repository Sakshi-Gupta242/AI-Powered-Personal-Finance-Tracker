import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail('demo@financetracker.com');
    setPassword('password123');
    setError(null);
    setIsSubmitting(true);
    try {
      await login('demo@financetracker.com', 'password123');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo account not initialized. Please register or seed first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              ₹
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              SmartFinance<span className="text-emerald-400">.AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your financial dashboard & ML predictions
          </p>
        </div>

        {/* Demo Quick Fill Banner */}
        <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Viva Demo Account Ready</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={isSubmitting}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            1-Click Login
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center p-3.5 text-xs text-rose-300 bg-rose-950/50 rounded-xl border border-rose-800">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
