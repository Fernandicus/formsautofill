import { useState, useCallback } from 'react';
import { FieldMapping, ProcessingStatus, UserField } from '@/app/shared/types';
import { extractFormFields, fillPdf } from '@/app/features/autofill/services/pdfService';
import { mapFieldsWithGemini } from '@/app/features/autofill/services/geminiService';
import { logger } from '@/app/shared/utils/logger';

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
      logger.info('PDF_PROCESS', `Starting processing for file: ${file.name}`, { size: file.size });
      setStatus({ step: 'analyzing_pdf', message: 'Scanning PDF fields...' });
      
      // Yield to main thread so UI can paint the status overlay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      logger.info('PDF_ANALYZE', 'Extracting form fields from PDF...');
      const pdfFields = await extractFormFields(file);
      logger.info('PDF_ANALYZE', `Extracted ${pdfFields.length} fields.`, pdfFields);

      if (pdfFields.length === 0) {
        logger.warn('PDF_ANALYZE', 'No fillable fields found.');
        setStatus({ step: 'error', message: 'No fillable forms found in this PDF.' });
        return;
      }

      logger.info('AI_MAPPING', 'Sending fields to Gemini for mapping...');
      setStatus({ step: 'mapping_ai', message: 'Gemini is thinking...' });
      
      // Yield to main thread so UI can paint the status overlay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const flattenedFields: UserField[] = groups.flatMap(group => 
        group.fields.map(field => ({
            id: field.id,
            key: `${group.name}: ${field.key}`,
            value: field.value
        }))
      );

      const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(pdfFields, flattenedFields, file);
      logger.info('AI_MAPPING', `Gemini returned ${generatedMappings.length} mappings. Language: ${detectedLanguage}`, generatedMappings);
      
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
      logger.info('REVIEW', 'Ready for user review.');
      setStatus({ step: 'review' });
      setShowReview(true);

    } catch (error) {
      logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
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
      logger.info('SAVE_DATA', `Saving ${newFieldsToSave.length} new fields to profile...`);
      saveScrapedFields(newFieldsToSave);
    }

    setStatus({ step: 'filling', message: 'Generating your PDF...' });
    logger.info('PDF_FILL', 'Filling PDF with confirmed mappings...', finalMappings);

    try {
      const pdfBytes = await fillPdf(currentFile, finalMappings);
      logger.info('PDF_FILL', 'PDF file generated successfully.');
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');

      setStatus({ 
          step: 'completed', 
          message: win ? 'PDF Ready! Opened in new tab.' : 'PDF Ready! Click below to view.',
          downloadUrl: url
      });
      logger.info('COMPLETED', 'Process finished.');
    } catch (error) {
      logger.error('PDF_FILL', 'Failed to write to PDF.', error);
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
