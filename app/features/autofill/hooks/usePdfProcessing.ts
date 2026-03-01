import { useState, useCallback } from 'react';
import { FieldMapping, ProcessingStatus, UserField } from '@/app/shared/types';
import { extractFormFields, fillPdf } from '@/app/features/autofill/services/pdfService';
import { mapFieldsWithGemini } from '@/app/features/autofill/services/geminiService';

type UsePdfProcessingProps = {
  groups: { name: string; fields: UserField[] }[];
  saveScrapedFields: (fields: UserField[]) => void;
};

export const usePdfProcessing = ({ groups, saveScrapedFields }: UsePdfProcessingProps) => {
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle' });
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [pdfLanguage, setPdfLanguage] = useState<string>('en');
  const [showReview, setShowReview] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const processPdf = useCallback(async (file: File) => {
    try {
      setStatus({ step: 'analyzing_pdf', message: 'Scanning PDF fields...' });
      const pdfFields = await extractFormFields(file);

      if (pdfFields.length === 0) {
        setStatus({ step: 'error', message: 'No fillable forms found in this PDF.' });
        return;
      }

      setStatus({ step: 'mapping_ai', message: 'Gemini is thinking...' });
      
      const flattenedFields: UserField[] = groups.flatMap(group => 
        group.fields.map(field => ({
            id: field.id,
            key: `${group.name}: ${field.key}`,
            value: field.value
        }))
      );

      const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(pdfFields, flattenedFields, file);
      
      const allMappings: FieldMapping[] = pdfFields.map(field => {
        const found = generatedMappings.find(m => m.pdfFieldName === field.name);
        if (found) return found;
        return {
          pdfFieldName: field.name,
          userValue: '',
          label: field.label || field.name,
          isSuggestion: false,
          confidence: 'low'
        };
      });

      setMappings(allMappings);
      setPdfLanguage(detectedLanguage);
      setStatus({ step: 'review' });
      setShowReview(true);

    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'An error occurred during processing.' });
    }
  }, [groups]);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    
    setCurrentFile(file);
    setStatus({ step: 'idle' });
    processPdf(file);
  }, [processPdf]);

  const handleConfirmFill = useCallback(async (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => {
    if (!currentFile) return;
    setShowReview(false);

    if (newFieldsToSave && newFieldsToSave.length > 0) {
      saveScrapedFields(newFieldsToSave);
    }

    setStatus({ step: 'filling', message: 'Generating your PDF...' });

    try {
      const pdfBytes = await fillPdf(currentFile, finalMappings);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');

      setStatus({ 
          step: 'completed', 
          message: win ? 'PDF Ready! Opened in new tab.' : 'PDF Ready! Click below to view.',
          downloadUrl: url
      });
    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'Failed to write to PDF.' });
    }
  }, [currentFile, saveScrapedFields]);

  const closeStatusModal = useCallback(() => {
    setStatus({ step: 'idle' });
  }, []);

  const cancelReview = useCallback(() => {
    setShowReview(false); 
    setStatus({ step: 'idle' });
  }, []);

  return {
    status,
    mappings,
    pdfLanguage,
    showReview,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
  };
};
