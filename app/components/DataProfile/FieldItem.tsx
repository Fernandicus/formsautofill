import React, { useState } from 'react';
import { UserField } from '../../types';

type FieldItemProps = {
  field: UserField;
  onUpdate: (key: string, value: string) => void;
  onRemove: () => void;
};

export const FieldItem: React.FC<FieldItemProps> = ({ field, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(field.key);
  const [editValue, setEditValue] = useState(field.value);

  const handleSave = () => {
    if (editKey.trim() && editValue.trim()) {
      onUpdate(editKey.trim(), editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditKey(field.key);
    setEditValue(field.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm animate-in fade-in duration-200">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <input 
            value={editKey}
            onChange={e => setEditKey(e.target.value)}
            className="text-xs font-bold text-indigo-600 uppercase tracking-wider w-full bg-white border border-indigo-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-indigo-300"
            placeholder="FIELD NAME"
          />
          <input 
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="text-slate-800 font-medium w-full bg-white border border-indigo-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Value"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <button 
            onClick={handleSave} 
            className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
            title="Save"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button 
            onClick={handleCancel} 
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg group border bg-slate-50 border-transparent hover:border-slate-200 transition-all">
      <div 
        className="flex-1 min-w-0 cursor-pointer" 
        onClick={() => setIsEditing(true)}
      >
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block truncate mb-0.5">
          {field.key}
        </span>
        <span className="text-slate-800 font-medium block break-words">
          {field.value}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 self-center">
        <button 
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-2 text-slate-300 homever:text-indigo-600 hover:bg-white rounded-md transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          type="button"
          onClick={onRemove}
          className="text-slate-300 hover:text-red-500 hover:bg-white transition-colors p-2 rounded-md"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
