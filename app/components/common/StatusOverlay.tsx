import React from 'react';
import { ProcessingStatus } from '../../types';

interface StatusOverlayProps {
  status: ProcessingStatus;
  onClose: () => void;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ status, onClose }) => {
  const isProcessing = ['analyzing_pdf', 'mapping_ai', 'filling'].includes(status.step);
  const isError = status.step === 'error';
  const isCompleted = status.step === 'completed';
  const show = isProcessing || isError || isCompleted;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in fade-in zoom-in duration-200">
        
        {!isProcessing && (
           <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {status.step === 'analyzing_pdf' ? 'Reading PDF...' : 
               status.step === 'mapping_ai' ? 'AI Matching...' : 'Creating PDF...'}
            </h3>
            <p className="text-slate-500 text-sm">{status.message}</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Error</h3>
            <p className="text-slate-500 text-sm mb-6">{status.message}</p>
            <button 
              onClick={onClose} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
            <p className="text-slate-500 text-sm mb-6">{status.message}</p>
            
            {status.downloadUrl && (
                <a 
                    href={status.downloadUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mb-3 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-2 rounded-lg transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open PDF
                </a>
            )}

            <button 
              onClick={onClose} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
