import React, { useRef } from 'react';
import { DataProfile } from './features/profile/components/DataProfile';
import { ReviewModal } from './features/autofill-v2/components/ReviewModal';
import { MarkedPdfPreview } from './features/autofill-v2/components/MarkedPdfPreview';
import { StatusOverlay } from './shared/components/StatusOverlay';
import { useDataGroups } from './features/profile/hooks/useDataGroups';
import { usePdfProcessing } from './features/autofill-v2/hooks/usePdfProcessing';
import { AutoFillLogoIcon, UploadIcon } from '../icons';
import { Button } from './shared/components/Button';

const App: React.FC = () => {
  const {
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    duplicateGroup,
    saveScrapedFields
  } = useDataGroups();

  const {
    status,
    mappings,
    pdfLanguage,
    showReview,
    markedBase64,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
    continueMapping,
    cancelMarksReview,
  } = usePdfProcessing({ groups, saveScrapedFields });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <AutoFillLogoIcon className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              AutoFill AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              Powered by Gemini 3 Flash
            </div>
            <Button 
              variant="primary"
              onClick={handleUploadClick}
              leftIcon={<UploadIcon className="w-4 h-4"/>}
            >
              Upload PDF
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataProfile 
          groups={groups} 
          addGroup={addGroup}
          updateGroup={updateGroup}
          deleteGroup={deleteGroup}
          duplicateGroup={duplicateGroup}
        />
      </main>

      {showReview && (
        <ReviewModal 
          mappings={mappings} 
          fromLanguage={pdfLanguage}
          onConfirm={handleConfirmFill} 
          onCancel={cancelReview} 
        />
      )}

      {status.step === 'review_marks' && markedBase64 && (
        <MarkedPdfPreview 
          base64Pdf={markedBase64}
          onContinue={continueMapping}
          onCancel={cancelMarksReview}
        />
      )}

      <StatusOverlay status={status} onClose={closeStatusModal} />
    </div>
  );
};

export default App;