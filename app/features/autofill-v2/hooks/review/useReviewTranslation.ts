import { useState, useCallback } from 'react';
import translate from 'translate';
import { FieldMapping } from '@/app/shared/types';

export const useReviewTranslation = (
  editedMappings: FieldMapping[],
  setEditedMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>,
  fromLanguage: string,
  defaultLang: string = 'en'
) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslateLabels = useCallback(async (targetLang: string = defaultLang) => {
    if (isTranslating) return;

    if (isTranslated) {
      setEditedMappings((prev) =>
        prev.map((m) => ({
          ...m,
          label: m.originalLabel !== undefined ? m.originalLabel : m.label,
        }))
      );
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    translate.engine = 'google';

    try {
      const labelsToTranslate = editedMappings.map(m => m.label || m.pdfFieldName);
      const batchString = labelsToTranslate.join('\n');
      const translatedBatch = await translate(batchString, { from: fromLanguage, to: targetLang });
      const translatedLabels = translatedBatch.split('\n').map(s => s.trim());

      const updated = editedMappings.map((m, i) => {
        const translated = translatedLabels[i];
        return translated ? {
          ...m,
          originalLabel: m.originalLabel !== undefined ? m.originalLabel : (m.label || m.pdfFieldName),
          label: translated
        } : m;
      });
      setEditedMappings(updated);
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [editedMappings, fromLanguage, isTranslating, isTranslated, defaultLang, setEditedMappings]);

  return { isTranslating, isTranslated, handleTranslateLabels };
};
