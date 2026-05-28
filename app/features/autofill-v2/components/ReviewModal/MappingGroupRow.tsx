import React from 'react';
import { FieldMapping } from '@/app/shared/types';
import { CheckCircleIcon } from '../../../../../icons';

type MappingGroupRowProps = {
  label: string;
  mappings: FieldMapping[];
  onToggle: (index: number) => void;
  hideCheckbox?: boolean;
  forceEnabled?: boolean;
};

export const MappingGroupRow: React.FC<MappingGroupRowProps> = ({ label, mappings, onToggle, hideCheckbox, forceEnabled }) => {
  const isSelected = forceEnabled ? true : mappings.some(m => Boolean(m.userValue));
  const isSuggested = mappings.some(m => Boolean(m.isSuggestion));

  const containerClasses = isSelected 
    ? (isSuggested ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200') 
    : 'bg-slate-50 border-transparent opacity-70 hover:opacity-100 hover:bg-slate-100/50';

  const checkboxClasses = isSuggested 
    ? 'text-amber-600 focus:ring-amber-500 border-amber-300' 
    : 'text-indigo-600 focus:ring-indigo-500 border-slate-300';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${containerClasses}`}>
      {!hideCheckbox && (
        <div className="pt-2">
          <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => mappings.forEach((m, i) => { if (Boolean(m.userValue) === isSelected) onToggle(i); })}
              aria-label={`Toggle auto-fill for ${label}`}
              className={`w-5 h-5 rounded focus:ring-offset-0 transition-colors shadow-sm cursor-pointer ${checkboxClasses}`}
          />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex justify-between items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                {label}
            </label>
            {isSuggested && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700 uppercase tracking-wide shrink-0 border border-amber-200/50">
                    Suggested
                </span>
            )}
        </div>
        <div className="pt-1 flex flex-wrap gap-2">
          {mappings.map((mapping, idx) => {
            const isChipSelected = Boolean(mapping.userValue);
            const isChipSuggested = Boolean(mapping.isSuggestion);

            return (
              <button
                key={`${mapping.pdfFieldName}-${idx}`}
                type="button"
                onClick={() => onToggle(idx)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                  isChipSelected 
                    ? (isChipSuggested ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-100')
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {isChipSelected ? (
                  <CheckCircleIcon className="w-4 h-4 shrink-0" />
                ) : (
                  <div className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
                )}
                <span>{mapping.displayValue || (isChipSelected ? 'Yes' : 'Select')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
