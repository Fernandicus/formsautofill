'use client';

import React from 'react';
import { DataProfile } from './features/profile/components/DataProfile';
import { ReviewModal } from './features/autofill-v2/components/ReviewModal';
import { StatusOverlay } from './shared/components/StatusOverlay';
import { useDataGroups } from './features/profile/hooks/useDataGroups';
import { usePdfProcessing } from './features/autofill-v2/hooks/usePdfProcessing';
import { AppHeader } from './shared/components/AppHeader';
import { UserOnboarding } from './features/profile/components/UserOnboarding';
import { useOnboarding } from './features/profile/hooks/useOnboarding';

const App: React.FC = () => {
  const {
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    duplicateGroup,
    saveScrapedFields,
    createGroupWithData
  } = useDataGroups();

  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  const handleOnboardingComplete = (fields: { key: string, value: string }[]) => {
    if (fields.length > 0) {
      createGroupWithData('Personal Info', fields);
    }
    completeOnboarding();
  };

  const {
    status,
    mappings,
    pdfLanguage,
    showReview,
    handleFileChange,
    handleConfirmFill,
    closeStatusModal,
    cancelReview,
  } = usePdfProcessing({ groups, saveScrapedFields });
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      <AppHeader onFileSelect={handleFileChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataProfile 
          groups={groups} 
          addGroup={addGroup}
          updateGroup={updateGroup}
          deleteGroup={deleteGroup}
          duplicateGroup={duplicateGroup}
        />
      </main>

      {showReview && (
        <ReviewModal 
          mappings={mappings} 
          fromLanguage={pdfLanguage}
          onConfirm={handleConfirmFill} 
          onCancel={cancelReview} 
        />
      )}

      <StatusOverlay status={status} onClose={closeStatusModal} />

      {!hasCompletedOnboarding && (
        <UserOnboarding 
          onComplete={handleOnboardingComplete} 
          onSkip={completeOnboarding} 
        />
      )}
    </div>
  );
};

export default App;