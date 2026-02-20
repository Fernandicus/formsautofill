import React, { useState, useRef } from 'react';
import { UserField, DataGroup } from '../types';
import { extractDataFromDocument } from '../services/geminiService';

interface DataProfileProps {
  groups: DataGroup[];
  setGroups: React.Dispatch<React.SetStateAction<DataGroup[]>>;
}

interface GroupCardProps { 
    group: DataGroup; 
    updateGroup: (g: DataGroup) => void;
    deleteGroup: (id: string) => void;
    duplicateGroup: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ 
    group, 
    updateGroup, 
    deleteGroup,
    duplicateGroup
}) => {
    // State for Adding
    const [addKey, setAddKey] = useState('');
    const [addValue, setAddValue] = useState('');
    
    // State for Editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editKey, setEditKey] = useState('');
    const [editValue, setEditValue] = useState('');

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

    const handleAddField = () => {
        if (!addKey.trim() || !addValue.trim()) return;
        
        const newField: UserField = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            key: addKey,
            value: addValue
        };
        updateGroup({ ...group, fields: [...group.fields, newField] });
        setAddKey('');
        setAddValue('');
    };

    const handleUpdateField = () => {
        if (!editingId || !editKey.trim() || !editValue.trim()) return;

        const updatedFields = group.fields.map(f => 
            f.id === editingId ? { ...f, key: editKey, value: editValue } : f
        );
        updateGroup({ ...group, fields: updatedFields });
        setEditingId(null);
        setEditKey('');
        setEditValue('');
    };

    const handleEditField = (field: UserField) => {
        setEditKey(field.key);
        setEditValue(field.value);
        setEditingId(field.id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditKey('');
        setEditValue('');
    };

    const handleRemoveField = (id: string) => {
        const updatedFields = group.fields.filter(f => f.id !== id);
        updateGroup({ ...group, fields: updatedFields });
        if (editingId === id) {
            handleCancelEdit();
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
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
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="application/pdf,image/png,image/jpeg,image/webp" 
                        className="hidden" 
                    />
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUploadClick();
                        }}
                        disabled={isExtracting}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Auto-extract data from document (PDF, PNG, JPG)"
                    >
                        {isExtracting ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        )}
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            duplicateGroup(group.id);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicate Group"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    {group.id !== 'default' && (
                        <>
                            {confirmDelete ? (
                                <div className="flex items-center gap-1 animate-in slide-in-from-right duration-200">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteGroup(group.id);
                                        }}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold whitespace-nowrap"
                                    >
                                        Delete?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDelete(false);
                                        }}
                                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <button 
                                     type="button"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setConfirmDelete(true);
                                     }}
                                     className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                     title="Delete Group"
                                >
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                        </>
                    )}
                    <button 
                        type="button"
                        onClick={toggleExpand}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={group.isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg className={`w-5 h-5 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            {group.isExpanded && (
                <div className="flex flex-col">
                    <div className="p-4 space-y-3">
                        {group.fields.length === 0 && !isExtracting && (
                            <div className="text-center py-4 text-slate-400 text-sm italic">
                                No fields yet. Upload a document above or add manually below.
                            </div>
                        )}
                        {group.fields.map((field) => (
                            <div 
                                key={field.id} 
                                className={`flex items-start gap-3 p-3 rounded-lg group border transition-all ${
                                    editingId === field.id 
                                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm' 
                                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                                }`}
                            >
                                {editingId === field.id ? (
                                    <>
                                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                                            <input 
                                                value={editKey}
                                                onChange={e => setEditKey(e.target.value)}
                                                className="text-xs font-bold text-indigo-600 uppercase tracking-wider w-full bg-white border border-indigo-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-indigo-300"
                                                placeholder="FIELD NAME"
                                            />
                                            <input 
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleUpdateField()}
                                                className="text-slate-800 font-medium w-full bg-white border border-indigo-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                placeholder="Value"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 pt-1">
                                            <button 
                                                onClick={handleUpdateField} 
                                                className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                                                title="Save"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button 
                                                onClick={handleCancelEdit} 
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Cancel"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEditField(field)}>
                                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block truncate mb-0.5">{field.key}</span>
                                            <span className="text-slate-800 font-medium block break-words">{field.value}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 self-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleEditField(field)}
                                                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveField(field.id)}
                                                className="text-slate-300 hover:text-red-500 hover:bg-white transition-colors p-2 rounded-md"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Add Field
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={addKey}
                                    onChange={(e) => setAddKey(e.target.value)}
                                    className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
                                    placeholder="Type (e.g. Email)"
                                />
                            </div>
                            <input
                                type="text"
                                value={addValue}
                                onChange={(e) => setAddValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                                className="w-full text-sm bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none border placeholder-slate-400"
                                placeholder="Value"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddField}
                            disabled={!addKey.trim() || !addValue.trim()}
                            className="w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                        >
                            Add Field
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
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
     setGroups(prevGroups => prevGroups.filter(g => g.id !== id));
  };

  const duplicateGroup = (id: string) => {
      const groupToDuplicate = groups.find(g => g.id === id);
      if (!groupToDuplicate) return;

      const newGroup: DataGroup = {
          ...groupToDuplicate,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: `${groupToDuplicate.name} (Copy)`,
          fields: groupToDuplicate.fields.map(f => ({
              ...f,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }))
      };
      
      const index = groups.findIndex(g => g.id === id);
      const newGroups = [...groups];
      newGroups.splice(index + 1, 0, newGroup);
      setGroups(newGroups);
  };

  return (
    <div className="flex flex-col">
        {/* Top Action Bar */}
        <div className="mb-6 flex justify-between items-end">
            <div>
                 <h2 className="text-xl font-bold text-slate-800">Your Data</h2>
                 <p className="text-sm text-slate-500">Create groups to organize data for different contexts (e.g. Personal, Spouse, Vehicle).</p>
            </div>
            <button 
                type="button"
                onClick={handleAddGroup}
                className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Group
            </button>
        </div>

        <div className="space-y-6 pb-10">
            {groups.map(group => (
                <GroupCard 
                    key={group.id} 
                    group={group} 
                    updateGroup={updateGroup}
                    deleteGroup={deleteGroup}
                    duplicateGroup={duplicateGroup}
                />
            ))}
        </div>
    </div>
  );
};