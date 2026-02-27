import React, { useState } from 'react';
import translate from 'translate';
import { FieldMapping } from '../types';
import { MappingRow } from './ReviewModal/MappingRow';

interface ReviewModalProps {
  mappings: FieldMapping[];
  fromLanguage?: string;
  onConfirm: (finalMappings: FieldMapping[]) => void;
  onCancel: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ mappings, fromLanguage = 'en', onConfirm, onCancel }) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(mappings);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMatched, setShowMatched] = useState(true);
  const targetTranslationLang = "en";

  const handleTranslateLabels = async (targetLang: string = "en") => {
    setIsTranslating(true);
    translate.engine = 'google';
    
    try {
        const labelsToTranslate = editedMappings.map(m => m.label || m.pdfFieldName);
        const batchString = labelsToTranslate.join('\n');
        const translatedBatch = await translate(batchString, { from: fromLanguage, to: targetLang });
        const translatedLabels = translatedBatch.split('\n').map(s => s.trim());
        
        const updated = editedMappings.map((m, i) => {
            const translated = translatedLabels[i];
            
            if (translated) {
                return { ...m, label: translated };
            }
            return m;
        });
        setEditedMappings(updated);
    } catch (e) {
        console.error('Translation error:', e);
    } finally {
        setIsTranslating(false);
    }
  };

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

  const matchedFields = editedMappings.filter(m => !m.isSuggestion);
  const suggestedFields = editedMappings.filter(m => m.isSuggestion);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-800">Review Form Data</h3>
              {targetTranslationLang !== fromLanguage && <button
                onClick={()=>handleTranslateLabels(targetTranslationLang)}
                disabled={isTranslating}
                className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isTranslating ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                )}
                {isTranslating ? 'Translating...' : 'Translate all labels'}
              </button>}
            </div>
            <p className="text-sm text-slate-500 mt-1">Review matches and AI suggestions before filling.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-8">
            
            {/* Suggestions Section */}
            {suggestedFields.length > 0 && (
                <div >
                    <div className=" flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="p-1 hover:bg-amber-100 rounded-lg transition-colors text-amber-800"
                            >
                                <svg className={`w-5 h-5 transition-transform duration-200 ${showSuggestions ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div>
                                <h4 className="text-amber-800 font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    AI Suggestions ({suggestedFields.length})
                                </h4>
                                <p className="text-xs text-amber-700 mt-1">
                                    Values suggested based on your profile context or AI defaults.
                                </p>
                            </div>
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
                    {showSuggestions && (
                        <div className="py-4 space-y-3">
                            {editedMappings.map((m, i) => m.isSuggestion ? (
                              <MappingRow 
                                key={`${m.pdfFieldName}-${i}`}
                                mapping={m}
                                onToggle={() => handleToggleInclude(i)}
                                onChange={(val) => handleChange(i, val)}
                              />
                            ) : null)}
                        </div>
                    )}
                </div>
            )}

            <div>
                <div className="flex items-center gap-3 mb-3 px-1">
                    <button 
                        onClick={() => setShowMatched(!showMatched)}
                        className="p-1 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                    >
                        <svg className={`w-5 h-5 transition-transform duration-200 ${showMatched ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <h4 className="text-slate-700 font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Matched from Profile ({matchedFields.length})
                    </h4>
                </div>
                {showMatched && (
                    <div className="space-y-3">
                        {matchedFields.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">
                                No direct profile matches found.
                            </div>
                        )}
                        {editedMappings.map((m, i) => !m.isSuggestion ? (
                          <MappingRow 
                            key={`${m.pdfFieldName}-${i}`}
                            mapping={m}
                            onToggle={() => handleToggleInclude(i)}
                            onChange={(val) => handleChange(i, val)}
                          />
                        ) : null)}
                    </div>
                )}
            </div>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};