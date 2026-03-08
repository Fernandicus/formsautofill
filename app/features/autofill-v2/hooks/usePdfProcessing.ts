import { useReducer, useCallback } from 'react';
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

// --- REDUCER ---

type PdfProcessingState = {
  status: ProcessingStatus;
  mappings: FieldMapping[];
  pdfLanguage: string;
  showReview: boolean;
  currentFile: File | null;
  markedBase64: string | null;
  pendingPdfFields: PdfFieldInfo[];
};

type PdfProcessingAction = 
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'MAPPING_COMPLETE'; payload: { mappings: FieldMapping[]; pdfLanguage: string } }
  | { type: 'START_MARKS_REVIEW'; payload: { markedBase64: string; pendingPdfFields: PdfFieldInfo[] } }
  | { type: 'CANCEL_REVIEW' }
  | { type: 'CANCEL_MARKS_REVIEW' }
  | { type: 'CLEAR_PENDING' };

const initialState: PdfProcessingState = {
  status: { step: 'idle' },
  mappings: [],
  pdfLanguage: 'en',
  showReview: false,
  currentFile: null,
  markedBase64: null,
  pendingPdfFields: []
};

const reducer = (state: PdfProcessingState, action: PdfProcessingAction): PdfProcessingState => {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_FILE':
      return { 
        ...state, 
        currentFile: action.payload, 
        status: { step: 'idle' }, 
        markedBase64: null, 
        pendingPdfFields: [] 
      };
    case 'MAPPING_COMPLETE':
      return { 
        ...state, 
        mappings: action.payload.mappings, 
        pdfLanguage: action.payload.pdfLanguage, 
        status: { step: 'review' }, 
        showReview: true,
        markedBase64: null,
        pendingPdfFields: [] 
      };
    case 'START_MARKS_REVIEW':
      return {
        ...state,
        markedBase64: action.payload.markedBase64,
        pendingPdfFields: action.payload.pendingPdfFields,
        status: { step: 'review_marks' }
      };
    case 'CANCEL_REVIEW':
      return { ...state, showReview: false, status: { step: 'idle' } };
    case 'CANCEL_MARKS_REVIEW':
      return { ...state, status: { step: 'idle' }, markedBase64: null, pendingPdfFields: [] };
    case 'CLEAR_PENDING':
      return { ...state, markedBase64: null, pendingPdfFields: [] };
    default:
      return state;
  }
};

// --- HOOK ---

