import React from 'react';
import { FieldMapping } from '@/app/shared/types';
import { CheckCircleIcon } from '@/icons';
import { AlertCircleIcon } from 'lucide-react';

// --- Types ---
type MappingRowProps = {
  mapping: FieldMapping;
  onToggle?: () => void;
  onChange: (value: string) => void;
  hideCheckbox?: boolean;
  forceEnabled?: boolean;
};

// --- Helper Functions for Class Names (Guard Clauses) ---
const resolveContainerClasses = (isIncluded: boolean, isSuggested: boolean, isInvalidOption: boolean): string => {
  if (isInvalidOption) return 'bg-red-50/80 border-red-300 ring-1 ring-red-200 shadow-sm';
  if (!isIncluded) return 'bg-slate-50 border-transparent opacity-70 hover:opacity-100 hover:bg-slate-100/50';
  if (isSuggested) return 'bg-amber-50/80 border-amber-200';
  return 'bg-white border-slate-200';
};

const resolveCheckboxClasses = (isSuggested: boolean, isInvalidOption: boolean): string => {
  if (isInvalidOption) return 'text-red-600 focus:ring-red-500 border-red-300';
  if (isSuggested) return 'text-amber-600 focus:ring-amber-500 border-amber-300';
  return 'text-indigo-600 focus:ring-indigo-500 border-slate-300';
};

const resolveInputClasses = (isIncluded: boolean, isSuggested: boolean): string => {
  if (!isIncluded) return 'bg-white/50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 text-slate-900 shadow-sm hover:border-slate-300 cursor-not-allowed text-slate-500';
  if (isSuggested) return 'bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900 shadow-sm';
  return 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 shadow-sm';
};

// --- Sub-components (SRP) ---

const MappingLabel: React.FC<{
  label?: string;
  pdfFieldName: string;
  isInvalidOption: boolean;
  isSuggested: boolean;
}> = ({ label, pdfFieldName, isInvalidOption, isSuggested }) => {
  const displayLabel = label || pdfFieldName;
  
  return (
    <div className="flex justify-between items-center gap-2">
      <label className={`text-xs font-bold uppercase tracking-wider truncate flex items-center gap-1.5 ${isInvalidOption ? 'text-red-700' : 'text-slate-600'}`}>
        {isInvalidOption && <AlertCircleIcon className="w-3.5 h-3.5" />}
        {displayLabel}
      </label>
      {isSuggested && !isInvalidOption && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700 uppercase tracking-wide shrink-0 border border-amber-200/50">
          Suggested
        </span>
      )}
      {isInvalidOption && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wide shrink-0 border border-red-200">
          Invalid Value
        </span>
      )}
    </div>
  );
};

