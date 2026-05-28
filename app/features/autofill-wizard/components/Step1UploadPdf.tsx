import React, { useRef } from 'react';
import { UploadIcon } from '@/icons';
import { MappingGroupRow } from '../../autofill-v2/components/ReviewModal/MappingGroupRow';
import { AddFieldForm } from '../../profile/components/DataProfile/AddFieldForm';

type Step1UploadPdfProps = {
  onUpload: (file: File) => void;
};

export const Step1UploadPdf: React.FC<Step1UploadPdfProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUpload(file);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">1. Upload the form you want to complete</h2>
        <p className="text-slate-500">
          Our AI will identify which fields are necessary and will tell you exactly which documents to upload in the next step to autocomplete them.
        </p>
      </div>

      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="bg-indigo-100 p-3 rounded-full mb-4">
          <UploadIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="font-semibold text-slate-700 mb-1">
          Drag your empty PDF here or <span className="text-indigo-600">browse on your PC</span>
        </p>
        <p className="text-sm text-slate-500">
          Registration forms, tax forms, or applications (Max. 25MB)
        </p>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
};
