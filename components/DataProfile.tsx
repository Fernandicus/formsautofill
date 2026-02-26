import React from 'react';
import { DataGroup } from '../types';
import { GroupCard } from './DataProfile/GroupCard';

interface DataProfileProps {
  groups: DataGroup[];
  addGroup: () => void;
  updateGroup: (g: DataGroup) => void;
  deleteGroup: (id: string) => void;
  duplicateGroup: (id: string) => void;
}

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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
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