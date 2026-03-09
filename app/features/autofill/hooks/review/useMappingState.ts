import { useState, useCallback } from 'react';
import { FieldMapping } from '@/app/shared/types';

export const useMappingState = (initialMappings: FieldMapping[]) => {
    const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(initialMappings);

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
            const current = { ...updated[index] }; // Extracted into a shallow copy to prevent mutation of prev state

            if (current.userValue) {
                current.originalValue = current.userValue;
                current.userValue = '';
            } else {
                current.userValue = current.originalValue || ' ';
            }

            updated[index] = current;
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

    return {
        editedMappings,
        setEditedMappings,
        handleChange,
        handleToggleInclude,
        handleAcceptAllSuggestions,
        handleClearAllSuggestions
    };
};
