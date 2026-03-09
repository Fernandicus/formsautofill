import { useState, useRef } from 'react';
import { DataGroup } from '@/app/shared/types';
import { extractDataFromDocument } from '@/app/features/autofill-v2/services/geminiService';

export const useGroupCardLogic = (
    group: DataGroup,
    updateGroup: (g: DataGroup) => void,
    deleteGroup: (id: string) => void,
    duplicateGroup: (id: string) => void
) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(group.name);
    const [isExtracting, setIsExtracting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleExpand = () => {
        updateGroup({ ...group, isExpanded: !group.isExpanded });
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            updateGroup({ ...group, name: tempName.trim() });
            setIsEditingName(false);
        }
    };

    const handleAddField = (key: string, value: string) => {
        const newField = {
            id: crypto.randomUUID(),
            key,
            value
        };
        updateGroup({ ...group, fields: [...group.fields, newField] });
    };

    const handleUpdateField = (id: string, key: string, value: string) => {
        const updatedFields = group.fields.map(f =>
            f.id === id ? { ...f, key, value } : f
        );
        updateGroup({ ...group, fields: updatedFields });
    };

    const handleRemoveField = (id: string) => {
        const updatedFields = group.fields.filter(f => f.id !== id);
        updateGroup({ ...group, fields: updatedFields });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setIsExtracting(true);
            try {
                const extractedFields = await extractDataFromDocument(file);
                if (extractedFields.length > 0) {
                    updateGroup({ ...group, fields: [...group.fields, ...extractedFields] });
                } else {
                    alert("Could not extract any data from this document.");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to process document.");
            } finally {
                setIsExtracting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    return {
        isEditingName,
        setIsEditingName,
        tempName,
        setTempName,
        isExtracting,
        confirmDelete,
        setConfirmDelete,
        fileInputRef,
        toggleExpand,
        handleSaveName,
        handleAddField,
        handleUpdateField,
        handleRemoveField,
        handleFileChange,
        handleDeleteGroup: () => deleteGroup(group.id),
        handleDuplicateGroup: () => duplicateGroup(group.id)
    };
};
