import React, { useRef, useState } from 'react';
import { UploadIcon } from '@/icons';
import { Button } from '@/app/shared/components/Button';
import Tesseract from 'tesseract.js';
import { FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

import { getBinarizedCanvas } from '../utils/imageProcessing';

type Step2UploadDocsProps = {
  onContinue: (files: File[]) => void;
  isProcessing: boolean;
};

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const processImages = async (docs: File[]): Promise<File[]> => {
  return Promise.all(
    docs.map(async (doc) => {
      if (!doc.type.startsWith('image/')) {
        return doc;
      }
      try {
        const binarizedCanvas = await getBinarizedCanvas(doc);
        const result = await Tesseract.recognize(binarizedCanvas, 'eng');
        const text = result.data.text;
        return new File([text], `${doc.name}.txt`, { type: 'text/plain' });
      } catch (err) {
        console.error("Error processing image:", err);
        throw err;
      }
    })
  );
};

export const Step2UploadDocs: React.FC<Step2UploadDocsProps> = ({ onContinue, isProcessing }) => {
  const [docs, setDocs] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleContinue = async () => {
    const hasImage = docs.some(doc => doc.type.startsWith('image/'));
    
    if (!hasImage) {
      onContinue(docs);
      return;
    }

    setIsExtractingText(true);
    setError(null);
    
    try {
      const processedFiles = await processImages(docs);
      onContinue(processedFiles);
    } catch (err) {
      setError('Failed to extract text from image(s).');
    } finally {
      setIsExtractingText(false);
    }
  };

  const isButtonDisabled = docs.length === 0 || isProcessing || isExtractingText;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">2. Upload your supporting documents</h2>
          <p className="text-slate-500">
            Upload all documents or files that might contain the data requested by the form you want to complete.
            <br/>For example: <strong>ID Card and Employment Contract</strong>
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleContinue} 
          disabled={isButtonDisabled}
        >
          {isExtractingText ? 'Extracting text...' : 'Continue'}
        </Button>
      </div>

      {docs.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-400 mb-3 uppercase">Uploaded Documents</div>
          <div className="flex flex-wrap gap-3">
            {docs.map((doc, idx) => {
              let Icon = FileIcon;
              let iconColor = 'text-slate-500';

              if (doc.type.includes('pdf')) {
                Icon = FileText;
                iconColor = 'text-red-500';
              } else if (doc.type.includes('image')) {
                Icon = ImageIcon;
                iconColor = 'text-indigo-500';
              }

              return (
                <div key={idx} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50">
                  <Icon size={18} className={iconColor} strokeWidth={2.5} />
                  <span className="text-slate-700 font-medium">{doc.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
      )}

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
          Click to upload photos or files
        </p>
        <p className="text-sm text-slate-500">
          ID, Passport, utility bills, certificates (JPG, PNG, PDF)
        </p>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              addFiles(e.target.files);
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
};

