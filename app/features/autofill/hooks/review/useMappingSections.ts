import { useState, useMemo } from 'react';
import { FieldMapping } from '@/app/shared/types';

export const useMappingSections = (initialMappings: FieldMapping[]) => {
    const [showMissing, setShowMissing] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showMatched, setShowMatched] = useState(true);

    // Derive initial indices for stable sections. This determines the category, 
    // so fields DO NOT jump between sections as the user edits them.
    const indices = useMemo(() => {
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

    return {
        showMissing,
        setShowMissing,
        showSuggestions,
        setShowSuggestions,
        showMatched,
        setShowMatched,
        ...indices
    };
};
