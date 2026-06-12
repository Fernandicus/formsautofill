import React from 'react';
import { FieldMapping } from '@/app/shared/types';
import { AlertCircleIcon } from 'lucide-react';
import { MappingRow } from '../../../autofill-v2/components/ReviewModal/MappingRow';

type ErrorFieldsSectionProps = {
  errorMappings: FieldMapping[];
  currentErrorCount: number;
  handleInputChange: (pdfFieldName: string, val: string) => void;
};

export const ErrorFieldsSection: React.FC<ErrorFieldsSectionProps> = ({
  errorMappings,
  currentErrorCount,
  handleInputChange,
}) => {
  if (errorMappings.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
      <div className="text-xs font-bold text-red-600 mb-4 uppercase tracking-wide flex items-center gap-2">
        <AlertCircleIcon className="w-4 h-4" />
        Error in {currentErrorCount} Fields
      </div>
      <div className="space-y-4">
        {errorMappings.map((m, idx) => (
          <MappingRow
            key={`error-${idx}`}
            mapping={m}
            onChange={(val) => handleInputChange(m.pdfFieldName, val)}
            hideCheckbox={true}
            forceEnabled={true}
          />
        ))}
      </div>
    </div>
  );
};
