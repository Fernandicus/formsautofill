import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import translate from 'translate';
import { FieldMapping } from '@/app/shared/types';

type UseMappingTranslationsProps = {
    editedMappings: FieldMapping[];
    setEditedMappings: Dispatch<SetStateAction<FieldMapping[]>>;
    fromLanguage: string;
    defaultLang: string;
};

export const useMappingTranslations = ({
    editedMappings,
    setEditedMappings,
    fromLanguage,
    defaultLang
}: UseMappingTranslationsProps) => {
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslateLabels = useCallback(async (targetLang: string = defaultLang) => {
        if (isTranslating) return; // Guard clause

        setIsTranslating(true);
        translate.engine = 'google';

        try {
            const labelsToTranslate = editedMappings.map(m => m.label || m.pdfFieldName);
            if (labelsToTranslate.length === 0) return; // Guard logic

            const batchString = labelsToTranslate.join('\n');
            const translatedBatch = await translate(batchString, { from: fromLanguage, to: targetLang });
            const translatedLabels = translatedBatch.split('\n').map(s => s.trim());

            setEditedMappings(prev => prev.map((m, i) => {
                const translated = translatedLabels[i];
                return translated ? { ...m, label: translated } : m;
            }));
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
        }
    }, [editedMappings, fromLanguage, isTranslating, defaultLang, setEditedMappings]);

    return {
        isTranslating,
        handleTranslateLabels
    };
};
