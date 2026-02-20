import React, { useState, useMemo } from 'react';
import { FieldMapping } from '../types';

interface ReviewModalProps {
  mappings: FieldMapping[];
  onConfirm: (finalMappings: FieldMapping[]) => void;
  onCancel: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ mappings, onConfirm, onCancel }) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(mappings);

  const hasSuggestions = useMemo(() => editedMappings.some(m => m.isSuggestion), [editedMappings]);

  const handleChange = (index: number, newValue: string) => {
    const updated = [...editedMappings];
    updated[index] = { ...updated[index], userValue: newValue };
    setEditedMappings(updated);
  };

  const handleToggleInclude = (index: number) => {
    const updated = [...editedMappings];
    if (updated[index].userValue) {
        updated[index].originalValue = updated[index].userValue; 
        updated[index].userValue = '';
    } else {
        updated[index].userValue = updated[index].originalValue || ' ';
    }
    setEditedMappings(updated);
  };

  const handleAcceptAllSuggestions = () => {
    // If they are already filled (default), this might re-fill cleared ones?
    // Let's assume this means "Ensure all suggestions have their original generated value"
    // But currently we initialize them with the value. 
    // Maybe we need a "Reject All Suggestions" button mainly.
    // Or if user cleared them, bring them back.
    const updated = editedMappings.map(m => {
        if (m.isSuggestion && !m.userValue && m.originalValue) {
            return { ...m, userValue: m.originalValue };
        }
        return m;
    });
    setEditedMappings(updated);
  };

  const handleClearAllSuggestions = () => {
      const updated = editedMappings.map(m => {
          if (m.isSuggestion && m.userValue) {
              return { ...m, originalValue: m.userValue, userValue: '' };
          }
          return m;
      });
      setEditedMappings(updated);
  };

  // Group mappings for display
  const matchedFields = editedMappings.filter(m => !m.isSuggestion);
  const suggestedFields = editedMappings.filter(m => m.isSuggestion);

  // Helper to render a mapping row
  const renderRow = (map: FieldMapping, originalIndex: number) => (
    <div key={originalIndex} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${map.userValue ? (map.isSuggestion ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200') : 'bg-slate-50 border-transparent opacity-60'}`}>
      <div className="pt-3">
        <input 
            type="checkbox" 
            checked={!!map.userValue} 
            onChange={() => handleToggleInclude(originalIndex)}
            className={`w-5 h-5 rounded border-slate-300 focus:ring-offset-0 ${map.isSuggestion ? 'text-amber-600 focus:ring-amber-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {map.label || map.pdfFieldName}
            </label>
            {map.isSuggestion && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                    Suggested
                </span>
            )}
        </div>
        <input
          type="text"
          value={map.userValue}
          onChange={(e) => handleChange(originalIndex, e.target.value)}
          disabled={!map.userValue && !map.originalValue} 
          placeholder={!map.userValue ? "(Skipped)" : "Value"}
          className={`w-full text-sm rounded-lg px-3 py-2 outline-none border transition-all ${
              map.userValue 
              ? (map.isSuggestion ? 'bg-white border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 shadow-sm' : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 shadow-sm') 
              : 'bg-transparent border-transparent text-slate-400'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Review Form Data</h3>
            <p className="text-sm text-slate-500">Review matches and AI suggestions before filling.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-8">
            
            {/* Suggestions Section */}
            {suggestedFields.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-amber-800 font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                AI Suggestions ({suggestedFields.length})
                            </h4>
                            <p className="text-xs text-amber-700 mt-1">
                                Values suggested based on your profile context or AI defaults.
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleClearAllSuggestions} className="text-xs font-semibold text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                                Reject All
                             </button>
                             <button onClick={handleAcceptAllSuggestions} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                Accept All
                             </button>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {editedMappings.map((m, i) => m.isSuggestion ? renderRow(m, i) : null)}
                    </div>
                </div>
            )}

            {/* Matched Section */}
            <div>
                <h4 className="text-slate-700 font-bold mb-3 flex items-center gap-2 px-1">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Matched from Profile ({matchedFields.length})
                </h4>
                <div className="space-y-3">
                    {matchedFields.length === 0 && (
                        <div className="text-center py-8 text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                            No direct profile matches found.
                        </div>
                    )}
                    {editedMappings.map((m, i) => !m.isSuggestion ? renderRow(m, i) : null)}
                </div>
            </div>

            {editedMappings.length === 0 && (
                 <p className="text-center text-slate-500 italic">No fillable fields found in this PDF.</p>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white z-10">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(editedMappings)}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] flex items-center gap-2"
          >
            <span>Fill PDF</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};