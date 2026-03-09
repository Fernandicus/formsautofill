import { useState, useCallback } from 'react';
import { UserField } from '@/app/shared/types';

export const useSavePrompt = () => {
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [fieldsToSave, setFieldsToSave] = useState<UserField[]>([]);

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
        showSavePrompt,
        setShowSavePrompt,
        fieldsToSave,
        setFieldsToSave,
        cancelSavePrompt,
        updateFieldToSave,
        removeFieldToSave
    };
};
