import { useState, useCallback } from 'react';
import { FieldMapping, ProcessingStatus, UserField, PdfFieldInfo } from '@/app/shared/types';
import { extractFormFields, fillPdf, generateMarkedPdfBase64 } from '@/app/features/autofill-v2/services/pdfService';
import { mapFieldsWithGemini } from '@/app/features/autofill-v2/services/geminiService';
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
  
  // Pending state for interrupted two-step process
  const [markedBase64, setMarkedBase64] = useState<string | null>(null);
  const [pendingPdfFields, setPendingPdfFields] = useState<PdfFieldInfo[]>([]);

  const executeMapping = useCallback(async (file: File, fieldsToMap: PdfFieldInfo[], markedPdfData: string) => {
    try {
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

        const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(fieldsToMap, flattenedFields, markedPdfData);
        logger.info('AI_MAPPING', `Gemini returned ${generatedMappings.length} mappings. Language: ${detectedLanguage}`, generatedMappings);
        
        const allMappings: FieldMapping[] = fieldsToMap.map(field => {
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
        logger.error('PDF_PROCESS', 'An error occurred during mapping.', error);
        console.error(error);
        setStatus({ step: 'error', message: 'An error occurred during mapping.' });
    } finally {
        // Clear pending states
        setMarkedBase64(null);
        setPendingPdfFields([]);
    }
  }, [groups]);

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

      setStatus({ step: 'analyzing_pdf', message: 'Generating visual tags...' });
      const markedPdfBase64 = await generateMarkedPdfBase64(file, pdfFields);
      
      const isDev = import.meta.env.DEV;
      const showPreview = import.meta.env.VITE_SHOW_MARKED_PDF === 'true';

      if (isDev && showPreview) {
        setMarkedBase64(markedPdfBase64);
        setPendingPdfFields(pdfFields);
        setStatus({ step: 'review_marks' });
      } else {
        await executeMapping(file, pdfFields, markedPdfBase64);
      }

    } catch (error) {
      logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
      console.error(error);
      setStatus({ step: 'error', message: 'An error occurred during processing.' });
    }
  }, [executeMapping]);

  const continueMapping = useCallback(async () => {
    if (!currentFile || !markedBase64 || pendingPdfFields.length === 0) return;
    await executeMapping(currentFile, pendingPdfFields, markedBase64);
  }, [currentFile, markedBase64, pendingPdfFields, executeMapping]);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    
    setCurrentFile(file);
    setStatus({ step: 'idle' });
    setMarkedBase64(null);
    setPendingPdfFields([]);
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

  const cancelMarksReview = useCallback(() => {
    setStatus({ step: 'idle' });
    setMarkedBase64(null);
    setPendingPdfFields([]);
  }, []);

  return {
    status,
    mappings,
    pdfLanguage,
    showReview,
    markedBase64,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
    continueMapping,
    cancelMarksReview,
  };
};
