import React, { useState } from 'react';

type AddFieldFormProps = {
  onAdd: (key: string, value: string) => void;
};

export const AddFieldForm: React.FC<AddFieldFormProps> = ({ onAdd }) => {
  const [addKey, setAddKey] = useState('');
  const [addValue, setAddValue] = useState('');

  const handleAddField = () => {
    if (addKey.trim() && addValue.trim()) {
      onAdd(addKey, addValue);
      setAddKey('');
      setAddValue('');
    }
  };

  return (
    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Add Field
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="relative">
          <input
            type="text"
            value={addKey}
            onChange={(e) => setAddKey(e.target.value)}
            className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
            placeholder="Type (e.g. Email)"
          />
        </div>
        <input
          type="text"
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
          className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
          placeholder="Value"
        />
      </div>
      <button
        type="button"
        onClick={handleAddField}
        disabled={!addKey.trim() || !addValue.trim()}
        className="w-full text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
      >
        Add Field
      </button>
    </div>
  );
};
