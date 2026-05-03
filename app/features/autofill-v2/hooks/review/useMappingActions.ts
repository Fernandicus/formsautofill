import { useCallback } from 'react';
import { FieldMapping } from '@/app/shared/types';

export const useMappingActions = (
  setEditedMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>
) => {
  const handleChange = useCallback((index: number, newValue: string) => {
    setEditedMappings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], userValue: newValue };
      return updated;
    });
  }, [setEditedMappings]);

  const handleToggleInclude = useCallback((index: number) => {
    setEditedMappings(prev => {
      const updated = [...prev];
      const current = { ...updated[index] };

      if (current.userValue) {
        current.originalValue = current.userValue;
        current.userValue = '';
      } else {
        if (current.type === 'CheckBox') {
          current.userValue = current.originalValue || 'yes';
        } else {
          current.userValue = current.originalValue || ' ';
        }
      }
      
      updated[index] = current;
      return updated;
    });
  }, [setEditedMappings]);

  const handleAcceptAllSuggestions = useCallback(() => {
    setEditedMappings(prev => prev.map(m => {
      if (!m.isSuggestion || m.userValue || !m.originalValue) return m;
      return { ...m, userValue: m.originalValue };
    }));
  }, [setEditedMappings]);

  const handleClearAllSuggestions = useCallback(() => {
    setEditedMappings(prev => prev.map(m => {
      if (!m.isSuggestion || !m.userValue) return m;
      return { ...m, originalValue: m.userValue, userValue: '' };
    }));
  }, [setEditedMappings]);

  return {
    handleChange,
    handleToggleInclude,
    handleAcceptAllSuggestions,
    handleClearAllSuggestions
  };
};
