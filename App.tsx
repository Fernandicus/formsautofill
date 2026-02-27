import React, { useState, useRef } from 'react';
import { DataProfile } from './components/DataProfile';
import { ReviewModal } from './components/ReviewModal';
import { StatusOverlay } from './components/common/StatusOverlay';
import { extractFormFields, fillPdf } from './services/pdfService';
import { mapFieldsWithGemini } from './services/geminiService';
import { FieldMapping, ProcessingStatus, UserField } from './types';
import { useDataGroups } from './hooks/useDataGroups';

const App: React.FC = () => {
  const { 
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    duplicateGroup 
  } = useDataGroups();

  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle' });
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [pdfLanguage, setPdfLanguage] = useState<string>('en');
  const [showReview, setShowReview] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processPdf = async (file: File) => {
    try {
      setStatus({ step: 'analyzing_pdf', message: 'Scanning PDF fields...' });
      const pdfFields = await extractFormFields(file);

      if (pdfFields.length === 0) {
        setStatus({ step: 'error', message: 'No fillable forms found in this PDF.' });
        return;
      }

      setStatus({ step: 'mapping_ai', message: 'Gemini is thinking...' });
      
      const flattenedFields: UserField[] = groups.flatMap(group => 
        group.fields.map(field => ({
            id: field.id,
            key: `${group.name}: ${field.key}`,
            value: field.value
        }))
      );

      const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(pdfFields, flattenedFields, file);
      
      setMappings(generatedMappings);
      setPdfLanguage(detectedLanguage);
      setStatus({ step: 'review' });
      setShowReview(true);

    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'An error occurred during processing.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setStatus({ step: 'idle' });
      processPdf(file);
      e.target.value = '';
    }
  };

  const handleConfirmFill = async (finalMappings: FieldMapping[]) => {
    if (!currentFile) return;
    setShowReview(false);
    setStatus({ step: 'filling', message: 'Generating your PDF...' });

    try {
      const pdfBytes = await fillPdf(currentFile, finalMappings);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');

      setStatus({ 
          step: 'completed', 
          message: win ? 'PDF Ready! Opened in new tab.' : 'PDF Ready! Click below to view.',
          downloadUrl: url
      });
    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'Failed to write to PDF.' });
    }
  };

  const closeStatusModal = () => {
    setStatus({ step: 'idle' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              AutoFill AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              Powered by Gemini 3 Flash
            </div>
            <button 
              onClick={handleUploadClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload PDF
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
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
          onCancel={() => { setShowReview(false); setStatus({ step: 'idle' }); }} 
        />
      )}

      <StatusOverlay status={status} onClose={closeStatusModal} />
    </div>
  );
};

export default App;