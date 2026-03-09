import React from 'react';
import { ArrowRightIcon, CloseIcon, Icon1 } from '../../../../icons';

type MarkedPdfPreviewProps = {
  base64Pdf: string;
  onContinue: () => void;
  onCancel: () => void;
};

export const MarkedPdfPreview: React.FC<MarkedPdfPreviewProps> = ({ base64Pdf, onContinue, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                <Icon1 className="w-6 h-6"/>
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800">Set-of-Marks Applied</h2>
               <p className="text-sm text-slate-500">Review the visual tags before AI processing.</p>
             </div>
          </div>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100 p-4 overflow-hidden relative">
            <iframe 
                src={`data:application/pdf;base64,${base64Pdf}#toolbar=0&navpanes=0`} 
                className="w-full h-full rounded-xl border border-slate-200 shadow-sm"
                title="Marked PDF Preview"
            />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onContinue}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            Process with AI
            <ArrowRightIcon className="w-4 h-4"/>
          </button>
        </div>

      </div>
    </div>
  );
};
