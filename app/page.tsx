'use client';

import React from 'react';
import { DataProfile } from './features/profile/components/DataProfile';
import { ReviewModal } from './features/autofill-v2/components/ReviewModal';
import { StatusOverlay } from './shared/components/StatusOverlay';
import { useDataGroups } from './features/profile/hooks/useDataGroups';
import { usePdfProcessing } from './features/autofill-v2/hooks/usePdfProcessing';
import { AppHeader } from './shared/components/AppHeader';

const App: React.FC = () => {
  const {
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    duplicateGroup,
    saveScrapedFields
  } = useDataGroups();

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
    </div>
  );
};

export default App;