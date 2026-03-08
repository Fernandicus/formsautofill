import { useState, useCallback } from 'react';
import { FieldMapping, ProcessingStatus, UserField, PdfFieldInfo } from '@/app/shared/types';
import { extractFormFields, fillPdf, generateMarkedPdfBase64 } from '@/app/features/autofill-v2/services/pdfService';
import { mapFieldsWithGemini } from '@/app/features/autofill-v2/services/geminiService';
import { logger } from '@/app/shared/utils/logger';

const UI_PAINT_DELAY_MS = 1000;
const SCANNING_DELAY_MS = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const flattenUserGroups = (groups: { name: string; fields: UserField[] }[]): UserField[] => {
  return groups.flatMap(group => 
    group.fields.map(field => ({
      id: field.id,
      key: `${group.name}: ${field.key}`,
      value: field.value
    }))
  );
};

const mergeGeminiMappings = (pdfFields: PdfFieldInfo[], geminiMappings: FieldMapping[]): FieldMapping[] => {
  return pdfFields.map(field => {
    const foundMapping = geminiMappings.find(mapping => mapping.pdfFieldName === field.name);
    
    if (foundMapping) {
      return foundMapping;
    }
    
    return {
      pdfFieldName: field.name,
      userValue: '',
      label: field.label || field.name,
      isSuggestion: false,
      confidence: 'low'
    };
  });
};

const createPdfUrl = (pdfBytes: Uint8Array): string => {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

const openPdfInNewTab = (url: string): Window | null => {
  return window.open(url, '_blank');
};

type UsePdfProcessingProps = {
  groups: { name: string; fields: UserField[] }[];
  saveScrapedFields: (fields: UserField[]) => void;
};

type ExecuteMappingParams = {
  file: File;
  fieldsToMap: PdfFieldInfo[];
  markedPdfData: string;
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

  const executeMapping = useCallback(async ({ file, fieldsToMap, markedPdfData }: ExecuteMappingParams) => {
    try {
      logger.info('AI_MAPPING', 'Sending fields to Gemini for mapping...');
      setStatus({ step: 'mapping_ai', message: 'Gemini is thinking...' });
      
      // Yield to main thread so UI can paint the status overlay
      await delay(UI_PAINT_DELAY_MS);
      
      const flattenedFields = flattenUserGroups(groups);
      const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(fieldsToMap, flattenedFields, markedPdfData);
      
      logger.info('AI_MAPPING', `Gemini returned ${generatedMappings.length} mappings. Language: ${detectedLanguage}`, generatedMappings);
      
      const allMappings = mergeGeminiMappings(fieldsToMap, generatedMappings);

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
      await delay(SCANNING_DELAY_MS);
      
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
        return;
      }

      await executeMapping({ file, fieldsToMap: pdfFields, markedPdfData: markedPdfBase64 });
    } catch (error) {
      logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
      console.error(error);
      setStatus({ step: 'error', message: 'An error occurred during processing.' });
    }
  }, [executeMapping]);

  const continueMapping = useCallback(async () => {
    if (!currentFile || !markedBase64 || pendingPdfFields.length === 0) {
      return;
    }
    
    await executeMapping({
      file: currentFile,
      fieldsToMap: pendingPdfFields,
      markedPdfData: markedBase64
    });
  }, [currentFile, markedBase64, pendingPdfFields, executeMapping]);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      return;
    }
    
    setCurrentFile(file);
    setStatus({ step: 'idle' });
    setMarkedBase64(null);
    setPendingPdfFields([]);
    
    processPdf(file);
  }, [processPdf]);

  const handleConfirmFill = useCallback(async (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => {
    if (!currentFile) {
      return;
    }

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
      
      const url = createPdfUrl(pdfBytes);
      const newTabWindow = openPdfInNewTab(url);

      setStatus({ 
        step: 'completed', 
        message: newTabWindow ? 'PDF Ready! Opened in new tab.' : 'PDF Ready! Click below to view.',
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
