import React from 'react';
import { Button } from '@/app/shared/components/Button';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { WizardCard } from './base/WizardCard';

type Step4DownloadProps = {
  downloadUrl: string | null;
  onRestart: () => void;
};

export const Step4Download: React.FC<Step4DownloadProps> = ({ downloadUrl, onRestart }) => {
  return (
    <WizardCard className="sm:p-12 text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Form ready to download!</h2>
      <p className="text-slate-600 mb-10 max-w-lg mx-auto">
        The AI has integrated your information directly into the original PDF form. Review it and download it ready to sign.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-12 px-6">
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Completed PDF
            </Button>
          </a>
        )}
        
        <Button variant="secondary" onClick={onRestart} className="w-full sm:w-auto h-12 px-6">
          <RefreshCwIcon className="w-5 h-5 mr-2" />
          Fill another PDF
        </Button>
      </div>
    </WizardCard>
  );
};
