import React from 'react';
import { FieldMapping } from '../../types';

interface MappingRowProps {
  mapping: FieldMapping;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export const MappingRow: React.FC<MappingRowProps> = ({ mapping, onToggle, onChange }) => {
  const { userValue, isSuggestion, label, pdfFieldName, originalValue } = mapping;
  
  const isDisabled = !userValue && !originalValue;
  const isSelected = !!userValue;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
      isSelected 
        ? (isSuggestion ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200') 
        : 'bg-slate-50 border-transparent opacity-60'
    }`}>
      <div className="pt-3">
        <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggle}
            className={`w-5 h-5 rounded border-slate-300 focus:ring-offset-0 ${
              isSuggestion ? 'text-amber-600 focus:ring-amber-500' : 'text-indigo-600 focus:ring-indigo-500'
            }`}
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {label || pdfFieldName}
            </label>
            {isSuggestion && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                    Suggested
                </span>
            )}
        </div>
        <input
          type="text"
          value={userValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled} 
          placeholder={isSelected ? "Value" : "(Skipped)"}
          className={`w-full text-sm rounded-lg px-3 py-2 outline-none border transition-all ${
              isSelected 
              ? (isSuggestion ? 'bg-white border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 shadow-sm' : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 shadow-sm') 
              : 'bg-transparent border-transparent text-slate-400'
          }`}
        />
      </div>
    </div>
  );
};
