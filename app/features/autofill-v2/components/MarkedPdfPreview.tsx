import React from 'react';
import { ArrowRightIcon, CloseIcon, Icon1 } from '../../../../icons';
import { Modal } from '@/app/shared/components/Modal';
import { Button } from '@/app/shared/components/Button';

type MarkedPdfPreviewProps = {
  base64Pdf: string;
  onContinue: () => void;
  onCancel: () => void;
};

export const MarkedPdfPreview: React.FC<MarkedPdfPreviewProps> = ({ base64Pdf, onContinue, onCancel }) => {
  return (
    <Modal maxWidth="max-w-4xl" className="h-[85vh] rounded-2xl" isOpen={true} onClose={onCancel}>
        
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
          <Button 
            variant="ghost"
            onClick={onCancel}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={onContinue}
            rightIcon={<ArrowRightIcon className="w-4 h-4"/>}
            className="rounded-xl"
          >
            Process with AI
          </Button>
        </div>

    </Modal>
  );
};
