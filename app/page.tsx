'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from './shared/components/AppHeader';
import { useWizardWorkflow } from './features/autofill-wizard/hooks/useWizardWorkflow';
import { Stepper } from './features/autofill-wizard/components/Stepper';
import { Step1UploadPdf } from './features/autofill-wizard/components/Step1UploadPdf';
import { Step2UploadDocs } from './features/autofill-wizard/components/Step2UploadDocs';
import { Step3Review } from './features/autofill-wizard/components/Step3Review';
import { Step4Download } from './features/autofill-wizard/components/Step4Download';
import { StatusOverlay } from './shared/components/StatusOverlay';

const App: React.FC = () => {
  const {
    state,
    handleMainPdfUpload,
    processAllAndMap,
    handleConfirmFill,
    resetWizard,
    dismissError,
  } = useWizardWorkflow();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4 overflow-hidden">
        {state.currentStep < 4 && <Stepper currentStep={state.currentStep} />}

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {state.currentStep === 1 && (
                <Step1UploadPdf onUpload={handleMainPdfUpload} />
              )}

              {state.currentStep === 2 && (
                <Step2UploadDocs 
                  onContinue={processAllAndMap} 
                  isProcessing={state.isProcessing} 
                />
              )}

              {state.currentStep === 3 && (
                <Step3Review 
                  mappings={state.mappings}
                  supportingDocs={state.supportingDocs}
                  onConfirm={handleConfirmFill}
                  isProcessing={state.isProcessing}
                />
              )}

              {state.currentStep === 4 && (
                <Step4Download 
                  downloadUrl={state.generatedPdfUrl}
                  onRestart={resetWizard}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Show processing modal */}
      {state.isProcessing && (
        <StatusOverlay status={{ step: 'processing', message: state.loadingMessage }} onClose={() => {}} />
      )}

      {/* Show error modal if any */}
      {state.error && (
        <StatusOverlay status={{ step: 'error', message: state.error }} onClose={dismissError} />
      )}
    </div>
  );
};

export default App;