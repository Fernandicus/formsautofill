import React, { useState } from 'react';
import { UserField } from '@/app/shared/types';
import { TrashIcon } from '../../../../../icons';
import { EditableText } from '@/app/shared/components/EditableText';

type FieldItemProps = {
  field: UserField;
  onUpdate: (key: string, value: string) => void;
  onRemove?: () => void;
};

export const FieldItem: React.FC<FieldItemProps> = ({ field, onUpdate, onRemove }) => {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg group border bg-slate-50 border-transparent hover:border-slate-200 transition-all">
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <EditableText 
          value={field.key}
          onSave={(newKey) => onUpdate(newKey, field.value)}
          as="span"
          textClassName="text-xs font-semibold text-indigo-600 uppercase tracking-wider block truncate"
          inputClassName="text-xs text-indigo-600 uppercase"
        />
        <EditableText 
          value={field.value}
          onSave={(newValue) => onUpdate(field.key, newValue)}
          as="span"
          textClassName="text-slate-800 font-medium block break-words"
          inputClassName="text-sm"
        />
      </div>
      {onRemove && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 self-center">
          <button 
            type="button"
            onClick={onRemove}
            className="text-slate-300 hover:text-red-500 hover:bg-white transition-colors p-2 rounded-md"
            title="Remove"
          >
            <TrashIcon className="w-4 h-4"/>
          </button>
        </div>
      )}
    </div>
  );
};
