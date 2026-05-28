import { useCallback } from 'react';
import { useWizardState } from './useWizardState';
import { useDocumentExtraction } from './useDocumentExtraction';
import { extractFormFields, generateMarkedPdfBase64, fillPdf } from '@/app/features/autofill-v2/services/pdfService';
import { FieldMapping, UserField } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';

const mergeGeminiMappings = (pdfFields: any[], geminiMappings: FieldMapping[]): FieldMapping[] => {
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
          confidence: 'low',
          type: field.type,
          options: field.options
      };
  });
};

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
      // 1. Extract data from supporting documents
      const extractedFields = await extractFieldsFromDocuments(supportingDocs);

      // 2. Scan main PDF form fields
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Scanning PDF form...' } });
      const pdfFields = await extractFormFields(state.mainPdf);
      
      if (pdfFields.length === 0) {
        throw new Error('No fillable forms found in this PDF.');
      }

      // 3. Generate marked PDF base64 for Gemini visual context
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Analyzing form structure...' } });
      const markedPdfBase64 = await generateMarkedPdfBase64(state.mainPdf, pdfFields);

      // 4. Send everything to Gemini Map API
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing: true, message: 'Matching your data to the form...' } });
      const response = await fetch('/api/autofill/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pdfFields,
            userFields: extractedFields.map(f => ({ key: f.key, value: f.value })),
            markedBase64: markedPdfBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to map fields');
      }

      const { mappings: generatedMappings, detectedLanguage } = await response.json();
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
