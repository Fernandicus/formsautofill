import { useState } from 'react';

export const useReviewFilters = () => {
    const [showMissing, setShowMissing] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showMatched, setShowMatched] = useState(true);

    return {
        showMissing,
        setShowMissing,
        showSuggestions,
        setShowSuggestions,
        showMatched,
        setShowMatched
    };
};
