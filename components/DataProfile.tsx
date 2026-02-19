import React, { useState } from 'react';
import { UserField, DataGroup } from '../types';
import { PLACEHOLDER_KEYS } from '../constants';

interface DataProfileProps {
  groups: DataGroup[];
  setGroups: React.Dispatch<React.SetStateAction<DataGroup[]>>;
}

interface GroupCardProps { 
    group: DataGroup; 
    updateGroup: (g: DataGroup) => void;
    deleteGroup: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ 
    group, 
    updateGroup, 
    deleteGroup 
}) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(group.name);

    const toggleExpand = () => {
        updateGroup({ ...group, isExpanded: !group.isExpanded });
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            updateGroup({ ...group, name: tempName.trim() });
            setIsEditingName(false);
        }
    };

    const handleSaveField = () => {
        if (!newKey.trim() || !newValue.trim()) return;

        if (editingId) {
            const updatedFields = group.fields.map(f => f.id === editingId ? { ...f, key: newKey, value: newValue } : f);
            updateGroup({ ...group, fields: updatedFields });
            setEditingId(null);
        } else {
            const newField: UserField = {
                id: Date.now().toString() + Math.random().toString(),
                key: newKey,
                value: newValue
            };
            updateGroup({ ...group, fields: [...group.fields, newField] });
        }
        setNewKey('');
        setNewValue('');
    };

    const handleEditField = (field: UserField) => {
        setNewKey(field.key);
        setNewValue(field.value);
        setEditingId(field.id);
    };

    const handleCancelEdit = () => {
        setNewKey('');
        setNewValue('');
        setEditingId(null);
    };

    const handleRemoveField = (id: string) => {
        const updatedFields = group.fields.filter(f => f.id !== id);
        updateGroup({ ...group, fields: updatedFields });
        if (editingId === id) {
            handleCancelEdit();
        }
    };

    const suggestKey = () => {
        const random = PLACEHOLDER_KEYS[Math.floor(Math.random() * PLACEHOLDER_KEYS.length)];
        setNewKey(random);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    {isEditingName ? (
                        <input 
                            autoFocus
                            value={tempName}
                            onChange={e => setTempName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                            className="font-bold text-lg text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    ) : (
                        <h2 
                            onClick={() => setIsEditingName(true)}
                            className="font-bold text-lg text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2 group/title"
                            title="Click to rename"
                        >
                            {group.name}
                            <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </h2>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleExpand}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={group.isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg className={`w-5 h-5 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {group.id !== 'default' && (
                        <button 
                             onClick={() => deleteGroup(group.id)}
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                             title="Delete Group"
                        >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {group.isExpanded && (
                <div className="flex flex-col">
                    <div className="p-4 space-y-3">
                        {group.fields.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                No fields in this group. Add one below.
                            </div>
                        )}
                        {group.fields.map((field) => (
                            <div 
                                key={field.id} 
                                className={`flex items-center gap-3 p-3 rounded-lg group border transition-all ${
                                    editingId === field.id 
                                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block truncate">{field.key}</span>
                                    <span className="text-slate-800 font-medium block truncate">{field.value}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                    <button 
                                        onClick={() => handleEditField(field)}
                                        className={`p-2 transition-colors rounded-md ${
                                            editingId === field.id 
                                            ? 'text-indigo-600 bg-indigo-100' 
                                            : 'text-slate-300 hover:text-indigo-600 hover:bg-white'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveField(field.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-white transition-colors p-2 rounded-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 border-t border-slate-100 bg-slate-50/50 ${editingId ? 'bg-indigo-50/50' : ''}`}>
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {editingId ? 'Editing Field' : 'Add Field'}
                            </span>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="text-xs font-medium text-slate-500 hover:text-slate-700 underline">
                                    Cancel
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
                                    placeholder="Type (e.g. Email)"
                                />
                                {!editingId && (
                                    <button onClick={suggestKey} className="absolute right-2 top-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">Suggest</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveField()}
                                className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
                                placeholder="Value"
                            />
                        </div>
                        <button
                            onClick={handleSaveField}
                            disabled={!newKey.trim() || !newValue.trim()}
                            className={`w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                editingId 
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                            {editingId ? 'Update Field' : 'Add Field'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DataProfile: React.FC<DataProfileProps> = ({ groups, setGroups }) => {

  const handleAddGroup = () => {
    const newGroup: DataGroup = {
        id: Date.now().toString(),
        name: `New Group ${groups.length + 1}`,
        fields: [],
        isExpanded: true
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (updatedGroup: DataGroup) => {
      setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const deleteGroup = (id: string) => {
      if (confirm("Are you sure you want to delete this group and all its fields?")) {
        setGroups(groups.filter(g => g.id !== id));
      }
  };

  return (
    <div className="flex flex-col h-full">
        {/* Top Action Bar */}
        <div className="mb-6 flex justify-between items-end">
            <div>
                 <h2 className="text-xl font-bold text-slate-800">Your Data</h2>
                 <p className="text-sm text-slate-500">Create groups to organize data for different contexts (e.g. Personal, Spouse, Vehicle).</p>
            </div>
            <button 
                onClick={handleAddGroup}
                className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Group
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6">
            {groups.map(group => (
                <GroupCard 
                    key={group.id} 
                    group={group} 
                    updateGroup={updateGroup}
                    deleteGroup={deleteGroup}
                />
            ))}
        </div>
    </div>
  );
};