import React, { ReactNode } from 'react';
import { ChevronIcon } from '../../../../../icons';

type ReviewSectionProps = {
  title: string;
  description?: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  icon: ReactNode;
  theme: 'rose' | 'amber' | 'indigo';
  actions?: ReactNode;
  children: ReactNode;
  emptyMessage?: string;
};

const THEME_STYLES = {
  rose: {
    container: 'border-rose-100 bg-white shadow-rose-100/50',
    header: 'bg-rose-50/70 border-rose-100',
    button: 'hover:bg-rose-100 text-rose-600',
    title: 'text-rose-800',
    description: 'text-rose-600'
  },
  amber: {
    container: 'border-amber-100 bg-white shadow-amber-100/50',
    header: 'bg-amber-50/70 border-amber-100',
    button: 'hover:bg-amber-100 text-amber-600',
    title: 'text-amber-800',
    description: 'text-amber-600'
  },
  indigo: {
    container: 'border-indigo-100 bg-white shadow-indigo-100/50',
    header: 'bg-indigo-50/70 border-indigo-100',
    button: 'hover:bg-indigo-100 text-indigo-600',
    title: 'text-indigo-800',
    description: 'text-indigo-600'
  }
};

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  description,
  count,
  isOpen,
  onToggle,
  icon,
  theme,
  actions,
  children,
  emptyMessage
}) => {
  const activeTheme = THEME_STYLES[theme];

  if (count === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${activeTheme.container}`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${activeTheme.header}`}>
        <div className="flex items-start sm:items-center gap-3">
          <button 
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-all mt-0.5 sm:mt-0 ${activeTheme.button}`}
          >
            <ChevronIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <div>
            <h4 className={`font-bold flex items-center gap-2 ${activeTheme.title}`}>
              {icon}
              {title} ({count})
            </h4>
            {description && (
              <p className={`text-xs mt-1 font-medium ${activeTheme.description}`}>
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2 ms-10 sm:ms-0">
            {actions}
          </div>
        )}
      </div>
      
      {/* 
        Instead of conditionally rendering the DOM completely, 
        we use max-height transition if we wanted smooth open/close. 
        For now, standard conditional render keeps DOM lean.
      */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-slate-50/30">
          {children}
        </div>
      )}
    </div>
  );
};
