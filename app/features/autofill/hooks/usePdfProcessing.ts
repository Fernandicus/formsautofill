import { useCallback } from 'react';
import { UserField } from '@/app/shared/types';
import { usePdfProcessingState } from './processing/usePdfProcessingState';
import { usePdfScanner } from './processing/usePdfScanner';
import { usePdfGenerator } from './processing/usePdfGenerator';

type UsePdfProcessingProps = {
  groups: { name: string; fields: UserField[] }[];
  saveScrapedFields: (fields: UserField[]) => void;
};

export const usePdfProcessing = ({ groups, saveScrapedFields }: UsePdfProcessingProps) => {
  const {
    state,
    setStatus,
    setFile,
    setMappingComplete,
    closeStatusModal,
    cancelReview,
  } = usePdfProcessingState();

  const { processPdf } = usePdfScanner({
    groups,
    setStatus,
    setMappingComplete
  });

  const { handleConfirmFill } = usePdfGenerator({
    currentFile: state.currentFile,
    setStatus,
    saveScrapedFields
  });

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      return;
    }

    setFile(file);
    processPdf(file);
  }, [setFile, processPdf]);

  return {
    status: state.status,
    mappings: state.mappings,
    pdfLanguage: state.pdfLanguage,
    showReview: state.showReview,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
  };
};
