import React, { useState } from 'react';
import { UploadIcon } from '@/icons';
import { WizardCard } from './base/WizardCard';
import { WizardStepHeader } from './items/WizardStepHeader';
import { FileDropzone } from './base/FileDropzone';

type Step1UploadPdfProps = {
  onUpload: (file: File) => Promise<void> | void;
};

export const Step1UploadPdf: React.FC<Step1UploadPdfProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PDF Form');
    }
  };

  return (
    <WizardCard>
      <WizardStepHeader
        title="1. Upload the form you want to complete"
        description="Our AI will identify which fields are necessary and will tell you exactly which documents to upload in the next step to autocomplete them."
        containerClassName="mb-6 text-left"
      />
      
      <FileDropzone
        icon={<UploadIcon className="w-6 h-6 currentColor" />}
        title={<>Drag your empty PDF here or <span className={error ? "text-red-600" : "text-indigo-600"}>browse on your PC</span></>}
        description="Registration forms, tax forms, or applications (Max. 25MB)"
        accept="application/pdf"
        error={error}
        onFilesAdded={(files) => handleUpload(files[0])}
      />
    </WizardCard>
  );
};
