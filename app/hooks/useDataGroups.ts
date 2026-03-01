import { useCallback } from 'react';
import { DataGroup, UserField } from '../../types';
import { INITIAL_DATA_GROUPS } from '../constants';
import { useLocalStorage } from './useLocalStorage';

export const useDataGroups = () => {
  const [groups, setGroups] = useLocalStorage<DataGroup[]>('autoFillDataGroups', INITIAL_DATA_GROUPS);

  const addGroup = useCallback(() => {
    const newGroup: DataGroup = {
      id: crypto.randomUUID(),
      name: `New Group ${groups.length + 1}`,
      fields: [],
      isExpanded: true
    };
    setGroups(prev => [...prev, newGroup]);
  }, [groups.length, setGroups]);

  const updateGroup = useCallback((updatedGroup: DataGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  }, [setGroups]);

  const deleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, [setGroups]);

  const duplicateGroup = useCallback((id: string) => {
    const groupToDuplicate = groups.find(g => g.id === id);
    if (!groupToDuplicate) return;

    const newGroup: DataGroup = {
      ...groupToDuplicate,
      id: crypto.randomUUID(),
      name: `${groupToDuplicate.name} (Copy)`,
      fields: groupToDuplicate.fields.map(f => ({
        ...f,
        id: crypto.randomUUID()
      }))
    };
    
    const index = groups.findIndex(g => g.id === id);
    setGroups(prev => {
      const newGroups = [...prev];
      newGroups.splice(index + 1, 0, newGroup);
      return newGroups;
    });
  }, [groups, setGroups]);

  const addFieldToGroup = useCallback((groupId: string, key: string, value: string) => {
    if (!key.trim() || !value.trim()) return;

    const newField: UserField = {
      id: crypto.randomUUID(),
      key,
      value
    };

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, fields: [...group.fields, newField] } 
        : group
    ));
  }, [setGroups]);

  const updateFieldInGroup = useCallback((groupId: string, fieldId: string, key: string, value: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      
      const updatedFields = group.fields.map(f => 
        f.id === fieldId ? { ...f, key, value } : f
      );
      return { ...group, fields: updatedFields };
    }));
  }, [setGroups]);

  const removeFieldFromGroup = useCallback((groupId: string, fieldId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, fields: group.fields.filter(f => f.id !== fieldId) };
    }));
  }, [setGroups]);

  const saveScrapedFields = useCallback((newFieldsToSave: UserField[]) => {
    if (!newFieldsToSave.length) return;

    setGroups(prev => {
      const existingGroupIndex = prev.findIndex(g => g.name === 'Saved Data');
      
      const newFields: UserField[] = newFieldsToSave.map(f => ({
        id: crypto.randomUUID(),
        key: f.key,
        value: f.value
      }));

      if (existingGroupIndex >= 0) {
        const updatedGroups = [...prev];
        updatedGroups[existingGroupIndex] = {
           ...updatedGroups[existingGroupIndex],
           fields: [...updatedGroups[existingGroupIndex].fields, ...newFields]
        };
        return updatedGroups;
      } else {
        const newGroup: DataGroup = {
          id: crypto.randomUUID(),
          name: 'Saved Data',
          fields: newFields,
          isExpanded: true
        };
        return [...prev, newGroup];
      }
    });

  }, [setGroups]);

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    duplicateGroup,
    addFieldToGroup,
    updateFieldInGroup,
    removeFieldFromGroup,
    saveScrapedFields
  };
};
