import React, { useState, useEffect } from 'react';
import { ProcessingStatus } from '@/app/shared/types';
import { CheckIcon, CloseIcon, DocumentIcon, ExternalLinkIcon, SearchIcon, SparkleIcon, UserIcon, WarningIcon } from '../../../icons';

type StatusOverlayProps = {
  status: ProcessingStatus;
  onClose: () => void;
};

import { useStatusOverlayLogic } from '../hooks/useStatusOverlayLogic';

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ status, onClose }) => {
  const {
    progress,
    isProcessing,
    isError,
    isCompleted,
    show,
    title,
    message
  } = useStatusOverlayLogic(status);

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
             <CloseIcon className="w-5 h-5"/>
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
                      <DocumentIcon className="w-6 h-6 text-indigo-500"/>
                    </div>
                    {/* AI/Sparkle Icon */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <SparkleIcon className="w-6 h-6 text-violet-500 animate-pulse"/>
                    </div>
                    {/* Database/Profile Icon */}
                    <div className="flex flex-col items-center gap-1 opacity-60 flex-shrink-0">
                      <UserIcon className="w-6 h-6 text-blue-500"/>
                    </div>
                    {/* Search Icon */}
                    <div className="flex flex-col items-center gap-1 opacity-60 flex-shrink-0">
                      <SearchIcon className="w-6 h-6 text-emerald-500"/>
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
               <WarningIcon className="w-8 h-8"/>
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
              <CheckIcon className="w-8 h-8"/>
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
                    <ExternalLinkIcon className="w-4 h-4"/>
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
