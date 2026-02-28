import React, { useState, useMemo } from 'react';
import translate from 'translate';
import { FieldMapping, UserField } from '../types';
import { MappingRow } from './ReviewModal/MappingRow';
import { ReviewSection } from './ReviewModal/ReviewSection';
import { FieldItem } from './DataProfile/FieldItem';

interface ReviewModalProps {
  mappings: FieldMapping[];
  fromLanguage?: string;
  onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
  onCancel: () => void;
}

const DEFAULT_LANG = "en";

export const ReviewModal: React.FC<ReviewModalProps> = ({ mappings, fromLanguage = DEFAULT_LANG, onConfirm, onCancel }) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(mappings);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [showMissing, setShowMissing] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMatched, setShowMatched] = useState(true);

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [fieldsToSave, setFieldsToSave] = useState<UserField[]>([]);

  // Derive initial indices for stable sections. This determines the category, 
  // so fields DO NOT jump between sections as the user edits them.
  const { missingIndices, suggestedIndices, matchedIndices } = useMemo(() => {
    const missing: number[] = [];
    const suggested: number[] = [];
    const matched: number[] = [];

    mappings.forEach((mapping, idx) => {
      if (!mapping.userValue) {
        missing.push(idx);
      } else if (mapping.isSuggestion) {
        suggested.push(idx);
      } else {
        matched.push(idx);
      }
    });

    return { missingIndices: missing, suggestedIndices: suggested, matchedIndices: matched };
  }, [mappings]);

  const handleTranslateLabels = async (targetLang: string = DEFAULT_LANG) => {
    if (isTranslating) return; // Guard clause
    
    setIsTranslating(true);
    translate.engine = 'google';
    
    try {
        const labelsToTranslate = editedMappings.map(m => m.label || m.pdfFieldName);
        const batchString = labelsToTranslate.join('\n');
        const translatedBatch = await translate(batchString, { from: fromLanguage, to: targetLang });
        const translatedLabels = translatedBatch.split('\n').map(s => s.trim());
        
        const updated = editedMappings.map((m, i) => {
            const translated = translatedLabels[i];
            return translated ? { ...m, label: translated } : m;
        });
        setEditedMappings(updated);
    } catch (error) {
        console.error('Translation error:', error);
    } finally {
        setIsTranslating(false);
    }
  };

  const handleChange = (index: number, newValue: string) => {
    setEditedMappings(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], userValue: newValue };
        return updated;
    });
  };

  const handleToggleInclude = (index: number) => {
    setEditedMappings(prev => {
        const updated = [...prev];
        const current = updated[index];
        
        if (current.userValue) {
            // Unchecking: stash the current value so we can restore it if they check it again
            current.originalValue = current.userValue; 
            current.userValue = '';
        } else {
            // Checking: restore the original value, or provide a space if they explicitly check an empty line
            current.userValue = current.originalValue || ' ';
        }
        return updated;
    });
  };

  const handleAcceptAllSuggestions = () => {
    setEditedMappings(prev => prev.map(m => {
        if (!m.isSuggestion || m.userValue || !m.originalValue) return m;
        return { ...m, userValue: m.originalValue };
    }));
  };

  const handleClearAllSuggestions = () => {
      setEditedMappings(prev => prev.map(m => {
          if (!m.isSuggestion || !m.userValue) return m;
          return { ...m, originalValue: m.userValue, userValue: '' };
      }));
  };

  const handleGenerateClick = () => {
    // Collect filled missing fields
    const newlyFilled: UserField[] = missingIndices
      .filter(idx => {
         const mapping = editedMappings[idx];
         return mapping.userValue && mapping.userValue.trim() !== '';
      })
      .map(idx => ({
         id: crypto.randomUUID(),
         key: editedMappings[idx].label || editedMappings[idx].pdfFieldName,
         value: editedMappings[idx].userValue
      }));

    if (newlyFilled.length > 0) {
      setFieldsToSave(newlyFilled);
      setShowSavePrompt(true);
    } else {
      onConfirm(editedMappings);
    }
  };

  const renderMappingRows = (indices: number[]) => (
      indices.map(index => (
        <MappingRow 
            key={`${editedMappings[index].pdfFieldName}-${index}`}
            mapping={editedMappings[index]}
            onToggle={() => handleToggleInclude(index)}
            onChange={(val) => handleChange(index, val)}
        />
      ))
  );

  if (showSavePrompt) {
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
                <p className="text-sm text-slate-500">You filled out <span className="font-bold text-indigo-600">{fieldsToSave.length}</span> new field(s). Modify their labels below if needed, and store them for future use.</p>
            </div>

            <div className="overflow-y-auto px-6 pb-2 space-y-3 text-left w-full custom-scrollbar">
              {fieldsToSave.map((field, idx) => (
                <FieldItem 
                  key={field.id}
                  field={field}
                  onUpdate={(key, value) => {
                      const updated = [...fieldsToSave];
                      updated[idx] = { ...updated[idx], key, value };
                      setFieldsToSave(updated);
                  }}
                  onRemove={() => {
                      setFieldsToSave(prev => prev.filter(f => f.id !== field.id));
                  }}
                />
              ))}
            </div>

            <div className="p-6 shrink-0 pt-4 flex gap-3 justify-center bg-white border-t border-slate-50">
                <button 
                  onClick={() => onConfirm(editedMappings)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  No, just generate
                </button>
                <button 
                  onClick={() => onConfirm(editedMappings, fieldsToSave)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-2"
                >
                  Yes, store it
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Review Form Data</h3>
              {DEFAULT_LANG !== fromLanguage && (
                <button
                  onClick={() => handleTranslateLabels(DEFAULT_LANG)}
                  disabled={isTranslating}
                  className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 group disabled:opacity-50"
                  aria-label="Translate labels"
                >
                  {isTranslating ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  )}
                  {isTranslating ? 'Translating...' : 'Translate labels'}
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Review AI matches before generating your document.</p>
          </div>
          <button onClick={onCancel} aria-label="Close modal" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-full transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6 scroll-smooth">
            
            <ReviewSection
                title="Missing Data"
                description="These fields were found in the PDF but have no matching data. Please fill them manually."
                count={missingIndices.length}
                isOpen={showMissing}
                onToggle={() => setShowMissing(!showMissing)}
                theme="rose"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            >
                {renderMappingRows(missingIndices)}
            </ReviewSection>

            <ReviewSection
                title="AI Suggestions"
                description="Values inferred from your profile context. Verify these carefully."
                count={suggestedIndices.length}
                isOpen={showSuggestions}
                onToggle={() => setShowSuggestions(!showSuggestions)}
                theme="amber"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                actions={
                  <>
                     <button onClick={handleClearAllSuggestions} className="text-xs font-bold text-amber-700 hover:bg-amber-100/80 px-4 py-2 rounded-lg transition-colors border border-amber-200">
                        Reject All
                     </button>
                     <button onClick={handleAcceptAllSuggestions} className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-amber-200">
                        Accept All
                     </button>
                  </>
                }
            >
                {renderMappingRows(suggestedIndices)}
            </ReviewSection>

            <ReviewSection
                title="Matched from Profile"
                description="Direct verified matches between the form and your stored profile data."
                count={matchedIndices.length}
                isOpen={showMatched}
                onToggle={() => setShowMatched(!showMatched)}
                theme="indigo"
                emptyMessage="No direct profile matches were found."
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
                {renderMappingRows(matchedIndices)}
            </ReviewSection>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white z-10 shrink-0">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerateClick}
            className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <span>Generate Document</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};