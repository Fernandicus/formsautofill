import React, { useState, useRef } from 'react';
import { UserField } from '@/app/shared/types';
import { PlusIcon, TrashIcon } from '../../../../../icons';

interface UserOnboardingProps {
  onComplete: (fields: Omit<UserField, 'id'>[]) => void;
  onSkip: () => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onSkip }) => {
  const [fields, setFields] = useState<{ key: string, value: string }[]>([
    { key: 'Full Name', value: '' },
    { key: 'Email', value: '' },
    { key: 'Year of Birth', value: '' },
  ]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateField = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index] = { key, value };
    setFields(updated);
  };

  const handleAddField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setIsExtracting(true);
      try {
        const base64 = await fileToBase64(file);
        const mimeType = file.type;

        const response = await fetch('/api/autofill/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mimeType })
        });

        if (!response.ok) {
          throw new Error('Failed to extract data');
        }

        const data = await response.json();
        if (data.fields && data.fields.length > 0) {
          // Merge with existing fields, removing empty ones
          const nonEmptyCurrent = fields.filter(f => f.key.trim() !== '' || f.value.trim() !== '');
          const newFields = data.fields.map((f: any) => ({ key: f.key, value: f.value }));
          setFields([...nonEmptyCurrent, ...newFields]);
        } else {
          alert("Could not extract any data from this document.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to process document. Please try adding fields manually.");
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleComplete = () => {
    const validFields = fields.filter(f => f.key.trim() !== '' && f.value.trim() !== '');
    onComplete(validFields);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-8 border-b border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to AutoFill!</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Let's get started by adding your basic information. This data will be securely stored on your device and used to magically fill PDF forms.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div>
              <h3 className="font-semibold text-indigo-900">Want to save time?</h3>
              <p className="text-sm text-indigo-700">Upload a resume or ID, and AI will extract your details automatically.</p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 mb-4 px-1">Your Details</h3>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-3 items-center group">
                <input
                  type="text"
                  placeholder="Field Name (e.g. Email)"
                  value={field.key}
                  onChange={(e) => handleUpdateField(index, e.target.value, field.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleUpdateField(index, field.key, e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Field"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddField}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Custom Field
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white">
          <button
            type="button"
            onClick={onSkip}
            className="text-slate-500 hover:text-slate-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};
