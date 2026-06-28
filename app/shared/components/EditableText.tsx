import React, { useState, useEffect } from 'react';
import { CheckIcon, CloseIcon, EditSquareIcon } from '@/icons';
import { cn } from '@/app/shared/utils/cn';

type EditableTextProps = {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  textClassName?: string;
  placeholder?: string;
  multiline?: boolean;
  prefixUrl?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
};

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = '',
  inputClassName = '',
  textClassName = '',
  placeholder = 'Enter value...',
  as: Component = 'span'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Sync state when prop changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    if (tempValue.trim() !== value) {
      onSave(tempValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input 
          autoFocus
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className={cn(
            "font-medium text-slate-800 bg-white border border-primary/30 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary w-full",
            inputClassName
          )}
          placeholder={placeholder}
        />
        <div className="flex items-center gap-1 shrink-0">
          <button 
            type="button"
            onClick={handleSave} 
            className="p-1.5 text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors"
            title="Save"
          >
            <CheckIcon className="w-4 h-4"/>
          </button>
          <button 
            type="button"
            onClick={handleCancel} 
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger-light rounded-md transition-colors"
            title="Cancel"
          >
            <CloseIcon className="w-4 h-4"/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex items-center gap-2", className)}>
      <Component 
        onClick={() => setIsEditing(true)}
        className={cn("cursor-pointer hover:text-primary transition-colors", textClassName)}
        title="Click to edit"
      >
        {value || <span className="text-slate-400 italic font-normal">{placeholder}</span>}
      </Component>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-primary transition-all p-1"
        aria-label="Edit"
      >
        <EditSquareIcon className="w-3.5 h-3.5"/>
      </button>
    </div>
  );
};
