import React from 'react';
import { FieldMapping } from '@/app/shared/types';
import { MappingRow } from '../../../../autofill-v2/components/ReviewModal/MappingRow';
import { MappingGroupRow } from '../../../../autofill-v2/components/ReviewModal/MappingGroupRow';

type MissingFieldsSectionProps = {
  missingGroups: FieldMapping[][];
  currentMissingCount: number;
  handleInputChange: (pdfFieldName: string, val: string) => void;
};

export const MissingFieldsSection: React.FC<MissingFieldsSectionProps> = ({
  missingGroups,
  currentMissingCount,
  handleInputChange,
}) => {
  if (missingGroups.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
      <div className="text-xs font-bold text-amber-600 mb-4 uppercase tracking-wide">
        Missing {currentMissingCount} Fields
      </div>
      <div className="space-y-4">
        {missingGroups.map((group, idx) => {
          const first = group[0];
          if (first.type === 'CheckBox' && group.length > 1) {
            return (
              <MappingGroupRow
                key={`missing-${idx}`}
                label={first.label || 'Group'}
                mappings={group}
                onToggle={(index) => {
                  const m = group[index];
                  handleInputChange(m.pdfFieldName, m.userValue === 'Yes' ? '' : 'Yes');
                }}
                hideCheckbox={true}
                forceEnabled={true}
              />
            );
          }

          const m = first;
          return (
            <MappingRow
              key={`missing-${idx}`}
              mapping={m}
              onChange={(val) => handleInputChange(m.pdfFieldName, val)}
              hideCheckbox={true}
              forceEnabled={true}
            />
          );
        })}
      </div>
    </div>
  );
};
