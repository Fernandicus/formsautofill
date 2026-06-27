import React from 'react';
import { WizardStep } from '../hooks/useWizardState';
import { FileText, Database, CheckCircle2 } from 'lucide-react';
import { WizardCard } from './base/WizardCard';

type StepperProps = {
  currentStep: WizardStep;
};

const MobileStepper: React.FC<{
  currentStepData: { num: number; title: string; icon: React.ElementType };
}> = ({ currentStepData }) => {
  const CurrentIcon = currentStepData.icon;
  return (
    <>
      <div className="sm:hidden h-6 w-full" />
      <div className="sm:hidden fixed top-16 left-0 right-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {currentStepData.num}
          </div>
          <div className="flex flex-col">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Step {currentStepData.num} of 3
            </div>
            <div className="flex items-center gap-1.5 text-slate-900">
              <CurrentIcon size={14} className="text-indigo-600" strokeWidth={2.5} />
              <span className="font-bold text-sm">{currentStepData.title}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DesktopStepper: React.FC<{
  currentStep: number;
  steps: { num: number; title: string; description: string; icon: React.ElementType }[];
}> = ({ currentStep, steps }) => {
  return (
    <WizardCard className="hidden sm:flex mb-8 flex-col sm:flex-row gap-6 sm:gap-8">
      {steps.map((step) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;
        const isHighlighted = isActive || isCompleted;

        const Icon = step.icon;

        return (
          <div key={step.num} className="flex-1 flex flex-col">
            <div className={`h-[2px] w-full mb-4 ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <div className={`text-[10px] sm:text-xs font-bold mb-2 uppercase tracking-wide ${isHighlighted ? 'text-indigo-600' : 'text-slate-400'}`}>
              Step {step.num}
            </div>
            <div className={`flex items-center gap-2 mb-1.5 ${isHighlighted ? 'text-slate-900' : 'text-slate-500'}`}>
              <Icon size={16} className={isHighlighted ? 'text-indigo-600' : 'text-slate-400'} strokeWidth={isHighlighted ? 2.5 : 2} />
              <span className="font-bold text-sm">{step.title}</span>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {step.description}
            </div>
          </div>
        );
      })}
    </WizardCard>
  );
};

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { 
      num: 1, 
      title: 'Upload PDF', 
      description: 'Upload the form to analyze it',
      icon: FileText
    },
    { 
      num: 2, 
      title: 'Upload Data', 
      description: 'Attach ID or supporting documents',
      icon: Database
    },
    { 
      num: 3, 
      title: 'Download', 
      description: 'Ready to sign and save',
      icon: CheckCircle2
    }
  ];

  const currentStepData = steps.find(s => s.num === currentStep) || steps[0];

  return (
    <>
      <MobileStepper currentStepData={currentStepData} />
      <DesktopStepper currentStep={currentStep} steps={steps} />
    </>
  );
};
