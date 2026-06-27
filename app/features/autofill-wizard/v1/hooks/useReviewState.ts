import { useState, useMemo, useCallback } from 'react';
import { FieldMapping } from '@/app/shared/types';

export const useReviewState = (initialMappings: FieldMapping[]) => {
  const [editedMappings, setEditedMappings] = useState<FieldMapping[]>(initialMappings);

  const percentage = useMemo(() => {
    if (initialMappings.length === 0) return 100;
    const filled = editedMappings.filter((m) => m.userValue && m.userValue.trim() !== '').length;
    return Math.round((filled / initialMappings.length) * 100);
  }, [editedMappings, initialMappings]);

  // Keep track of which fields were initially missing so they don't jump sections when edited.
  const initiallyMissingKeys = useMemo(() => {
    return new Set(
      initialMappings.filter((m) => !m.userValue || m.userValue.trim() === '').map((m) => m.pdfFieldName)
    );
  }, [initialMappings]);

  // Keep track of which fields were initially errors (invalid dropdown values).
  const initiallyErrorKeys = useMemo(() => {
    return new Set(
      initialMappings
        .filter((m) => {
          return (
            (m.type === 'Dropdown' || m.type === 'RadioGroup') &&
            m.options &&
            m.options.length > 0 &&
            m.userValue &&
            !m.options.includes(m.userValue)
          );
        })
        .map((m) => m.pdfFieldName)
    );
  }, [initialMappings]);

  const missingSectionMappings = useMemo(
    () => editedMappings.filter((m) => initiallyMissingKeys.has(m.pdfFieldName)),
    [editedMappings, initiallyMissingKeys]
  );

  const errorSectionMappings = useMemo(
    () => editedMappings.filter((m) => initiallyErrorKeys.has(m.pdfFieldName)),
    [editedMappings, initiallyErrorKeys]
  );

  const currentMissingCount = useMemo(
    () => editedMappings.filter((m) => !m.userValue || m.userValue.trim() === '').length,
    [editedMappings]
  );

  const currentErrorCount = useMemo(
    () =>
      editedMappings.filter((m) => {
        return (
          initiallyErrorKeys.has(m.pdfFieldName) &&
          (m.type === 'Dropdown' || m.type === 'RadioGroup') &&
          m.options &&
          m.options.length > 0 &&
          m.userValue &&
          !m.options.includes(m.userValue)
        );
      }).length,
    [editedMappings, initiallyErrorKeys]
  );

  const groupMappings = useCallback((mappingsToGroup: FieldMapping[]) => {
    const groups = new Map<string, FieldMapping[]>();
    mappingsToGroup.forEach((m) => {
      const groupKey = m.type === 'CheckBox' && m.label ? `group_${m.label}` : `single_${m.pdfFieldName}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(m);
    });
    return Array.from(groups.values());
  }, []);

  const missingGroups = useMemo(
    () => groupMappings(missingSectionMappings),
    [groupMappings, missingSectionMappings]
  );

  const handleInputChange = useCallback((pdfFieldName: string, value: string) => {
    setEditedMappings((prev) =>
      prev.map((m) => (m.pdfFieldName === pdfFieldName ? { ...m, userValue: value } : m))
    );
  }, []);

  return {
    editedMappings,
    percentage,
    errorSectionMappings,
    currentErrorCount,
    missingGroups,
    currentMissingCount,
    handleInputChange,
  };
};
