import { useCallback } from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';
import { fillPdf } from '@/app/features/autofill-v2/services/pdfService';
import { logger } from '@/app/shared/utils/logger';
import { PdfProcessingAction } from './usePdfProcessingState';

const createPdfUrl = (pdfBytes: Uint8Array): string => {
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
};

const openPdfInNewTab = (url: string): Window | null => {
    return window.open(url, '_blank');
};

type UsePdfGeneratorProps = {
    dispatch: React.Dispatch<PdfProcessingAction>;
    saveScrapedFields: (fields: UserField[]) => void;
    currentFile: File | null;
};

export const usePdfGenerator = ({ dispatch, saveScrapedFields, currentFile }: UsePdfGeneratorProps) => {
    const handleConfirmFill = useCallback(async (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => {
        if (!currentFile) {
            return;
        }

        dispatch({ type: 'HIDE_REVIEW' });
        dispatch({ type: 'SET_STATUS', payload: { step: 'filling', message: 'Generating your PDF...' } });

        if (newFieldsToSave && newFieldsToSave.length > 0) {
            logger.info('SAVE_DATA', `Saving ${newFieldsToSave.length} new fields to profile...`);
            saveScrapedFields(newFieldsToSave);
        }

        logger.info('PDF_FILL', 'Filling PDF with confirmed mappings...', finalMappings);

        try {
            const pdfBytes = await fillPdf(currentFile, finalMappings);
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
    }, [currentFile, dispatch, saveScrapedFields]);

    return { handleConfirmFill };
};
