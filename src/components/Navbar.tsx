import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  PlusCircle,
  Database,
  LogOut,
  User as UserIcon,
  Menu,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenAddModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAddModal }) => {
  const { user, logout, seedAccount, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedAccount();
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Failed to seed data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center space-x-3">
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 md:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                SmartFinance<span className="text-emerald-500">.AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium leading-none">
              Track. Analyze. Predict. Save.
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Actions and Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {isAuthenticated ? (
          <>
            {/* Quick Add Button */}
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm hover:shadow transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            )}

            {/* Quick Seed Demo Data Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              title="Populate realistic transactions and budgets"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
            >
              {isSeeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              ) : seedSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="hidden lg:inline">{seedSuccess ? 'Seeded!' : 'Seed Demo Data'}</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                      Account & Viva Profile
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