const MappingCheckboxControl: React.FC<{
  mapping: FieldMapping;
  isCheckboxChecked: boolean;
  isSuggested: boolean;
  onClick: () => void;
}> = ({ mapping, isCheckboxChecked, isSuggested, onClick }) => {
  const getButtonClass = () => {
    if (!isCheckboxChecked) return 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600';
    if (isSuggested) return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
    return 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-100';
  };

  const displayValue = mapping.displayValue || (isCheckboxChecked ? 'Yes' : 'Select');

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${getButtonClass()}`}
      >
        {isCheckboxChecked ? (
          <CheckCircleIcon className="w-4 h-4 shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
        )}
        <span>{displayValue}</span>
      </button>
    </div>
  );
};

const MappingOptionsControl: React.FC<{
  mapping: FieldMapping;
  userValue?: string;
  isIncluded: boolean;
  isSuggested: boolean;
  isInvalidOption: boolean;
  forceEnabled: boolean;
  onChange: (val: string) => void;
}> = ({ mapping, userValue, isIncluded, isSuggested, isInvalidOption, forceEnabled, onChange }) => {
  if (!mapping.options) return null;

  return (
    <div className="pt-1 flex flex-wrap gap-2">
      {mapping.options.map((option, idx) => {
        const isOptionSelected = forceEnabled ? userValue === option : (isIncluded && userValue === option);
        const displayLabel = mapping.radioOptionsMap?.[option] || option;

        const getButtonClass = () => {
          if (isOptionSelected) {
            return isSuggested 
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-100';
          }
          if (isInvalidOption) return 'bg-white border-red-200 text-red-700 hover:bg-red-50';
          return 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600';
        };

        return (
          <button
            key={`${option}-${idx}`}
            type="button"
            onClick={() => onChange(isOptionSelected ? '' : option)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${getButtonClass()}`}
          >
            {isOptionSelected ? (
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
            ) : (
              <div className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
            )}
            <span>{displayLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

const MappingTextControl: React.FC<{
  mapping: FieldMapping;
  userValue?: string;
  isIncluded: boolean;
  isSuggested: boolean;
  forceEnabled: boolean;
  onChange: (val: string) => void;
}> = ({ mapping, userValue, isIncluded, isSuggested, forceEnabled, onChange }) => {
  const value = forceEnabled ? (userValue || '') : (isIncluded ? userValue : (mapping.originalValue || ''));
  const placeholder = isIncluded ? "Add a value to include" : "Click to type an implicit value...";
  const inputClasses = resolveInputClasses(isIncluded, isSuggested);

  return (
    <input
      type="text"
      value={value}
      disabled={!isIncluded}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm rounded-lg px-3 py-2.5 outline-none border focus:ring-2 transition-all ${inputClasses}`}
    />
  );
};

// --- Main Component ---
export const MappingRow: React.FC<MappingRowProps> = ({ mapping, onToggle, onChange, hideCheckbox, forceEnabled }) => {
  const { userValue, isSuggestion, label, pdfFieldName, type, options } = mapping;
  
  const isIncluded = forceEnabled ? true : Boolean(userValue);
  const isSuggested = Boolean(isSuggestion);
  
  const isInvalidOption = Boolean(
    (type === 'Dropdown' || type === 'RadioGroup') && 
    options && 
    options.length > 0 && 
    userValue && 
    !options.includes(userValue)
  );

  const containerClasses = resolveContainerClasses(isIncluded, isSuggested, isInvalidOption);
  const checkboxClasses = resolveCheckboxClasses(isSuggested, isInvalidOption);
  const isCheckboxChecked = forceEnabled ? userValue === 'Yes' : isIncluded;

  const handleCheckboxToggle = () => {
    if (onToggle) {
        onToggle();
    } else {
        onChange(userValue === 'Yes' ? '' : 'Yes');
    }
  };

  const renderControl = () => {
    if (type === 'CheckBox') {
      return (
        <MappingCheckboxControl
          mapping={mapping}
          isCheckboxChecked={isCheckboxChecked}
          isSuggested={isSuggested}
          onClick={handleCheckboxToggle}
        />
      );
    }
    
    if (type === 'RadioGroup' || type === 'Dropdown') {
      return (
        <MappingOptionsControl
          mapping={mapping}
          userValue={userValue}
          isIncluded={isIncluded}
          isSuggested={isSuggested}
          isInvalidOption={isInvalidOption}
          forceEnabled={Boolean(forceEnabled)}
          onChange={onChange}
        />
      );
    }
    
    return (
      <MappingTextControl
        mapping={mapping}
        userValue={userValue}
        isIncluded={isIncluded}
        isSuggested={isSuggested}
        forceEnabled={Boolean(forceEnabled)}
        onChange={onChange}
      />
    );
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${containerClasses}`}>
      {!hideCheckbox && (
        <div className="pt-2">
          <input 
              type="checkbox" 
              checked={isIncluded} 
              onChange={onToggle}
              aria-label={`Toggle auto-fill for ${label || pdfFieldName}`}
              className={`w-5 h-5 rounded focus:ring-offset-0 transition-colors shadow-sm cursor-pointer ${checkboxClasses}`}
          />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <MappingLabel 
          label={label} 
          pdfFieldName={pdfFieldName} 
          isInvalidOption={isInvalidOption} 
          isSuggested={isSuggested} 
        />

        {isInvalidOption && (
            <div className="text-xs text-red-600 mt-1 mb-2 font-medium bg-red-100/50 p-2 rounded-lg border border-red-100 inline-block">
                The current value <span className="font-bold">"{userValue}"</span> is not valid for this field. Please select one of the valid options below.
            </div>
        )}

        {renderControl()}
      </div>
    </div>
  );
};
