import React from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';
import { MappingRow } from './MappingRow';
import { ReviewSection } from './ReviewSection';
import { SaveDataPrompt } from './SaveDataPrompt';
import { useReviewMappings } from '@/app/features/autofill-v2/hooks/useReviewMappings';
import { ArrowRightIcon, CheckCircleIcon, CloseIcon, MissingDataIcon, SparkleIcon, SpinnerIcon, TranslateIcon } from '../../../../../icons';

type ReviewModalProps = {
  mappings: FieldMapping[];
  fromLanguage?: string;
  onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
  onCancel: () => void;
};

const DEFAULT_LANG = "en";

export const ReviewModal: React.FC<ReviewModalProps> = ({ mappings, fromLanguage = DEFAULT_LANG, onConfirm, onCancel }) => {
  const {
    editedMappings,
    isTranslating,
    showMissing,
    setShowMissing,
    showSuggestions,
    setShowSuggestions,
    showMatched,
    setShowMatched,
    showSavePrompt,
    fieldsToSave,
    missingIndices,
    suggestedIndices,
    matchedIndices,
    handleTranslateLabels,
    handleChange,
    handleToggleInclude,
    handleAcceptAllSuggestions,
    handleClearAllSuggestions,
    handleGenerateClick,
    confirmSaveAndGenerate,
    updateFieldToSave,
    removeFieldToSave
  } = useReviewMappings({
    initialMappings: mappings,
    fromLanguage,
    onConfirm,
    defaultLang: DEFAULT_LANG
  });

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
      <SaveDataPrompt 
        fieldsToSave={fieldsToSave}
        editedMappings={editedMappings}
        onConfirm={confirmSaveAndGenerate}
        updateFieldToSave={updateFieldToSave}
        removeFieldToSave={removeFieldToSave}
      />
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
                    <SpinnerIcon className="animate-spin h-4 w-4"/>
                  ) : (
                    <TranslateIcon className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                  )}
                  {isTranslating ? 'Translating...' : 'Translate labels'}
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Review AI matches before generating your document.</p>
          </div>
          <button onClick={onCancel} aria-label="Close modal" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-full transition-all shrink-0">
            <CloseIcon className="w-6 h-6"/>
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
                icon={<MissingDataIcon className="w-5 h-5"/>}
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
                icon={<SparkleIcon className="w-5 h-5"/>}
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
                icon={<CheckCircleIcon className="w-5 h-5"/>}
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
            <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};