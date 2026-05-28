import React from 'react';
import { WizardStep } from '../hooks/useWizardState';

type StepperProps = {
  currentStep: WizardStep;
};

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, title: 'Upload PDF' },
    { num: 2, title: 'Upload Data' },
    { num: 3, title: 'Review' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          
          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center flex-1">
                <div className={`text-xs font-bold mb-1 ${isActive || isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
                  STEP {step.num}
                </div>
                <div className={`text-sm font-semibold ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <div className={`h-1 w-full rounded ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
