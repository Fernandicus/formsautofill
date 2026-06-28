'use client';

import React from 'react';
import { DataProfile } from '@/app/features/profile/components/DataProfile';
import { UserOnboarding } from '@/app/features/profile/components/UserOnboarding';
import { useDataGroups } from '@/app/features/profile/hooks/useDataGroups';
import { useOnboarding } from '@/app/features/profile/hooks/useOnboarding';
import { AppHeader } from '@/app/shared/components/AppHeader';

const ProfilePage: React.FC = () => {
  const {
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    duplicateGroup,
    createGroupWithData
  } = useDataGroups();

  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  const handleOnboardingComplete = (fields: { key: string, value: string }[]) => {
    if (fields.length > 0) {
      createGroupWithData('Personal Info', fields);
    }
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataProfile 
          groups={groups} 
          addGroup={addGroup}
          updateGroup={updateGroup}
          deleteGroup={deleteGroup}
          duplicateGroup={duplicateGroup}
        />
      </main>

      {!hasCompletedOnboarding && (
        <UserOnboarding 
          onComplete={handleOnboardingComplete} 
          onSkip={completeOnboarding} 
        />
      )}
    </div>
  );
};

export default ProfilePage;
