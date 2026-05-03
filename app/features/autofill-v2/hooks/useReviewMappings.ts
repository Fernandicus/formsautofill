import { useState, useMemo, useCallback } from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';
import { useReviewFilters } from './review/useReviewFilters';
import { useSavePrompt } from './review/useSavePrompt';
import { useReviewTranslation } from './review/useReviewTranslation';
import { useMappingActions } from './review/useMappingActions';

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

  const filterState = useReviewFilters();
  const saveState = useSavePrompt();

  const { isTranslating, isTranslated, handleTranslateLabels } = useReviewTranslation(
    editedMappings,
    setEditedMappings,
    fromLanguage,
    defaultLang
  );

  const {
    handleChange,
    handleToggleInclude,
    handleAcceptAllSuggestions,
    handleClearAllSuggestions
  } = useMappingActions(setEditedMappings);

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

  const handleGenerateClick = useCallback(() => {
    const newlyFilled: UserField[] = missingIndices
      .filter(idx => {
        const mapping = editedMappings[idx];
        return mapping.userValue && mapping.userValue.trim() !== '';
      })
      .map(idx => {
        const mapping = editedMappings[idx];
        const valueToSave = (mapping.type === 'CheckBox' && mapping.displayValue) 
          ? mapping.displayValue 
          : mapping.userValue;

        return {
          id: crypto.randomUUID(),
          key: mapping.label || mapping.pdfFieldName,
          value: valueToSave
        };
      });

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
