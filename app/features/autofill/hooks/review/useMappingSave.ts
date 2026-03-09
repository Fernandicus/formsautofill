import { useState, useCallback } from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';

type UseMappingSaveProps = {
    editedMappings: FieldMapping[];
    missingIndices: number[];
    onConfirm: (finalMappings: FieldMapping[], newFieldsToSave?: UserField[]) => void;
};

export const useMappingSave = ({ editedMappings, missingIndices, onConfirm }: UseMappingSaveProps) => {
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [fieldsToSave, setFieldsToSave] = useState<UserField[]>([]);

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
            return; // Early return mapping
        }

        onConfirm(editedMappings);
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
        showSavePrompt,
        fieldsToSave,
        handleGenerateClick,
        confirmSaveAndGenerate,
        cancelSavePrompt,
        updateFieldToSave,
        removeFieldToSave
    };
};
