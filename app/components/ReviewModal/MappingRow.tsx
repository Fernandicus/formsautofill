import React from 'react';
import { FieldMapping } from '../../types';

interface MappingRowProps {
  mapping: FieldMapping;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export const MappingRow: React.FC<MappingRowProps> = ({ mapping, onToggle, onChange }) => {
  const { userValue, isSuggestion, label, pdfFieldName } = mapping;
  
  const isSelected = Boolean(userValue);
  const isSuggested = Boolean(isSuggestion);

  const containerClasses = isSelected 
    ? (isSuggested ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200') 
    : 'bg-slate-50 border-transparent opacity-70 hover:opacity-100 hover:bg-slate-100/50';

  const checkboxClasses = isSuggested 
    ? 'text-amber-600 focus:ring-amber-500 border-amber-300' 
    : 'text-indigo-600 focus:ring-indigo-500 border-slate-300';

  const inputClasses = isSelected 
    ? (isSuggested 
        ? 'bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900 shadow-sm' 
        : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 shadow-sm') 
    : 'bg-white/50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 text-slate-900 shadow-sm hover:border-slate-300';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${containerClasses}`}>
      <div className="pt-2">
        <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggle}
            aria-label={`Toggle auto-fill for ${label || pdfFieldName}`}
            className={`w-5 h-5 rounded focus:ring-offset-0 transition-colors shadow-sm cursor-pointer ${checkboxClasses}`}
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex justify-between items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                {label || pdfFieldName}
            </label>
            {isSuggested && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700 uppercase tracking-wide shrink-0 border border-amber-200/50">
                    Suggested
                </span>
            )}
        </div>
        <input
          type="text"
          value={userValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSelected ? "Add a value to include" : "Click to type an implicit value..."}
          className={`w-full text-sm rounded-lg px-3 py-2.5 outline-none border focus:ring-2 transition-all ${inputClasses}`}
        />
      </div>
    </div>
  );
};
