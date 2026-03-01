import React, { useState, useEffect } from 'react';
import { ProcessingStatus } from '@/app/shared/types';

type StatusOverlayProps = {
  status: ProcessingStatus;
  onClose: () => void;
};

const LOADING_TIPS = [
  "Analyzing document layout...",
  "Reading your profile data...",
  "Matching fields with AI...",
  "Applying smart context...",
  "Almost there..."
];

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ status, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const isProcessing = ['analyzing_pdf', 'mapping_ai', 'filling'].includes(status.step);
  const isError = status.step === 'error';
  const isCompleted = status.step === 'completed';
  const show = isProcessing || isError || isCompleted;

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setTipIndex(0);
      return;
    }

    let currentProgress = progress; // Start from current progress
    const progressInterval = setInterval(() => {
      // Slower asymptotic progress: smaller multiplier means slower crawl
      currentProgress += (98 - currentProgress) * 0.012; 
      setProgress(Math.min(98, currentProgress));
    }, 150);

    return () => clearInterval(progressInterval);
  }, [isProcessing, status.step]);

  useEffect(() => {
    if (status.step !== 'mapping_ai') return;
    
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2000);
    
    return () => clearInterval(tipInterval);
  }, [status.step]);

  // Adjust message and title based on step
  let title = "Processing...";
  let message = status.message;

  if (status.step === 'analyzing_pdf') {
    title = 'Reading PDF...';
    message = status.message || 'Scanning form fields...';
  } else if (status.step === 'mapping_ai') {
    title = 'AI Matching...';
    message = LOADING_TIPS[tipIndex];
  } else if (status.step === 'filling') {
    title = 'Creating PDF...';
    message = status.message || 'Finalizing document...';
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
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
            {/* Sliding Icons Animation */}
            <div className="relative w-full h-16 mb-8 overflow-hidden bg-slate-50 rounded-xl border border-slate-100 flex items-center">
              <div className="flex gap-12 animate-marquee whitespace-nowrap px-4">
                {[1, 2, 3].map((i) => (
                  <React.Fragment key={i}>
                    {/* PDF Icon */}
                    <div className="flex flex-col items-center gap-1 opacity-60 flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* AI/Sparkle Icon */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <svg className="w-6 h-6 text-violet-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                      </svg>
                    </div>
                    {/* Database/Profile Icon */}
                    <div className="flex flex-col items-center gap-1 opacity-60 flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {/* Search Icon */}
                    <div className="flex flex-col items-center gap-1 opacity-60 flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              {/* Fade overlays for the sliding edge */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {title}
            </h3>
            <p className="text-slate-500 text-sm mb-6 h-5 transition-all">
              {message}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
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
