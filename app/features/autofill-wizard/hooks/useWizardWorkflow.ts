import { useCallback } from 'react';
import { useWizardState } from './useWizardState';
import { useDocumentExtraction } from './useDocumentExtraction';
import { extractFormFields, generateMarkdownFromPdf, fillPdf } from '@/app/features/autofill-v2/services/pdfService';
import { FieldMapping } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';
import { mergeGeminiMappings } from '../utils/mappingUtils';
import { fetchMappedFieldsV3 } from '../services/wizardApiService';

export const useWizardWorkflow = () => {
  const [state, dispatch] = useWizardState();
  const { extractFieldsFromDocuments } = useDocumentExtraction();

  const handleMainPdfUpload = useCallback((file: File) => {
    dispatch({ type: 'SET_MAIN_PDF', payload: file });
  }, [dispatch]);

  const processAllAndMap = useCallback(async (supportingDocs: File[]) => {
    if (!state.mainPdf) return;
    
    dispatch({ type: 'ADD_SUPPORTING_DOCS', payload: supportingDocs });
    dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Extracting data from documents...' } });

    try {
      // 1. Start extracting data from supporting documents concurrently
      const extractedFieldsPromise = extractFieldsFromDocuments(supportingDocs);

      // 2. Scan main PDF form fields
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Scanning PDF form...' } });
      const pdfFields = await extractFormFields(state.mainPdf);
      
      if (pdfFields.length === 0) {
        throw new Error('No fillable forms found in this PDF.');
      }

      // 3. Generate Markdown with embedded markers for Gemini context
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Analyzing form structure...' } });
      const markedMarkdownPromise = generateMarkdownFromPdf(state.mainPdf, pdfFields);

      // Wait for both concurrent tasks to finish
      const [extractedFields, markedMarkdown] = await Promise.all([
        extractedFieldsPromise,
        markedMarkdownPromise
      ]);

      // 4. Send everything to Gemini Map API (v3)
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Matching your data to the form...' } });
      const { mappings: generatedMappings, detectedLanguage } = await fetchMappedFieldsV3(
        pdfFields,
        extractedFields,
        markedMarkdown
      );

      const allMappings = mergeGeminiMappings(pdfFields, generatedMappings);

      dispatch({ 
        type: 'SET_MAPPINGS', 
        payload: { mappings: allMappings, pdfLanguage: detectedLanguage, extractedFields } 
      });

    } catch (error) {
      logger.error('WIZARD_PROCESS', 'An error occurred during processing.', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }, [state.mainPdf, extractFieldsFromDocuments, dispatch]);

  const handleConfirmFill = useCallback(async (finalMappings: FieldMapping[]) => {
    if (!state.mainPdf) return;

    dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Generating completed PDF...' } });

    try {
      const pdfBytes = await fillPdf(state.mainPdf, finalMappings);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      dispatch({ type: 'SET_GENERATED_PDF', payload: url });
    } catch (error) {
      logger.error('WIZARD_FILL', 'Failed to generate PDF.', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate PDF.' });
    }
  }, [state.mainPdf, dispatch]);

  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    state,
    handleMainPdfUpload,
    processAllAndMap,
    handleConfirmFill,
    resetWizard,
  };
};
