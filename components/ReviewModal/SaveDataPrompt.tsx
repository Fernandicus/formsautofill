import React from 'react';
import { FieldMapping, UserField } from '../../types';
import { FieldItem } from '../DataProfile/FieldItem';

interface SaveDataPromptProps {
  fieldsToSave: UserField[];
  editedMappings: FieldMapping[];
  onConfirm: (withSave: boolean) => void;
  updateFieldToSave: (index: number, key: string, value: string) => void;
  removeFieldToSave: (id: string) => void;
}

export const SaveDataPrompt: React.FC<SaveDataPromptProps> = ({
  fieldsToSave,
  onConfirm,
  updateFieldToSave,
  removeFieldToSave
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center">
          <div className="p-6 shrink-0 pb-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Save New Data?</h3>
              <p className="text-sm text-slate-500">
                You filled out <span className="font-bold text-indigo-600">{fieldsToSave.length}</span> new field(s). Modify their labels below if needed, and store them for future use.
              </p>
          </div>

          <div className="overflow-y-auto px-6 pb-2 space-y-3 text-left w-full custom-scrollbar">
            {fieldsToSave.map((field, idx) => (
              <FieldItem 
                key={field.id}
                field={field}
                onUpdate={(key, value) => updateFieldToSave(idx, key, value)}
                onRemove={() => removeFieldToSave(field.id)}
              />
            ))}
          </div>

          <div className="p-6 shrink-0 pt-4 flex gap-3 justify-center bg-white border-t border-slate-50">
              <button 
                onClick={() => onConfirm(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                No, just generate
              </button>
              <button 
                onClick={() => onConfirm(true)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-2"
              >
                Yes, store it
              </button>
          </div>
      </div>
    </div>
  );
};
