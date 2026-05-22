import React, { useState, useRef } from 'react';
import { DataGroup } from '@/app/shared/types';
import { extractDataFromDocument } from '@/app/features/autofill-v2/services/geminiService';
import { FieldItem } from './FieldItem';
import { AddFieldForm } from './AddFieldForm';
import { EditableText } from '@/app/shared/components/EditableText';
import { ChevronIcon, CloseIcon, DuplicateIcon, RefreshIcon, TrashIcon, UserIcon } from '../../../../../icons';

type GroupCardProps = { 
  group: DataGroup; 
  updateGroup: (g: DataGroup) => void;
  deleteGroup: (id: string) => void;
  duplicateGroup: (id: string) => void;
};

import { useGroupCardLogic } from '../../hooks/useGroupCardLogic';

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  updateGroup, 
  deleteGroup,
  duplicateGroup
}) => {
  const {
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
    handleDeleteGroup,
    handleDuplicateGroup
  } = useGroupCardLogic(group, updateGroup, deleteGroup, duplicateGroup);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <UserIcon className="w-5 h-5"/>
          </div>
          <EditableText 
            value={group.name}
            onSave={(newVal) => {
              setTempName(newVal);
              // Small hack to use the existing hooked handleSaveName pattern
              // We dispatch update synchronously if tempName is updated directly or re-wire hook
              updateGroup({ ...group, name: newVal });
            }}
            as="h2"
            textClassName="font-bold text-lg text-slate-800"
            inputClassName="text-lg"
          />
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
              <RefreshIcon className="w-5 h-5"/>
            )}
          </button>
          <button 
            type="button"
            onClick={handleDuplicateGroup}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Duplicate Group"
          >
            <DuplicateIcon className="w-5 h-5"/>
          </button>
          {group.id !== 'default' && (
            confirmDelete ? (
              <div className="flex items-center gap-1 animate-in slide-in-from-right duration-200">
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold whitespace-nowrap"
                >
                  Delete?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <CloseIcon className="w-5 h-5"/>
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Group"
              >
                <TrashIcon className="w-5 h-5"/>
              </button>
            )
          )}
          <button 
            type="button"
            onClick={toggleExpand}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={group.isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronIcon className={`w-5 h-5 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {group.isExpanded && (
        <div className="flex flex-col">
          <div className="p-4 space-y-3">
            {group.fields.length === 0 && !isExtracting && (
              <div className="text-center py-4 text-slate-400 text-sm italic">
                No fields yet.{' '}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium not-italic"
                >
                  Upload a document
                </button>{' '}
                or add manually below.
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
