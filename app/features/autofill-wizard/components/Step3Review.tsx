import React, { useState, useMemo } from 'react';
import { FieldMapping } from '@/app/shared/types';
import { Button } from '@/app/shared/components/Button';
import { AlertCircleIcon } from 'lucide-react';
import { MappingRow } from '../../autofill-v2/components/ReviewModal/MappingRow';
import { MappingGroupRow } from '../../autofill-v2/components/ReviewModal/MappingGroupRow';
import { WizardCard } from './base/WizardCard';
import { UploadedFileList } from './base/UploadedFileList';

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

  // Keep track of which fields were initially missing so they don't jump sections when edited.
  const initiallyMissingKeys = useMemo(() => {
    return new Set(mappings.filter(m => !m.userValue || m.userValue.trim() === '').map(m => m.pdfFieldName));
  }, [mappings]);

  const missingSectionMappings = editedMappings.filter(m => initiallyMissingKeys.has(m.pdfFieldName));
  
  const currentMissingCount = editedMappings.filter(m => !m.userValue || m.userValue.trim() === '').length;

  const groupMappings = (mappingsToGroup: FieldMapping[]) => {
    const groups = new Map<string, FieldMapping[]>();
    mappingsToGroup.forEach(m => {
      const groupKey = (m.type === 'CheckBox' && m.label) ? `group_${m.label}` : `single_${m.pdfFieldName}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(m);
    });
    return Array.from(groups.values());
  };

  const missingGroups = useMemo(() => groupMappings(missingSectionMappings), [missingSectionMappings]);

  const handleInputChange = (pdfFieldName: string, value: string) => {
    setEditedMappings(prev => prev.map(m => m.pdfFieldName === pdfFieldName ? { ...m, userValue: value } : m));
  };

  return (
    <WizardCard>
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

      <UploadedFileList files={supportingDocs} />

      {missingSectionMappings.length > 0 && (
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
                    key={idx}
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
                  key={idx}
                  mapping={m}
                  onChange={(val) => handleInputChange(m.pdfFieldName, val)}
                  hideCheckbox={true}
                  forceEnabled={true}
                />
              );
            })}
          </div>
        </div>
      )}

    </WizardCard>
  );
};
