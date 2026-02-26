import React, { useState, useRef } from 'react';
import { DataGroup } from '../../types';
import { extractDataFromDocument } from '../../services/geminiService';
import { FieldItem } from './FieldItem';
import { AddFieldForm } from './AddFieldForm';

interface GroupCardProps { 
  group: DataGroup; 
  updateGroup: (g: DataGroup) => void;
  deleteGroup: (id: string) => void;
  duplicateGroup: (id: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  updateGroup, 
  deleteGroup,
  duplicateGroup
}) => {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
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
              <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Auto-extract data"
          >
            {isExtracting ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </button>
          <button 
            type="button"
            onClick={() => duplicateGroup(group.id)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Duplicate Group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {group.id !== 'default' && (
            confirmDelete ? (
              <div className="flex items-center gap-1 animate-in slide-in-from-right duration-200">
                <button
                  type="button"
                  onClick={() => deleteGroup(group.id)}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold whitespace-nowrap"
                >
                  Delete?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )
          )}
          <button 
            type="button"
            onClick={toggleExpand}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={group.isExpanded ? "Collapse" : "Expand"}
          >
            <svg className={`w-5 h-5 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {group.isExpanded && (
        <div className="flex flex-col">
          <div className="p-4 space-y-3">
            {group.fields.length === 0 && !isExtracting && (
              <div className="text-center py-4 text-slate-400 text-sm italic">
                No fields yet. Upload a document above or add manually below.
              </div>
            )}
            {group.fields.map((field) => (
              <FieldItem 
                key={field.id} 
                field={field} 
                onUpdate={(key, value) => handleUpdateField(field.id, key, value)}
                onRemove={() => handleRemoveField(field.id)}
              />
            ))}
          </div>
          <AddFieldForm onAdd={handleAddField} />
        </div>
      )}
    </div>
  );
};
