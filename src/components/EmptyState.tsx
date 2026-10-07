import React, { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
