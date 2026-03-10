import React from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';
import { MappingRow } from './MappingRow';
import { ReviewSection } from './ReviewSection';
import { SaveDataPrompt } from './SaveDataPrompt';
import { useReviewMappings } from '@/app/features/autofill-v2/hooks/useReviewMappings';
import { ArrowRightIcon, CheckCircleIcon, CloseIcon, MissingDataIcon, SparkleIcon, SpinnerIcon, TranslateIcon } from '../../../../../icons';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/shared/components/Modal';
import { Button } from '@/app/shared/components/Button';

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
    isTranslated,
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
    <Modal maxWidth="max-w-5xl" className="h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-3xl" isOpen={true} onClose={onCancel}>
        
        {/* Header */}
        <ModalHeader>
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Review Form Data</h3>
              {DEFAULT_LANG !== fromLanguage && (
                <Button
                  size="sm"
                  onClick={() => handleTranslateLabels(DEFAULT_LANG)}
                  disabled={isTranslating}
                  className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold flex items-center gap-2 group"
                  aria-label={isTranslated ? "Show original labels" : "Translate labels"}
                >
                  {isTranslating ? (
                    <SpinnerIcon className="animate-spin h-4 w-4"/>
                  ) : (
                    <TranslateIcon className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                  )}
                  {isTranslating ? 'Translating...' : (isTranslated ? 'Show original labels' : 'Translate labels')}
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Review AI matches before generating your document.</p>
          </div>
          <button onClick={onCancel} aria-label="Close modal" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-full transition-all shrink-0">
            <CloseIcon className="w-6 h-6"/>
          </button>
        </ModalHeader>

        {/* Content */}
        <ModalBody>
            
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
                     <Button size="sm" onClick={handleClearAllSuggestions} className="text-amber-700 hover:bg-amber-100/80 border border-amber-200 bg-transparent">
                        Reject All
                     </Button>
                     <Button size="sm" onClick={handleAcceptAllSuggestions} className="text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-200">
                        Accept All
                     </Button>
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

        </ModalBody>

        {/* Footer */}
        <ModalFooter>
          <Button 
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleGenerateClick}
            rightIcon={<ArrowRightIcon className="w-5 h-5"/>}
            className="rounded-xl shadow-indigo-600/30 active:scale-95"
          >
            Generate Document
          </Button>
        </ModalFooter>
    </Modal>
  );
};