import React, { useState, useRef } from 'react';
import { DataProfile } from './components/DataProfile';
import { ReviewModal } from './components/ReviewModal';
import { extractFormFields, fillPdf } from './services/pdfService';
import { mapFieldsWithGemini } from './services/geminiService';
import { DataGroup, FieldMapping, ProcessingStatus, UserField } from './types';
import { INITIAL_DATA_GROUPS } from './constants';

const App: React.FC = () => {
  const [dataGroups, setDataGroups] = useState<DataGroup[]>(INITIAL_DATA_GROUPS);
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle' });
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showReview, setShowReview] = useState(false);
  
  // We keep a reference to the file to re-use if needed, though mostly handled in flow now
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentFile(file);
      // Reset status to ensure overlay shows correct state
      setStatus({ step: 'idle' });
      // Start processing immediately
      processPdf(file);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
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
      
      // Flatten fields for AI context, including group names for better inference
      const flattenedFields: UserField[] = dataGroups.flatMap(group => 
        group.fields.map(field => ({
            id: field.id,
            key: `${group.name}: ${field.key}`,
            value: field.value
        }))
      );

      const generatedMappings = await mapFieldsWithGemini(pdfFields, flattenedFields);
      
      setMappings(generatedMappings);
      setStatus({ step: 'review' });
      setShowReview(true);

    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'An error occurred during processing.' });
    }
  };

  const handleConfirmFill = async (finalMappings: FieldMapping[]) => {
    if (!currentFile) return;
    setShowReview(false);
    setStatus({ step: 'filling', message: 'Generating your PDF...' });

    try {
      const pdfBytes = await fillPdf(currentFile, finalMappings);
      
      // Trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled_${currentFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus({ step: 'completed', message: 'PDF Ready! Download started.' });
    } catch (error) {
      setStatus({ step: 'error', message: 'Failed to write to PDF.' });
    }
  };

  const closeStatusModal = () => {
    setStatus({ step: 'idle' });
  };

  const isProcessing = ['analyzing_pdf', 'mapping_ai', 'filling'].includes(status.step);
  const isError = status.step === 'error';
  const isCompleted = status.step === 'completed';
  const showStatusModal = isProcessing || isError || isCompleted;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">AutoFill AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              Powered by Gemini 3 Flash
            </div>
            <button 
              onClick={handleUploadClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
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
        <div className="w-full">
            {/* Full Width Data Profile */}
            {/* Height calculated to fill screen minus header and padding */}
            
                <DataProfile groups={dataGroups} setGroups={setDataGroups} />
            
        </div>
      </main>

      {/* Review Modal */}
      {showReview && (
        <ReviewModal 
          mappings={mappings} 
          onConfirm={handleConfirmFill} 
          onCancel={() => { setShowReview(false); setStatus({ step: 'idle' }); }} 
        />
      )}

      {/* Status / Loading Overlay */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in fade-in zoom-in duration-200">
            
            {/* Close button for Error/Success */}
            {!isProcessing && (
               <button onClick={closeStatusModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{status.step === 'analyzing_pdf' ? 'Reading PDF...' : status.step === 'mapping_ai' ? 'AI Matching...' : 'Creating PDF...'}</h3>
                <p className="text-slate-500 text-sm">{status.message}</p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Error</h3>
                <p className="text-slate-500 text-sm mb-6">{status.message}</p>
                <button onClick={closeStatusModal} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
                <p className="text-slate-500 text-sm mb-6">{status.message}</p>
                <button onClick={closeStatusModal} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-lg shadow-indigo-200">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;