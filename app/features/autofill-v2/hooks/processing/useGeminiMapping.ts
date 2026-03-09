import { useCallback } from 'react';
import { FieldMapping, PdfFieldInfo, UserField } from '@/app/shared/types';
import { mapFieldsWithGemini } from '@/app/features/autofill-v2/services/geminiService';
import { logger } from '@/app/shared/utils/logger';
import { PdfProcessingAction } from './usePdfProcessingState';

const UI_PAINT_DELAY_MS = 1000;
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

type UseGeminiMappingProps = {
    dispatch: React.Dispatch<PdfProcessingAction>;
    groups: { name: string; fields: UserField[] }[];
};

export const useGeminiMapping = ({ dispatch, groups }: UseGeminiMappingProps) => {
    const executeMapping = useCallback(async ({ file, fieldsToMap, markedPdfData }: { file: File, fieldsToMap: PdfFieldInfo[], markedPdfData: string }) => {
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
    }, [dispatch, groups]);

    return { executeMapping };
};
