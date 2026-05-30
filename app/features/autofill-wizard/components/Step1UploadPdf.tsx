import React from 'react';
import { UploadIcon } from '@/icons';
import { WizardCard } from './base/WizardCard';
import { WizardStepHeader } from './items/WizardStepHeader';
import { FileDropzone } from './base/FileDropzone';

type Step1UploadPdfProps = {
  onUpload: (file: File) => void;
};

export const Step1UploadPdf: React.FC<Step1UploadPdfProps> = ({ onUpload }) => {
  return (
    <WizardCard>
      <WizardStepHeader
        title="1. Upload the form you want to complete"
        description="Our AI will identify which fields are necessary and will tell you exactly which documents to upload in the next step to autocomplete them."
      />
      
      <FileDropzone
        icon={<UploadIcon className="w-6 h-6 text-indigo-600" />}
        title={<>Drag your empty PDF here or <span className="text-indigo-600">browse on your PC</span></>}
        description="Registration forms, tax forms, or applications (Max. 25MB)"
        accept="application/pdf"
        onFilesAdded={(files) => onUpload(files[0])}
      />
    </WizardCard>
  );
};
