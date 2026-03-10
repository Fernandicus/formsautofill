import React, { useRef } from 'react';
import { Button } from './Button';
import { AutoFillLogoIcon, UploadIcon } from '../../../icons';

type AppHeaderProps = {
  onFileSelect: (file: File) => void;
};

export const AppHeader: React.FC<AppHeaderProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 rounded-lg p-1.5">
            <AutoFillLogoIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            AutoFill AI
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Powered by Gemini 3 Flash
          </div>
          <Button
            variant="primary"
            onClick={handleUploadClick}
            leftIcon={<UploadIcon className="w-4 h-4" />}
          >
            Upload PDF
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
};
