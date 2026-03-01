import { useState, useMemo, useCallback } from 'react';
import translate from 'translate';
import { FieldMapping, UserField } from '../../types';

interface UseReviewMappingsProps {
  initialMappings: FieldMapping[];
  fromLanguage: string;
  onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
  defaultLang?: string;
}

export const useReviewMappings = ({ 
  initialMappings, 
  fromLanguage, 
  onConfirm,
  defaultLang = 'en'
}: UseReviewMappingsProps) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(initialMappings);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [showMissing, setShowMissing] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMatched, setShowMatched] = useState(true);

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [fieldsToSave, setFieldsToSave] = useState<UserField[]>([]);

  // Derive initial indices for stable sections. This determines the category, 
  // so fields DO NOT jump between sections as the user edits them.
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
    if (isTranslating) return; // Guard clause
    
    setIsTranslating(true);
    translate.engine = 'google';
    
    try {
        const labelsToTranslate = editedMappings.map(m => m.label || m.pdfFieldName);
        const batchString = labelsToTranslate.join('\n');
        const translatedBatch = await translate(batchString, { from: fromLanguage, to: targetLang });
        const translatedLabels = translatedBatch.split('\n').map(s => s.trim());
        
        const updated = editedMappings.map((m, i) => {
            const translated = translatedLabels[i];
            return translated ? { ...m, label: translated } : m;
        });
        setEditedMappings(updated);
    } catch (error) {
        console.error('Translation error:', error);
    } finally {
        setIsTranslating(false);
    }
  }, [editedMappings, fromLanguage, isTranslating, defaultLang]);

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
            // Unchecking: stash the current value so we can restore it if they check it again
            current.originalValue = current.userValue; 
            current.userValue = '';
        } else {
            // Checking: restore the original value, or provide a space if they explicitly check an empty line
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
    // Collect filled missing fields
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
      setFieldsToSave(newlyFilled);
      setShowSavePrompt(true);
    } else {
      onConfirm(editedMappings);
    }
  }, [missingIndices, editedMappings, onConfirm]);

  const confirmSaveAndGenerate = useCallback((withSave: boolean) => {
    onConfirm(editedMappings, withSave ? fieldsToSave : undefined);
    setShowSavePrompt(false);
  }, [editedMappings, fieldsToSave, onConfirm]);

  const cancelSavePrompt = useCallback(() => {
    setShowSavePrompt(false);
  }, []);

  const updateFieldToSave = useCallback((index: number, key: string, value: string) => {
    setFieldsToSave(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], key, value };
      return updated;
    });
  }, []);

  const removeFieldToSave = useCallback((id: string) => {
    setFieldsToSave(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    editedMappings,
    isTranslating,
    showMissing,
    setShowMissing,
    showSuggestions,
    setShowSuggestions,
    showMatched,
    setShowMatched,
    showSavePrompt,
    fieldsToSave,
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
    cancelSavePrompt,
    updateFieldToSave,
    removeFieldToSave
  };
};
