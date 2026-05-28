import React, { useState, useMemo } from 'react';
import { FieldMapping } from '@/app/shared/types';
import { Button } from '@/app/shared/components/Button';
import { AlertCircleIcon } from 'lucide-react';

type Step3ReviewProps = {
  mappings: FieldMapping[];
  supportingDocs: File[];
  onConfirm: (finalMappings: FieldMapping[]) => void;
  isProcessing: boolean;
};

export const Step3Review: React.FC<Step3ReviewProps> = ({ mappings, supportingDocs, onConfirm, isProcessing }) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(mappings);

  const percentage = useMemo(() => {
    if (mappings.length === 0) return 100;
    const filled = editedMappings.filter(m => m.userValue && m.userValue.trim() !== '').length;
    return Math.round((filled / mappings.length) * 100);
  }, [editedMappings, mappings]);

  const missingMappings = editedMappings.filter(m => !m.userValue || m.userValue.trim() === '');
  const filledMappings = editedMappings.filter(m => m.userValue && m.userValue.trim() !== '');

  const handleInputChange = (pdfFieldName: string, value: string) => {
    setEditedMappings(prev => prev.map(m => m.pdfFieldName === pdfFieldName ? { ...m, userValue: value } : m));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <AlertCircleIcon className="w-8 h-8 text-orange-500" />
          <h2 className="text-3xl font-bold text-slate-900">{percentage}% Completed</h2>
        </div>
        <Button 
          variant="primary" 
          onClick={() => onConfirm(editedMappings)}
          disabled={isProcessing}
        >
          Continue
        </Button>
      </div>

      <p className="text-slate-600 mb-6">
        {percentage < 100 
          ? "We are missing some data that we don't have. You can complete them manually."
          : "All fields look good! Review the filled data if you want."}
      </p>

      {supportingDocs.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-bold text-slate-400 mb-3 uppercase">Uploaded Documents</div>
          <div className="flex flex-wrap gap-3">
            {supportingDocs.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50">
                <span className="text-red-500 font-bold">PDF</span>
                <span className="text-slate-700 font-medium">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingMappings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="text-xs font-bold text-amber-600 mb-4 uppercase tracking-wide">
            Missing {missingMappings.length} Fields
          </div>
          <div className="space-y-4">
            {missingMappings.map((m, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
                <label className="block text-sm font-semibold text-slate-900 mb-2">{m.label}</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={m.userValue || ''}
                  onChange={(e) => handleInputChange(m.pdfFieldName, e.target.value)}
                  placeholder={`Enter ${m.label}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {filledMappings.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">
            Filled Fields
          </div>
          <div className="space-y-4">
            {filledMappings.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{m.label}</span>
                <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded border border-slate-200">
                  {m.displayValue || m.userValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
