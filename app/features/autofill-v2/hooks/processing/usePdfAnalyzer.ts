import { useCallback } from 'react';
import { extractFormFields, generateMarkedPdfBase64 } from '@/app/features/autofill-v2/services/pdfService';
import { logger } from '@/app/shared/utils/logger';
import { PdfProcessingAction } from './usePdfProcessingState';
import { PdfFieldInfo } from '@/app/shared/types';

const SCANNING_DELAY_MS = 800;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type UsePdfAnalyzerProps = {
    dispatch: React.Dispatch<PdfProcessingAction>;
    executeMapping: (params: { file: File; fieldsToMap: PdfFieldInfo[]; markedPdfData: string }) => Promise<void>;
};

export const usePdfAnalyzer = ({ dispatch, executeMapping }: UsePdfAnalyzerProps) => {
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

            await executeMapping({ file, fieldsToMap: pdfFields, markedPdfData: markedPdfBase64 });
        } catch (error) {
            logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
            console.error(error);
            dispatch({ type: 'SET_STATUS', payload: { step: 'error', message: 'An error occurred during processing.' } });
        }
    }, [dispatch, executeMapping]);

    return { processPdf };
};
