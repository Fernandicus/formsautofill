import React from 'react';
import { DataGroup } from '@/app/shared/types';
import { GroupCard } from './GroupCard';
import { PlusIcon } from '@/icons';

type DataProfileProps = {
  groups: DataGroup[];
  addGroup: () => void;
  updateGroup: (g: DataGroup) => void;
  deleteGroup: (id: string) => void;
  duplicateGroup: (id: string) => void;
};

export const DataProfile: React.FC<DataProfileProps> = ({ 
  groups, 
  addGroup,
  updateGroup, 
  deleteGroup, 
  duplicateGroup 
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Data</h2>
          <p className="text-sm text-slate-500">
            Create groups to organize data for different contexts (e.g. Personal, Spouse, Vehicle).
          </p>
        </div>
        <button 
          type="button"
          onClick={addGroup}
          className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusIcon className="w-4 h-4"/>
          Create Group
        </button>
      </div>

      <div className="space-y-6 pb-10">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No data stored yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              You don't have any data stored. Start by adding some data to easily autofill your forms.
            </p>
            <button 
              type="button"
              onClick={addGroup}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4"/>
              Add First Data Group
            </button>
          </div>
        ) : (
          groups.map(group => (
            <GroupCard 
              key={group.id} 
              group={group} 
              updateGroup={updateGroup}
              deleteGroup={deleteGroup}
              duplicateGroup={duplicateGroup}
            />
          ))
        )}
      </div>
    </div>
  );
};