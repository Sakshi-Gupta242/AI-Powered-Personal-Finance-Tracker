import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  PieChart,
  BrainCircuit,
  FileSpreadsheet,
  User,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Add Transaction', path: '/add-transaction', icon: PlusCircle },
    { name: 'Budget Limits', path: '/budget', icon: PieChart },
    { name: 'AI Insights & ML', path: '/ai-insights', icon: BrainCircuit, badge: 'AI' },
    { name: 'Monthly Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Profile & Viva Specs', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-emerald-500/30">
              ₹
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">SmartFinance</span>
              <span className="text-emerald-400 font-bold">.AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        {onOpenAddModal && (
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => {
                onOpenAddModal();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Quick Add Entry</span>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 transition group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Mini Callout */}
        <div className="p-4 mx-3 mb-3 bg-gradient-to-b from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">Linear Regression</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scikit-learn active to predict upcoming expenses and auto-detect categories.
          </p>
        </div>

        {/* Footer User Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