export const usePdfProcessing = ({ groups, saveScrapedFields }: UsePdfProcessingProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const executeMapping = useCallback(async ({ file, fieldsToMap, markedPdfData }: ExecuteMappingParams) => {
    try {
      logger.info('AI_MAPPING', 'Sending fields to Gemini for mapping...');
      dispatch({ type: 'SET_STATUS', payload: { step: 'mapping_ai', message: 'Gemini is thinking...' } });
      
      await delay(UI_PAINT_DELAY_MS);
      
      const flattenedFields = flattenUserGroups(groups);
      const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(fieldsToMap, flattenedFields, markedPdfData);
      
      logger.info('AI_MAPPING', `Gemini returned ${generatedMappings.length} mappings. Language: ${detectedLanguage}`, generatedMappings);
      
      const allMappings = mergeGeminiMappings(fieldsToMap, generatedMappings);

      logger.info('REVIEW', 'Ready for user review.');
      
      dispatch({ 
        type: 'MAPPING_COMPLETE', 
        payload: { mappings: allMappings, pdfLanguage: detectedLanguage } 
      });
    } catch (error) {
      logger.error('PDF_PROCESS', 'An error occurred during mapping.', error);
      console.error(error);
      dispatch({ type: 'SET_STATUS', payload: { step: 'error', message: 'An error occurred during mapping.' } });
      dispatch({ type: 'CLEAR_PENDING' });
    }
  }, [groups]);

  const processPdf = useCallback(async (file: File) => {
    try {
      logger.info('PDF_PROCESS', `Starting processing for file: ${file.name}`, { size: file.size });
      dispatch({ type: 'SET_STATUS', payload: { step: 'analyzing_pdf', message: 'Scanning PDF fields...' } });
      
      await delay(SCANNING_DELAY_MS);
      
      logger.info('PDF_ANALYZE', 'Extracting form fields from PDF...');
      const pdfFields = await extractFormFields(file);
      logger.info('PDF_ANALYZE', `Extracted ${pdfFields.length} fields.`, pdfFields);

      if (pdfFields.length === 0) {
        logger.warn('PDF_ANALYZE', 'No fillable fields found.');
        dispatch({ type: 'SET_STATUS', payload: { step: 'error', message: 'No fillable forms found in this PDF.' } });
        return;
      }

      dispatch({ type: 'SET_STATUS', payload: { step: 'analyzing_pdf', message: 'Generating visual tags...' } });
      const markedPdfBase64 = await generateMarkedPdfBase64(file, pdfFields);
      
      const isDev = import.meta.env.DEV;
      const showPreview = import.meta.env.VITE_SHOW_MARKED_PDF === 'true';

      if (isDev && showPreview) {
        dispatch({ 
          type: 'START_MARKS_REVIEW', 
          payload: { markedBase64: markedPdfBase64, pendingPdfFields: pdfFields } 
        });
        return;
      }

      await executeMapping({ file, fieldsToMap: pdfFields, markedPdfData: markedPdfBase64 });
    } catch (error) {
      logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
      console.error(error);
      dispatch({ type: 'SET_STATUS', payload: { step: 'error', message: 'An error occurred during processing.' } });
    }
  }, [executeMapping]);

  const continueMapping = useCallback(async () => {
    if (!state.currentFile || !state.markedBase64 || state.pendingPdfFields.length === 0) {
      return;
    }
    
    await executeMapping({
      file: state.currentFile,
      fieldsToMap: state.pendingPdfFields,
      markedPdfData: state.markedBase64
    });
  }, [state.currentFile, state.markedBase64, state.pendingPdfFields, executeMapping]);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      return;
    }
    
    dispatch({ type: 'SET_FILE', payload: file });
    processPdf(file);
  }, [processPdf]);

  const handleConfirmFill = useCallback(async (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => {
    if (!state.currentFile) {
      return;
    }

    dispatch({ type: 'SET_STATUS', payload: { step: 'filling', message: 'Generating your PDF...' } });

    if (newFieldsToSave && newFieldsToSave.length > 0) {
      logger.info('SAVE_DATA', `Saving ${newFieldsToSave.length} new fields to profile...`);
      saveScrapedFields(newFieldsToSave);
    }

    logger.info('PDF_FILL', 'Filling PDF with confirmed mappings...', finalMappings);

    try {
      const pdfBytes = await fillPdf(state.currentFile, finalMappings);
      logger.info('PDF_FILL', 'PDF file generated successfully.');
      
      const url = createPdfUrl(pdfBytes);
      const newTabWindow = openPdfInNewTab(url);

      dispatch({ 
        type: 'SET_STATUS', 
        payload: { 
          step: 'completed', 
          message: newTabWindow ? 'PDF Ready! Opened in new tab.' : 'PDF Ready! Click below to view.',
          downloadUrl: url
        } 
      });
      
      logger.info('COMPLETED', 'Process finished.');
    } catch (error) {
      logger.error('PDF_FILL', 'Failed to write to PDF.', error);
      console.error(error);
      dispatch({ type: 'SET_STATUS', payload: { step: 'error', message: 'Failed to write to PDF.' } });
    }
  }, [state.currentFile, saveScrapedFields]);

  const closeStatusModal = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: { step: 'idle' } });
  }, []);

  const cancelReview = useCallback(() => {
    dispatch({ type: 'CANCEL_REVIEW' });
  }, []);

  const cancelMarksReview = useCallback(() => {
    dispatch({ type: 'CANCEL_MARKS_REVIEW' });
  }, []);

  return {
    status: state.status,
    mappings: state.mappings,
    pdfLanguage: state.pdfLanguage,
    showReview: state.showReview,
    markedBase64: state.markedBase64,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
    continueMapping,
    cancelMarksReview,
  };
};
