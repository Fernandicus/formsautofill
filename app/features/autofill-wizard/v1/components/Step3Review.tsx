import React from 'react';
import { FieldMapping } from '@/app/shared/types';
import { Button } from '@/app/shared/components/Button';
import { AlertCircleIcon } from 'lucide-react';
import { WizardCard } from '@/app/features/autofill-wizard/v1/components/base/WizardCard';
import { UploadedFileList } from '@/app/features/autofill-wizard/v1/components/base/UploadedFileList';
import { MobileFixedBottomButton } from '@/app/features/autofill-wizard/v1/components/base/MobileFixedBottomButton';
import { ErrorFieldsSection } from '@/app/features/autofill-wizard/v1/components/items/ErrorFieldsSection';
import { MissingFieldsSection } from '@/app/features/autofill-wizard/v1/components/items/MissingFieldsSection';
import { useReviewState } from '@/app/features/autofill-wizard/v1/hooks/useReviewState';

type Step3ReviewProps = {
  mappings: FieldMapping[];
  supportingDocs: File[];
  onConfirm: (finalMappings: FieldMapping[]) => void;
  isProcessing: boolean;
};

export const Step3Review: React.FC<Step3ReviewProps> = ({ mappings, supportingDocs, onConfirm, isProcessing }) => {
  const {
    editedMappings,
    percentage,
    errorSectionMappings,
    currentErrorCount,
    missingGroups,
    currentMissingCount,
    handleInputChange,
  } = useReviewState(mappings);

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
          className="hidden sm:inline-flex"
        >
          Continue
        </Button>
      </div>

      {/* Mobile fixed bottom button */}
      <MobileFixedBottomButton
        onClick={() => onConfirm(editedMappings)}
        disabled={isProcessing}
      >
        Continue
      </MobileFixedBottomButton>

      <p className="text-slate-600 mb-6">
        {percentage < 100 || errorSectionMappings.length > 0
          ? "We are missing some data or have invalid entries. You can fix them manually."
          : "All fields look good! Review the filled data if you want."}
      </p>

      <UploadedFileList files={supportingDocs} />

      <ErrorFieldsSection
        errorMappings={errorSectionMappings}
        currentErrorCount={currentErrorCount}
        handleInputChange={handleInputChange}
      />

      <MissingFieldsSection
        missingGroups={missingGroups}
        currentMissingCount={currentMissingCount}
        handleInputChange={handleInputChange}
      />

    </WizardCard>
  );
};
