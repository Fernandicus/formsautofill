import React, { useState } from 'react';
import { UploadIcon } from '@/icons';
import { Button } from '@/app/shared/components/Button';
import { WizardCard } from './base/WizardCard';
import { WizardStepHeader } from './items/WizardStepHeader';
import { UploadedFileList } from './base/UploadedFileList';
import { FileDropzone } from './base/FileDropzone';
import { MobileFixedBottomButton } from './base/MobileFixedBottomButton';

type Step2UploadDocsProps = {
  onContinue: (files: File[]) => void;
  isProcessing: boolean;
};

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const Step2UploadDocs: React.FC<Step2UploadDocsProps> = ({ onContinue, isProcessing }) => {
  const [docs, setDocs] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (files: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only PDF, JPG, and PNG files are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Files must be under 10MB.');
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setDocs(prev => [...prev, ...validFiles]);
    }
  };

  const handleContinue = () => {
    onContinue(docs);
  };

  const isButtonDisabled = docs.length === 0 || isProcessing;

  return (
    <WizardCard className="relative overflow-hidden min-h-[400px]">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="processing-loader mb-8"></div>
          <p className="text-lg font-bold text-primary animate-pulse mt-4">Processing your documents...</p>
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <WizardStepHeader
          title="2. Upload your supporting documents"
          description={
            <>
              Upload all documents or files that might contain the data requested by the form you want to complete.
              <br/>For example: <strong>ID Card and Employment Contract</strong>
            </>
          }
          containerClassName="mb-0 text-left flex-1 mr-4"
        />
        <Button 
          variant="primary" 
          onClick={handleContinue} 
          disabled={isButtonDisabled}
          isLoading={isProcessing}
          className="hidden sm:inline-flex"
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </Button>
      </div>

      {/* Mobile fixed bottom button */}
      <MobileFixedBottomButton
        onClick={handleContinue}
        disabled={isButtonDisabled}
        isLoading={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Continue'}
      </MobileFixedBottomButton>

      <UploadedFileList files={docs} />

      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
      )}

      <FileDropzone
        icon={<UploadIcon className="w-6 h-6 text-indigo-600" />}
        title="Click to upload photos or files"
        description="ID, Passport, utility bills, certificates (JPG, PNG, PDF)"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple={true}
        disabled={isProcessing}
        onFilesAdded={addFiles}
      />
    </WizardCard>
  );
};


