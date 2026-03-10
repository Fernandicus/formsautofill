import { useCallback } from 'react';
import { UserField } from '@/app/shared/types';
import { usePdfProcessingState } from './processing/usePdfProcessingState';
import { useGeminiMapping } from './processing/useGeminiMapping';
import { usePdfAnalyzer } from './processing/usePdfAnalyzer';
import { usePdfGenerator } from './processing/usePdfGenerator';

type UsePdfProcessingProps = {
  groups: { name: string; fields: UserField[] }[];
  saveScrapedFields: (fields: UserField[]) => void;
};

export const usePdfProcessing = ({ groups, saveScrapedFields }: UsePdfProcessingProps) => {
  const [state, dispatch] = usePdfProcessingState();

  const { executeMapping } = useGeminiMapping({ dispatch, groups });
  const { processPdf } = usePdfAnalyzer({ dispatch, executeMapping });
  const { handleConfirmFill } = usePdfGenerator({ dispatch, saveScrapedFields, currentFile: state.currentFile });

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      return;
    }

    dispatch({ type: 'SET_FILE', payload: file });
    processPdf(file);
  }, [processPdf, dispatch]);

  const closeStatusModal = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: { step: 'idle' } });
  }, [dispatch]);

  const cancelReview = useCallback(() => {
    dispatch({ type: 'CANCEL_REVIEW' });
  }, [dispatch]);

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
