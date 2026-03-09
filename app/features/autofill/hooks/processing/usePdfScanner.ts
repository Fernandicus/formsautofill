import { useCallback } from 'react';
import { FieldMapping, ProcessingStatus, UserField } from '@/app/shared/types';
import { extractFormFields } from '@/app/features/autofill/services/pdfService';
import { mapFieldsWithGemini } from '@/app/features/autofill/services/geminiService';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            confidence: 'low'
        };
    });
};

type UsePdfScannerProps = {
    groups: { name: string; fields: UserField[] }[];
    setStatus: (status: ProcessingStatus) => void;
    setMappingComplete: (mappings: FieldMapping[], pdfLanguage: string) => void;
};

export const usePdfScanner = ({ groups, setStatus, setMappingComplete }: UsePdfScannerProps) => {
    const processPdf = useCallback(async (file: File) => {
        try {
            logger.info('PDF_PROCESS', `Starting processing for file: ${file.name}`, { size: file.size });
            setStatus({ step: 'analyzing_pdf', message: 'Scanning PDF fields...' });

            await delay(SCANNING_DELAY_MS);

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

            await delay(UI_PAINT_DELAY_MS);

            const flattenedFields = flattenUserGroups(groups);
            const { mappings: generatedMappings, detectedLanguage } = await mapFieldsWithGemini(pdfFields, flattenedFields, file);

            logger.info('AI_MAPPING', `Gemini returned ${generatedMappings.length} mappings. Language: ${detectedLanguage}`, generatedMappings);

            const allMappings = mergeGeminiMappings(pdfFields, generatedMappings);

            logger.info('REVIEW', 'Ready for user review.');
            setMappingComplete(allMappings, detectedLanguage);
        } catch (error) {
            logger.error('PDF_PROCESS', 'An error occurred during processing.', error);
            console.error(error);
            setStatus({ step: 'error', message: 'An error occurred during processing.' });
        }
    }, [groups, setStatus, setMappingComplete]);

    return { processPdf };
};
