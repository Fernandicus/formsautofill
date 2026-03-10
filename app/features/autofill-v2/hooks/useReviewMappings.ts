import { useState, useMemo, useCallback } from 'react';
import translate from 'translate';
import { FieldMapping, UserField } from '@/app/shared/types';
import { useReviewFilters } from './review/useReviewFilters';
import { useSavePrompt } from './review/useSavePrompt';

type UseReviewMappingsProps = {
  initialMappings: FieldMapping[];
  fromLanguage: string;
  onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
  defaultLang?: string;
};

export const useReviewMappings = ({
  initialMappings,
  fromLanguage,
  onConfirm,
  defaultLang = 'en'
}: UseReviewMappingsProps) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(initialMappings);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const filterState = useReviewFilters();
  const saveState = useSavePrompt();

  const { missingIndices, suggestedIndices, matchedIndices } = useMemo(() => {
    const missing: number[] = [];
    const suggested: number[] = [];
    const matched: number[] = [];

    initialMappings.forEach((mapping, idx) => {
      if (!mapping.userValue) {
        missing.push(idx);
      } else if (mapping.isSuggestion) {
        suggested.push(idx);
      } else {
        matched.push(idx);
      }
    });

    return { missingIndices: missing, suggestedIndices: suggested, matchedIndices: matched };
  }, [initialMappings]);

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
  }, [editedMappings, fromLanguage, isTranslating, isTranslated, defaultLang]);

  const handleChange = useCallback((index: number, newValue: string) => {
    setEditedMappings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], userValue: newValue };
      return updated;
    });
  }, []);

  const handleToggleInclude = useCallback((index: number) => {
    setEditedMappings(prev => {
      const updated = [...prev];
      const current = updated[index];

      if (current.userValue) {
        current.originalValue = current.userValue;
        current.userValue = '';
      } else {
        current.userValue = current.originalValue || ' ';
      }
      return updated;
    });
  }, []);

  const handleAcceptAllSuggestions = useCallback(() => {
    setEditedMappings(prev => prev.map(m => {
      if (!m.isSuggestion || m.userValue || !m.originalValue) return m;
      return { ...m, userValue: m.originalValue };
    }));
  }, []);

  const handleClearAllSuggestions = useCallback(() => {
    setEditedMappings(prev => prev.map(m => {
      if (!m.isSuggestion || !m.userValue) return m;
      return { ...m, originalValue: m.userValue, userValue: '' };
    }));
  }, []);

  const handleGenerateClick = useCallback(() => {
    const newlyFilled: UserField[] = missingIndices
      .filter(idx => {
        const mapping = editedMappings[idx];
        return mapping.userValue && mapping.userValue.trim() !== '';
      })
      .map(idx => ({
        id: crypto.randomUUID(),
        key: editedMappings[idx].label || editedMappings[idx].pdfFieldName,
        value: editedMappings[idx].userValue
      }));

    if (newlyFilled.length > 0) {
      saveState.setFieldsToSave(newlyFilled);
      saveState.setShowSavePrompt(true);
    } else {
      onConfirm(editedMappings);
    }
  }, [missingIndices, editedMappings, onConfirm, saveState]);

  const confirmSaveAndGenerate = useCallback((withSave: boolean) => {
    onConfirm(editedMappings, withSave ? saveState.fieldsToSave : undefined);
    saveState.setShowSavePrompt(false);
  }, [editedMappings, saveState.fieldsToSave, onConfirm, saveState]);

  return {
    editedMappings,
    isTranslating,
    isTranslated,
    ...filterState,
    ...saveState,
    missingIndices,
    suggestedIndices,
    matchedIndices,
    handleTranslateLabels,
    handleChange,
    handleToggleInclude,
    handleAcceptAllSuggestions,
    handleClearAllSuggestions,
    handleGenerateClick,
    confirmSaveAndGenerate,
  };
};
